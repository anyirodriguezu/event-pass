import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limit: máximo 5 intentos de checkout por IP cada 10 minutos
export const checkoutRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "eventpass:checkout",
});

// Rate limit: máximo 20 scans QR por dispositivo por minuto (anti-fraude)
export const qrScanRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "eventpass:qrscan",
});

export async function cacheEventSearch(key: string, data: unknown, ttl = 60) {
  await redis.setex(`eventpass:search:${key}`, ttl, JSON.stringify(data));
}

export async function getCachedEventSearch(key: string) {
  const cached = await redis.get(`eventpass:search:${key}`);
  return cached ? JSON.parse(cached as string) : null;
}
