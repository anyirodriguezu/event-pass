"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";

export function CheckoutForm({
  checkoutUrl,
  total,
}: {
  checkoutUrl: string;
  total: number;
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    setLoading(true);
    window.location.href = checkoutUrl;
  };

  return (
    <div className="space-y-3">
      <Button
        variant="gradient"
        className="w-full h-12 text-base font-semibold rounded-xl relative overflow-hidden"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Redirigiendo a Stripe...
          </span>
        ) : (
          <>
            Pagar S/ {total.toFixed(2)}
            {/* shimmer on hover */}
            <span className="absolute inset-0 opacity-0 hover:opacity-100 animate-shimmer transition-opacity duration-300" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-emerald-500" />
        <span>Pago seguro procesado por Stripe</span>
      </div>
    </div>
  );
}
