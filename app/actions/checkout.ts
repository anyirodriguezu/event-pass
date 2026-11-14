"use server";

// Server Action — procesa el pago simulado
// Next.js ejecuta esto en el servidor: DB, email y rate limit sin exponer nada al cliente
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, tickets, ticketTypes, users, events } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createHmac, randomBytes } from "crypto";
import { sendTicketConfirmation } from "@/lib/email";
import { getCheckoutRateLimit } from "@/lib/redis";

function generateQRCode(ticketId: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET!)
    .update(`${ticketId}-${randomBytes(16).toString("hex")}`)
    .digest("hex");
}

type State = { error: string | null };

export async function processSimulatedPayment(
  _prev: State,
  formData: FormData
): Promise<State> {
  const session = await auth();
  if (!session) redirect("/login");

  const eventId     = formData.get("eventId") as string;
  const ticketTypeId = formData.get("ticketTypeId") as string;
  const quantity    = Math.max(1, parseInt(formData.get("quantity") as string));

  // Rate limiting — máx 5 intentos cada 10 minutos por IP
  const hdrs = await headers();
  const ip   = hdrs.get("x-forwarded-for") ?? "anonymous";
  const { success } = await getCheckoutRateLimit().limit(ip);
  if (!success) {
    return { error: "Demasiados intentos. Espera unos minutos." };
  }

  // Verificar disponibilidad
  const [event, ticketType] = await Promise.all([
    db.query.events.findFirst({ where: eq(events.id, eventId) }),
    db.query.ticketTypes.findFirst({ where: eq(ticketTypes.id, ticketTypeId) }),
  ]);

  if (!event || !ticketType) return { error: "Evento o ticket no encontrado." };

  const available = ticketType.totalQuantity - ticketType.soldQuantity;
  if (quantity > available) return { error: "No hay suficientes tickets disponibles." };

  const totalAmount = (Number(ticketType.price) * quantity).toFixed(2);

  // Crear orden
  const [order] = await db
    .insert(orders)
    .values({
      buyerId:         session.user.id,
      eventId,
      status:          "PAID",
      totalAmount,
      paymentIntentId: `sim_${randomBytes(8).toString("hex")}`,
    })
    .returning();

  // Crear tickets individuales con QR único por cada uno
  const newTickets = await Promise.all(
    Array.from({ length: quantity }).map(async () => {
      const ticketId = crypto.randomUUID();
      const qrCode   = generateQRCode(ticketId);
      const [ticket] = await db
        .insert(tickets)
        .values({ id: ticketId, orderId: order.id, ticketTypeId, eventId, buyerId: session.user.id, qrCode })
        .returning();
      return ticket;
    })
  );

  // Actualizar contador de vendidos
  await db
    .update(ticketTypes)
    .set({ soldQuantity: sql`${ticketTypes.soldQuantity} + ${quantity}` })
    .where(eq(ticketTypes.id, ticketTypeId));

  // Email de confirmación — usamos qrserver.com para generar la imagen del QR
  const buyer = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  if (buyer?.email) {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${newTickets[0].qrCode}`;
    await sendTicketConfirmation({
      to:         buyer.email,
      buyerName:  buyer.name ?? "Comprador",
      eventTitle: event.title,
      eventDate:  new Date(event.startsAt).toLocaleDateString("es-PE"),
      venueName:  event.venueName,
      ticketType: ticketType.name,
      qrUrl:      qrImageUrl,
      ticketId:   newTickets[0].id,
    }).catch(() => {}); // Email no bloquea el flujo si falla
  }

  redirect("/dashboard?success=1");
}
