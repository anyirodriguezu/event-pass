// Client-driven page — shell SSR + Client Component con polling cada 10s
// No requiere WebSockets: el polling es suficiente para validación en puerta
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AttendeesList } from "@/components/scanner/AttendeesList";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = { title: "Asistentes en vivo" };

export default async function StaffListaPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const session = await auth();

  if (!session || !["STAFF", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });

  return (
    <div className="max-w-lg mx-auto space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Asistentes en vivo</h1>
          {event && (
            <p className="text-muted-foreground text-sm">{event.title}</p>
          )}
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/staff/${eventId}/scanner`}>Escáner →</Link>
        </Button>
      </div>

      {/* Client Component: se hidrata en el browser y empieza el polling */}
      <AttendeesList eventId={eventId} />
    </div>
  );
}
