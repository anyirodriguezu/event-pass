import type { Metadata } from "next";
import { Geist, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/shared/Providers";
import "./globals.css";

/* Body font — clean, modern sans-serif */
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

/* Heading font — geometric, bold display personality */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EventPass — Tickets para eventos en Latinoamérica",
    template: "%s | EventPass",
  },
  description: "Compra, vende y valida tickets para eventos con QR anti-fraude.",
  openGraph: {
    type: "website",
    siteName: "EventPass",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geist.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        {/* Vercel Analytics — registra page views automáticamente */}
        <Analytics />
        {/* Vercel Speed Insights — Core Web Vitals en tiempo real */}
        <SpeedInsights />
      </body>
    </html>
  );
}
