// SSR — datos del organizador en tiempo real
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, organizers, orders } from "@/lib/db/schema";
import { eq, count, sum } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const metadata: Metadata = { title: "Panel Organizador" };

export default async function OrganizerPage() {
  const session = await auth();
  if (!session || session.user.role !== "ORGANIZER") redirect("/dashboard");

  const organizer = await db.query.organizers.findFirst({
    where: eq(organizers.userId, session.user.id),
  });

  if (!organizer) {
    return (
      <div className="text-center py-12 space-y-4">
        <p>No tienes perfil de organizador aún.</p>
        <Button asChild>
          <Link href="/organizer/setup">Crear perfil</Link>
        </Button>
      </div>
    );
  }

  const myEvents = await db
    .select()
    .from(events)
    .where(eq(events.organizerId, organizer.id))
    .orderBy(events.createdAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel Organizador</h1>
          <p className="text-muted-foreground">{organizer.orgName}</p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/organizer/nuevo">+ Nuevo evento</Link>
        </Button>
      </div>

      {myEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No tienes eventos aún. ¡Crea tu primer evento!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{event.title}</h3>
                    <EventStatusBadge status={event.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.startsAt), "d MMM yyyy", { locale: es })} •{" "}
                    {event.venueName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/organizer/${event.id}/ventas`}>Ventas</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/organizer/${event.id}`}>Editar</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EventStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "Borrador", className: "bg-gray-100 text-gray-700" },
    PUBLISHED: { label: "Publicado", className: "bg-green-100 text-green-700" },
    SOLD_OUT: { label: "Agotado", className: "bg-orange-100 text-orange-700" },
    FINISHED: { label: "Finalizado", className: "bg-blue-100 text-blue-700" },
  };
  const s = map[status] ?? map.DRAFT;
  return <Badge className={s.className}>{s.label}</Badge>;
}
