import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EventNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="text-6xl">🎟️</div>
      <h1 className="text-2xl font-bold">Evento no encontrado</h1>
      <p className="text-muted-foreground">
        Este evento no existe o ya no está disponible.
      </p>
      <Button asChild>
        <Link href="/eventos">Ver todos los eventos</Link>
      </Button>
    </div>
  );
}
