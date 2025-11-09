/**
 * Cache Statistics Utility
 *
 * View and analyze cache performance
 */

import { globalCache } from '../cache/in-memory-cache';
import { queryCache } from '../cache/query-cache';
import { performanceMonitor } from '../monitoring/performance-monitor';

export interface CombinedStats {
  cache: ReturnType<typeof globalCache.getStats>;
  queryCacheSize: number;
  performance: ReturnType<typeof performanceMonitor.getMetrics>;
  slowQueries: ReturnType<typeof performanceMonitor.getSlowQueries>;
}

/**
 * Get all cache and performance statistics
 */
export function getAllStats(): CombinedStats {
  return {
    cache: globalCache.getStats(),
    queryCacheSize: queryCache.size(),
    performance: performanceMonitor.getMetrics(),
    slowQueries: performanceMonitor.getSlowQueries(5),
  };
}

/**
 * Print formatted statistics to console
 */
export function printStats(): void {
  const stats = getAllStats();

  console.log('\n=== Database Cache & Performance Stats ===\n');

  console.log('📦 In-Memory Cache:');
  console.log(`  Total Size: ${stats.cache.size} entries`);
  console.log(`  Hits: ${stats.cache.hits}`);
  console.log(`  Misses: ${stats.cache.misses}`);
  console.log(`  Hit Rate: ${stats.cache.hitRate.toFixed(2)}%`);
  console.log(`  Sets: ${stats.cache.sets}`);
  console.log(`  Invalidations: ${stats.cache.invalidations}`);

  console.log('\n🔍 Query Cache:');
  console.log(`  Total Size: ${stats.queryCacheSize} entries`);

  console.log('\n⚡ Performance:');
  console.log(`  Total Queries: ${stats.performance.totalQueries}`);
  console.log(`  Average Query Time: ${stats.performance.averageQueryTime.toFixed(2)}ms`);
  console.log(`  Slow Queries: ${stats.performance.slowQueries}`);
  console.log(`  Fastest Query: ${stats.performance.fastestQuery.toFixed(2)}ms`);
  console.log(`  Slowest Query: ${stats.performance.slowestQuery.toFixed(2)}ms`);

  console.log('\n📊 Queries by Collection:');
  Object.entries(stats.performance.queriesByCollection).forEach(([collection, count]) => {
    console.log(`  ${collection}: ${count}`);
  });

  console.log('\n🔧 Queries by Operation:');
  Object.entries(stats.performance.queriesByOperation).forEach(([operation, count]) => {
    console.log(`  ${operation}: ${count}`);
  });

  if (stats.slowQueries.length > 0) {
    console.log('\n🐌 Top 5 Slow Queries:');
    stats.slowQueries.forEach((query, i) => {
      console.log(`  ${i + 1}. ${query.collection}.${query.operation} - ${query.duration.toFixed(2)}ms`);
    });
  }

  console.log('\n==========================================\n');
}

/**
 * Reset all statistics
 */
export function resetAllStats(): void {
  globalCache.resetStats();
  performanceMonitor.reset();
  console.log('✅ All statistics reset');
}

/**
 * Export statistics to JSON
 */
export function exportStats(): string {
  const stats = getAllStats();
  return JSON.stringify(stats, null, 2);
}

/**
 * Check cache health and provide recommendations
 */
export function analyzeCacheHealth(): {
  health: 'good' | 'warning' | 'critical';
  recommendations: string[];
} {
  const stats = getAllStats();
  const recommendations: string[] = [];
  let health: 'good' | 'warning' | 'critical' = 'good';

  // Check hit rate
  if (stats.cache.hitRate < 50) {
    health = 'warning';
    recommendations.push('Low cache hit rate (<50%). Consider increasing cache TTL or cache size.');
  } else if (stats.cache.hitRate < 30) {
    health = 'critical';
    recommendations.push('Very low cache hit rate (<30%). Cache is not effective.');
  }

  // Check slow queries
  const slowQueryRate = (stats.performance.slowQueries / stats.performance.totalQueries) * 100;
  if (slowQueryRate > 20) {
    health = 'warning';
    recommendations.push(`High slow query rate (${slowQueryRate.toFixed(2)}%). Optimize slow queries.`);
  }

  // Check average query time
  if (stats.performance.averageQueryTime > 500) {
    health = 'warning';
    recommendations.push(
      `High average query time (${stats.performance.averageQueryTime.toFixed(2)}ms). Consider adding indexes.`
    );
  }

  // Check cache size
  if (stats.cache.size > 900) {
    recommendations.push('Cache is nearly full. Consider increasing max cache size.');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Cache and performance metrics look healthy!');
  }

  return { health, recommendations };
}
