import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Rutas que requieren autenticación
const authRoutes = ["/dashboard", "/organizer", "/staff"];
// Rutas que solo pueden visitar usuarios NO autenticados
const publicOnlyRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAuthRoute = authRoutes.some((r) => nextUrl.pathname.startsWith(r));
  const isPublicOnlyRoute = publicOnlyRoutes.includes(nextUrl.pathname);

  if (isAuthRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isPublicOnlyRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Geo-routing: detectar país por cabecera de Vercel
  const country = req.headers.get("x-vercel-ip-country");
  const res = NextResponse.next();
  if (country) res.headers.set("x-country", country);

  return res;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
