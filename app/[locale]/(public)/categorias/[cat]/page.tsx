// ISR — se regenera cada 300 segundos en Vercel
// generateStaticParams pre-genera una página por categoría en build time
// Cambios en eventos aparecen sin rebuild, en máximo 5 minutos
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { events, organizers } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { EventCard } from "@/components/events/EventCard";
import Link from "next/link";


const CATEGORIES = {
  music:    { label: "Música",    value: "MUSIC",    icon: "🎵" },
  theater:  { label: "Teatro",    value: "THEATER",  icon: "🎭" },
  sports:   { label: "Deportes",  value: "SPORTS",   icon: "⚽" },
  workshop: { label: "Talleres",  value: "WORKSHOP", icon: "🛠️" },
  party:    { label: "Fiestas",   value: "PARTY",    icon: "🎉" },
  other:    { label: "Otros",     value: "OTHER",    icon: "✨" },
} as const;

type CatKey = keyof typeof CATEGORIES;

// Pre-genera una ruta estática por cada categoría en build time
export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((cat) => ({ cat }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cat: string }>;
}): Promise<Metadata> {
  const { cat } = await params;
  const category = CATEGORIES[cat as CatKey];
  if (!category) return { title: "Categoría no encontrada" };
  return {
    title: `Eventos de ${category.label} | EventPass`,
    description: `Encuentra los mejores eventos de ${category.label} cerca de ti.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ cat: string }>;
}) {
  const { cat } = await params;
  const category = CATEGORIES[cat as CatKey];
  if (!category) notFound();

  const rows = await db
    .select()
    .from(events)
    .leftJoin(organizers, eq(events.organizerId, organizers.id))
    .where(and(eq(events.status, "PUBLISHED"), eq(events.category, category.value)))
    .orderBy(desc(events.startsAt))
    .limit(50);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <p className="text-5xl">{category.icon}</p>
        <h1 className="text-3xl font-bold mt-3">Eventos de {category.label}</h1>
        <p className="text-muted-foreground mt-1">
          {rows.length === 0
            ? "No hay eventos en esta categoría aún."
            : `${rows.length} evento${rows.length !== 1 ? "s" : ""} disponible${rows.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Navegación entre categorías */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CATEGORIES).map(([key, c]) => (
          <Link
            key={key}
            href={`/categorias/${key}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              key === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            }`}
          >
            {c.icon} {c.label}
          </Link>
        ))}
      </div>

      {/* Grid de eventos */}
      {rows.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">{category.icon}</p>
          <p>Pronto habrá eventos de {category.label} aquí.</p>
          <Link href="/eventos" className="text-purple-600 hover:underline text-sm mt-2 inline-block">
            Ver todos los eventos →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((row) => (
            <EventCard key={row.events.id} event={row.events} organizer={row.organizers} />
          ))}
        </div>
      )}
    </div>
  );
}
