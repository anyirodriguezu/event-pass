import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Versiones locale-aware de Link, useRouter, usePathname, redirect.
// Usar estos en vez de los de next/navigation cuando se trabaje con rutas localizadas.
export const { Link, useRouter, usePathname, redirect } =
  createNavigation(routing);
