import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BASE_URL = "https://eventpass.vercel.app";

const CATEGORIES = ["music", "theater", "sports", "workshop", "party", "other"];

// Next.js llama a esta función en build time (y en cada ISR revalidation)
// y sirve el resultado en /sitemap.xml — indexado por Google automáticamente
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rutas estáticas
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/eventos`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...CATEGORIES.map((cat) => ({
      url: `${BASE_URL}/categorias/${cat}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];

  // Rutas dinámicas: una entrada por evento publicado
  const publishedEvents = await db
    .select({ slug: events.slug, createdAt: events.createdAt })
    .from(events)
    .where(eq(events.status, "PUBLISHED"));

  const eventRoutes: MetadataRoute.Sitemap = publishedEvents.map((e) => ({
    url: `${BASE_URL}/eventos/${e.slug}`,
    lastModified: e.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...eventRoutes];
}
