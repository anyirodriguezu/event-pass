// SSR — datos del organizador en tiempo real
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, organizers, ticketTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Ticket, TrendingUp, Sparkles, MapPin, Plus } from "lucide-react";

export const metadata: Metadata = { title: "Panel Organizador" };

export default async function OrganizerPage() {
  const session = await auth();
  if (!session || session.user.role !== "ORGANIZER") redirect("/dashboard");

  const organizer = await db.query.organizers.findFirst({
    where: eq(organizers.userId, session.user.id),
  });

  if (!organizer) {
    return (
      <div className="text-center py-12 space-y-4 animate-fade-up">
        <p>No tienes perfil de organizador aún.</p>
        <Button asChild variant="gradient">
          <Link href="/organizer/setup">Crear perfil</Link>
        </Button>
      </div>
    );
  }

  const myEvents = await db
    .select()
    .from(events)
    .where(eq(events.organizerId, organizer.id))
    .orderBy(events.createdAt);

  // Agregados para los KPIs — un solo join sobre los tipos de ticket del organizador
  const typeRows = await db
    .select({
      price: ticketTypes.price,
      sold: ticketTypes.soldQuantity,
    })
    .from(ticketTypes)
    .innerJoin(events, eq(ticketTypes.eventId, events.id))
    .where(eq(events.organizerId, organizer.id));

  const totalSold = typeRows.reduce((a, t) => a + t.sold, 0);
  const totalRevenue = typeRows.reduce((a, t) => a + Number(t.price) * t.sold, 0);
  const publishedCount = myEvents.filter((e) => e.status === "PUBLISHED").length;

  const kpis = [
    { label: "Eventos", value: String(myEvents.length), icon: CalendarDays, from: "from-violet-500", to: "to-violet-700" },
    { label: "Publicados", value: String(publishedCount), icon: Sparkles, from: "from-fuchsia-500", to: "to-pink-600" },
    { label: "Tickets vendidos", value: totalSold.toLocaleString("es-PE"), icon: Ticket, from: "from-sky-500", to: "to-blue-600" },
    { label: "Ingresos", value: `S/ ${totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: TrendingUp, from: "from-emerald-500", to: "to-teal-600" },
  ];

  return (
    <div className="space-y-8">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 animate-fade-up">
        <div>
          <p className="text-sm text-muted-foreground">Bienvenido de vuelta 👋</p>
          <h1 className="font-heading font-bold text-3xl">
            <span className="gradient-brand-animated">{organizer.orgName}</span>
          </h1>
        </div>
        <Button asChild variant="gradient" className="sheen">
          <Link href="/organizer/nuevo" className="inline-flex items-center gap-1.5">
            <Plus className="size-4" /> Nuevo evento
          </Link>
        </Button>
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 card-lift animate-fade-up"
            style={{ ["--d" as string]: `${i * 90}ms` }}
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

      {/* ── Lista de eventos ─────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="font-heading font-semibold text-lg">Tus eventos</h2>

        {myEvents.length === 0 ? (
          <Card className="gradient-border animate-fade-up">
            <CardContent className="py-14 text-center space-y-3">
              <p className="text-4xl">🎪</p>
              <p className="text-muted-foreground">Aún no tienes eventos. ¡Crea el primero!</p>
              <Button asChild variant="gradient" className="sheen">
                <Link href="/organizer/nuevo">Crear evento</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myEvents.map((event, i) => (
              <Card
                key={event.id}
                className="card-lift animate-fade-up overflow-hidden"
                style={{ ["--d" as string]: `${i * 70}ms` }}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{event.title}</h3>
                      <EventStatusBadge status={event.status} />
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 shrink-0" />
                      {format(new Date(event.startsAt), "d MMM yyyy", { locale: es })}
                      <MapPin className="size-3.5 shrink-0 ml-2" />
                      <span className="truncate">{event.venueName}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/organizer/${event.id}/ventas`}>Ventas</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/organizer/${event.id}`}>Editar</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "Borrador", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
    PUBLISHED: { label: "Publicado", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
    SOLD_OUT: { label: "Agotado", className: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" },
    FINISHED: { label: "Finalizado", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  };
  const s = map[status] ?? map.DRAFT;
  return <Badge className={s.className}>{s.label}</Badge>;
}
