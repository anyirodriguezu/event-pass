// Autorización a nivel de recurso (object-level).
// El guard de rol (ORGANIZER/STAFF/ADMIN) dice QUÉ puede hacer un usuario;
// esto dice SOBRE QUÉ evento puede hacerlo, evitando IDOR entre organizadores.
import { db } from "@/lib/db";
import { events, organizers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * True si el usuario es el organizador dueño del evento indicado.
 * Un usuario sin perfil de organizador, o dueño de otro evento, da false.
 */
export async function organizerOwnsEvent(
  userId: string,
  eventId: string
): Promise<boolean> {
  const organizer = await db.query.organizers.findFirst({
    where: eq(organizers.userId, userId),
    columns: { id: true },
  });
  if (!organizer) return false;

  const event = await db.query.events.findFirst({
    where: and(eq(events.id, eventId), eq(events.organizerId, organizer.id)),
    columns: { id: true },
  });
  return !!event;
}

/**
 * ¿Puede este usuario operar (check-in, ver asistentes, gestionar) el evento?
 * - ADMIN / STAFF: sí (no hay tabla de asignación staff→evento en el schema,
 *   así que el staff se asume de confianza para cualquier evento).
 * - ORGANIZER: solo si es el dueño del evento.
 * - resto: no.
 */
export async function canManageEvent(
  user: { id: string; role: string },
  eventId: string
): Promise<boolean> {
  if (user.role === "ADMIN" || user.role === "STAFF") return true;
  if (user.role === "ORGANIZER") return organizerOwnsEvent(user.id, eventId);
  return false;
}
