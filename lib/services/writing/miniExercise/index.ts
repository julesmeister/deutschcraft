/**
 * Mini Exercise Service - Database abstraction layer
 *
 * This service provides a unified interface for mini exercise operations
 * and automatically switches between Firebase and Turso based on environment.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 */

// Determine which database to use
const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === 'true';

// Import from the appropriate implementation
const implementation = USE_TURSO
  ? require('./turso')
  : require('./firebase');

// Re-export all functions
export const {
  getRandomMiniExercise,
} = implementation;

// Re-export types
export type { MiniExerciseData } from './firebase';
