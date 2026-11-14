import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { QRScanner } from "@/components/scanner/QRScanner";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Escáner QR" };

export default async function ScannerPage({
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
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-xl font-bold">Escáner de entrada</h1>
        {event && <p className="text-muted-foreground text-sm">{event.title}</p>}
      </div>

      {/* Client Component con acceso a la cámara */}
      <QRScanner eventId={eventId} />
    </div>
  );
}
