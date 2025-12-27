/**
 * Turso Flashcard Service - Progress Module
 * Re-exports read and write operations for flashcard progress
 *
 * Split into:
 * - progressRead.ts (~210 lines) - Read operations
 * - progressWrite.ts (~130 lines) - Write operations
 */

// Re-export read operations
export {
  getFlashcardProgress,
  getSingleFlashcardProgress,
  getStudyProgress,
  getFlashcardProgressByState,
  getDueFlashcards,
  getStrugglingFlashcards,
  getCategoryProgress,
} from './progressRead';

export type { CategoryStats } from './progressRead';

// Re-export write operations
export {
  saveFlashcardProgress,
  saveDailyProgress,
} from './progressWrite';
