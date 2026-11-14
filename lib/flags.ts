// Vercel Edge Config (Global Config) — Feature Flags sin redeploy
// Permite activar/desactivar features desde el dashboard de Vercel en tiempo real
import { createClient } from "@vercel/global-config";

const config = createClient(process.env.EDGE_CONFIG!);

// Ejemplo de flags disponibles:
// - presale_mode: bool — activa modo preventa (solo usuarios registrados pueden comprar)
// - maintenance_mode: bool — muestra banner de mantenimiento
// - max_tickets_per_order: number — límite de tickets por compra

export async function getFlag<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const value = await config.get<T>(key);
    return value ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function isPresaleMode(): Promise<boolean> {
  return getFlag("presale_mode", false);
}

export async function isMaintenanceMode(): Promise<boolean> {
  return getFlag("maintenance_mode", false);
}

export async function getMaxTicketsPerOrder(): Promise<number> {
  return getFlag("max_tickets_per_order", 5);
}
