// SSR — mis tickets en tiempo real
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets, events, ticketTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketCard } from "@/components/tickets/TicketCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis tickets" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  const { success } = await searchParams;

  const myTickets = await db
    .select({
      ticket: tickets,
      event: events,
      ticketType: ticketTypes,
    })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .innerJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
    .where(eq(tickets.buyerId, session!.user.id))
    .orderBy(events.startsAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis tickets</h1>
        <p className="text-muted-foreground">Hola, {session?.user.name}</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
          ✅ ¡Compra exitosa! Recibirás tu ticket por email en unos minutos.
        </div>
      )}

      {myTickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">No tienes tickets aún.</p>
            <Button asChild>
              <Link href="/eventos">Ver eventos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myTickets.map(({ ticket, event, ticketType }) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              event={event}
              ticketType={ticketType}
            />
          ))}
        </div>
      )}
    </div>
  );
}
