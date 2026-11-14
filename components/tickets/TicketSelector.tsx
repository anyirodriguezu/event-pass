"use client";
// Client Component — maneja la selección de tickets y el contador de disponibilidad
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ticketTypes } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type TicketType = InferSelectModel<typeof ticketTypes>;

export function TicketSelector({
  ticketTypes,
  eventId,
}: {
  ticketTypes: TicketType[];
  eventId: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selectedType = ticketTypes.find((t) => t.id === selected);
  const available = selectedType
    ? selectedType.totalQuantity - selectedType.soldQuantity
    : 0;

  const handleCheckout = () => {
    if (!selected) return;
    const params = new URLSearchParams({
      eventId,
      ticketTypeId: selected,
      quantity: String(quantity),
    });
    // Redirige a la página de resumen antes de Stripe
    window.location.href = `/checkout?${params.toString()}`;
  };

  if (ticketTypes.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          No hay tickets disponibles
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ticketTypes.map((type) => {
          const avail = type.totalQuantity - type.soldQuantity;
          const isSelected = selected === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setSelected(type.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                isSelected
                  ? "border-purple-600 bg-purple-50"
                  : "border-border hover:border-purple-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{type.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {avail > 0 ? `${avail} disponibles` : "Agotado"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {type.currency} {Number(type.price).toFixed(2)}
                  </p>
                  {avail === 0 && <Badge variant="destructive" className="text-xs">Agotado</Badge>}
                </div>
              </div>
            </button>
          );
        })}

        {selected && available > 0 && (
          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm">Cantidad:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </Button>
              <span className="w-6 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.min(available, quantity + 1))}
              >
                +
              </Button>
            </div>
          </div>
        )}

        <Button
          variant="gradient"
          className="w-full"
          disabled={!selected || available === 0}
          onClick={handleCheckout}
        >
          {selected && available > 0
            ? `Comprar — ${selectedType?.currency} ${(Number(selectedType?.price) * quantity).toFixed(2)}`
            : "Selecciona un ticket"}
        </Button>
      </CardContent>
    </Card>
  );
}
