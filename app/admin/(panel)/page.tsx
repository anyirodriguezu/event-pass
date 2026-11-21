// SSR — dashboard del backoffice. Datos globales en tiempo real (sin caché).
// El acceso (rol ADMIN) lo controla el layout del grupo (panel).
import { db } from "@/lib/db";
import { events, tickets, orders, users, organizers, refunds } from "@/lib/db/schema";
import { eq, count, sum, asc, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setOrganizerVerified } from "@/actions/admin";
import { approveRefund, rejectRefund } from "@/actions/refunds";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  Ticket,
  TrendingUp,
  Users,
  Building2,
  BadgeCheck,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel Admin" };

export default async function AdminPage() {
  // Métricas globales — count()/sum() agregan en la DB, no en memoria.
  const [
    [{ v: totalEvents }],
    [{ v: publishedEvents }],
    [{ v: ticketsSold }],
    [{ v: revenue }],
    [{ v: totalUsers }],
    orgs,
  ] = await Promise.all([
    db.select({ v: count() }).from(events),
    db.select({ v: count() }).from(events).where(eq(events.status, "PUBLISHED")),
    db.select({ v: count() }).from(tickets),
    db.select({ v: sum(orders.totalAmount) }).from(orders).where(eq(orders.status, "PAID")),
    db.select({ v: count() }).from(users),
    db
      .select({ org: organizers, user: users })
      .from(organizers)
      .innerJoin(users, eq(organizers.userId, users.id))
      .orderBy(asc(organizers.verified), asc(organizers.createdAt)),
  ]);

  // Solicitudes de reembolso con contexto (orden, evento, comprador).
  const refundRows = await db
    .select({ refund: refunds, event: events, buyer: users })
    .from(refunds)
    .innerJoin(orders, eq(refunds.orderId, orders.id))
    .innerJoin(events, eq(orders.eventId, events.id))
    .innerJoin(users, eq(orders.buyerId, users.id))
    .orderBy(asc(refunds.status), desc(refunds.requestedAt));

  const totalRevenue = Number(revenue ?? 0);
  const pendingCount = orgs.filter((o) => !o.org.verified).length;
  const pendingRefunds = refundRows.filter((r) => r.refund.status === "PENDING").length;

  const kpis = [
    { label: "Eventos", value: String(totalEvents), icon: CalendarDays, from: "from-violet-500", to: "to-violet-700" },
    { label: "Publicados", value: String(publishedEvents), icon: BadgeCheck, from: "from-fuchsia-500", to: "to-pink-600" },
    { label: "Tickets vendidos", value: Number(ticketsSold).toLocaleString("es-PE"), icon: Ticket, from: "from-sky-500", to: "to-blue-600" },
    { label: "Ingresos (pagados)", value: `S/ ${totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, from: "from-emerald-500", to: "to-teal-600" },
    { label: "Usuarios", value: String(totalUsers), icon: Users, from: "from-amber-500", to: "to-orange-600" },
    { label: "Organizadores", value: String(orgs.length), icon: Building2, from: "from-indigo-500", to: "to-purple-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Administración</p>
        <h1 className="font-heading font-bold text-3xl gradient-brand-text">Resumen</h1>
      </div>

      {/* Métricas globales */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5"
          >
            <div className={`absolute -top-6 -right-6 size-20 rounded-full bg-gradient-to-br ${k.from} ${k.to} opacity-20 blur-xl`} />
            <div className={`grid place-items-center size-10 rounded-xl bg-gradient-to-br ${k.from} ${k.to} text-white mb-3`}>
              <k.icon className="size-5" />
            </div>
            <p className="text-2xl font-bold">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Verificación de organizadores */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Organizadores</CardTitle>
          {pendingCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700">{pendingCount} pendiente{pendingCount > 1 ? "s" : ""}</Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {orgs.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">
              Aún no hay organizadores registrados.
            </p>
          ) : (
            <div className="divide-y">
              {orgs.map(({ org, user }) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between px-6 py-3 gap-4 hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{org.orgName}</p>
                      {org.verified ? (
                        <Badge className="bg-green-100 text-green-700">Verificado</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600">Sin verificar</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.name ?? user.email}
                      {org.ruc ? ` · RUC ${org.ruc}` : ""}
                      {" · "}
                      {format(new Date(org.createdAt), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>

                  <form action={setOrganizerVerified.bind(null, org.id, !org.verified)} className="shrink-0">
                    <Button
                      type="submit"
                      size="sm"
                      variant={org.verified ? "outline" : "success"}
                    >
                      {org.verified ? "Revocar" : "Verificar"}
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reembolsos */}
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Reembolsos</CardTitle>
          {pendingRefunds > 0 && (
            <Badge className="bg-amber-100 text-amber-700">{pendingRefunds} pendiente{pendingRefunds > 1 ? "s" : ""}</Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {refundRows.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">
              No hay solicitudes de reembolso.
            </p>
          ) : (
            <div className="divide-y">
              {refundRows.map(({ refund, event, buyer }) => (
                <div key={refund.id} className="flex items-center justify-between px-6 py-3 gap-4 hover:bg-muted/30">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <RefundStatusBadge status={refund.status} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {buyer.name ?? buyer.email} · S/ {Number(refund.amount).toFixed(2)}
                      {refund.reason ? ` · "${refund.reason}"` : ""}
                      {" · "}
                      {format(new Date(refund.requestedAt), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>

                  {refund.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <form action={approveRefund.bind(null, refund.id)}>
                        <Button type="submit" size="sm" variant="success">Aprobar</Button>
                      </form>
                      <form action={rejectRefund.bind(null, refund.id)}>
                        <Button type="submit" size="sm" variant="outline">Rechazar</Button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RefundStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING:  { label: "Pendiente", className: "bg-amber-100 text-amber-700" },
    APPROVED: { label: "Aprobado",  className: "bg-green-100 text-green-700" },
    REJECTED: { label: "Rechazado", className: "bg-red-100 text-red-700" },
  };
  const s = map[status] ?? map.PENDING;
  return <Badge className={s.className}>{s.label}</Badge>;
}
