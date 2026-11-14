// Node.js runtime — Edge Runtime fue deprecado en Next.js 16
import { db } from "@/lib/db";
import { tickets, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { qrScanRateLimit } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["STAFF", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Rate limiting: máximo 20 scans por dispositivo por minuto (anti-fraude)
  const deviceId = req.headers.get("x-device-id") ?? session.user.id;
  const { success } = await qrScanRateLimit.limit(deviceId);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiados escaneos. Espera un momento." },
      { status: 429 }
    );
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
