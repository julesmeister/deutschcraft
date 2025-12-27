/**
 * Turso Flashcards Service Module - Main Entry Point
 *
 * This file re-exports all flashcard-related services from their respective modules.
 * The service has been split into smaller files to maintain the 300-line guideline:
 *
 * - vocabulary.ts (~110 lines) - Flashcard and vocabulary word operations
 * - progress.ts (~320 lines) - Progress tracking and daily progress
 *
 * Total: ~430 lines split into 2 focused modules (each under or near 300 lines)
 *
 * This index maintains backward compatibility - all imports continue to work:
 * import { getFlashcardsByLevel, saveFlashcardProgress } from '@/lib/services/turso/flashcardService';
 */

// ============================================================================
// RE-EXPORTS - Vocabulary Operations
// ============================================================================

export {
  getFlashcardsByLevel,
  getVocabularyWord,
  getVocabularyByLevel,
} from './vocabulary';

// ============================================================================
// RE-EXPORTS - Progress Operations
// ============================================================================

export {
  getFlashcardProgress,
  getSingleFlashcardProgress,
  getStudyProgress,
  getRecentStudyProgress,
  getFlashcardProgressByState,
  getDueFlashcards,
  getStrugglingFlashcards,
  getCategoryProgress,
  saveFlashcardProgress,
  saveDailyProgress,
} from './progress';

export type { CategoryStats } from './progressRead';
