/**
 * Batch Operation Optimizer
 *
 * Optimizes database operations by batching multiple requests
 */

interface BatchRequest<T> {
  id: string;
  resolve: (value: T | null) => void;
  reject: (error: Error) => void;
}

export class BatchOptimizer<T extends { id?: string }> {
  private queue: Map<string, BatchRequest<T>[]> = new Map();
  private batchDelay: number;
  private maxBatchSize: number;
  private timeout: NodeJS.Timeout | null = null;

  constructor(batchDelay: number = 10, maxBatchSize: number = 100) {
    this.batchDelay = batchDelay;
    this.maxBatchSize = maxBatchSize;
  }

  /**
   * Add request to batch queue
   */
  async batchFindById(
    collection: string,
    id: string,
    fetcher: (ids: string[]) => Promise<T[]>
  ): Promise<T | null> {
    return new Promise((resolve, reject) => {
      // Add to queue
      if (!this.queue.has(collection)) {
        this.queue.set(collection, []);
      }

      const queue = this.queue.get(collection)!;
      queue.push({ id, resolve, reject });

      // Process immediately if batch is full
      if (queue.length >= this.maxBatchSize) {
        this.processBatch(collection, fetcher);
      } else {
        // Schedule batch processing
        this.scheduleBatchProcessing(collection, fetcher);
      }
    });
  }

  /**
   * Schedule batch processing
   */
  private scheduleBatchProcessing(
    collection: string,
    fetcher: (ids: string[]) => Promise<T[]>
  ): void {
    if (this.timeout) {
      return; // Already scheduled
    }

    this.timeout = setTimeout(() => {
      this.processBatch(collection, fetcher);
      this.timeout = null;
    }, this.batchDelay);
  }

  /**
   * Process queued batch requests
   */
  private async processBatch(
    collection: string,
    fetcher: (ids: string[]) => Promise<T[]>
  ): Promise<void> {
    const queue = this.queue.get(collection);
    if (!queue || queue.length === 0) {
      return;
    }

    // Take requests from queue
    const requests = queue.splice(0, this.maxBatchSize);
    const ids = requests.map(r => r.id);

    try {
      // Fetch all items in one batch
      const items = await fetcher(ids);

      // Create lookup map
      const itemMap = new Map<string, T>();
      items.forEach(item => {
        if (item.id) {
          itemMap.set(item.id, item);
        }
      });

      // Resolve all requests
      requests.forEach(request => {
        const item = itemMap.get(request.id);
        request.resolve(item || null);
      });
    } catch (error) {
      // Reject all requests
      requests.forEach(request => {
        request.reject(error as Error);
      });
    }

    // Process remaining items if any
    if (queue.length > 0) {
      this.processBatch(collection, fetcher);
    }
  }
}

/**
 * DataLoader-style request coalescing
 * Combines multiple identical requests into single database call
 */
export class RequestCoalescer {
  private pending: Map<string, Promise<any>> = new Map();

  async coalesce<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    const existing = this.pending.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    // Create new request
    const promise = fetcher()
      .then(result => {
        this.pending.delete(key);
        return result;
      })
      .catch(error => {
        this.pending.delete(key);
        throw error;
      });

    this.pending.set(key, promise);
    return promise;
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pending.clear();
  }
}

// Global instances
export const batchOptimizer = new BatchOptimizer();
export const requestCoalescer = new RequestCoalescer();
