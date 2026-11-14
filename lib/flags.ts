// Vercel Edge Config — Feature Flags sin redeploy
// Permite activar/desactivar features desde el dashboard de Vercel en tiempo real
// Lee el valor desde la red edge global (< 1ms de latencia)
// Fallback seguro: si EDGE_CONFIG no está configurado, retorna defaultValue
import { get } from "@vercel/edge-config";

export async function getFlag<T>(key: string, defaultValue: T): Promise<T> {
  if (!process.env.EDGE_CONFIG) return defaultValue;
  try {
    const value = await get<T>(key);
    return value ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export const isMaintenanceMode  = () => getFlag("maintenance_mode", false);
export const isPresaleMode      = () => getFlag("presale_mode", false);
export const getMaxTicketsPerOrder = () => getFlag("max_tickets_per_order", 5);
