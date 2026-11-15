"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import type { ticketTypes } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import { Minus, Plus, Ticket, ShieldCheck } from "lucide-react";

type TicketType = InferSelectModel<typeof ticketTypes>;

export function TicketSelector({
  ticketTypes,
  eventId,
}: {
  ticketTypes: TicketType[];
  eventId: string;
}) {
  const [selected, setSelected] = useState<string | null>(
    ticketTypes.find((t) => t.totalQuantity - t.soldQuantity > 0)?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);

  const selectedType = ticketTypes.find((t) => t.id === selected);
  const available = selectedType
    ? selectedType.totalQuantity - selectedType.soldQuantity
    : 0;
  const total = selectedType ? Number(selectedType.price) * quantity : 0;

  const handleCheckout = () => {
    if (!selected) return;
    const params = new URLSearchParams({
      eventId,
      ticketTypeId: selected,
      quantity: String(quantity),
    });
    window.location.href = `/checkout?${params.toString()}`;
  };

  if (ticketTypes.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-6 text-center space-y-2">
        <Ticket className="size-8 mx-auto text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">No hay tickets disponibles aún.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2">
        <Ticket className="size-4 text-violet-500" />
        <h3 className="font-semibold text-sm">Selecciona tu entrada</h3>
      </div>

      <div className="p-4 space-y-3">
        {/* Ticket types */}
        {ticketTypes.map((type) => {
          const avail = type.totalQuantity - type.soldQuantity;
          const isSelected = selected === type.id;
          const isSoldOut = avail === 0;

          return (
            <button
              key={type.id}
              onClick={() => { if (!isSoldOut) { setSelected(type.id); setQuantity(1); }}}
              disabled={isSoldOut}
              className={cn(
                "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                isSelected
                  ? "border-violet-500 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 shadow-[0_0_0_1px_oklch(0.52_0.265_295/0.3)]"
                  : isSoldOut
                  ? "border-border/40 opacity-50 cursor-not-allowed"
                  : "border-border/60 hover:border-violet-400/50 hover:bg-muted/40"
              )}
            >
              <div className="flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">{type.name}</p>
                    {isSoldOut && (
                      <Badge variant="destructive" className="text-xs shrink-0">Agotado</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isSoldOut ? "Sin disponibilidad" : `${avail} disponibles`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn("font-bold text-base", isSelected && "gradient-brand-text")}>
                    {type.currency} {Number(type.price).toFixed(2)}
                  </p>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-violet-500 ml-auto mt-1" />
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* Quantity selector */}
        {selected && available > 0 && (
          <div className="flex items-center justify-between pt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-sm font-medium">Cantidad</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="size-8 rounded-lg border border-border/60 hover:border-violet-400 hover:bg-violet-500/10 flex items-center justify-center transition-all active:scale-90"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-8 text-center font-semibold tabular-nums">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(Math.min(available, 10), quantity + 1))}
                className="size-8 rounded-lg border border-border/60 hover:border-violet-400 hover:bg-violet-500/10 flex items-center justify-center transition-all active:scale-90"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Separator */}
        {selected && available > 0 && (
          <div className="ticket-perforation my-1" />
        )}

        {/* CTA */}
        <Button
          variant="gradient"
          className="w-full h-11 text-sm font-semibold rounded-xl"
          disabled={!selected || available === 0}
          onClick={handleCheckout}
        >
          {!selected
            ? "Selecciona un ticket"
            : available === 0
            ? "Sin disponibilidad"
            : `Comprar · ${selectedType?.currency} ${total.toFixed(2)}`}
        </Button>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          Pago seguro · QR anti-fraude
        </div>
      </div>
    </div>
  );
}
