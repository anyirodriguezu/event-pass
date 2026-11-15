import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Habilita Draft Mode y redirige a la página del evento.
// Solo accesible para organizadores y admins.
// draftMode() setea una cookie firmada — Next.js la detecta en las páginas
// y omite el cache estático, renderizando todo en tiempo real.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["ORGANIZER", "ADMIN"].includes(session.user.role)) {
    return new Response("No autorizado", { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return new Response("Falta el parámetro slug", { status: 400 });

  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
  });
  if (!event) return new Response("Evento no encontrado", { status: 404 });

  (await draftMode()).enable();
  redirect(`/eventos/${slug}`);
}
