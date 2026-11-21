import { describe, it, expect } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("pasa a minúsculas y une palabras con guiones", () => {
    expect(slugify("Concierto De Rock")).toBe("concierto-de-rock");
  });

  it("elimina acentos y la ñ dejando la letra base", () => {
    // NFD descompone: ñ -> n + tilde combinante, á/ó/í -> vocal + acento;
    // las marcas combinantes se eliminan, queda la letra base.
    expect(slugify("Peña Flamenca")).toBe("pena-flamenca");
    expect(slugify("Función Única")).toBe("funcion-unica");
  });

  it("colapsa símbolos y espacios múltiples en un solo guion", () => {
    expect(slugify("Rock & Roll!!!  2026")).toBe("rock-roll-2026");
  });

  it("no deja guiones al inicio ni al final", () => {
    expect(slugify("  ¡Hola Mundo!  ")).toBe("hola-mundo");
  });

  it("un texto sin caracteres válidos da string vacío", () => {
    expect(slugify("¡¿!?")).toBe("");
  });
});
