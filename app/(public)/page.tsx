// SSG — generada en build time, sin revalidación
import Link from "next/link";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: "🔐",
    title: "QR Anti-fraude",
    description: "Cada ticket tiene un código HMAC-SHA256 único. Se invalida en el primer escaneo — imposible de duplicar.",
    color: "from-violet-500/10 to-violet-500/5",
    iconBg: "bg-violet-100 text-violet-700",
  },
  {
    icon: "⚡",
    title: "Validación en ms",
    description: "El staff escanea QRs con la cámara del celular. Respuesta desde la red edge de Vercel en milisegundos.",
    color: "from-amber-500/10 to-amber-500/5",
    iconBg: "bg-amber-100 text-amber-700",
  },
  {
    icon: "💳",
    title: "Pagos con Stripe",
    description: "Integración completa con Stripe Checkout. Reembolsos automáticos si el organizador cancela el evento.",
    color: "from-green-500/10 to-green-500/5",
    iconBg: "bg-green-100 text-green-700",
  },
  {
    icon: "🔄",
    title: "Transferencia segura",
    description: "Transfiere tu ticket a otra persona con un link de expiración de 24 horas. Registrado en blockchain de asistencia.",
    color: "from-blue-500/10 to-blue-500/5",
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    icon: "📊",
    title: "Panel en tiempo real",
    description: "El organizador ve ventas en vivo. El staff ve quién entró, cuántos faltan y recibe alertas automáticas.",
    color: "from-pink-500/10 to-pink-500/5",
    iconBg: "bg-pink-100 text-pink-700",
  },
  {
    icon: "🌎",
    title: "Multi-país",
    description: "Soporte para Perú, México, Colombia y más. Precios en moneda local, fechas en zona horaria correcta.",
    color: "from-teal-500/10 to-teal-500/5",
    iconBg: "bg-teal-100 text-teal-700",
  },
];

const CATEGORIES = [
  { href: "/categorias/music",    label: "🎵 Música" },
  { href: "/categorias/theater",  label: "🎭 Teatro" },
  { href: "/categorias/sports",   label: "⚽ Deportes" },
  { href: "/categorias/workshop", label: "🛠️ Talleres" },
  { href: "/categorias/party",    label: "🎉 Fiestas" },
  { href: "/categorias/other",    label: "✨ Otros" },
];

const STATS = [
  { value: "12 K+",   label: "Eventos realizados" },
  { value: "500 K+",  label: "Tickets vendidos" },
  { value: "99.9%",   label: "Uptime en Vercel" },
  { value: "< 50 ms", label: "Validación edge" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative mesh-bg overflow-hidden py-24 sm:py-32 px-4">
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-white/80 text-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Plataforma de tickets #1 en Latinoamérica
          </div>

          <h1 className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.08] tracking-tight text-white">
            Tickets para eventos{" "}
            <span className="gradient-brand-text">sin complicaciones</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Compra, vende y valida entradas con QR anti-fraude. Para organizadores,
            compradores y staff — todo en un solo lugar, con la velocidad de Vercel Edge.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              asChild
              size="lg"
              variant="gradient" className="h-12 px-8 shadow-lg shadow-violet-900/40"
            >
              <Link href="/eventos">Ver eventos ahora</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 text-white bg-white/8 hover:bg-white/14 backdrop-blur-sm h-12 px-8"
            >
              <Link href="/login">Crear cuenta gratis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="font-heading font-bold text-2xl sm:text-3xl gradient-brand-text">
                {s.value}
              </p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categorías ───────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-center">
            Explora por categoría
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="px-5 py-2.5 rounded-full border border-border/80 text-sm font-medium hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
              >
                {c.label}
              </Link>
            ))}
            <Link
              href="/eventos"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              Ver todos →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl">
              ¿Por qué EventPass?
            </h2>
            <p className="text-muted-foreground text-lg">
              Tecnología de primer nivel para que los eventos funcionen sin fricciones.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`p-6 rounded-2xl border border-border/60 bg-gradient-to-br ${f.color} space-y-3 hover:border-border hover:shadow-md transition-all`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${f.iconBg}`}>
                  {f.icon}
                </div>
                <h3 className="font-heading font-semibold text-base">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────── */}
      <section className="relative mesh-bg overflow-hidden py-20 px-4 text-center">
        <div className="relative max-w-2xl mx-auto space-y-6">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white">
            ¿Organizas eventos?
          </h2>
          <p className="text-white/70 text-lg">
            Crea tu evento en minutos, acepta pagos con Stripe y valida entradas
            con QR desde cualquier celular.
          </p>
          <Button
            asChild
            size="lg"
            variant="gradient" className="h-12 px-10 shadow-lg shadow-violet-900/40"
          >
            <Link href="/login">Empezar gratis — sin tarjeta</Link>
          </Button>
        </div>
      </section>

    </div>
  );
}
