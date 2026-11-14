// Webhook de Stripe — se ejecuta cuando el pago es exitoso
// Crea la orden y los tickets individuales con QR único
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders, tickets, ticketTypes, events, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { uploadQRCode } from "@/lib/blob";
import { sendTicketConfirmation } from "@/lib/email";
import { createHmac, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

// Necesario para leer el body raw (Stripe verifica la firma)
export const runtime = "nodejs";

function generateQRCode(ticketId: string, secret: string) {
  // Hash HMAC-SHA256 para hacer el QR único y verificable
  return createHmac("sha256", secret)
    .update(`${ticketId}-${randomBytes(16).toString("hex")}`)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const { eventId, ticketTypeId, buyerId, quantity } = session.metadata!;
  const qty = parseInt(quantity);

  // Crear orden
  const [order] = await db
    .insert(orders)
    .values({
      buyerId,
      eventId,
      status: "PAID",
      totalAmount: String((session.amount_total ?? 0) / 100),
      paymentIntentId: session.payment_intent as string,
    })
    .returning();

  // Crear tickets individuales con QR único por cada uno
  const newTickets = await Promise.all(
    Array.from({ length: qty }).map(async () => {
      const ticketId = crypto.randomUUID();
      const qrCode = generateQRCode(ticketId, process.env.AUTH_SECRET!);

      // Guardar QR como imagen en Vercel Blob
      // (el QR real se genera en el cliente, aquí guardamos el código)
      const [ticket] = await db
        .insert(tickets)
        .values({
          id: ticketId,
          orderId: order.id,
          ticketTypeId,
          eventId,
          buyerId,
          qrCode,
        })
        .returning();

      return ticket;
    })
  );

  // Actualizar contador de vendidos
  await db
    .update(ticketTypes)
    .set({ soldQuantity: sql`${ticketTypes.soldQuantity} + ${qty}` })
    .where(eq(ticketTypes.id, ticketTypeId));

  // Enviar email de confirmación
  const [buyer, eventData, ticketType] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, buyerId) }),
    db.query.events.findFirst({ where: eq(events.id, eventId) }),
    db.query.ticketTypes.findFirst({ where: eq(ticketTypes.id, ticketTypeId) }),
  ]);

  if (buyer?.email && eventData && ticketType) {
    await sendTicketConfirmation({
      to: buyer.email,
      buyerName: buyer.name ?? "Comprador",
      eventTitle: eventData.title,
      eventDate: eventData.startsAt.toLocaleDateString("es-PE"),
      venueName: eventData.venueName,
      ticketType: ticketType.name,
      qrUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ticket/${newTickets[0].id}`,
      ticketId: newTickets[0].id,
    });
  }

  return NextResponse.json({ received: true });
}
