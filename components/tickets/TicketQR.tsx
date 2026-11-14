"use client";
import QRCode from "react-qr-code";

export function TicketQR({
  qrCode,
  disabled,
}: {
  qrCode: string;
  disabled: boolean;
}) {
  return (
    <div className={`inline-block p-3 bg-white rounded-xl ${disabled ? "opacity-40 grayscale" : ""}`}>
      <QRCode value={qrCode} size={200} />
    </div>
  );
}
