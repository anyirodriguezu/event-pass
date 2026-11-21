// Promueve un usuario existente a rol ADMIN por su email.
// Uso:  npx tsx scripts/make-admin.ts  tu-email@ejemplo.com
// Usa la misma DATABASE_URL de .env.local (apunta a tu Neon de producción).
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("❌ Falta el email.  Uso: npx tsx scripts/make-admin.ts tu@email.com");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  const [updated] = await db
    .update(schema.users)
    .set({ role: "ADMIN" })
    .where(eq(schema.users.email, email))
    .returning({ id: schema.users.id, email: schema.users.email, role: schema.users.role });

  if (!updated) {
    console.error(`❌ No existe ningún usuario con email "${email}". ¿Ya iniciaste sesión al menos una vez con esa cuenta?`);
    process.exit(1);
  }

  console.log(`✅ ${updated.email} ahora es ${updated.role}.`);
  console.log("⚠️  Cierra sesión y vuelve a entrar para que el JWT tome el nuevo rol.");
}

main();
