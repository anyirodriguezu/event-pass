"use client";
// Client Component — necesita acceso a la cámara del dispositivo
// Usa html5-qrcode para escanear QRs con la cámara
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ScanResult = {
  valid: boolean;
  message: string;
  buyer?: string;
  ticketType?: string;
};

export function QRScanner({ eventId }: { eventId: string }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    setResult(null);
    setError(null);
    setScanning(true);

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" }, // cámara trasera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // QR detectado — detener cámara y validar
          await scanner.stop();
          setScanning(false);
          await validateQR(decodedText);
        },
        undefined
      );
    } catch {
      setError("No se pudo acceder a la cámara");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    setScanning(false);
  };

  const validateQR = async (qrCode: string) => {
    try {
      const res = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Error al validar el ticket");
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {/* Área de la cámara */}
      <div
        id="qr-reader"
        className={`w-full rounded-xl overflow-hidden bg-black ${
          !scanning ? "hidden" : ""
        }`}
        style={{ minHeight: 300 }}
      />

      {!scanning && (
        <Card>
          <CardContent className="p-8 flex flex-col items-center gap-4">
            <div className="text-6xl">📷</div>
            <p className="text-muted-foreground text-sm text-center">
              Presiona el botón para activar la cámara y escanear el QR del asistente
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resultado del scan */}
      {result && (
        <Card
          className={
            result.valid
              ? "border-green-500 bg-green-50"
              : "border-red-400 bg-red-50"
          }
        >
          <CardContent className="p-4 space-y-1">
            <p className={`font-bold text-lg ${result.valid ? "text-green-700" : "text-red-700"}`}>
              {result.message}
            </p>
            {result.buyer && <p className="text-sm">👤 {result.buyer}</p>}
            {result.ticketType && <p className="text-sm">🎟️ {result.ticketType}</p>}
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

      <div className="flex gap-3">
        {!scanning ? (
          <Button onClick={startScanner} variant="gradient" className="flex-1">
            Escanear QR
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="outline" className="flex-1">
            Detener
          </Button>
        )}
        {result && (
          <Button
            onClick={() => {
              setResult(null);
              startScanner();
            }}
            variant="outline"
            className="flex-1"
          >
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
}
