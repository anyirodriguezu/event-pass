// Ver QR de un ticket específico
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets, events, ticketTypes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketQR } from "@/components/tickets/TicketQR";
import { TransferButton } from "@/components/tickets/TransferButton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi ticket" };

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const result = await db
    .select({ ticket: tickets, event: events, ticketType: ticketTypes })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .innerJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
    .where(and(eq(tickets.id, id), eq(tickets.buyerId, session!.user.id)))
    .limit(1);

  if (result.length === 0) notFound();

  const { ticket, event, ticketType } = result[0];

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold text-center">{event.title}</h1>

      <Card>
        <CardContent className="p-6 space-y-4 text-center">
          {/* Componente cliente: genera el QR con react-qr-code */}
          <TicketQR qrCode={ticket.qrCode} disabled={ticket.status !== "ACTIVE"} />

          <div className="space-y-1 text-sm">
            <p className="font-semibold">{ticketType.name}</p>
            <p className="text-muted-foreground">
              {format(new Date(event.startsAt), "d MMM yyyy · HH:mm", { locale: es })}
            </p>
            <p className="text-muted-foreground">{event.venueName}</p>
          </div>

          <Badge
            className={
              ticket.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }
          >
            {ticket.status}
          </Badge>

          <p className="text-xs text-muted-foreground font-mono break-all">
            ID: {ticket.id}
          </p>
        </CardContent>
      </Card>

      {ticket.status === "ACTIVE" && (
        <TransferButton ticketId={ticket.id} />
      )}
    </div>
  );
}
