import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, MapPin, QrCode } from "lucide-react";
import { cn } from "cn";
import type { tickets, events, ticketTypes } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Props = {
  ticket: InferSelectModel<typeof tickets>;
  event: InferSelectModel<typeof events>;
  ticketType: InferSelectModel<typeof ticketTypes>;
  style?: React.CSSProperties;
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  ACTIVE:      { label: "Activo",      dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  USED:        { label: "Usado",       dot: "bg-gray-400",    text: "text-gray-500" },
  CANCELLED:   { label: "Cancelado",   dot: "bg-red-500",     text: "text-red-600 dark:text-red-400" },
  TRANSFERRED: { label: "Transferido", dot: "bg-blue-500",    text: "text-blue-600 dark:text-blue-400" },
};

export function TicketCard({ ticket, event, ticketType, style }: Props) {
  const status = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.ACTIVE;

  return (
    <Link
      href={`/dashboard/ticket/${ticket.id}`}
      className="group block animate-ticket-enter"
      style={style}
    >
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
        {/* Top accent stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-600 to-fuchsia-500" />

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <h3 className="font-bold leading-tight text-base truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {event.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{ticketType.name}</p>
            </div>
            {/* Status */}
            <div className={cn("flex items-center gap-1.5 shrink-0 text-xs font-semibold", status.text)}>
              <span className={cn("size-1.5 rounded-full inline-block", status.dot)} />
              {status.label}
            </div>
          </div>

          {/* Perforation */}
          <div className="ticket-perforation" />

          {/* Event details */}
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-3.5 text-violet-500 shrink-0" />
              <span className="capitalize">
                {format(new Date(event.startsAt), "d MMM yyyy · HH:mm", { locale: es })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-fuchsia-500 shrink-0" />
              <span className="truncate">{event.venueName}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-mono text-muted-foreground/60 truncate max-w-[100px]">
              #{ticket.id.slice(0, 8)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:gap-2.5 transition-all">
              <QrCode className="size-3.5" />
              Ver QR
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
