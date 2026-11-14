import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin:       "Email o contraseña incorrectos.",
  OAuthAccountNotLinked:   "Este email ya está registrado con otro método.",
  default:                 "Ocurrió un error. Intenta de nuevo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMsg = error
    ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default)
    : null;

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      {/* Glass card */}
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl space-y-7">

        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">🎟️</span>
            <span className="font-heading font-bold text-xl gradient-brand-text">
              EventPass
            </span>
          </Link>
          <p className="text-white/60 text-sm">
            Accede para comprar o gestionar eventos
          </p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* Google */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-white/20 bg-white/8 text-white text-sm font-medium hover:bg-white/14 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <span className="flex-1 h-px bg-white/15" />
          <span className="text-xs text-white/40 uppercase tracking-widest">o</span>
          <span className="flex-1 h-px bg-white/15" />
        </div>

        {/* Email form */}
        <form
          action={async (formData: FormData) => {
            "use server";
            try {
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirectTo: "/dashboard",
              });
            } catch (err) {
              if (err instanceof AuthError) {
                redirect(`/login?error=${err.type}`);
              }
              throw err;
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/70 text-xs uppercase tracking-wide">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="ana@ejemplo.com"
              className="bg-white/8 border-white/20 text-white placeholder:text-white/30 focus:border-primary/70 h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-white/70 text-xs uppercase tracking-wide">
              Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="bg-white/8 border-white/20 text-white placeholder:text-white/30 focus:border-primary/70 h-11"
            />
          </div>
          <Button
            type="submit"
            variant="gradient" className="w-full h-11"
          >
            Entrar
          </Button>
        </form>

        {/* Demo hint */}
        <p className="text-center text-xs text-white/40">
          Usuarios de prueba:{" "}
          <span className="text-white/60 font-mono">ana@test.com</span> o{" "}
          <span className="text-white/60 font-mono">carlos@test.com</span>
          <br />
          (cualquier contraseña)
        </p>

      </div>
    </div>
  );
}
