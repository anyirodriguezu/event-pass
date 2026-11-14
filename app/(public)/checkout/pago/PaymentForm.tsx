"use client";

// Client Component — UI de pago simulado
// Demuestra: useActionState (React 19), useFormStatus, animaciones en tiempo real
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { processSimulatedPayment } from "@/app/actions/checkout";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CreditCard, Lock, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "cn";

// ── Submit button — usa useFormStatus para leer el estado del form padre ──
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
          Procesando pago...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Lock className="size-4" />
          Confirmar pago — S/ {total.toFixed(2)}
        </span>
      )}
    </Button>
  );
}

// ── Chip SVG ──────────────────────────────────────────────────────────────
function ChipIcon() {
  return (
    <svg width="34" height="26" viewBox="0 0 34 26" fill="none" className="opacity-90">
      <rect width="34" height="26" rx="4" fill="#D4A843" />
      <rect x="1" y="8" width="32" height="10" fill="#C49A30" />
      <rect x="11" y="1" width="12" height="24" fill="#C49A30" />
      <rect x="13" y="1" width="8" height="24" fill="#D4A843" />
      <rect x="1" y="10" width="32" height="6" fill="#D4A843" />
      <rect x="13" y="8" width="8" height="10" rx="1" fill="#B8860B" opacity="0.6" />
    </svg>
  );
}

// ── Card preview animado ──────────────────────────────────────────────────
function CardPreview({
  number, name, expiry, flipped,
}: {
  number: string; name: string; expiry: string; flipped: boolean;
}) {
  const displayNumber = number.padEnd(16, "·").replace(/(.{4})/g, "$1 ").trim();
  const masked = displayNumber.split(" ").map((g, i) =>
    i < 3 ? g.replace(/\d/g, "•") : g
  ).join(" ");

  return (
    <div className="relative h-44 w-full perspective-[1000px]" style={{ perspective: "1000px" }}>
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)",
          }}
        >
          {/* Shine */}
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(ellipse at 30% 20%, white 0%, transparent 60%)" }}
          />
          <div className="flex justify-between items-start">
            <ChipIcon />
            <span className="text-white/60 text-xs font-mono tracking-widest">VISA</span>
          </div>
          <div>
            <p className="text-white font-mono text-lg tracking-widest mb-3 tabular-nums">
              {masked || "•••• •••• •••• ••••"}
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/50 text-[9px] uppercase tracking-widest mb-0.5">Titular</p>
                <p className="text-white text-sm font-medium uppercase tracking-wide truncate max-w-[160px]">
                  {name || "NOMBRE COMPLETO"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-[9px] uppercase tracking-widest mb-0.5">Vence</p>
                <p className="text-white text-sm font-mono">{expiry || "MM/AA"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)",
          }}
        >
          <div className="w-full h-10 bg-black/70 mt-6" />
          <div className="px-5 mt-4">
            <p className="text-white/50 text-[9px] uppercase tracking-widest mb-1">CVV</p>
            <div className="bg-white/90 rounded px-3 py-1.5 w-16 text-center">
              <p className="text-gray-800 font-mono text-sm tracking-widest">•••</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
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
  const [state, action] = useActionState(processSimulatedPayment, { error: null });

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName]     = useState("");
  const [expiry, setExpiry]         = useState("");
  const [cvv, setCvv]               = useState("");
  const [flipped, setFlipped]       = useState(false);

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const inputCls = cn(
    "w-full rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm",
    "placeholder:text-muted-foreground/50 focus:outline-none focus:border-violet-500",
    "focus:ring-2 focus:ring-violet-500/20 transition-all"
  );

  return (
    <form action={action} className="space-y-5">
      {/* Hidden fields */}
      <input type="hidden" name="eventId"      value={eventId} />
      <input type="hidden" name="ticketTypeId" value={ticketTypeId} />
      <input type="hidden" name="quantity"     value={quantity} />

      {/* Card preview */}
      <CardPreview number={cardNumber} name={cardName} expiry={expiry} flipped={flipped} />

      {/* Card number */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Número de tarjeta
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className={cn(inputCls, "pr-10 font-mono tracking-widest")}
            maxLength={19}
            required
          />
          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
        </div>
      </div>

      {/* Cardholder name */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Nombre del titular
        </label>
        <input
          type="text"
          placeholder="Como aparece en tu tarjeta"
          value={cardName}
          onChange={(e) => setCardName(e.target.value.toUpperCase())}
          className={cn(inputCls, "uppercase")}
          required
        />
      </div>

      {/* Expiry + CVV */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Vencimiento
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM/AA"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            className={cn(inputCls, "font-mono")}
            maxLength={5}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            CVV
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onFocus={() => setFlipped(true)}
            onBlur={() => setFlipped(false)}
            className={cn(inputCls, "font-mono tracking-widest")}
            maxLength={4}
            required
          />
        </div>
      </div>

      {/* Error */}
      {state.error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <SubmitButton total={total} />

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 px-4 py-3">
        <ShieldCheck className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          <strong>Pago simulado</strong> — ningún dato es procesado ni cobrado. Usa cualquier número de tarjeta válido (ej: 4242 4242 4242 4242).
        </p>
      </div>
    </form>
  );
}
