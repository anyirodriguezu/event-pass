// SSR — resumen de orden antes de redirigir a Stripe
// Patrón: datos en el servidor, solo el botón de "Pagar" es Client Component
// Evita que el usuario llegue a Stripe sin confirmar lo que compra
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, ticketTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import Link from "next/link";

export const metadata: Metadata = { title: "Confirmar compra" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    eventId?: string;
    ticketTypeId?: string;
    quantity?: string;
  }>;
}) {
  const session = await auth();
  const { eventId, ticketTypeId, quantity: qtyStr } = await searchParams;

  if (!session) redirect("/login?callbackUrl=/checkout");
  if (!eventId || !ticketTypeId) notFound();

  const qty = Math.max(1, parseInt(qtyStr ?? "1"));

  const [event, ticketType] = await Promise.all([
    db.query.events.findFirst({ where: eq(events.id, eventId) }),
    db.query.ticketTypes.findFirst({ where: eq(ticketTypes.id, ticketTypeId) }),
  ]);

  if (!event || !ticketType) notFound();

  const available = ticketType.totalQuantity - ticketType.soldQuantity;

  if (qty > available) {
    redirect(`/eventos/${event.slug}?error=no-stock`);
  }

  const total = Number(ticketType.price) * qty;
  const checkoutUrl = `/api/checkout?eventId=${eventId}&ticketTypeId=${ticketTypeId}&quantity=${qty}`;

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      {/* Shell estático — visible de inmediato */}
      <div>
        <h1 className="text-2xl font-bold">Confirmar compra</h1>
        <p className="text-muted-foreground text-sm">
          Revisa tu pedido antes de pagar
        </p>
      </div>

      {/* Resumen Server Component — no necesita hidratación */}
      <OrderSummary event={event} ticketType={ticketType} quantity={qty} />

      {/* Botón Client Component — solo para manejar el loading state */}
      {/* CheckoutForm usa variant="gradient" internamente */}
      <CheckoutForm checkoutUrl={checkoutUrl} total={total} />

      <p className="text-center text-xs text-muted-foreground">
        ¿Cambiaste de opinión?{" "}
        <Link
          href={`/eventos/${event.slug}`}
          className="text-purple-600 hover:underline"
        >
          Volver al evento
        </Link>
      </p>
    </div>
  );
}
