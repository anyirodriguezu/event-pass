// Node.js runtime — Edge Runtime fue deprecado en Next.js 16
import { db } from "@/lib/db";
import { tickets, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getQrScanRateLimit } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageEvent } from "@/lib/authz";


export async function POST(req: NextRequest) {
  // Mismas reglas que la Server Action validateTicketByQR: STAFF/ADMIN/ORGANIZER.
  const session = await auth();
  if (!session || !["STAFF", "ADMIN", "ORGANIZER"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Rate limiting: máximo 20 scans por dispositivo por minuto (anti-fraude)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const deviceId = req.headers.get("x-device-id") ?? session.user.id;
    const { success } = await getQrScanRateLimit().limit(deviceId);
    if (!success) {
      return NextResponse.json(
        { error: "Demasiados escaneos. Espera un momento." },
        { status: 429 }
      );
    }
  }

  const { qrCode } = await req.json();
  if (!qrCode) {
    return NextResponse.json({ error: "QR requerido" }, { status: 400 });
  }

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.qrCode, qrCode),
    with: { event: true, ticketType: true, buyer: true },
  });

  if (!ticket) {
    return NextResponse.json(
      { valid: false, message: "QR inválido" },
      { status: 200 }
    );
  }

  // Un ORGANIZER solo puede validar tickets de sus propios eventos.
  if (!(await canManageEvent(session.user, ticket.eventId))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (ticket.status === "USED") {
    return NextResponse.json({
      valid: false,
      message: "Este ticket ya fue usado",
      checkedInAt: ticket.checkedInAt,
    });
  }

  if (ticket.status !== "ACTIVE") {
    return NextResponse.json({
      valid: false,
      message: `Ticket ${ticket.status.toLowerCase()}`,
    });
  }

  // Marcar como usado
  await db
    .update(tickets)
    .set({
      status: "USED",
      checkedInAt: new Date(),
      checkedInBy: session.user.id,
    })
    .where(eq(tickets.id, ticket.id));

  return NextResponse.json({
    valid: true,
    message: "✅ Acceso permitido",
    buyer: ticket.buyer?.name,
    ticketType: ticket.ticketType?.name,
    event: (ticket as any).event?.title,
  });
}
