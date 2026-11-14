import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { get } from "@vercel/edge-config";

const authRoutes       = ["/dashboard", "/organizer", "/staff"];
const publicOnlyRoutes = ["/login", "/register"];

export default auth(async (req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  // ── Edge Config: modo mantenimiento ────────────────────────────────────────
  if (process.env.EDGE_CONFIG) {
    try {
      const maintenance = await get<boolean>("maintenance_mode");
      if (maintenance) {
        const isMaintPage   = nextUrl.pathname === "/mantenimiento";
        const isStaticAsset = nextUrl.pathname.startsWith("/_next");
        if (!isMaintPage && !isStaticAsset) {
          return NextResponse.redirect(new URL("/mantenimiento", nextUrl));
        }
      }
    } catch {
      // Edge Config no disponible → continuar sin bloquear
    }
  }

  // ── Auth guards ────────────────────────────────────────────────────────────
  const isAuthRoute       = authRoutes.some((r) => nextUrl.pathname.startsWith(r));
  const isPublicOnlyRoute = publicOnlyRoutes.includes(nextUrl.pathname);

  if (isAuthRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isPublicOnlyRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // ── Geo-routing ────────────────────────────────────────────────────────────
  const country = req.headers.get("x-vercel-ip-country");
  const res = NextResponse.next();
  if (country) res.headers.set("x-country", country);

  return res;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
