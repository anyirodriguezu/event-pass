"use client";

import QRCode from "react-qr-code";
import { cn } from "cn";

export function TicketQR({
  qrCode,
  disabled,
}: {
  qrCode: string;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          "relative inline-block p-4 bg-white rounded-2xl transition-all duration-500",
          !disabled && "animate-glow-ring animate-float",
          disabled && "opacity-40 grayscale"
        )}
      >
        <QRCode value={qrCode} size={180} />
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20 backdrop-blur-[1px]">
            <span className="text-xs font-semibold text-white bg-black/60 px-3 py-1 rounded-full">
              No disponible
            </span>
          </div>
        )}
      </div>
      {!disabled && (
        <p className="text-xs text-muted-foreground animate-in fade-in duration-700 delay-300">
          Presenta este QR en la entrada
        </p>
      )}
    </div>
  );
}
