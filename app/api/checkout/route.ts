import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, ticketTypes, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createCheckoutSession } from "@/lib/stripe";
import { checkoutRateLimit } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Rate limiting con Vercel KV (Upstash Redis)
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await checkoutRateLimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta en unos minutos." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const ticketTypeId = searchParams.get("ticketTypeId");
  const quantity = parseInt(searchParams.get("quantity") ?? "1");

  if (!eventId || !ticketTypeId) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const [event, ticketType] = await Promise.all([
    db.query.events.findFirst({ where: eq(events.id, eventId) }),
    db.query.ticketTypes.findFirst({ where: eq(ticketTypes.id, ticketTypeId) }),
  ]);

  if (!event || !ticketType) {
    return NextResponse.json({ error: "Evento o tipo de ticket no encontrado" }, { status: 404 });
  }

  const available = ticketType.totalQuantity - ticketType.soldQuantity;
  if (quantity > available) {
    return NextResponse.json({ error: "No hay suficientes tickets disponibles" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const checkoutSession = await createCheckoutSession({
    eventId,
    ticketTypeId,
    quantity,
    buyerId: session.user.id,
    eventTitle: event.title,
    ticketTypeName: ticketType.name,
    unitPrice: Number(ticketType.price),
    successUrl: `${appUrl}/dashboard?success=1`,
    cancelUrl: `${appUrl}/eventos/${event.slug}`,
  });

  return NextResponse.redirect(checkoutSession.url!);
}
