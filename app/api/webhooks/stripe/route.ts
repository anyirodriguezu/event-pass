// Webhook de Stripe — Node runtime (necesita el cuerpo crudo para verificar firma).
// Stripe firma cada evento con STRIPE_WEBHOOK_SECRET; verificamos esa firma antes
// de confiar en el payload, para que nadie pueda falsificar un "pago exitoso".
// En local obtienes el secret con:  stripe listen --forward-to localhost:3000/api/webhooks/stripe
import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { payOrder, releaseOrder } from "@/lib/orders";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Falta la firma" }, { status: 400 });

  // Cuerpo CRUDO: la firma se calcula sobre los bytes exactos, no sobre el JSON parseado.
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    // Firma inválida o secret incorrecto → posible intento de falsificación.
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  switch (event.type) {
    // Pago confirmado → marcar orden PAID y generar tickets.
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const m = s.metadata ?? {};
      if (m.orderId && m.ticketTypeId && m.quantity && m.buyerId && m.eventId) {
        await payOrder({
          orderId: m.orderId,
          ticketTypeId: m.ticketTypeId,
          quantity: parseInt(m.quantity),
          buyerId: m.buyerId,
          eventId: m.eventId,
          paymentIntentId: typeof s.payment_intent === "string" ? s.payment_intent : null,
        });
      }
      break;
    }

    // Sesión expirada sin pagar → liberar el stock reservado.
    case "checkout.session.expired": {
      const s = event.data.object as Stripe.Checkout.Session;
      const m = s.metadata ?? {};
      if (m.orderId && m.ticketTypeId && m.quantity) {
        await releaseOrder({
          orderId: m.orderId,
          ticketTypeId: m.ticketTypeId,
          quantity: parseInt(m.quantity),
        });
      }
      break;
    }
  }

  // Siempre 200 ante un evento válido: así Stripe deja de reintentarlo.
  return NextResponse.json({ received: true });
}
