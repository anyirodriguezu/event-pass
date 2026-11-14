"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Event = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  venueName: string;
  venueAddress: string;
  startsAt: Date;
  category: string;
  isFeatured: boolean;
};

type Organizer = {
  orgName: string;
} | null;

export function EventModalContent({
  event,
  organizer,
}: {
  event: Event;
  organizer: Organizer;
}) {
  const router = useRouter();

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    // Overlay — click fuera cierra el modal
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => router.back()}
    >
      {/* Fondo difuminado */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel del modal — stopPropagation para no cerrar al hacer click dentro */}
      <div
        className="relative z-10 w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen de portada */}
        {event.coverUrl ? (
          <div className="relative h-52 w-full shrink-0">
            <Image
              src={event.coverUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ) : (
          <div className="h-32 w-full shrink-0 mesh-bg" />
        )}

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Categoría + título */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{event.category}</Badge>
              {event.isFeatured && (
                <Badge className="bg-yellow-400 text-yellow-900">Destacado</Badge>
              )}
            </div>
            <h2 className="font-heading font-bold text-xl leading-tight">
              {event.title}
            </h2>
          </div>

          {/* Detalles */}
          <div className="text-sm text-muted-foreground space-y-1.5">
            <p>
              📅{" "}
              {format(new Date(event.startsAt), "EEEE d 'de' MMMM · HH:mm", {
                locale: es,
              })}
            </p>
            <p>📍 {event.venueName}</p>
            <p className="text-xs">{event.venueAddress}</p>
            {organizer && <p>🎤 {organizer.orgName}</p>}
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {event.description}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="p-4 border-t border-border/60 flex gap-3 shrink-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Cerrar
          </Button>
          <Button
            variant="gradient"
            className="flex-1"
            onClick={() => { window.location.href = `/eventos/${event.slug}`; }}
          >
            Ver evento completo →
          </Button>
        </div>
      </div>
    </div>
  );
}
