import type { MetadataRoute } from "next";

const BASE_URL = "https://eventpass.vercel.app";

// Next.js sirve esto en /robots.txt automáticamente
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // No indexar rutas privadas ni APIs
        disallow: [
          "/api/",
          "/dashboard/",
          "/organizer/",
          "/staff/",
          "/checkout/",
          "/transfer/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
