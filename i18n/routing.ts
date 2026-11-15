import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  // as-needed: el locale por defecto (es) no tiene prefijo en la URL.
  // "/" → español, "/en" → inglés.
  localePrefix: "as-needed",
});
