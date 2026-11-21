import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("devuelve el formato 'salt:hash' (ambos en hex)", async () => {
    const stored = await hashPassword("secreta123");
    const [salt, hash] = stored.split(":");
    expect(stored).toContain(":");
    expect(salt).toMatch(/^[0-9a-f]+$/);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it("usa un salt aleatorio: el mismo password da hashes distintos", async () => {
    const a = await hashPassword("misma-clave");
    const b = await hashPassword("misma-clave");
    expect(a).not.toBe(b);
  });

  it("verifica correctamente la contraseña correcta", async () => {
    const stored = await hashPassword("P@ssw0rd!");
    expect(await verifyPassword("P@ssw0rd!", stored)).toBe(true);
  });

  it("rechaza una contraseña incorrecta", async () => {
    const stored = await hashPassword("P@ssw0rd!");
    expect(await verifyPassword("otra-cosa", stored)).toBe(false);
  });

  it("rechaza cuando no hay hash guardado (cuenta solo-OAuth)", async () => {
    expect(await verifyPassword("lo-que-sea", null)).toBe(false);
    expect(await verifyPassword("lo-que-sea", undefined)).toBe(false);
  });

  it("rechaza un hash con formato inválido (sin ':')", async () => {
    expect(await verifyPassword("x", "no-tiene-dos-puntos")).toBe(false);
  });
});
