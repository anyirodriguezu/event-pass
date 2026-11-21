import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets, events, ticketTypes, orders, refunds } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TicketQR } from "@/components/tickets/TicketQR";
import { TransferButton } from "@/components/tickets/TransferButton";
import { RefundButton } from "@/components/tickets/RefundButton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "cn";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi ticket" };

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  ACTIVE:      { label: "✓ Activo",      cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  USED:        { label: "Usado",         cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 border-gray-300/40" },
  CANCELLED:   { label: "Cancelado",     cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30" },
  TRANSFERRED: { label: "Transferido",   cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" },
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const result = await db
    .select({ ticket: tickets, event: events, ticketType: ticketTypes })
    .from(tickets)
    .innerJoin(events, eq(tickets.eventId, events.id))
    .innerJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
    .where(and(eq(tickets.id, id), eq(tickets.buyerId, session!.user.id)))
    .limit(1);

  if (result.length === 0) notFound();

  const { ticket, event, ticketType } = result[0];
  const status = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.ACTIVE;
  const isActive = ticket.status === "ACTIVE";

  // Estado de reembolso de la ORDEN del ticket (un reembolso aplica a toda la compra).
  const order = await db.query.orders.findFirst({ where: eq(orders.id, ticket.orderId) });
  const activeRefund = await db.query.refunds.findFirst({
    where: and(eq(refunds.orderId, ticket.orderId), ne(refunds.status, "REJECTED")),
  });

  return (
    <div className="max-w-sm mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/dashboard">
          <ArrowLeft className="size-4" /> Mis tickets
        </Link>
      </Button>

      {/* Ticket card */}
      <div className="rounded-3xl overflow-hidden border border-border/60 shadow-xl bg-card">

        {/* Gradient header */}
        <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 px-6 py-7 text-white space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
                {ticketType.name}
              </p>
              <h1 className="text-xl font-bold leading-tight">{event.title}</h1>
            </div>
            <span className="text-3xl">🎟️</span>
          </div>
          <div className="space-y-1.5 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-3.5 shrink-0" />
              <span className="capitalize">
                {format(new Date(event.startsAt), "EEEE d 'de' MMMM · HH:mm", { locale: es })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" />
              <span>{event.venueName}</span>
            </div>
          </div>
        </div>

        {/* Perforation */}
        <div className="relative flex items-center px-4">
          <div className="absolute -left-3 size-6 rounded-full bg-background border-r border-border/60" />
          <div className="ticket-perforation w-full" />
          <div className="absolute -right-3 size-6 rounded-full bg-background border-l border-border/60" />
        </div>

        {/* QR section */}
        <div className="px-6 py-8 flex flex-col items-center gap-5">
          <TicketQR qrCode={ticket.qrCode} disabled={!isActive} />

          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold",
              status.cls
            )}
          >
            {status.label}
          </div>

          <p className="text-xs text-muted-foreground/60 font-mono">
            #{ticket.id.slice(0, 16).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Transfer */}
      {isActive && <TransferButton ticketId={ticket.id} />}

      {/* Reembolso — a nivel de orden */}
      {activeRefund ? (
        <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-center text-muted-foreground">
          {activeRefund.status === "PENDING"
            ? "⏳ Reembolso solicitado — en revisión por un administrador."
            : "✓ Reembolso aprobado. El pago fue devuelto."}
        </div>
      ) : (
        order?.status === "PAID" && <RefundButton orderId={order.id} />
      )}
    </div>
  );
}
