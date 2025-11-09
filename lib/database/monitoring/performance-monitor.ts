/**
 * Performance Monitoring for Database Operations
 *
 * Tracks query performance, slow queries, and provides metrics
 */

interface QueryMetric {
  operation: string;
  collection: string;
  duration: number;
  timestamp: number;
  params?: any;
}

interface PerformanceMetrics {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: number;
  fastestQuery: number;
  slowestQuery: number;
  queriesByCollection: Record<string, number>;
  queriesByOperation: Record<string, number>;
}

export class PerformanceMonitor {
  private metrics: QueryMetric[] = [];
  private slowQueryThreshold: number;
  private maxMetrics: number;

  constructor(slowQueryThreshold: number = 1000, maxMetrics: number = 1000) {
    this.slowQueryThreshold = slowQueryThreshold;
    this.maxMetrics = maxMetrics;
  }

  /**
   * Start tracking a database operation
   */
  startOperation(collection: string, operation: string, params?: any): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      this.recordMetric({
        operation,
        collection,
        duration,
        timestamp: Date.now(),
        params,
      });

      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        console.warn(
          `[Performance] Slow query detected: ${collection}.${operation} took ${duration.toFixed(2)}ms`,
          params
        );
      }
    };
  }

  /**
   * Record a query metric
   */
  private recordMetric(metric: QueryMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        fastestQuery: 0,
        slowestQuery: 0,
        queriesByCollection: {},
        queriesByOperation: {},
      };
    }

    const durations = this.metrics.map(m => m.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);

    const queriesByCollection: Record<string, number> = {};
    const queriesByOperation: Record<string, number> = {};

    this.metrics.forEach(metric => {
      queriesByCollection[metric.collection] = (queriesByCollection[metric.collection] || 0) + 1;
      queriesByOperation[metric.operation] = (queriesByOperation[metric.operation] || 0) + 1;
    });

    return {
      totalQueries: this.metrics.length,
      averageQueryTime: totalDuration / this.metrics.length,
      slowQueries: this.metrics.filter(m => m.duration > this.slowQueryThreshold).length,
      fastestQuery: Math.min(...durations),
      slowestQuery: Math.max(...durations),
      queriesByCollection,
      queriesByOperation,
    };
  }

  /**
   * Get slow queries
   */
  getSlowQueries(limit: number = 10): QueryMetric[] {
    return this.metrics
      .filter(m => m.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get recent queries
   */
  getRecentQueries(limit: number = 20): QueryMetric[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  export(): QueryMetric[] {
    return [...this.metrics];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor(1000, 1000);
