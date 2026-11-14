"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EventPass Error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-5">
      <p className="text-5xl">⚠️</p>
      <div className="space-y-2">
        <h2 className="font-heading font-bold text-2xl">Algo salió mal</h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 font-mono">
            ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="gradient" onClick={reset}>
          Reintentar
        </Button>
        <Button variant="outline" asChild>
          <a href="/">Ir al inicio</a>
        </Button>
      </div>
    </div>
  );
}
