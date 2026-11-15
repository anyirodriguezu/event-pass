// Editar evento + gestionar tipos de ticket
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, organizers, ticketTypes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { publishEvent, addTicketType } from "@/actions/events";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editar evento" };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ORGANIZER") redirect("/dashboard");

  const organizer = await db.query.organizers.findFirst({
    where: eq(organizers.userId, session.user.id),
  });

  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.organizerId, organizer?.id ?? "")),
  });

  if (!event) notFound();

  const types = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.eventId, eventId));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/organizer/${eventId}/ventas`}>📊 Ventas</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/organizer/${eventId}/asistentes`}>👥 Asistentes</Link>
          </Button>
          {event.status === "DRAFT" && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/api/draft/enable?slug=${event.slug}`}>
                  👁 Previsualizar
                </Link>
              </Button>
              <form action={publishEvent.bind(null, eventId)}>
                <Button type="submit" variant="success" size="sm">
                  Publicar evento
                </Button>
              </form>
            </>
          )}
          {event.status === "PUBLISHED" && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/eventos/${event.slug}`} target="_blank">
                Ver público →
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tipos de ticket */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {types.length > 0 && (
            <div className="space-y-2">
              {types.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-lg bg-muted text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">
                    {t.currency} {Number(t.price).toFixed(2)} ·{" "}
                    {t.soldQuantity}/{t.totalQuantity} vendidos
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Agregar tipo de ticket con Server Action */}
          <form action={addTicketType.bind(null, eventId)} className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <Label htmlFor="name">Nombre del ticket</Label>
              <Input id="name" name="name" placeholder="General, VIP, Mesa..." required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="price">Precio</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="totalQuantity">Cantidad</Label>
              <Input id="totalQuantity" name="totalQuantity" type="number" min="1" required />
            </div>
            <Input name="currency" type="hidden" value="PEN" />
            <Button type="submit" className="col-span-2">
              + Agregar tipo de ticket
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
