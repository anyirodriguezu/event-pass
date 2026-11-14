// SSR — datos en tiempo real, sin caché
// El organizador ve quién compró y quién ya ingresó al evento
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets, users, ticketTypes, events, organizers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { checkInTicket } from "@/actions/checkin";

export const metadata: Metadata = { title: "Asistentes" };

export default async function AsistentesPage({
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

  const attendees = await db
    .select({
      ticket: tickets,
      buyer: users,
      ticketType: ticketTypes,
    })
    .from(tickets)
    .innerJoin(users, eq(tickets.buyerId, users.id))
    .innerJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
    .where(eq(tickets.eventId, eventId))
    .orderBy(tickets.createdAt);

  const checkedIn = attendees.filter((a) => a.ticket.status === "USED").length;
  const total = attendees.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Asistentes</h1>
          <p className="text-muted-foreground text-sm">{event.title}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/organizer/${eventId}`}>← Volver al evento</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-700">{checkedIn}</p>
          <p className="text-sm text-green-600">Ingresaron</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-700">{total - checkedIn}</p>
          <p className="text-sm text-blue-600">Pendientes</p>
        </div>
        <div className="bg-gray-50 border rounded-xl p-4 text-center">
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-sm text-muted-foreground">Total vendidos</p>
        </div>
      </div>

      {/* Lista completa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de asistentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {attendees.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">
              Aún no hay tickets vendidos para este evento.
            </p>
          ) : (
            <div className="divide-y">
              {attendees.map(({ ticket, buyer, ticketType }) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {buyer.name ?? buyer.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{ticketType.name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {ticket.checkedInAt && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ticket.checkedInAt), "d MMM · HH:mm", { locale: es })}
                      </p>
                    )}
                    <TicketStatusBadge status={ticket.status} />
                    {/* Check-in manual para tickets aún activos */}
                    {ticket.status === "ACTIVE" && (
                      <form action={checkInTicket.bind(null, ticket.id, eventId)}>
                        <button
                          type="submit"
                          className="text-xs text-purple-600 hover:underline"
                        >
                          Check-in
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TicketStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ACTIVE:      { label: "Pendiente",   className: "bg-blue-100 text-blue-700" },
    USED:        { label: "Ingresó",     className: "bg-green-100 text-green-700" },
    CANCELLED:   { label: "Cancelado",   className: "bg-red-100 text-red-700" },
    TRANSFERRED: { label: "Transferido", className: "bg-yellow-100 text-yellow-700" },
  };
  const s = map[status] ?? map.ACTIVE;
  return <Badge className={s.className}>{s.label}</Badge>;
}
