import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { events, ticketTypes } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Props = {
  event: InferSelectModel<typeof events>;
  ticketType: InferSelectModel<typeof ticketTypes>;
  quantity: number;
};

export function OrderSummary({ event, ticketType, quantity }: Props) {
  const unitPrice = Number(ticketType.price);
  const total = unitPrice * quantity;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {event.coverUrl && (
          <div className="relative h-36 w-full rounded-xl overflow-hidden">
            <Image
              src={event.coverUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div>
          <h2 className="font-semibold text-lg leading-tight">{event.title}</h2>
          <div className="text-sm text-muted-foreground space-y-1 mt-2">
            <p>
              📅{" "}
              {format(
                new Date(event.startsAt),
                "EEEE d 'de' MMMM · HH:mm",
                { locale: es }
              )}
            </p>
            <p>📍 {event.venueName}</p>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {ticketType.name} × {quantity}
            </span>
            <span>S/ {(unitPrice * quantity).toFixed(2)}</span>
          </div>
          {quantity > 1 && (
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>Precio unitario</span>
              <span>S/ {unitPrice.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
