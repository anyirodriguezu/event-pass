"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets, ticketTransfers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";

export async function initiateTransfer(ticketId: string) {
  const session = await auth();
  if (!session) throw new Error("No autenticado");

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
  });

  if (!ticket || ticket.buyerId !== session.user.id) {
    throw new Error("Ticket no encontrado o no es tuyo");
  }

  if (ticket.status !== "ACTIVE") {
    throw new Error("Este ticket no se puede transferir");
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

  await db.insert(ticketTransfers).values({
    ticketId,
    fromUserId: session.user.id,
    token,
    expiresAt,
  });

  await db
    .update(tickets)
    .set({ status: "TRANSFERRED" })
    .where(eq(tickets.id, ticketId));

  revalidatePath("/dashboard");

  return {
    transferUrl: `${process.env.APP_URL}/transfer/${token}`,
  };
}

// Firma con _formData para compatibilidad con form action + .bind()
// Next.js pasa FormData como segundo arg cuando se usa bind en server actions
export async function acceptTransfer(
  token: string,
  _formData?: FormData
): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("No autenticado");

  const transfer = await db.query.ticketTransfers.findFirst({
    where: eq(ticketTransfers.token, token),
  });

  if (!transfer) throw new Error("Link de transferencia inválido");
  if (transfer.expiresAt < new Date()) throw new Error("Link expirado");
  if (transfer.acceptedAt) throw new Error("Este ticket ya fue transferido");
  if (transfer.fromUserId === session.user.id) {
    throw new Error("No puedes aceptar tu propia transferencia");
  }

  await db
    .update(ticketTransfers)
    .set({ toUserId: session.user.id, acceptedAt: new Date() })
    .where(eq(ticketTransfers.id, transfer.id));

  await db
    .update(tickets)
    .set({ buyerId: session.user.id, status: "ACTIVE" })
    .where(eq(tickets.id, transfer.ticketId));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
