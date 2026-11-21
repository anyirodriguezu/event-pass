// Login dedicado del backoffice admin. Está fuera del grupo (panel), así que
// NO lo gatea el layout de admin (evita bucle de redirección).
import { auth, signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Email o contraseña incorrectos.",
  default: "Ocurrió un error. Intenta de nuevo.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  // Ya autenticado como admin → directo al panel.
  if (session?.user.role === "ADMIN") redirect("/admin");

  const { error } = await searchParams;
  const errorMsg = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default) : null;

  // Sesión iniciada pero SIN rol admin: no mostramos el formulario, sino un aviso.
  // (Si fuera ADMIN ya habríamos redirigido arriba, así que basta con que haya sesión.)
  const loggedNonAdmin = !!session;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-sm rounded-3xl border border-border/60 bg-card p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="font-heading font-bold text-xl">Acceso administradores</h1>
          <p className="text-sm text-muted-foreground">EventPass · Backoffice</p>
        </div>

        {loggedNonAdmin ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/30 p-3 text-sm text-amber-700 dark:text-amber-400 text-center">
              Tu cuenta ({session!.user.email}) no tiene permisos de administrador.
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <Button type="submit" variant="outline" className="w-full">
                Cerrar sesión y usar otra cuenta
              </Button>
            </form>
            <Link href="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
              ← Volver al sitio
            </Link>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400 text-center">
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
                    redirectTo: "/admin",
                  });
                } catch (err) {
                  if (err instanceof AuthError) {
                    redirect(`/admin/login?error=${err.type}`);
                  }
                  throw err;
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Email
                </Label>
                <Input id="email" name="email" type="email" required placeholder="admin@eventpass.app" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Contraseña
                </Label>
                <Input id="password" name="password" type="password" required placeholder="••••••••" className="h-11" />
              </div>
              <Button type="submit" variant="gradient" className="w-full h-11">
                Entrar al panel
              </Button>
            </form>

            <Link href="/" className="block text-center text-xs text-muted-foreground hover:text-foreground">
              ← Volver al sitio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
