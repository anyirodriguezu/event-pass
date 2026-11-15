"use client";

// useLocale: lee el locale activo desde el contexto de next-intl
// useRouter / usePathname: versiones de next-intl que entienden rutas localizadas
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";
import { cn } from "cn";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: "es" | "en") => {
    if (next === locale) return;
    startTransition(() => {
      // router.replace de next-intl cambia el locale manteniendo la misma ruta
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border/60 p-0.5 bg-muted/30">
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          disabled={isPending}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
            locale === l
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
