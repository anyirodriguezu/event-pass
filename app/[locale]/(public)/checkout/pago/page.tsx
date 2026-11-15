// Página de pago simulado — Server Component
// Carga datos en servidor, el formulario interactivo es un Client Component aparte
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, ticketTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { PaymentForm } from "./PaymentForm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, MapPin, ArrowLeft, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Pagar" };

export default async function PagoPage({
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

  const total = Number(ticketType.price) * qty;

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/checkout?eventId=${eventId}&ticketTypeId=${ticketTypeId}&quantity=${qty}`}>
          <ArrowLeft className="size-4" /> Volver al resumen
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Datos de pago</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Simulación segura — sin cargos reales
        </p>
      </div>

      {/* Order mini-summary */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Ticket className="size-4 text-violet-500" />
          <span>{event.title}</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {format(new Date(event.startsAt), "d MMM yyyy · HH:mm", { locale: es })}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {event.venueName}
          </div>
        </div>
        <div className="ticket-perforation" />
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            {ticketType.name} × {qty}
          </span>
          <span className="font-bold gradient-brand-text text-base">
            S/ {total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment form — Client Component */}
      <PaymentForm
        eventId={eventId}
        ticketTypeId={ticketTypeId}
        quantity={qty}
        total={total}
      />
    </div>
  );
}
