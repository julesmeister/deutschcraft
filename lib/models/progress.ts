/**
 * Progress and Vocabulary Models
 * FLAT STRUCTURE - Top-level collections only
 *
 * Collections:
 * - progress/{progressId}
 * - vocabulary/{wordId}
 * - flashcards/{flashcardId}
 */

import { CEFRLevel } from './cefr';

/**
 * Study Progress Model
 * Path: progress/{progressId}
 * Format: PROG_{YYYYMMDD}_{email}
 * Daily/weekly learning statistics
 */
export interface StudyProgress {
  progressId: string;
  userId: string; // Student's email
  date: string; // YYYY-MM-DD format

  // Daily stats
  wordsStudied: number;
  wordsCorrect: number;
  wordsIncorrect: number;
  timeSpent: number; // minutes

  // Practice details
  sessionsCompleted: number;
  cardsReviewed: number;
  sentencesCreated: number;

  createdAt: number;
}

/**
 * Vocabulary Word Model
 * Path: vocabulary/{wordId}
 * Top-level collection (global word bank)
 */
export interface VocabularyWord {
  wordId: string;
  germanWord: string;
  englishTranslation: string;

  partOfSpeech?: string; // noun, verb, adjective, etc.
  gender?: string; // for German nouns: der, die, das
  level: CEFRLevel;

  exampleSentence?: string;
  exampleTranslation?: string;
  audioUrl?: string;

  frequency: number; // How common (1-10)
  tags: string[]; // Categories like 'family', 'food', etc.

  createdAt: number;
}

/**
 * Flashcard Model
 * Path: flashcards/{flashcardId}
 * Individual flashcard for vocabulary practice
 */
export interface Flashcard {
  id: string;
  wordId: string;
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
  type: 'translation' | 'fill-in-blank' | 'multiple-choice';
  level: CEFRLevel;
  createdAt: number;
}

/**
 * Card State Types for SRS
 */
export type CardState = 'new' | 'learning' | 'review' | 'relearning' | 'lapsed';

/**
 * Flashcard Progress Model (Enhanced)
 * Path: flashcard-reviews/{userId}_{wordId}
 * Student's spaced repetition data with advanced tracking
 */
export interface FlashcardProgress {
  // Identity
  flashcardId: string;
  userId: string; // Student's email
  wordId: string; // Reference to vocabulary word
  level?: string; // CEFR level (A1, A2, etc.)

  // Card State (NEW!)
  state: CardState;

  // SRS (Spaced Repetition System) data
  repetitions: number;
  easeFactor: number;
  interval: number; // days until next review
  nextReviewDate: number; // INDEXED for efficient queries

  // Performance
  correctCount: number;
  incorrectCount: number;
  consecutiveCorrect: number; // NEW! Track current streak
  consecutiveIncorrect: number; // NEW! Detect struggling cards
  lastReviewDate?: number | null; // INDEXED for decay calculations
  masteryLevel: number; // 0-100 (with decay)

  // Lapse Detection (NEW!)
  lapseCount: number; // How many times card was forgotten
  lastLapseDate?: number | null;

  // Timestamps
  firstSeenAt?: number; // When card was first encountered (NEW!)
  createdAt: number;
  updatedAt: number;
}

/**
 * Review History Entry (Optional - for detailed analytics)
 * Path: flashcard-review-history/{userId}_{wordId}_{timestamp}
 */
export interface FlashcardReviewHistory {
  userId: string;
  wordId: string;
  flashcardId: string;
  difficulty: 'again' | 'hard' | 'good' | 'easy';
  responseTime?: number; // milliseconds (optional)
  masteryBefore: number;
  masteryAfter: number;
  stateBefore: CardState;
  stateAfter: CardState;
  timestamp: number;
}
