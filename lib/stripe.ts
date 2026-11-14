import Stripe from "stripe";

// Proxy lazy — Stripe no se instancia al importar el módulo sino al primer uso
// Esto evita el crash en build time cuando STRIPE_SECRET_KEY no está configurada
let _instance: Stripe | undefined;

function getInstance(): Stripe {
  if (!_instance) _instance = new Stripe(process.env.STRIPE_SECRET_KEY!);
  return _instance;
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop: string) {
    return (getInstance() as any)[prop];
  },
});

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
          product_data: { name: `${eventTitle} — ${ticketTypeName}` },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity,
      },
    ],
    metadata: { eventId, ticketTypeId, buyerId, quantity: String(quantity) },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}
