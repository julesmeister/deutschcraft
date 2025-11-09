/**
 * Query Result Cache with LRU eviction
 *
 * Caches full query results to avoid repeated database calls
 */

interface QueryCacheEntry<T> {
  result: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
}

export class QueryCache {
  private cache: Map<string, QueryCacheEntry<any>>;
  private maxEntries: number;
  private defaultTTL: number;

  constructor(maxEntries: number = 500, defaultTTL: number = 60000) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get cached query result
   */
  get<T>(queryKey: string, ttl?: number): T | null {
    const entry = this.cache.get(queryKey);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    const maxAge = ttl || this.defaultTTL;

    if (age > maxAge) {
      this.cache.delete(queryKey);
      return null;
    }

    // Update access stats for LRU
    entry.accessCount++;
    entry.lastAccess = Date.now();

    return entry.result as T;
  }

  /**
   * Set query result in cache
   */
  set<T>(queryKey: string, result: T): void {
    // If cache is full, evict least recently used
    if (this.cache.size >= this.maxEntries) {
      this.evictLRU();
    }

    this.cache.set(queryKey, {
      result,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccess: Date.now(),
    });
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Invalidate entries matching pattern
   */
  invalidatePattern(pattern: RegExp): number {
    let count = 0;

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cached queries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

export const queryCache = new QueryCache();
