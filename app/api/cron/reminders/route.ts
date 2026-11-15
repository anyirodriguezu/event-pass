// Vercel Cron Job — se ejecuta a las 8am Lima (UTC-5) todos los días
// Configurado en vercel.json: "0 13 * * *"
// Envía emails de recordatorio a compradores cuyos eventos son mañana
import { db } from "@/lib/db";
import { events, tickets, users } from "@/lib/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { sendEventReminder } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  // Vercel Cron envía este header para autenticar — protege la ruta de llamadas externas
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayStart = new Date(tomorrow);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(tomorrow);
  dayEnd.setHours(23, 59, 59, 999);

  // Buscar eventos que son mañana
  const tomorrowEvents = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.status, "PUBLISHED"),
        gte(events.startsAt, dayStart),
        lt(events.startsAt, dayEnd)
      )
    );

  let sent = 0;

  for (const event of tomorrowEvents) {
    // Obtener todos los compradores activos de este evento
    const buyers = await db
      .select({ user: users })
      .from(tickets)
      .innerJoin(users, eq(tickets.buyerId, users.id))
      .where(and(eq(tickets.eventId, event.id), eq(tickets.status, "ACTIVE")));

    // Deduplicar por usuario (puede tener varios tickets)
    const uniqueBuyers = [...new Map(buyers.map((b) => [b.user.id, b.user])).values()];

    for (const buyer of uniqueBuyers) {
      if (buyer.email) {
        await sendEventReminder({
          to: buyer.email,
          buyerName: buyer.name ?? "Comprador",
          eventTitle: event.title,
          eventDate: event.startsAt.toLocaleDateString("es-PE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          venueName: event.venueName,
        });
        sent++;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    eventsChecked: tomorrowEvents.length,
    emailsSent: sent,
  });
}
