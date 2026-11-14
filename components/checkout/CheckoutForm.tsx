"use client";

// Client Component — maneja el estado de carga mientras redirige a Stripe
// No necesita fetch: Stripe Checkout es una redirección GET
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
        className="w-full h-12 text-base"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading
          ? "Redirigiendo a Stripe..."
          : `Pagar S/ ${total.toFixed(2)} con Stripe`}
      </Button>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>🔒</span>
        <span>Pago seguro procesado por Stripe</span>
      </div>
    </div>
  );
}
