import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // PPR en Next.js 16: cacheComponents habilita Partial Prerendering globalmente.
  // partialPrefetching mejora la navegación prefetcheando solo el shell estático.
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com", // Vercel Blob
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google avatars (NextAuth)
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Seed data cover images
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
