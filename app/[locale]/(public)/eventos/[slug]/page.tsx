import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { draftMode } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketSelector } from "@/components/tickets/TicketSelector";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getEventBySlug, getTicketTypes } from "@/lib/queries";
import { after, connection } from "next/server";
import { trackEventView } from "@/lib/analytics";
import { CalendarDays, MapPin, Mic2, Eye, EyeOff } from "lucide-react";

// PPR: el shell estático se genera en build time y se sirve desde el CDN de Vercel.
// El bloque dinámico (disponibilidad de tickets) hace streaming al momento del request.
// Resultado: TTFB ultra rápido + stock siempre fresco, sin elegir entre los dos.
export const experimental_ppr = true;

export async function generateStaticParams() {
  const publishedEvents = await db
    .select({ slug: events.slug })
    .from(events)
    .where(eq(events.status, "PUBLISHED"));
  return publishedEvents.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await getEventBySlug(slug);
  if (!row) return { title: "Evento no encontrado" };
  const { events: event } = row;
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

async function TicketAvailability({ eventId }: { eventId: string }) {
  // connection() marca este componente como dinámico — se ejecuta en cada request.
  // Sin esto, Next.js podría intentar prerenderizarlo en build time y cachear el stock.
  await connection();
  const types = await getTicketTypes(eventId);
  return <TicketSelector ticketTypes={types} eventId={eventId} />;
}

const CATEGORY_LABEL: Record<string, string> = {
  MUSIC: "Música", THEATER: "Teatro", SPORTS: "Deportes",
  WORKSHOP: "Taller", PARTY: "Fiesta", OTHER: "Evento",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();

  // En Draft Mode consultamos la DB directamente (sin cache) para ver borradores.
  // En modo normal usamos la query cacheada con unstable_cache.
  let row = isDraft
    ? await db.query.events
        .findFirst({ where: eq(events.slug, slug) })
        .then((e) => e ? { events: e, organizers: null } : null)
    : await getEventBySlug(slug);

  if (!row) notFound();

  after(async () => { await trackEventView(row!.events.id, slug); });

  const { events: event, organizers: organizer } = row;

  return (
    <div className="min-h-screen">
      {/* ── Banner de Draft Mode ───────────────────────────────────── */}
      {isDraft && (
        <div className="sticky top-16 z-40 flex items-center justify-between gap-3 bg-amber-400 dark:bg-amber-500 px-4 py-2.5 text-amber-950 text-sm font-medium">
          <span className="flex items-center gap-2">
            <Eye className="size-4 shrink-0" />
            Modo preview — este evento aún no está publicado y solo tú puedes verlo
          </span>
          <Link
            href={`/api/draft/disable?back=/organizer/${row.events.id}`}
            className="flex items-center gap-1.5 shrink-0 rounded-md bg-amber-950/15 hover:bg-amber-950/25 px-3 py-1 transition-colors text-xs"
          >
            <EyeOff className="size-3.5" />
            Salir del preview
          </Link>
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative h-[62vh] min-h-[420px] w-full overflow-hidden">
        {event.coverUrl ? (
          <Image
            src={event.coverUrl}
            alt={event.title}
            fill
            className="object-cover scale-105"
            priority
          />
        ) : (
          <div className="absolute inset-0 mesh-bg" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-10 sm:px-8 animate-ticket-enter">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Badge className="bg-white/15 text-white border-white/25 backdrop-blur-sm text-xs">
                {CATEGORY_LABEL[event.category] ?? event.category}
              </Badge>
              {event.isFeatured && (
                <Badge className="bg-yellow-400/90 text-yellow-900 text-xs font-semibold">
                  ⭐ Destacado
                </Badge>
              )}
              <Badge
                className={
                  event.status === "PUBLISHED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs"
                    : "bg-red-500/20 text-red-300 border-red-500/30 text-xs"
                }
              >
                {event.status === "PUBLISHED" ? "Disponible" : event.status}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4 max-w-2xl">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4 text-violet-300" />
                {format(new Date(event.startsAt), "EEEE d 'de' MMMM · HH:mm", { locale: es })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-fuchsia-300" />
                {event.venueName}
              </span>
              {organizer && (
                <span className="flex items-center gap-1.5">
                  <Mic2 className="size-4 text-pink-300" />
                  {organizer.orgName}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Description */}
          <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            {event.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Acerca del evento</h2>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Location card */}
            <div className="rounded-2xl border border-border/60 p-5 bg-card space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <MapPin className="size-4 text-fuchsia-500" /> Ubicación
              </h3>
              <p className="font-medium">{event.venueName}</p>
              <p className="text-sm text-muted-foreground">{event.venueAddress}</p>
            </div>

            {/* Date card */}
            <div className="rounded-2xl border border-border/60 p-5 bg-card space-y-1">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <CalendarDays className="size-4 text-violet-500" /> Fecha y hora
              </h3>
              <p className="font-medium capitalize">
                {format(new Date(event.startsAt), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(event.startsAt), "HH:mm", { locale: es })}
                {event.endsAt && ` — ${format(new Date(event.endsAt), "HH:mm", { locale: es })}`}
              </p>
            </div>
          </div>

          {/* Ticket selector — sticky on desktop */}
          <div className="lg:sticky lg:top-24 h-fit animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Suspense
              fallback={
                <div className="space-y-3 p-5 rounded-2xl border border-border/60 bg-card">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              }
            >
              <TicketAvailability eventId={event.id} />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
