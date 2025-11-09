/**
 * Database Abstraction Layer - Main Entry Point
 *
 * This is the main export file for the database abstraction layer.
 * Import database functionality from here in your application code.
 *
 * Example usage:
 *
 * ```typescript
 * import { db } from '@/lib/database';
 *
 * // Fetch a user
 * const user = await db.users.findByEmail('user@example.com');
 *
 * // Create a student
 * const student = await db.students.create({
 *   userId: user.id,
 *   targetLanguage: 'German',
 *   wordsLearned: 0,
 *   // ... other fields
 * });
 *
 * // Query students for a teacher
 * const { data: students } = await db.students.findByTeacherId('teacher123', {
 *   limit: 20,
 *   orderBy: [{ field: 'lastActiveDate', direction: 'desc' }]
 * });
 * ```
 */

// Core exports
export { getDatabaseProvider, resetDatabaseProvider, createDatabaseProvider } from './factory';
export * from './types';

// Cache exports (commented out temporarily due to TS compatibility issues)
// export * from './cache';

// Monitoring exports (commented out temporarily)
// export * from './monitoring';

// Optimization exports (commented out temporarily)
// export * from './optimization';

// Utility exports (commented out temporarily)
// export * from './utils/cache-stats';

// Export a convenient singleton instance
import { getDatabaseProvider } from './factory';

/**
 * Default database instance
 * This is a singleton that can be imported throughout your application
 * Includes automatic caching and performance monitoring
 */
export const db = getDatabaseProvider();
