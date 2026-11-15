// Intercepting Route — se activa cuando el usuario navega a /eventos/[slug]
// desde la página /eventos (client-side navigation con Link)
// Si el usuario accede directamente o refresca, Next.js usa [slug]/page.tsx normal
import { notFound } from "next/navigation";
import { getEventBySlug } from "@/lib/queries";
import { EventModalContent } from "@/components/events/EventModalContent";

export default async function EventModalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await getEventBySlug(slug);

  if (!row) notFound();

  return (
    <EventModalContent
      event={row.events}
      organizer={row.organizers}
    />
  );
}
