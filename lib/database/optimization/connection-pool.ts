/**
 * Connection Pool Manager
 *
 * For future database providers that need connection pooling (PostgreSQL, MySQL, etc.)
 */

interface PoolConfig {
  min: number;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

interface PoolStats {
  total: number;
  active: number;
  idle: number;
  waiting: number;
}

/**
 * Generic connection pool interface
 * Implement this for specific databases
 */
export interface ConnectionPool<T> {
  /**
   * Get connection from pool
   */
  acquire(): Promise<T>;

  /**
   * Return connection to pool
   */
  release(connection: T): void;

  /**
   * Get pool statistics
   */
  stats(): PoolStats;

  /**
   * Close all connections
   */
  close(): Promise<void>;
}

/**
 * Example PostgreSQL pool configuration
 */
export const DefaultPostgresPoolConfig: PoolConfig = {
  min: 5,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

/**
 * Example MySQL pool configuration
 */
export const DefaultMySQLPoolConfig: PoolConfig = {
  min: 5,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

/**
 * Pool monitor for tracking connection usage
 */
export class PoolMonitor {
  private samples: PoolStats[] = [];
  private maxSamples: number;

  constructor(maxSamples: number = 100) {
    this.maxSamples = maxSamples;
  }

  /**
   * Record pool stats snapshot
   */
  record(stats: PoolStats): void {
    this.samples.push({
      ...stats,
    });

    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Get average pool utilization
   */
  getAverageUtilization(): number {
    if (this.samples.length === 0) return 0;

    const totalUtilization = this.samples.reduce((sum, stats) => {
      return sum + (stats.active / stats.total) * 100;
    }, 0);

    return totalUtilization / this.samples.length;
  }

  /**
   * Get peak connection usage
   */
  getPeakUsage(): number {
    if (this.samples.length === 0) return 0;

    return Math.max(...this.samples.map(s => s.active));
  }

  /**
   * Detect if pool is undersized
   */
  isUndersized(): boolean {
    const recentSamples = this.samples.slice(-10);
    if (recentSamples.length === 0) return false;

    // Check if we frequently have waiting connections
    const waitingCount = recentSamples.filter(s => s.waiting > 0).length;
    return waitingCount > recentSamples.length * 0.5; // More than 50% of samples have waiting
  }

  /**
   * Detect if pool is oversized
   */
  isOversized(): boolean {
    const avgUtilization = this.getAverageUtilization();
    return avgUtilization < 20; // Less than 20% utilization
  }
}
