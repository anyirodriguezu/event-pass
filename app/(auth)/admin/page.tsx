// SSR — panel de administración. Datos globales en tiempo real (sin caché).
// Solo accesible para rol ADMIN.
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { events, tickets, orders, users, organizers } from "@/lib/db/schema";
import { eq, count, sum, asc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setOrganizerVerified } from "@/actions/admin";
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
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

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

  const totalRevenue = Number(revenue ?? 0);
  const pendingCount = orgs.filter((o) => !o.org.verified).length;

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
      {/* Header */}
      <div>
        <p className="text-sm text-muted-foreground">Administración</p>
        <h1 className="font-heading font-bold text-3xl gradient-brand-text">Panel Admin</h1>
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

                  {/* Aprobar / revocar — Server Action con el nuevo valor horneado */}
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
    </div>
  );
}
