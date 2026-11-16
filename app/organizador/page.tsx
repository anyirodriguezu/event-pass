import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarPlus, BarChart3, QrCode, ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Acceso organizadores" };

const ERRORS: Record<string, string> = {
  CredentialsSignin: "Email o contraseña incorrectos.",
  default: "Ocurrió un error. Intenta de nuevo.",
};

const PERKS = [
  { icon: CalendarPlus, text: "Crea y publica eventos en minutos" },
  { icon: BarChart3, text: "Reportes de ventas en tiempo real" },
  { icon: QrCode, text: "Check-in con QR anti-fraude" },
];

export default async function OrganizadorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user.role === "ORGANIZER") redirect("/organizer");

  const { error } = await searchParams;
  const errorMsg = error ? (ERRORS[error] ?? ERRORS.default) : null;

  return (
    <div className="relative min-h-screen aurora-bg overflow-hidden flex items-center justify-center p-4">
      {/* Blobs decorativos flotantes */}
      <div className="blob w-80 h-80 bg-violet-600/40 top-[-4rem] left-[-4rem]" />
      <div className="blob w-72 h-72 bg-fuchsia-500/40 bottom-[-5rem] right-[-3rem]" style={{ animationDelay: "-6s" }} />
      <div className="blob w-64 h-64 bg-sky-500/30 top-1/3 right-1/4" style={{ animationDelay: "-10s" }} />

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* ── Lado marketing ───────────────────────────────────────── */}
        <div className="hidden lg:block space-y-8 text-white animate-fade-up">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
            <ArrowLeft className="size-4" /> Volver a EventPass
          </Link>

          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20 backdrop-blur">
              Portal de organizadores
            </span>
            <h1 className="font-heading font-bold text-4xl xl:text-5xl leading-tight">
              Lleva tu evento{" "}
              <span className="gradient-brand-animated">al siguiente nivel</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-md">
              Gestiona ventas, valida entradas y conoce a tu audiencia desde un
              solo panel.
            </p>
          </div>

          <ul className="space-y-4">
            {PERKS.map((p, i) => (
              <li
                key={p.text}
                className="flex items-center gap-3 text-white/80 animate-fade-up"
                style={{ ["--d" as string]: `${200 + i * 120}ms` }}
              >
                <span className="grid place-items-center size-10 rounded-xl bg-white/10 border border-white/15 shrink-0">
                  <p.icon className="size-5 text-fuchsia-300" />
                </span>
                <span className="text-sm">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Lado formulario ──────────────────────────────────────── */}
        <div className="w-full max-w-md mx-auto glass rounded-3xl p-8 shadow-2xl space-y-7 animate-bounce-in">
          <div className="text-center space-y-2">
            <Link href="/" className="lg:hidden inline-flex items-center gap-2">
              <span className="text-2xl">🎟️</span>
              <span className="font-heading font-bold text-xl gradient-brand-text">EventPass</span>
            </Link>
            <h2 className="font-heading font-bold text-2xl text-white">Panel de organizadores</h2>
            <p className="text-white/60 text-sm">Ingresa con tu correo y contraseña</p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm text-center animate-fade-up">
              {errorMsg}
            </div>
          )}

          <form
            action={async (formData: FormData) => {
              "use server";
              try {
                await signIn("credentials", {
                  email: formData.get("email"),
                  password: formData.get("password"),
                  redirectTo: "/organizer",
                });
              } catch (err) {
                if (err instanceof AuthError) redirect(`/organizador?error=${err.type}`);
                throw err;
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/70 text-xs uppercase tracking-wide">Email</Label>
              <Input
                id="email" name="email" type="email" required
                placeholder="carlos@test.com"
                className="bg-white/8 border-white/20 text-white placeholder:text-white/30 focus:border-primary/70 h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/70 text-xs uppercase tracking-wide">Contraseña</Label>
              <Input
                id="password" name="password" type="password" required
                placeholder="••••••••"
                className="bg-white/8 border-white/20 text-white placeholder:text-white/30 focus:border-primary/70 h-11"
              />
            </div>
            <Button type="submit" variant="gradient" className="w-full h-11 sheen">
              Entrar al panel
            </Button>
          </form>

          <p className="text-center text-sm text-white/50">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/organizador/registro" className="text-fuchsia-300 hover:text-fuchsia-200 font-medium">
              Regístrate gratis
            </Link>
          </p>

          <p className="text-center text-xs text-white/35 border-t border-white/10 pt-4">
            Demo: <span className="font-mono text-white/55">carlos@test.com</span> ·{" "}
            <span className="font-mono text-white/55">demo1234</span>
          </p>
        </div>
      </div>
    </div>
  );
}
