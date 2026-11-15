// SSR — muestra los detalles del ticket que te están transfiriendo
// Requiere sesión; si no hay, redirige al login conservando el callbackUrl
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ticketTransfers, tickets, events, ticketTypes, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { acceptTransfer } from "@/actions/tickets";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata: Metadata = { title: "Aceptar transferencia" };

export default async function TransferPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=/transfer/${token}`);
  }

  const transfer = await db.query.ticketTransfers.findFirst({
    where: eq(ticketTransfers.token, token),
  });

  if (!transfer) {
    return <TransferError message="Link de transferencia inválido." />;
  }
  if (transfer.acceptedAt) {
    return <TransferError message="Este ticket ya fue transferido a otra persona." />;
  }
  if (transfer.expiresAt < new Date()) {
    return <TransferError message="Este link expiró. Pide uno nuevo al dueño del ticket." />;
  }
  if (transfer.fromUserId === session.user.id) {
    return <TransferError message="No puedes aceptar tu propia transferencia." />;
  }

  const [ticketData, fromUser] = await Promise.all([
    db
      .select({ ticket: tickets, event: events, ticketType: ticketTypes })
      .from(tickets)
      .innerJoin(events, eq(tickets.eventId, events.id))
      .innerJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
      .where(eq(tickets.id, transfer.ticketId))
      .limit(1),
    db.query.users.findFirst({ where: eq(users.id, transfer.fromUserId) }),
  ]);

  if (ticketData.length === 0) {
    return <TransferError message="Ticket no encontrado." />;
  }

  const { ticket, event, ticketType } = ticketData[0];
  const hoursLeft = Math.max(
    0,
    Math.floor((transfer.expiresAt.getTime() - Date.now()) / 3_600_000)
  );

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-5xl">🎟️</p>
        <h1 className="text-2xl font-bold">Te están transfiriendo un ticket</h1>
        <p className="text-muted-foreground text-sm">
          <span className="font-medium">{fromUser?.name ?? fromUser?.email}</span> quiere
          darte su entrada
        </p>
      </div>

      {/* Detalles del ticket */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{event.title}</h2>
            <Badge variant="outline">{ticketType.name}</Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1.5">
            <p>
              📅{" "}
              {format(
                new Date(event.startsAt),
                "EEEE d 'de' MMMM · HH:mm",
                { locale: es }
              )}
            </p>
            <p>📍 {event.venueName}</p>
            <p className="text-xs">{event.venueAddress}</p>
          </div>
          {hoursLeft <= 6 && (
            <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-2">
              ⏰ Este link expira en {hoursLeft === 0 ? "menos de 1 hora" : `~${hoursLeft}h`}.
              Acepta ahora para no perder el ticket.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Acción: form → Server Action acceptTransfer */}
      <form action={acceptTransfer.bind(null, token)}>
        <SubmitButton
          variant="gradient"
          className="w-full h-12 text-base"
          pendingText="Aceptando ticket..."
        >
          Aceptar ticket
        </SubmitButton>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        Al aceptar, el ticket quedará registrado a nombre de{" "}
        <span className="font-medium">{session.user.email}</span>.
      </p>
    </div>
  );
}

function TransferError({ message }: { message: string }) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <p className="text-5xl">❌</p>
      <h1 className="text-xl font-semibold">Link inválido</h1>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
