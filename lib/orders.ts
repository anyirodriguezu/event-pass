// Fulfillment de órdenes — llamado desde el webhook de Stripe.
// payOrder y releaseOrder son idempotentes: Stripe puede reenviar un webhook
// varias veces, así que la transición de estado se hace con un UPDATE condicional
// (solo afecta filas si la orden sigue en el estado esperado).
import { db } from "@/lib/db";
import { orders, tickets, ticketTypes, events, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { createHmac, randomBytes } from "crypto";
import { sendTicketConfirmation } from "@/lib/email";
import { revalidateTag } from "next/cache";

// Hash único por ticket, firmado con AUTH_SECRET (anti-fraude en la puerta).
function generateQRCode(ticketId: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET!)
    .update(`${ticketId}-${randomBytes(16).toString("hex")}`)
    .digest("hex");
}

type FulfillInput = {
  orderId: string;
  ticketTypeId: string;
  quantity: number;
  buyerId: string;
  eventId: string;
  paymentIntentId?: string | null;
};

/**
 * Confirma una orden pagada: la pasa PENDING -> PAID, genera los tickets con QR
 * y envía el email. Idempotente: si la orden ya no está PENDING, no hace nada.
 */
export async function payOrder(input: FulfillInput): Promise<void> {
  // Claim atómico: solo un webhook gana la transición PENDING -> PAID.
  const claimed = await db
    .update(orders)
    .set({ status: "PAID", paymentIntentId: input.paymentIntentId ?? undefined })
    .where(and(eq(orders.id, input.orderId), eq(orders.status, "PENDING")))
    .returning({ id: orders.id });

  if (claimed.length === 0) return; // ya procesada, cancelada o inexistente

  const newTickets = await Promise.all(
    Array.from({ length: input.quantity }).map(async () => {
      const ticketId = crypto.randomUUID();
      const qrCode = generateQRCode(ticketId);
      const [t] = await db
        .insert(tickets)
        .values({
          id: ticketId,
          orderId: input.orderId,
          ticketTypeId: input.ticketTypeId,
          eventId: input.eventId,
          buyerId: input.buyerId,
          qrCode,
        })
        .returning();
      return t;
    })
  );

  // Email de confirmación — no bloquea ni revierte si falla.
  const [event, ticketType, buyer] = await Promise.all([
    db.query.events.findFirst({ where: eq(events.id, input.eventId) }),
    db.query.ticketTypes.findFirst({ where: eq(ticketTypes.id, input.ticketTypeId) }),
    db.query.users.findFirst({ where: eq(users.id, input.buyerId) }),
  ]);

  if (buyer?.email && event && ticketType) {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${newTickets[0].qrCode}`;
    await sendTicketConfirmation({
      to: buyer.email,
      buyerName: buyer.name ?? "Comprador",
      eventTitle: event.title,
      eventDate: new Date(event.startsAt).toLocaleDateString("es-PE"),
      venueName: event.venueName,
      ticketType: ticketType.name,
      qrUrl: qrImageUrl,
      ticketId: newTickets[0].id,
    }).catch(() => {});
  }
}

/**
 * Libera el stock de una orden no pagada (sesión de Stripe expirada/cancelada).
 * Idempotente: solo actúa si la orden sigue PENDING.
 */
export async function releaseOrder(input: {
  orderId: string;
  ticketTypeId: string;
  quantity: number;
}): Promise<void> {
  const claimed = await db
    .update(orders)
    .set({ status: "CANCELLED" })
    .where(and(eq(orders.id, input.orderId), eq(orders.status, "PENDING")))
    .returning({ id: orders.id });

  if (claimed.length === 0) return;

  await db
    .update(ticketTypes)
    .set({ soldQuantity: sql`GREATEST(${ticketTypes.soldQuantity} - ${input.quantity}, 0)` })
    .where(eq(ticketTypes.id, input.ticketTypeId));

  // En Route Handlers revalidateTag requiere un perfil de cacheLife ("max").
  revalidateTag("events", "max");
}
