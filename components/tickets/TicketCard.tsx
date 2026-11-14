import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { tickets, events, ticketTypes } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Props = {
  ticket: InferSelectModel<typeof tickets>;
  event: InferSelectModel<typeof events>;
  ticketType: InferSelectModel<typeof ticketTypes>;
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIVE:      { label: "Activo",      className: "bg-green-100 text-green-700" },
  USED:        { label: "Usado",       className: "bg-gray-100 text-gray-500" },
  CANCELLED:   { label: "Cancelado",   className: "bg-red-100 text-red-700" },
  TRANSFERRED: { label: "Transferido", className: "bg-blue-100 text-blue-700" },
};

export function TicketCard({ ticket, event, ticketType }: Props) {
  const status = STATUS_MAP[ticket.status] ?? STATUS_MAP.ACTIVE;
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold leading-tight">{event.title}</h3>
            <p className="text-sm text-muted-foreground">{ticketType.name}</p>
          </div>
          <Badge className={`${status.className} shrink-0`}>{status.label}</Badge>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>📅 {format(new Date(event.startsAt), "d MMM yyyy · HH:mm", { locale: es })}</p>
          <p>📍 {event.venueName}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/dashboard/ticket/${ticket.id}`}>Ver QR</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
