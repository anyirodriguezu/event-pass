// SSR + Suspense (PPR pattern)
// El shell estático (título, evento) se muestra de inmediato al navegar
// Los stats pesados llegan en streaming via Suspense, sin bloquear el layout
import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, ticketTypes, events, organizers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata: Metadata = { title: "Reporte de ventas" };

// Componente con fetch a DB — llega en streaming mientras el shell ya se ve
async function SalesStats({ eventId }: { eventId: string }) {
  const [orderRows, typeRows] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(and(eq(orders.eventId, eventId), eq(orders.status, "PAID")))
      .orderBy(orders.createdAt),
    db
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.eventId, eventId)),
  ]);

  const totalRevenue = orderRows.reduce((acc, o) => acc + Number(o.totalAmount), 0);
  const totalSold = typeRows.reduce((a, t) => a + t.soldQuantity, 0);
  const totalCapacity = typeRows.reduce((a, t) => a + t.totalQuantity, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Ingresos totales" value={`S/ ${totalRevenue.toFixed(2)}`} color="green" />
        <StatCard label="Órdenes pagadas"  value={String(orderRows.length)}         color="blue" />
        <StatCard label="Tickets vendidos" value={String(totalSold)}                color="purple" />
        <StatCard
          label="Capacidad disponible"
          value={String(totalCapacity - totalSold)}
          color="gray"
        />
      </div>

      {/* Barra de progreso por tipo de ticket */}
      {typeRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas por tipo de ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {typeRows.map((t) => {
              const pct = t.totalQuantity > 0
                ? Math.round((t.soldQuantity / t.totalQuantity) * 100)
                : 0;
              const revenue = Number(t.price) * t.soldQuantity;
              return (
                <div key={t.id} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-muted-foreground">
                      {t.soldQuantity} / {t.totalQuantity} · S/ {revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">{pct}% vendido</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Últimas órdenes */}
      {orderRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Órdenes recientes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {orderRows
                .slice(-15)
                .reverse()
                .map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center px-6 py-3 text-sm hover:bg-muted/30"
                  >
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(order.createdAt), "d MMM · HH:mm", { locale: es })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-100 text-green-700">Pagado</Badge>
                      <span className="font-semibold">
                        S/ {Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {orderRows.length === 0 && (
        <p className="text-center text-muted-foreground py-10 text-sm">
          Aún no hay órdenes pagadas para este evento.
        </p>
      )}
    </div>
  );
}

function SalesStatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default async function VentasPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ORGANIZER") redirect("/dashboard");

  const organizer = await db.query.organizers.findFirst({
    where: eq(organizers.userId, session.user.id),
  });

  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.organizerId, organizer?.id ?? "")),
  });

  if (!event) notFound();

  return (
    <div className="space-y-6">
      {/* Shell estático — visible de inmediato */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reporte de ventas</h1>
          <p className="text-muted-foreground text-sm">{event.title}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline">
            {format(new Date(event.startsAt), "d MMM yyyy", { locale: es })}
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link href={`/organizer/${eventId}`}>← Volver</Link>
          </Button>
        </div>
      </div>

      {/* Stats — Suspense streaming: el layout ya pintó, esto llega después */}
      <Suspense fallback={<SalesStatsSkeleton />}>
        <SalesStats eventId={eventId} />
      </Suspense>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "green" | "blue" | "purple" | "gray";
}) {
  const colors = {
    green:  "bg-green-50  border-green-200  text-green-700",
    blue:   "bg-blue-50   border-blue-200   text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    gray:   "bg-gray-50   border            text-gray-700",
  };
  return (
    <div className={`rounded-xl border p-4 space-y-1 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
