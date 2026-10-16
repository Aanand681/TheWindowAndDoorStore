/**
 * Lightweight Client-Side In-Memory Cache with Request Deduplication (SWR pattern)
 * Completely eliminates layout flickering, cold-start blanks, and redundant network requests.
 */

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const cache = new Map<string, CacheEntry<any>>();
const inFlightPromises = new Map<string, Promise<any>>();

export function getCachedData<T>(key: string, maxAgeMs = 120_000): T | null {
  if (typeof window === 'undefined') return null;
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > maxAgeMs) {
    return entry.data; // Return stale data while revalidating
  }
  return entry.data;
}

export function setCachedData<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(keyPrefix?: string) {
  if (!keyPrefix) {
    cache.clear();
    return;
  }
  for (const k of cache.keys()) {
    if (k.startsWith(keyPrefix)) cache.delete(k);
  }
}

/**
 * Fetch with automatic request deduplication and in-memory caching.
 * Concurrent requests for the same URL share a single HTTP flight.
 */
export async function cachedFetch<T>(url: string, maxAgeMs = 120_000): Promise<T> {
  // If we have fresh cached data, return it immediately
  const existing = cache.get(url);
  const now = Date.now();
  if (existing && now - existing.timestamp < maxAgeMs) {
    return existing.data as T;
  }

  // If a request for this URL is currently in flight, attach to it
  if (inFlightPromises.has(url)) {
    return inFlightPromises.get(url)! as Promise<T>;
  }

  const promise = fetch(url)
    .then(async (res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res.json();
    })
    .then((data: T) => {
      cache.set(url, { data, timestamp: Date.now() });
      inFlightPromises.delete(url);
      return data;
    })
    .catch((err) => {
      inFlightPromises.delete(url);
      // If we had stale data, fallback to it gracefully
      if (existing) return existing.data as T;
      throw err;
    });

  inFlightPromises.set(url, promise);
  return promise;
}
