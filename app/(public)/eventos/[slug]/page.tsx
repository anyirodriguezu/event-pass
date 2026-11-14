// ISR + PPR — shell estático pre-renderizado, partes dinámicas en streaming
// generateStaticParams pre-genera las páginas de eventos publicados en build time
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { events, organizers, ticketTypes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketSelector } from "@/components/tickets/TicketSelector";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ISR: revalida cada 30 segundos
export const revalidate = 30;

// generateStaticParams: pre-genera en build time los slugs de eventos publicados
// Next.js llama a esta función en build y genera una página estática por cada slug
export async function generateStaticParams() {
  const publishedEvents = await db
    .select({ slug: events.slug })
    .from(events)
    .where(eq(events.status, "PUBLISHED"));

  return publishedEvents.map((e) => ({ slug: e.slug }));
}

// generateMetadata: SEO dinámico — título y descripción únicos por evento
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
  });

  if (!event) return { title: "Evento no encontrado" };

  return {
    title: event.title,
    description: `${event.title} en ${event.venueName}. Compra tus tickets en EventPass.`,
    openGraph: {
      title: event.title,
      description: event.description ?? undefined,
      images: event.coverUrl ? [{ url: event.coverUrl }] : [],
    },
  };
}

// Componente dinámico: se hace streaming mientras el shell ya está visible
async function TicketAvailability({ eventId }: { eventId: string }) {
  const types = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.eventId, eventId));

  return <TicketSelector ticketTypes={types} eventId={eventId} />;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const row = await db
    .select()
    .from(events)
    .leftJoin(organizers, eq(events.organizerId, organizers.id))
    .where(and(eq(events.slug, slug), eq(events.status, "PUBLISHED")))
    .limit(1);

  if (row.length === 0) notFound();

  const { events: event, organizers: organizer } = row[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Cover image — static shell */}
      {event.coverUrl && (
        <div className="relative h-64 w-full rounded-2xl overflow-hidden">
          <Image
            src={event.coverUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info del evento — static shell */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{event.category}</Badge>
            {event.isFeatured && <Badge className="bg-yellow-400 text-yellow-900">Destacado</Badge>}
          </div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="text-muted-foreground space-y-1 text-sm">
            <p>
              📅{" "}
              {format(new Date(event.startsAt), "EEEE d 'de' MMMM 'a las' HH:mm", {
                locale: es,
              })}
            </p>
            <p>📍 {event.venueName} — {event.venueAddress}</p>
            {organizer && <p>🎤 Organizado por {organizer.orgName}</p>}
          </div>
          {event.description && (
            <p className="text-sm leading-relaxed">{event.description}</p>
          )}
        </div>

        {/* Tickets — parte dinámica: Suspense hace streaming */}
        <div>
          <Suspense
            fallback={
              <div className="space-y-3 p-4 border rounded-xl">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            }
          >
            <TicketAvailability eventId={event.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
