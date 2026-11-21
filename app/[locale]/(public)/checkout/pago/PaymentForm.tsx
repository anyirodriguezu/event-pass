"use client";

// Client Component — botón de pago con Stripe Checkout (modo test).
// Demuestra: useActionState (React 19) + useFormStatus. La Server Action crea la
// sesión de Stripe y redirige a su página alojada; aquí no se tocan datos de tarjeta
// (eso ocurre en Stripe, cumpliendo PCI sin esfuerzo).
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCheckoutSession } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, AlertCircle, Loader2 } from "lucide-react";

function SubmitButton({ total }: { total: number }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="gradient"
      className="w-full h-12 text-base font-semibold rounded-xl"
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          Redirigiendo a Stripe...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Lock className="size-4" />
          Pagar con Stripe — S/ {total.toFixed(2)}
        </span>
      )}
    </Button>
  );
}

export function PaymentForm({
  eventId,
  ticketTypeId,
  quantity,
  total,
}: {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  total: number;
}) {
  const [state, action] = useActionState(createCheckoutSession, { error: null });

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="eventId" value={eventId} />
      <input type="hidden" name="ticketTypeId" value={ticketTypeId} />
      <input type="hidden" name="quantity" value={quantity} />

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <SubmitButton total={total} />

      <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 px-4 py-3">
        <ShieldCheck className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          <strong>Pago de prueba (Stripe test mode)</strong> — serás redirigido a la
          página segura de Stripe. No se cobra dinero real. Usa la tarjeta de prueba{" "}
          <span className="font-mono">4242 4242 4242 4242</span>, cualquier fecha futura y
          cualquier CVC.
        </p>
      </div>
    </form>
  );
}
