"use client";

import { useOptimistic, useTransition, useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { validateTicketByQR, type ScanResult } from "@/actions/checkin";
import { CheckCircle2, XCircle, Loader2, Camera, CameraOff } from "lucide-react";
import { cn } from "cn";

type ScanEntry = ScanResult & {
  id: string;
  status: "pending" | "valid" | "invalid";
};

export function QRScanner({ eventId }: { eventId: string }) {
  const [scans, setScans] = useState<ScanEntry[]>([]);
  // useOptimistic: mantiene una versión optimista de la lista de scans.
  // Cuando se detecta un QR, agrega la entrada ANTES de que el servidor responda.
  // Si el servidor falla, React descarta la entrada optimista y muestra el estado real.
  const [optimisticScans, addOptimistic] = useOptimistic(
    scans,
    (current, entry: ScanEntry) => [entry, ...current].slice(0, 5)
  );
  const [, startTransition] = useTransition();
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false); // evita procesar el mismo QR dos veces

  const startScanner = async () => {
    setCameraError(null);
    setScanning(true);
    processingRef.current = false;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (processingRef.current) return;
          processingRef.current = true;
          handleQRDetected(decodedText, scanner);
        },
        undefined
      );
    } catch {
      setCameraError("No se pudo acceder a la cámara. Verifica los permisos.");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleQRDetected = (qrCode: string, scanner: Html5Qrcode) => {
    scanner.stop().catch(() => {});
    setScanning(false);

    const id = crypto.randomUUID();

    startTransition(async () => {
      // 1. Entrada optimista — aparece INMEDIATAMENTE, sin esperar al servidor
      addOptimistic({ id, status: "pending", valid: false, message: "Validando..." });

      // 2. Server Action — valida en la DB y marca el ticket como usado
      const result = await validateTicketByQR(qrCode, eventId);

      // 3. Actualiza el estado real — reemplaza la entrada optimista con el resultado
      setScans((prev) =>
        [
          { id, status: (result.valid ? "valid" : "invalid") as ScanEntry["status"], ...result },
          ...prev,
        ].slice(0, 5)
      );
    });
  };

  useEffect(() => () => { stopScanner(); }, []);

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {/* Área de cámara */}
      <div
        id="qr-reader"
        className={cn(
          "w-full rounded-2xl overflow-hidden bg-black border border-border/60",
          !scanning && "hidden"
        )}
        style={{ minHeight: 300 }}
      />

      {/* Estado idle */}
      {!scanning && (
        <div className="rounded-2xl border border-border/60 bg-card p-8 flex flex-col items-center gap-3 text-center">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
            <Camera className="size-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Activa la cámara para escanear el QR del asistente
          </p>
        </div>
      )}

      {/* Controles */}
      <div className="flex gap-3">
        {!scanning ? (
          <Button onClick={startScanner} variant="gradient" className="flex-1 h-11">
            <Camera className="size-4 mr-2" />
            Escanear QR
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="outline" className="flex-1 h-11">
            <CameraOff className="size-4 mr-2" />
            Detener
          </Button>
        )}
        {optimisticScans.length > 0 && !scanning && (
          <Button onClick={startScanner} variant="outline" className="flex-1 h-11">
            Siguiente
          </Button>
        )}
      </div>

      {cameraError && (
        <p className="text-sm text-red-500 text-center">{cameraError}</p>
      )}

      {/* Historial de scans con useOptimistic */}
      {optimisticScans.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-1">
            Últimos escaneos
          </p>
          {optimisticScans.map((scan, i) => (
            <div
              key={scan.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-all duration-300",
                i === 0 && "animate-in slide-in-from-top-2 duration-300",
                scan.status === "pending" && "border-border/60 bg-muted/30",
                scan.status === "valid" &&
                  "border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/30",
                scan.status === "invalid" &&
                  "border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/30"
              )}
            >
              {scan.status === "pending" && (
                <Loader2 className="size-5 text-muted-foreground animate-spin shrink-0 mt-0.5" />
              )}
              {scan.status === "valid" && (
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              )}
              {scan.status === "invalid" && (
                <XCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-semibold text-sm",
                    scan.status === "valid" && "text-emerald-700 dark:text-emerald-400",
                    scan.status === "invalid" && "text-red-600 dark:text-red-400",
                    scan.status === "pending" && "text-muted-foreground"
                  )}
                >
                  {scan.message}
                </p>
                {scan.buyer && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {scan.buyer}
                    {scan.ticketType && ` · ${scan.ticketType}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
