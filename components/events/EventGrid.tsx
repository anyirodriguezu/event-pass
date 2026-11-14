import { EventCard } from "./EventCard";
import type { events, organizers } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type EventRow = {
  events: InferSelectModel<typeof events>;
  organizers: InferSelectModel<typeof organizers> | null;
};

export function EventGrid({ rows }: { rows: EventRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {rows.map((row) => (
        <EventCard key={row.events.id} event={row.events} organizer={row.organizers} />
      ))}
    </div>
  );
}
