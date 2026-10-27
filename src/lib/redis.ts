import { Redis } from '@upstash/redis';
import { env } from '@/env';

let redisInstance: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (redisInstance) return redisInstance;

  const url = env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    redisInstance = new Redis({
      url,
      token,
    });
    return redisInstance;
  } catch (error) {
    console.warn('[Redis] Failed to initialize Upstash client:', error);
    return null;
  }
}

/**
 * Safely get a cached value from Redis. Returns null on miss or error.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get<T>(key);
    return data ?? null;
  } catch (err) {
    console.warn(`[Redis] cacheGet failed for key "${key}":`, err);
    return null;
  }
}

/**
 * Safely set a value in Redis with TTL in seconds.
 */
export async function cacheSet<T>(key: string, data: T, ttlSeconds: number = 3600): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.set(key, data, { ex: ttlSeconds });
    return true;
  } catch (err) {
    console.warn(`[Redis] cacheSet failed for key "${key}":`, err);
    return false;
  }
}

/**
 * Safely delete one or more keys from Redis.
 */
export async function cacheDel(...keys: string[]): Promise<boolean> {
  const client = getRedisClient();
  if (!client || keys.length === 0) return false;

  try {
    await client.del(...keys);
    return true;
  } catch (err) {
    console.warn(`[Redis] cacheDel failed for keys "${keys.join(', ')}":`, err);
    return false;
  }
}

/**
 * Safely delete all keys matching a pattern (e.g. "quotes:badge:*").
 */
export async function cacheDelPattern(pattern: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const keys = await client.keys(pattern);
    if (keys && keys.length > 0) {
      await client.del(...keys);
    }
    return true;
  } catch (err) {
    console.warn(`[Redis] cacheDelPattern failed for "${pattern}":`, err);
    return false;
  }
}

/**
 * Helper to get cached data or compute and cache it if absent.
 */
export async function getOrSetCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const fresh = await fetchFn();
  if (fresh !== null && fresh !== undefined) {
    // Non-blocking set
    cacheSet(key, fresh, ttlSeconds).catch(() => {});
  }
  return fresh;
}
