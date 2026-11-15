import Link from "next/link";
import { NavAuthButton } from "@/components/shared/NavAuthButton";
import { NavLink } from "@/components/shared/NavLink";
import { LocaleSwitcher } from "@/components/shared/LocaleSwitcher";
import { getTranslations } from "next-intl/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getTranslations: versión de servidor de useTranslations — no necesita "use client"
  const t = await getTranslations("nav");

  const CATEGORIES = [
    { href: "/categorias/music",   label: t("music") },
    { href: "/categorias/theater", label: t("theater") },
    { href: "/categorias/sports",  label: t("sports") },
    { href: "/categorias/party",   label: t("parties") },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Navbar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🎟️</span>
            <span className="font-heading font-bold text-lg gradient-brand-text">
              EventPass
            </span>
          </Link>

          {/* Category links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/eventos">{t("all")}</NavLink>
            {CATEGORIES.map((c) => (
              <NavLink key={c.href} href={c.href}>
                {c.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side: locale switcher + auth */}
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <NavAuthButton />
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg">🎟️</span>
              <span className="font-heading font-bold gradient-brand-text">EventPass</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              La plataforma de tickets con QR anti-fraude para Latinoamérica.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">{t("events")}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {CATEGORIES.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="hover:text-foreground transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Organizadores</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Crear evento</Link></li>
              <li><Link href="/organizer" className="hover:text-foreground transition-colors">Panel de control</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Gestión de ventas</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold">Plataforma</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Términos de uso</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacidad</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Soporte</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} EventPass</p>
          <p>Hecho con Next.js 16 · Vercel</p>
        </div>
      </footer>
    </div>
  );
}
