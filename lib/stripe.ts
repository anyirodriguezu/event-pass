import Stripe from "stripe";

// Inicialización lazy — evita crash en build time si STRIPE_SECRET_KEY no está configurada
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export async function createCheckoutSession({
  eventId,
  ticketTypeId,
  quantity,
  buyerId,
  eventTitle,
  ticketTypeName,
  unitPrice,
  successUrl,
  cancelUrl,
}: {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  buyerId: string;
  eventTitle: string;
  ticketTypeName: string;
  unitPrice: number;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "pen",
          product_data: {
            name: `${eventTitle} — ${ticketTypeName}`,
          },
          unit_amount: Math.round(unitPrice * 100), // Stripe usa centavos
        },
        quantity,
      },
    ],
    metadata: { eventId, ticketTypeId, buyerId, quantity: String(quantity) },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}
