import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { OrganizerSetupForm } from "@/components/organizer/OrganizerSetupForm";

export const metadata: Metadata = { title: "Configurar organizador" };

export default async function SetupPage() {
  const session = await auth();
  if (!session) redirect("/organizador");

  // Si ya tiene perfil, no hay nada que configurar.
  const existing = await db.query.organizers.findFirst({
    where: eq(organizers.userId, session.user.id),
  });
  if (existing) redirect("/organizer");

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-up">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Configura tu organización</h1>
        <p className="text-muted-foreground text-sm">
          Un último paso para empezar a crear eventos.
        </p>
      </div>
      <OrganizerSetupForm />
    </div>
  );
}
