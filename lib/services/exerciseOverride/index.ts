/**
 * Exercise Override Service - Database abstraction layer
 *
 * This service provides a unified interface for exercise override operations
 * and automatically switches between Firebase and Turso based on environment.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All database operations are isolated in firebase.ts and turso.ts
 * - Hooks call these functions instead of using database directly
 * - Easy to swap databases by changing USE_TURSO environment variable
 */

// Determine which database to use
const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === 'true';

// Import from the appropriate implementation
const implementation = USE_TURSO
  ? require('./turso')
  : require('./firebase');

// Re-export all functions
export const {
  createExerciseOverride,
  getExerciseOverride,
  getTeacherOverrides,
  updateExerciseOverride,
  bulkUpdateDisplayOrder,
  deleteExerciseOverride,
} = implementation;
