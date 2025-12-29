/**
 * Smart Mini Exercise Service - Database abstraction layer
 *
 * This service provides a unified interface for smart mini exercise operations
 * and automatically switches between Firebase and Turso based on environment.
 */

// Determine which database to use
const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === 'true';

// Import from the appropriate implementation
const implementation = USE_TURSO
  ? require('./turso')
  : require('./firebase');

// Re-export all functions
export const {
  getSmartMiniExercise,
  recordMiniExerciseAttempt,
  indexSubmissionSentences,
} = implementation;

// Re-export types
export type { MiniExerciseResult } from './turso';
