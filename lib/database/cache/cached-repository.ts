/**
 * Cached Repository Wrapper
 *
 * Wraps any repository with automatic caching
 */

import { BaseRepository, QueryOptions, QueryResult } from '../types';
import { globalCache, CacheTTL } from './in-memory-cache';
import { queryCache } from './query-cache';

export class CachedRepository<T extends { id?: string }> implements BaseRepository<T> {
  constructor(
    private repository: BaseRepository<T>,
    private collectionName: string,
    private cacheTTL: number = CacheTTL.MEDIUM
  ) {}

  // ============================================================================
  // Read Operations (Cached)
  // ============================================================================

  async findById(id: string): Promise<T | null> {
    // Try cache first
    const cached = globalCache.get<T>(this.collectionName, { id });
    if (cached) {
      return cached;
    }

    // Fetch from database
    const result = await this.repository.findById(id);

    // Cache if found
    if (result) {
      globalCache.set(this.collectionName, { id }, result, this.cacheTTL);
    }

    return result;
  }

  async findOne(options: QueryOptions): Promise<T | null> {
    const cacheKey = `${this.collectionName}:findOne:${JSON.stringify(options)}`;

    // Try query cache
    const cached = queryCache.get<T>(cacheKey, this.cacheTTL);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const result = await this.repository.findOne(options);

    // Cache result
    if (result) {
      queryCache.set(cacheKey, result);
    }

    return result;
  }

  async findMany(options: QueryOptions): Promise<QueryResult<T>> {
    const cacheKey = `${this.collectionName}:findMany:${JSON.stringify(options)}`;

    // Try query cache
    const cached = queryCache.get<QueryResult<T>>(cacheKey, this.cacheTTL);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const result = await this.repository.findMany(options);

    // Cache result
    queryCache.set(cacheKey, result);

    // Also cache individual items
    result.data.forEach(item => {
      if (item.id) {
        globalCache.set(this.collectionName, { id: item.id }, item, this.cacheTTL);
      }
    });

    return result;
  }

  async findAll(): Promise<T[]> {
    const cacheKey = `${this.collectionName}:findAll`;

    // Try query cache
    const cached = queryCache.get<T[]>(cacheKey, this.cacheTTL);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const result = await this.repository.findAll();

    // Cache result
    queryCache.set(cacheKey, result);

    return result;
  }

  // ============================================================================
  // Write Operations (Invalidate Cache)
  // ============================================================================

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const result = await this.repository.create(data);

    // Invalidate collection cache
    this.invalidateCollection();

    // Cache new item
    if (result.id) {
      globalCache.set(this.collectionName, { id: result.id }, result, this.cacheTTL);
    }

    return result;
  }

  async createBatch(dataArray: Omit<T, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<T[]> {
    const results = await this.repository.createBatch(dataArray);

    // Invalidate collection cache
    this.invalidateCollection();

    // Cache new items
    results.forEach(item => {
      if (item.id) {
        globalCache.set(this.collectionName, { id: item.id }, item, this.cacheTTL);
      }
    });

    return results;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const result = await this.repository.update(id, data);

    // Invalidate caches
    globalCache.invalidateKey(this.collectionName, { id });
    this.invalidateCollection();

    // Cache updated item
    globalCache.set(this.collectionName, { id }, result, this.cacheTTL);

    return result;
  }

  async updateBatch(updates: { id: string; data: Partial<T> }[]): Promise<T[]> {
    const results = await this.repository.updateBatch(updates);

    // Invalidate caches
    updates.forEach(({ id }) => {
      globalCache.invalidateKey(this.collectionName, { id });
    });
    this.invalidateCollection();

    // Cache updated items
    results.forEach(item => {
      if (item.id) {
        globalCache.set(this.collectionName, { id: item.id }, item, this.cacheTTL);
      }
    });

    return results;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);

    // Invalidate caches
    globalCache.invalidateKey(this.collectionName, { id });
    this.invalidateCollection();
  }

  async deleteBatch(ids: string[]): Promise<void> {
    await this.repository.deleteBatch(ids);

    // Invalidate caches
    ids.forEach(id => {
      globalCache.invalidateKey(this.collectionName, { id });
    });
    this.invalidateCollection();
  }

  // ============================================================================
  // Utility Operations
  // ============================================================================

  async count(options?: QueryOptions): Promise<number> {
    const cacheKey = `${this.collectionName}:count:${JSON.stringify(options || {})}`;

    const cached = queryCache.get<number>(cacheKey, this.cacheTTL);
    if (cached !== null) {
      return cached;
    }

    const result = await this.repository.count(options);
    queryCache.set(cacheKey, result);

    return result;
  }

  async exists(id: string): Promise<boolean> {
    // Check cache first
    const cached = globalCache.get<T>(this.collectionName, { id });
    if (cached) {
      return true;
    }

    return this.repository.exists(id);
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  /**
   * Invalidate all query caches for this collection
   */
  private invalidateCollection(): void {
    queryCache.invalidatePattern(new RegExp(`^${this.collectionName}:`));
  }

  /**
   * Manually invalidate all caches for this collection
   */
  invalidateCache(): void {
    globalCache.invalidate(this.collectionName);
    this.invalidateCollection();
  }
}
