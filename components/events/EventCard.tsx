import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { events, organizers } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Event = InferSelectModel<typeof events>;
type Organizer = InferSelectModel<typeof organizers> | null;

const CATEGORY_STYLES: Record<string, { label: string; chip: string }> = {
  MUSIC:    { label: "Música",    chip: "bg-violet-100 text-violet-700" },
  THEATER:  { label: "Teatro",    chip: "bg-amber-100  text-amber-700"  },
  SPORTS:   { label: "Deportes",  chip: "bg-green-100  text-green-700"  },
  WORKSHOP: { label: "Taller",    chip: "bg-blue-100   text-blue-700"   },
  PARTY:    { label: "Fiesta",    chip: "bg-pink-100   text-pink-700"   },
  OTHER:    { label: "Otro",      chip: "bg-gray-100   text-gray-600"   },
};

export function EventCard({
  event,
  organizer,
}: {
  event: Event;
  organizer: Organizer;
}) {
  const cat = CATEGORY_STYLES[event.category] ?? CATEGORY_STYLES.OTHER;

  return (
    <Link href={`/eventos/${event.slug}`} className="group block">
      <Card className="overflow-hidden border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 hover:-translate-y-0.5">
        {/* Image + overlay */}
        <div className="relative h-52 bg-muted overflow-hidden">
          {event.coverUrl ? (
            <Image
              src={event.coverUrl}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-50">
              <span className="text-5xl opacity-30">🎟️</span>
            </div>
          )}

          {/* Gradient overlay — allows text legibility over any image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Badges on top-left */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${cat.chip}`}>
              {cat.label}
            </span>
            {event.isFeatured && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-400 text-yellow-900">
                ★ Destacado
              </span>
            )}
          </div>

          {/* Date pill on bottom-right */}
          <div className="absolute bottom-3 right-3">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm">
              {format(new Date(event.startsAt), "d MMM", { locale: es })}
            </span>
          </div>
        </div>

        {/* Card body */}
        <CardContent className="p-4 space-y-2">
          <h3 className="font-heading font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p className="flex items-center gap-1.5 truncate">
              <span>📍</span>
              <span className="truncate">{event.venueName}</span>
            </p>
            {organizer && (
              <p className="flex items-center gap-1.5 truncate">
                <span>👤</span>
                <span className="truncate">{organizer.orgName}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
