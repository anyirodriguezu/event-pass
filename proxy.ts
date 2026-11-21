import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { get } from "@vercel/edge-config";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const authRoutes       = ["/dashboard", "/organizer", "/staff", "/admin"];
const publicOnlyRoutes = ["/login", "/register"];

// Middleware de next-intl — detecta locale, normaliza URLs, setea la cookie de locale.
// Solo corre en rutas que NO son auth/api (esas no están bajo [locale]).
const intlMiddleware = createMiddleware(routing);

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
  // Las rutas auth están fuera de [locale], siempre sin prefijo
  const isAuthRoute       = authRoutes.some((r) => nextUrl.pathname.startsWith(r));
  const isPublicOnlyRoute = publicOnlyRoutes.includes(nextUrl.pathname);

  if (isAuthRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isPublicOnlyRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // ── Geo-routing header ─────────────────────────────────────────────────────
  const country = req.headers.get("x-vercel-ip-country");

  // ── i18n routing para páginas públicas ────────────────────────────────────
  // Las rutas auth/api/login no están bajo [locale] — las omitimos
  const isExcluded =
    isAuthRoute ||
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.startsWith("/organizador") ||
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/mantenimiento";

  if (!isExcluded) {
    const intlResponse = intlMiddleware(req);
    if (country) intlResponse.headers.set("x-country", country);
    return intlResponse;
  }

  const res = NextResponse.next();
  if (country) res.headers.set("x-country", country);
  return res;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
