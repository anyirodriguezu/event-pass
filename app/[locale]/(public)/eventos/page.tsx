// ISR + unstable_cache — datos cacheados con tags semánticos
// revalidateTag("events") invalida el cache al publicar un evento nuevo
// sin necesidad de esperar el tiempo de revalidación
import type { Metadata } from "next";
import { Suspense } from "react";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedEvents } from "@/lib/queries";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Descubre los mejores eventos cerca de ti",
};


async function EventsList({ category }: { category?: string }) {
  // getPublishedEvents está cacheada — no hace query a Neon si el cache está vigente
  const rows = await getPublishedEvents();

  const filtered = category
    ? rows.filter((r) => r.events.category === category.toUpperCase())
    : rows;

  if (filtered.length === 0) {
    const t = await getTranslations("common");
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-muted-foreground">{t("noEvents")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((row) => (
        <EventCard key={row.events.id} event={row.events} organizer={row.organizers} />
      ))}
    </div>
  );
}

function EventsListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-border/60">
          <Skeleton className="h-52 w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const t = await getTranslations("eventsPage");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <EventFilters />

      <Suspense fallback={<EventsListSkeleton />}>
        <EventsListAsync searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function EventsListAsync({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  return <EventsList category={categoria} />;
}
