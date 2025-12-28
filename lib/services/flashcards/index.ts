/**
 * Flashcards Service Module - Switcher
 * Automatically switches between Firebase and Turso implementations
 */

import * as firebaseImpl from './firebase';
import * as tursoImpl from '../turso/flashcards';

const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === 'true';

const implementation = USE_TURSO ? tursoImpl : firebaseImpl;

export const {
  // Vocabulary
  getFlashcardsByLevel,
  getVocabularyWord,
  getVocabularyByLevel,

  // Progress
  getFlashcardProgress,
  getSingleFlashcardProgress,
  getStudyProgress,
  getFlashcardProgressByState,
  getDueFlashcards,
  getStrugglingFlashcards,
  getCategoryProgress,
  saveFlashcardProgress,
  saveDailyProgress,

  // Stats
  getPracticeStats,
  getStudyStats,
} = implementation;

// Saved Vocabulary (already handled in its own module which might be switched)
export {
  getSavedVocabulary,
  getSavedVocabularyEntry,
  isWordSaved,
  detectSavedWordsInText,
  saveVocabularyForLater,
  incrementVocabularyUsage,
  bulkIncrementVocabularyUsage,
  removeSavedVocabulary,
} from './savedVocabulary/index';
