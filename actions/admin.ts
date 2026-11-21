"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Guard centralizado: toda acción de admin exige rol ADMIN.
async function assertAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("No autorizado");
}

/**
 * Aprueba o revoca la verificación de un organizador.
 * `verified` llega "horneado" con .bind() desde el form del panel.
 */
export async function setOrganizerVerified(organizerId: string, verified: boolean) {
  await assertAdmin();
  await db
    .update(organizers)
    .set({ verified })
    .where(eq(organizers.id, organizerId));
  revalidatePath("/admin");
}
