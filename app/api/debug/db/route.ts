// TEMPORAL — diagnóstico de conexión a la base de datos en producción.
// Devuelve el host (sin credenciales), si existe la columna password_hash y
// cuántos usuarios hay. Sirve para saber a QUÉ base está conectado Vercel.
// Se elimina apenas terminemos de diagnosticar.
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  const host = url.match(/@([^/?]+)/)?.[1] ?? "desconocido";
  try {
    const sqlc = neon(url);
    const col = await sqlc`SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash'`;
    const cnt = await sqlc`SELECT count(*)::int AS n FROM users`;
    return NextResponse.json({
      host,
      hasPasswordHash: col.length > 0,
      userCount: cnt[0]?.n ?? null,
    });
  } catch (e) {
    return NextResponse.json({ host, error: String(e) }, { status: 500 });
  }
}
