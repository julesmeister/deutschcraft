/**
 * Turso Flashcard Service - Progress Module
 * Re-exports read and write operations for flashcard progress
 *
 * Split into:
 * - progressRead.ts (~160 lines) - Basic read operations
 * - progressReadAdvanced.ts (~120 lines) - Advanced queries
 * - progressMappers.ts (~60 lines) - Row mapping helpers
 * - progressWrite.ts (~130 lines) - Write operations
 */

// Re-export basic read operations
export {
  getFlashcardProgress,
  getSingleFlashcardProgress,
  getStudyProgress,
  getCategoryProgress,
} from './progressRead';

// Re-export advanced read operations
export {
  getRecentStudyProgress,
  getFlashcardProgressByState,
  getDueFlashcards,
  getStrugglingFlashcards,
} from './progressReadAdvanced';

// Re-export types (getCategoryProgress returns CategoryStats)
export type { CategoryStats } from './progressRead';

// Re-export write operations
export {
  saveFlashcardProgress,
  saveDailyProgress,
} from './progressWrite';
