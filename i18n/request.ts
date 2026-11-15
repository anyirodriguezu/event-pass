import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Carga los mensajes del locale activo en cada request.
// Next-intl los inyecta automáticamente en el árbol de componentes
// vía NextIntlClientProvider en el layout.
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "es" | "en")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
