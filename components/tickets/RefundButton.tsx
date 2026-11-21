"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { requestRefund } from "@/actions/refunds";
import { AlertCircle, CheckCircle2 } from "lucide-react";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" size="sm" className="w-full" disabled={pending}>
      {pending ? "Enviando..." : "Enviar solicitud"}
    </Button>
  );
}

export function RefundButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(requestRefund.bind(null, orderId), {
    error: null,
  });

  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="size-4 shrink-0" />
        Solicitud enviada. Un administrador la revisará.
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => setOpen(true)}>
        Solicitar reembolso
      </Button>
    );
  }

  return (
    <form action={action} className="space-y-2 rounded-lg border border-border/60 p-3">
      <label className="text-xs font-medium text-muted-foreground">
        Motivo del reembolso (opcional)
      </label>
      <textarea
        name="reason"
        rows={2}
        placeholder="Ej. no puedo asistir al evento"
        className="w-full rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
      />
      {state.error && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="size-3.5 shrink-0" />
          {state.error}
        </div>
      )}
      <Submit />
    </form>
  );
}
