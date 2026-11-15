import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

// Este layout envuelve todas las páginas públicas con el contexto de i18n.
// getMessages() carga el JSON del locale activo (es.json o en.json).
// NextIntlClientProvider lo inyecta en el árbol — disponible en Client Components
// con useTranslations() y en Server Components con getTranslations().
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "es" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
