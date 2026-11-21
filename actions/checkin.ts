"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { canManageEvent } from "@/lib/authz";

export type ScanResult = {
  valid: boolean;
  message: string;
  buyer?: string;
  ticketType?: string;
};

// Server Action para el scanner — reemplaza el fetch al API route
// Permite usar useOptimistic en el cliente sin perder la validación en servidor
export async function validateTicketByQR(
  qrCode: string,
  eventId: string
): Promise<ScanResult> {
  const session = await auth();
  if (!session || !["STAFF", "ADMIN", "ORGANIZER"].includes(session.user.role)) {
    return { valid: false, message: "No autorizado" };
  }

  // Un ORGANIZER solo puede validar tickets de sus propios eventos.
  if (!(await canManageEvent(session.user, eventId))) {
    return { valid: false, message: "No autorizado" };
  }

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.qrCode, qrCode),
    with: { ticketType: true, buyer: true },
  });

  if (!ticket) return { valid: false, message: "QR inválido" };
  if (ticket.eventId !== eventId) return { valid: false, message: "Ticket de otro evento" };
  if (ticket.status === "USED") return { valid: false, message: "Ticket ya fue usado" };
  if (ticket.status !== "ACTIVE") return { valid: false, message: `Ticket ${ticket.status.toLowerCase()}` };

  await db
    .update(tickets)
    .set({ status: "USED", checkedInAt: new Date(), checkedInBy: session.user.id })
    .where(eq(tickets.id, ticket.id));

  revalidatePath(`/staff/${eventId}/lista`);
  revalidatePath(`/organizer/${eventId}/asistentes`);

  return {
    valid: true,
    message: "Acceso permitido",
    buyer: (ticket as any).buyer?.name ?? undefined,
    ticketType: (ticket as any).ticketType?.name ?? undefined,
  };
}

export async function checkInTicket(ticketId: string, eventId: string) {
  const session = await auth();
  if (!session || !["STAFF", "ADMIN", "ORGANIZER"].includes(session.user.role)) {
    throw new Error("No autorizado");
  }

  // Un ORGANIZER solo puede hacer check-in en sus propios eventos.
  if (!(await canManageEvent(session.user, eventId))) {
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
