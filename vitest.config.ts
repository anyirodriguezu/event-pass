import { defineConfig } from "vitest/config";

// Config de Vitest para tests unitarios de funciones puras (lib/).
// environment "node": no necesitamos DOM; son funciones de servidor/crypto.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "tests/**/*.test.ts"],
  },
});
