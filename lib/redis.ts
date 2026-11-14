import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let _redis: Redis | undefined;
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

let _checkoutRL: Ratelimit | undefined;
export function getCheckoutRateLimit(): Ratelimit {
  if (!_checkoutRL) {
    _checkoutRL = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, "10 m"),
      analytics: true,
      prefix: "eventpass:checkout",
    });
  }
  return _checkoutRL;
}

let _qrRL: Ratelimit | undefined;
export function getQrScanRateLimit(): Ratelimit {
  if (!_qrRL) {
    _qrRL = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
      prefix: "eventpass:qrscan",
    });
  }
  return _qrRL;
}

export async function cacheEventSearch(key: string, data: unknown, ttl = 60) {
  await getRedis().setex(`eventpass:search:${key}`, ttl, JSON.stringify(data));
}

export async function getCachedEventSearch(key: string) {
  const cached = await getRedis().get(`eventpass:search:${key}`);
  return cached ? JSON.parse(cached as string) : null;
}
