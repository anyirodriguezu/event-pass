// API route usada por el Client Component de lista en vivo (polling cada 10s)
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets, users, ticketTypes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { canManageEvent } from "@/lib/authz";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await auth();
  if (!session || !["STAFF", "ADMIN", "ORGANIZER"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { eventId } = await params;

  // Un ORGANIZER solo ve asistentes de sus propios eventos.
  if (!(await canManageEvent(session.user, eventId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const rows = await db
    .select({
      ticketId: tickets.id,
      status: tickets.status,
      checkedInAt: tickets.checkedInAt,
      buyerName: users.name,
      buyerEmail: users.email,
      typeName: ticketTypes.name,
    })
    .from(tickets)
    .innerJoin(users, eq(tickets.buyerId, users.id))
    .innerJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
    .where(eq(tickets.eventId, eventId))
    .orderBy(tickets.checkedInAt);

  return NextResponse.json(rows);
}
