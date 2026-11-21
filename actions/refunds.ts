"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { refunds, orders, tickets, ticketTypes } from "@/lib/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { getStripe } from "@/lib/stripe";

async function assertAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");
}

type RequestState = { error: string | null; ok?: boolean };

/**
 * El comprador solicita el reembolso de una orden pagada. `orderId` llega
 * horneado con .bind(); la firma restante es compatible con useActionState.
 */
export async function requestRefund(
  orderId: string,
  _prev: RequestState,
  formData: FormData
): Promise<RequestState> {
  const session = await auth();
  if (!session) return { error: "No autenticado" };

  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  if (!order || order.buyerId !== session.user.id) {
    return { error: "Orden no encontrada o no es tuya." };
  }
  if (order.status !== "PAID") {
    return { error: "Solo puedes solicitar reembolso de una orden pagada." };
  }

  // No permitir una segunda solicitud si ya hay una PENDING o APPROVED.
  const active = await db.query.refunds.findFirst({
    where: and(eq(refunds.orderId, orderId), ne(refunds.status, "REJECTED")),
  });
  if (active) {
    return { error: "Ya existe una solicitud de reembolso para esta compra." };
  }

  const reason = (formData.get("reason") as string | null)?.trim() || null;

  await db.insert(refunds).values({
    orderId,
    amount: order.totalAmount,
    reason,
    status: "PENDING",
  });

  revalidatePath("/dashboard");
  return { error: null, ok: true };
}

/**
 * El admin aprueba el reembolso: devuelve el dinero en Stripe (modo test),
 * cancela los tickets de la orden, libera el stock y marca orden REFUNDED.
 */
export async function approveRefund(refundId: string) {
  await assertAdmin();

  const refund = await db.query.refunds.findFirst({ where: eq(refunds.id, refundId) });
  if (!refund || refund.status !== "PENDING") throw new Error("Reembolso no válido");

  const order = await db.query.orders.findFirst({ where: eq(orders.id, refund.orderId) });
  if (!order) throw new Error("Orden no encontrada");

  // 1. Devolución en Stripe. Solo si tenemos un PaymentIntent real (pi_...).
  //    En modo test no mueve dinero; si falla, no bloquea el flujo del demo.
  if (order.paymentIntentId?.startsWith("pi_")) {
    try {
      await getStripe().refunds.create({ payment_intent: order.paymentIntentId });
    } catch {
      // PI no reembolsable en test → seguimos con el estado en la DB.
    }
  }

  // 2. Cancelar los tickets ACTIVE de la orden y liberar su stock por tipo.
  const activeTickets = await db
    .select({ ticketTypeId: tickets.ticketTypeId })
    .from(tickets)
    .where(and(eq(tickets.orderId, order.id), eq(tickets.status, "ACTIVE")));

  const qtyByType = new Map<string, number>();
  for (const t of activeTickets) {
    qtyByType.set(t.ticketTypeId, (qtyByType.get(t.ticketTypeId) ?? 0) + 1);
  }

  await db
    .update(tickets)
    .set({ status: "CANCELLED" })
    .where(and(eq(tickets.orderId, order.id), eq(tickets.status, "ACTIVE")));

  for (const [typeId, qty] of qtyByType) {
    await db
      .update(ticketTypes)
      .set({ soldQuantity: sql`GREATEST(${ticketTypes.soldQuantity} - ${qty}, 0)` })
      .where(eq(ticketTypes.id, typeId));
  }

  // 3. Marcar reembolso APPROVED y orden REFUNDED.
  await db
    .update(refunds)
    .set({ status: "APPROVED", processedAt: new Date() })
    .where(eq(refunds.id, refundId));
  await db.update(orders).set({ status: "REFUNDED" }).where(eq(orders.id, order.id));

  updateTag("events"); // la disponibilidad pública cambió al liberar stock
  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

/** El admin rechaza la solicitud. */
export async function rejectRefund(refundId: string) {
  await assertAdmin();

  const refund = await db.query.refunds.findFirst({ where: eq(refunds.id, refundId) });
  if (!refund || refund.status !== "PENDING") throw new Error("Reembolso no válido");

  await db
    .update(refunds)
    .set({ status: "REJECTED", processedAt: new Date() })
    .where(eq(refunds.id, refundId));

  revalidatePath("/admin");
}
