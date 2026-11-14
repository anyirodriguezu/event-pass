"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { initiateTransfer } from "@/actions/tickets";

export function TransferButton({ ticketId }: { ticketId: string }) {
  const [transferUrl, setTransferUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const result = await initiateTransfer(ticketId);
      setTransferUrl(result.transferUrl);
    } finally {
      setLoading(false);
    }
  };

  if (transferUrl) {
    return (
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-2 text-sm">
        <p className="font-medium text-blue-700">Link de transferencia generado:</p>
        <p className="font-mono text-xs break-all text-blue-600">{transferUrl}</p>
        <p className="text-blue-600 text-xs">Expira en 24 horas. Compártelo con quien recibirá el ticket.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigator.clipboard.writeText(transferUrl)}
        >
          Copiar link
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleTransfer}
      disabled={loading}
    >
      {loading ? "Generando link..." : "Transferir ticket"}
    </Button>
  );
}
