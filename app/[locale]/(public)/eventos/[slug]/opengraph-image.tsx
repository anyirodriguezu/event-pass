// OG Image dinámica — Next.js genera una imagen PNG por cada evento
// Se usa cuando alguien comparte el link en WhatsApp, Twitter, etc.
import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const alt = "EventPass";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await db.query.events.findFirst({
    where: eq(events.slug, slug),
  });

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            background: "rgba(255,255,255,0.2)",
            padding: "8px 20px",
            borderRadius: 999,
            marginBottom: 24,
          }}
        >
          🎟️ EventPass
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: 20,
          }}
        >
          {event?.title ?? "Evento"}
        </div>
        {event && (
          <div style={{ fontSize: 24, opacity: 0.85, textAlign: "center" }}>
            📍 {event.venueName}
          </div>
        )}
        <div
          style={{
            marginTop: 32,
            fontSize: 20,
            background: "#f59e0b",
            color: "#78350f",
            padding: "10px 28px",
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          Compra tus tickets →
        </div>
      </div>
    ),
    size
  );
}
