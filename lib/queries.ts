// Queries cacheadas con unstable_cache (Next.js 15)
// unstable_cache persiste el resultado entre requests (caché de servidor)
// revalidateTag("events") invalida todas las queries con ese tag al instante
// Diferencia clave vs revalidatePath: los tags son semánticos, no dependen de URLs
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { events, organizers, ticketTypes } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

// ─── Tags ────────────────────────────────────────────────────────────────────
// Convención: tag "events" = cualquier lista de eventos
//             tag "event-<slug>" = página de detalle de un evento específico
export const CACHE_TAGS = {
  events: "events",
  event: (slug: string) => `event-${slug}`,
  ticketTypes: (eventId: string) => `ticket-types-${eventId}`,
} as const;

// ─── Lista de eventos publicados ─────────────────────────────────────────────
// Usada en /eventos y /categorias/[cat]
// Se invalida con revalidateTag("events") al publicar/editar un evento
export const getPublishedEvents = unstable_cache(
  async () => {
    return db
      .select()
      .from(events)
      .leftJoin(organizers, eq(events.organizerId, organizers.id))
      .where(eq(events.status, "PUBLISHED"))
      .orderBy(desc(events.startsAt))
      .limit(50);
  },
  ["published-events"],
  { tags: [CACHE_TAGS.events], revalidate: 300 }
);

// ─── Detalle de un evento por slug ───────────────────────────────────────────
// Usada en /eventos/[slug] y generateMetadata
// Se invalida con revalidateTag(`event-${slug}`) al editar ese evento específico
export const getEventBySlug = unstable_cache(
  async (slug: string) => {
    const rows = await db
      .select()
      .from(events)
      .leftJoin(organizers, eq(events.organizerId, organizers.id))
      .where(and(eq(events.slug, slug), eq(events.status, "PUBLISHED")))
      .limit(1);

    return rows[0] ?? null;
  },
  ["event-by-slug"],
  { tags: [CACHE_TAGS.events], revalidate: 300 }
);

// ─── Ticket types de un evento ───────────────────────────────────────────────
// Usada en la sección de compra del detalle de evento
// Se invalida con revalidateTag(`ticket-types-${eventId}`) al modificar stock
export const getTicketTypes = unstable_cache(
  async (eventId: string) => {
    return db
      .select()
      .from(ticketTypes)
      .where(eq(ticketTypes.eventId, eventId));
  },
  ["ticket-types"],
  { tags: [CACHE_TAGS.events], revalidate: 60 }
);
