"use client";
// Client Component — necesita useState para manejar filtros interactivos
// El Server Component padre recibe los filtros como searchParams desde la URL
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "", label: "Todos" },
  { value: "music", label: "🎵 Música" },
  { value: "theater", label: "🎭 Teatro" },
  { value: "sports", label: "⚽ Deportes" },
  { value: "workshop", label: "🛠️ Talleres" },
  { value: "party", label: "🎉 Fiestas" },
  { value: "other", label: "Otros" },
];

export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("categoria") ?? "";

  const setCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("categoria", value);
    } else {
      params.delete("categoria");
    }
    router.push(`/eventos?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map((cat) => (
        <Button
          key={cat.value}
          variant={current === cat.value ? "default" : "outline"}
          size="sm"
          onClick={() => setCategory(cat.value)}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  );
}
