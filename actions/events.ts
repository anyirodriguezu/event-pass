"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events, organizers, ticketTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { trackEventCreated } from "@/lib/analytics";
import { redirect } from "next/navigation";
import { uploadEventCover } from "@/lib/blob";
import { z } from "zod";

const EventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  venueName: z.string().min(2),
  venueAddress: z.string().min(5),
  startsAt: z.string(),
  category: z.enum(["MUSIC", "THEATER", "SPORTS", "WORKSHOP", "PARTY", "OTHER"]),
});

export type EventFormState = { error: string } | null;

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Firma compatible con useActionState: (prevState, formData) => Promise<State>
// redirect() en Server Actions termina la respuesta — Next.js lo maneja correctamente
export async function createEvent(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const session = await auth();
  if (!session || session.user.role !== "ORGANIZER") {
    return { error: "No autorizado" };
  }

  const parsed = EventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    venueName: formData.get("venueName"),
    venueAddress: formData.get("venueAddress"),
    startsAt: formData.get("startsAt"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return { error: "Revisa los campos e intenta de nuevo." };
  }

  const organizer = await db.query.organizers.findFirst({
    where: eq(organizers.userId, session.user.id),
  });
  if (!organizer) return { error: "Perfil de organizador no encontrado" };

  const slug = `${slugify(parsed.data.title)}-${Date.now()}`;

  let coverUrl: string | undefined;
  const coverFile = formData.get("cover") as File | null;
  if (coverFile && coverFile.size > 0) {
    coverUrl = await uploadEventCover(coverFile, slug);
  }

  const [newEvent] = await db
    .insert(events)
    .values({
      organizerId: organizer.id,
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      coverUrl,
      venueName: parsed.data.venueName,
      venueAddress: parsed.data.venueAddress,
      startsAt: new Date(parsed.data.startsAt),
      category: parsed.data.category,
    })
    .returning();

  // after(): corre después del redirect — sin after() este código nunca ejecutaría
  // porque redirect() lanza una excepción interna que termina la función
  after(async () => {
    await trackEventCreated(newEvent.id, slug, organizer.id);
  });

  redirect(`/organizer/${newEvent.id}`);
}

export async function publishEvent(eventId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ORGANIZER") throw new Error("No autorizado");

  await db
    .update(events)
    .set({ status: "PUBLISHED" })
    .where(eq(events.id, eventId));

  // revalidatePath: invalida la página completa (ISR on-demand)
  revalidatePath("/eventos");
  revalidatePath(`/organizer/${eventId}`);

  // revalidateTag: invalida todas las queries cacheadas con ese tag
  // Más preciso que revalidatePath — afecta solo los datos, no toda la página
  // updateTag: versión de revalidateTag para Server Actions (Next.js 16)
  // Lee-tu-propio-write semantics — invalida de inmediato en la misma request
  updateTag("events");
}

export async function addTicketType(eventId: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "ORGANIZER") throw new Error("No autorizado");

  await db.insert(ticketTypes).values({
    eventId,
    name: formData.get("name") as string,
    price: formData.get("price") as string,
    currency: (formData.get("currency") as string) || "PEN",
    totalQuantity: parseInt(formData.get("totalQuantity") as string),
  });

  revalidatePath(`/organizer/${eventId}`);
}
