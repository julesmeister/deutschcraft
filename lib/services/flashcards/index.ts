/**
 * Flashcards Service Module - Main Entry Point
 *
 * This file re-exports all flashcard-related services from their respective modules.
 * The service has been split into smaller files to maintain the 300-line guideline:
 *
 * - vocabulary.ts (95 lines) - Flashcard and vocabulary word operations
 * - progress.ts (203 lines) - Progress tracking and daily progress
 * - stats.ts (134 lines) - Practice and study statistics
 *
 * Total: 432 lines split into 3 focused modules (each under 300 lines)
 *
 * This index maintains backward compatibility - all imports continue to work:
 * import { getFlashcardsByLevel, saveFlashcardProgress } from '@/lib/services/flashcardService';
 * import { getFlashcardsByLevel, saveFlashcardProgress } from '@/lib/services';
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
  getFlashcardProgressByState,
  getDueFlashcards,
  getStrugglingFlashcards,
  saveFlashcardProgress,
  saveDailyProgress,
} from './progress';

// ============================================================================
// RE-EXPORTS - Statistics Operations
// ============================================================================

export {
  getPracticeStats,
  getStudyStats,
} from './stats';

// ============================================================================
// RE-EXPORTS - Saved Vocabulary Operations
// ============================================================================

export {
  getSavedVocabulary,
  getSavedVocabularyEntry,
  isWordSaved,
  detectSavedWordsInText,
  saveVocabularyForLater,
  incrementVocabularyUsage,
  bulkIncrementVocabularyUsage,
  removeSavedVocabulary,
} from './savedVocabulary';
