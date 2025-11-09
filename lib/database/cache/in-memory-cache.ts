/**
 * In-Memory Cache Layer for Database Operations
 *
 * Provides fast in-memory caching with automatic expiration
 * Reduces database reads for frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  invalidations: number;
  size: number;
}

export class InMemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private stats: CacheStats;
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      invalidations: 0,
      size: 0,
    };

    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Generate cache key from query parameters
   */
  private generateKey(collection: string, params: any): string {
    return `${collection}:${JSON.stringify(params)}`;
  }

  /**
   * Get value from cache if it exists and hasn't expired
   */
  get<T>(collection: string, params: any): T | null {
    const key = this.generateKey(collection, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Set value in cache with TTL
   */
  set<T>(collection: string, params: any, data: T, ttl: number = 60000): void {
    const key = this.generateKey(collection, params);

    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    this.stats.sets++;
    this.stats.size = this.cache.size;
  }

  /**
   * Invalidate all cache entries for a collection
   */
  invalidate(collection: string): void {
    const prefix = `${collection}:`;
    let count = 0;

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.stats.invalidations += count;
    this.stats.size = this.cache.size;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidateKey(collection: string, params: any): void {
    const key = this.generateKey(collection, params);
    if (this.cache.delete(key)) {
      this.stats.invalidations++;
      this.stats.size = this.cache.size;
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.stats.size = this.cache.size;
      console.log(`[Cache] Cleaned up ${removed} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      invalidations: 0,
      size: this.cache.size,
    };
  }

  /**
   * Destroy cache and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Singleton instance
export const globalCache = new InMemoryCache(1000);

// Cache TTL presets (in milliseconds)
export const CacheTTL = {
  SHORT: 30 * 1000,           // 30 seconds
  MEDIUM: 2 * 60 * 1000,      // 2 minutes
  LONG: 10 * 60 * 1000,       // 10 minutes
  VERY_LONG: 60 * 60 * 1000,  // 1 hour
  DAY: 24 * 60 * 60 * 1000,   // 24 hours
} as const;
