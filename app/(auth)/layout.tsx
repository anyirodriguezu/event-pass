import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";
import { NavLink } from "@/components/shared/NavLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const initials = session.user.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : session.user.email?.[0].toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top nav ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🎟️</span>
            <span className="font-heading font-bold text-base gradient-brand-text">
              EventPass
            </span>
          </Link>

          {/* Role-based nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            <NavLink href="/dashboard">Mis tickets</NavLink>
            {session.user.role === "ORGANIZER" && (
              <NavLink href="/organizer">Panel organizador</NavLink>
            )}
            {(session.user.role === "STAFF" || session.user.role === "ADMIN") && (
              <NavLink href="/staff">Panel staff</NavLink>
            )}
            {session.user.role === "ADMIN" && (
              <NavLink href="/admin">Admin</NavLink>
            )}
            <NavLink href="/eventos">Explorar eventos</NavLink>
          </nav>

          {/* User avatar + dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-border/60 hover:border-border hover:bg-muted/40 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarImage src={session.user.image ?? ""} />
                <AvatarFallback className="text-xs bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium max-w-[120px] truncate hidden sm:block">
                {session.user.name ?? session.user.email}
              </span>
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium truncate">{session.user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{session.user.role.toLowerCase()}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/dashboard" className="w-full">Mis tickets</Link>
              </DropdownMenuItem>
              {session.user.role === "ORGANIZER" && (
                <DropdownMenuItem>
                  <Link href="/organizer" className="w-full">Panel organizador</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                  className="w-full"
                >
                  <button type="submit" className="w-full text-left text-destructive">
                    Cerrar sesión
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
