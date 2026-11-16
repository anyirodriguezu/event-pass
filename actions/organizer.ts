"use server";

import { db } from "@/lib/db";
import { users, organizers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "@/lib/password";
import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

// ── Registro de organizador ──────────────────────────────────────────────────
const RegisterSchema = z.object({
  name: z.string().min(2, "Nombre muy corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  orgName: z.string().min(2, "Nombre de organización muy corto"),
});

export type OrganizerFormState = { error: string } | null;

/**
 * Crea un usuario con rol ORGANIZER + su perfil de organizador, con contraseña
 * hasheada (scrypt), y lo deja logueado. Firma compatible con useActionState.
 */
export async function registerOrganizer(
  _prev: OrganizerFormState,
  formData: FormData
): Promise<OrganizerFormState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    orgName: formData.get("orgName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los campos." };
  }

  const { name, email, password, orgName } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { error: "Ya existe una cuenta con ese email. Inicia sesión." };
  }

  const passwordHash = await hashPassword(password);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, passwordHash, role: "ORGANIZER" })
    .returning();

  await db.insert(organizers).values({
    userId: newUser.id,
    orgName,
    verified: false,
  });

  // Login automático tras el registro.
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/organizer",
    });
  } catch (err) {
    // signIn con redirectTo lanza NEXT_REDIRECT — hay que re-lanzarlo.
    if (err instanceof AuthError) {
      return { error: "Cuenta creada, pero falló el login. Entra manualmente." };
    }
    throw err;
  }

  return null;
}

// ── Setup de perfil (usuario ORGANIZER sin perfil aún) ─────────────────────────
const SetupSchema = z.object({
  orgName: z.string().min(2, "Nombre de organización muy corto"),
  ruc: z.string().optional(),
});

export async function setupOrganizer(
  _prev: OrganizerFormState,
  formData: FormData
): Promise<OrganizerFormState> {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const parsed = SetupSchema.safeParse({
    orgName: formData.get("orgName"),
    ruc: formData.get("ruc"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los campos." };
  }

  const existing = await db.query.organizers.findFirst({
    where: eq(organizers.userId, session.user.id),
  });
  if (existing) redirect("/organizer");

  await db.insert(organizers).values({
    userId: session.user.id,
    orgName: parsed.data.orgName,
    ruc: parsed.data.ruc || null,
    verified: false,
  });

  redirect("/organizer");
}
