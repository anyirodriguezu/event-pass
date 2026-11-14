import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets, events, ticketTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { TicketCard } from "@/components/tickets/TicketCard";
import { SuccessBanner } from "@/components/shared/SuccessBanner";
import Link from "next/link";
import { Ticket, PartyPopper } from "lucide-react";
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
    .select({ ticket: tickets, event: events, ticketType: ticketTypes })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .innerJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
    .where(eq(tickets.buyerId, session!.user.id))
    .orderBy(events.startsAt);

  const activeCount = myTickets.filter((t) => t.ticket.status === "ACTIVE").length;

  return (
    <div className="space-y-8">
      {/* Success banner */}
      {success && <SuccessBanner />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>Mis tickets</span>
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-xs font-bold w-6 h-6">
                {activeCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hola, <span className="font-medium text-foreground">{session?.user.name ?? "viajero"}</span> 👋
          </p>
        </div>
        <Button asChild variant="gradient" size="sm" className="shrink-0">
          <Link href="/eventos">Explorar eventos</Link>
        </Button>
      </div>

      {/* Empty state */}
      {myTickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-16 text-center space-y-5 animate-in fade-in duration-500">
          <div className="relative inline-block">
            <Ticket className="size-14 text-muted-foreground/30 mx-auto" />
            <PartyPopper className="size-6 text-violet-500 absolute -top-1 -right-2 animate-bounce" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Aún no tienes tickets</p>
            <p className="text-sm text-muted-foreground mt-1">
              Explora los eventos disponibles y consigue el tuyo
            </p>
          </div>
          <Button asChild variant="gradient">
            <Link href="/eventos">Ver eventos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTickets.map(({ ticket, event, ticketType }, i) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              event={event}
              ticketType={ticketType}
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
