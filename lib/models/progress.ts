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
 * Flashcard Progress Model
 * Path: flashcard-progress/{progressId}
 * Student's spaced repetition data
 */
export interface FlashcardProgress {
  flashcardId: string;
  userId: string; // Student's email
  wordId: string; // Reference to vocabulary word

  // SRS (Spaced Repetition System) data
  repetitions: number;
  easeFactor: number;
  interval: number; // days until next review
  nextReviewDate: number;

  // Performance
  correctCount: number;
  incorrectCount: number;
  lastReviewDate?: number | null;
  masteryLevel: number; // 0-100

  createdAt: number;
  updatedAt: number;
}
