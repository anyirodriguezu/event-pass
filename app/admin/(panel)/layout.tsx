// Layout del backoffice admin — independiente de la app del comprador.
// Gatea el acceso: solo rol ADMIN; cualquier otro caso va a /admin/login.
// El grupo (panel) hace que /admin/login quede FUERA de este layout (sin bucle).
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, LayoutDashboard, ArrowLeft, LogOut } from "lucide-react";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border/60 bg-card flex-col hidden md:flex">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border/60">
          <ShieldCheck className="size-5 text-violet-600" />
          <span className="font-heading font-bold">EventPass Admin</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            <LayoutDashboard className="size-4" /> Resumen
          </Link>
        </nav>

        <div className="p-3 border-t border-border/60 space-y-1">
          <p className="px-3 pb-1 text-xs text-muted-foreground truncate">
            {session.user.email}
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-4" /> Volver al sitio
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-muted transition-colors text-left"
            >
              <LogOut className="size-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 min-w-0 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
