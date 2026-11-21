"use server";

// Server Action — inicia el pago con Stripe Checkout (modo test).
// Flujo: reserva stock + crea orden PENDING -> redirige a la página alojada de
// Stripe -> el webhook (/api/webhooks/stripe) confirma el pago, marca la orden
// PAID y genera los tickets. El dinero nunca se mueve en modo test.
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, ticketTypes, events } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { getCheckoutRateLimit } from "@/lib/redis";
import { getStripe } from "@/lib/stripe";

type State = { error: string | null };

// Construye la URL base desde los headers de la request (local y Vercel).
async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function createCheckoutSession(
  _prev: State,
  formData: FormData
): Promise<State> {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/eventos");

  const eventId = formData.get("eventId") as string;
  const ticketTypeId = formData.get("ticketTypeId") as string;
  const quantity = Math.max(1, parseInt(formData.get("quantity") as string));

  // Rate limiting — solo si Redis está configurado
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const hdrs = await headers();
    const ip = hdrs.get("x-forwarded-for") ?? "anonymous";
    const { success } = await getCheckoutRateLimit().limit(ip);
    if (!success) return { error: "Demasiados intentos. Espera unos minutos." };
  }

  const [event, ticketType] = await Promise.all([
    db.query.events.findFirst({ where: eq(events.id, eventId) }),
    db.query.ticketTypes.findFirst({ where: eq(ticketTypes.id, ticketTypeId) }),
  ]);
  if (!event || !ticketType) return { error: "Evento o ticket no encontrado." };

  const totalAmount = (Number(ticketType.price) * quantity).toFixed(2);

  // Reserva atómica de stock: incrementa soldQuantity solo si hay cupo. Si no
  // afecta filas, no había stock suficiente (evita oversell bajo concurrencia).
  const reserved = await db
    .update(ticketTypes)
    .set({ soldQuantity: sql`${ticketTypes.soldQuantity} + ${quantity}` })
    .where(
      and(
        eq(ticketTypes.id, ticketTypeId),
        sql`${ticketTypes.soldQuantity} + ${quantity} <= ${ticketTypes.totalQuantity}`
      )
    )
    .returning({ id: ticketTypes.id });

  if (reserved.length === 0) {
    return { error: "No hay suficientes tickets disponibles." };
  }

  // La disponibilidad pública cambió al reservar: invalida las queries cacheadas.
  // updateTag: invalidación inmediata (lee-tu-propio-write) desde Server Actions.
  updateTag("events");

  // Orden PENDING: el stock queda reservado hasta que el webhook la confirme
  // o la sesión de Stripe expire (y entonces se libera).
  const [order] = await db
    .insert(orders)
    .values({ buyerId: session.user.id, eventId, status: "PENDING", totalAmount })
    .returning();

  const baseUrl = await getBaseUrl();

  let checkoutUrl: string;
  try {
    const checkout = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity,
          price_data: {
            currency: ticketType.currency.toLowerCase(),
            unit_amount: Math.round(Number(ticketType.price) * 100),
            product_data: { name: `${event.title} — ${ticketType.name}` },
          },
        },
      ],
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        eventId,
        ticketTypeId,
        quantity: String(quantity),
        buyerId: session.user.id,
      },
      success_url: `${baseUrl}/dashboard?success=1`,
      cancel_url: `${baseUrl}/checkout?eventId=${eventId}&ticketTypeId=${ticketTypeId}&quantity=${quantity}`,
    });

    if (!checkout.url) throw new Error("Stripe no devolvió una URL de checkout");

    // Guarda el id de la sesión para trazabilidad / idempotencia del webhook.
    await db.update(orders).set({ paymentIntentId: checkout.id }).where(eq(orders.id, order.id));
    checkoutUrl = checkout.url;
  } catch {
    // Si Stripe falla, libera el stock reservado y cancela la orden.
    await db
      .update(ticketTypes)
      .set({ soldQuantity: sql`${ticketTypes.soldQuantity} - ${quantity}` })
      .where(eq(ticketTypes.id, ticketTypeId));
    await db.update(orders).set({ status: "CANCELLED" }).where(eq(orders.id, order.id));
    return { error: "No se pudo iniciar el pago. Intenta de nuevo." };
  }

  // redirect() soporta URLs externas: envía al usuario a la página de Stripe.
  redirect(checkoutUrl);
}
