"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function checkInTicket(ticketId: string, eventId: string) {
  const session = await auth();
  if (!session || !["STAFF", "ADMIN", "ORGANIZER"].includes(session.user.role)) {
    throw new Error("No autorizado");
  }

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
  });

  if (!ticket) throw new Error("Ticket no encontrado");
  if (ticket.eventId !== eventId) throw new Error("Ticket no pertenece a este evento");
  if (ticket.status === "USED") throw new Error("Ticket ya fue usado");
  if (ticket.status !== "ACTIVE") throw new Error(`Ticket ${ticket.status.toLowerCase()}`);

  await db
    .update(tickets)
    .set({
      status: "USED",
      checkedInAt: new Date(),
      checkedInBy: session.user.id,
    })
    .where(eq(tickets.id, ticketId));

  revalidatePath(`/staff/${eventId}/lista`);
  revalidatePath(`/organizer/${eventId}/asistentes`);
}
