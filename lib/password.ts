import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// scrypt nativo de Node — no requiere dependencias externas (bcrypt/argon).
// Corre solo en Node runtime (authorize callback + Server Actions), nunca en Edge.
const scryptAsync = promisify(scrypt);

const KEYLEN = 64;

/**
 * Hashea una contraseña. Devuelve "salt:hash" (ambos en hex).
 * El salt aleatorio por contraseña evita ataques con rainbow tables.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

/**
 * Verifica una contraseña contra un hash "salt:hash".
 * Usa timingSafeEqual para evitar timing attacks.
 */
export async function verifyPassword(
  password: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hashHex] = stored.split(":");
  const hashBuf = Buffer.from(hashHex, "hex");
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  if (hashBuf.length !== derived.length) return false;
  return timingSafeEqual(hashBuf, derived);
}
