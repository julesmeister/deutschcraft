/**
 * Grammar Exercise Models
 * FLAT STRUCTURE - Top-level collections only
 *
 * Collections:
 * - grammar-rules/{ruleId}
 * - grammar-sentences/{sentenceId}
 * - grammar-reviews/{userId}_{sentenceId}
 */

import { CEFRLevel } from './cefr';

/**
 * Grammar Rule Model
 * Path: grammar-rules/{ruleId}
 * Grammar rules/topics (e.g., "Nominative Case", "Dative Prepositions")
 */
export interface GrammarRule {
  ruleId: string;
  title: string;
  description: string;
  level: CEFRLevel;
  category: string; // e.g., "Cases", "Prepositions", "Verb Conjugation"
  examples?: string[]; // Example sentences in German
  explanation?: string; // Detailed explanation
  order?: number; // Display order
  createdAt: number;
  updatedAt: number;
}

/**
 * Grammar Sentence Model
 * Path: grammar-sentences/{sentenceId}
 * Practice sentences for grammar rules
 */
export interface GrammarSentence {
  sentenceId: string;
  ruleId: string; // Reference to grammar rule
  english: string; // English prompt
  german: string; // Correct German answer
  level: CEFRLevel;

  // Optional hints and metadata
  hints?: string[]; // Optional hints for students
  keywords?: string[]; // Key vocabulary in the sentence
  difficulty?: number; // 1-10 scale

  createdAt: number;
  updatedAt: number;
}

/**
 * Difficulty Rating Type
 * Same as flashcards for consistency
 */
export type DifficultyRating = 'again' | 'hard' | 'good' | 'easy' | 'expert';

/**
 * Grammar Review Model
 * Path: grammar-reviews/{userId}_{sentenceId}
 * Student's practice progress for grammar sentences
 */
export interface GrammarReview {
  reviewId: string; // Format: {userId}_{sentenceId}
  userId: string; // Student's email
  sentenceId: string; // Reference to grammar sentence
  ruleId: string; // Reference to grammar rule
  level: CEFRLevel;

  // SRS (Spaced Repetition System) data
  repetitions: number;
  easeFactor: number;
  interval: number; // days until next review
  nextReviewDate: number;

  // Performance tracking
  correctCount: number;
  incorrectCount: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  lastReviewDate?: number | null;
  masteryLevel: number; // 0-100

  // Last attempt details
  lastAttempt?: {
    userAnswer: string;
    correctAnswer: string;
    difficulty: DifficultyRating;
    timestamp: number;
  };

  // Timestamps
  firstSeenAt: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Grammar Review History Entry (for detailed analytics)
 * Path: grammar-review-history/{userId}_{sentenceId}_{timestamp}
 */
export interface GrammarReviewHistory {
  historyId: string;
  userId: string;
  sentenceId: string;
  ruleId: string;

  // Review details
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  difficulty: DifficultyRating;

  // SRS state changes
  masteryBefore: number;
  masteryAfter: number;
  intervalBefore: number;
  intervalAfter: number;

  // Metadata
  responseTime?: number; // milliseconds
  timestamp: number;
}

/**
 * Grammar Progress Summary
 * Aggregated stats for a user's grammar practice
 */
export interface GrammarProgressSummary {
  userId: string;
  level: CEFRLevel;

  // Overall stats
  totalRulesStudied: number;
  totalSentencesPracticed: number;
  totalReviews: number;

  // Performance metrics
  averageMastery: number;
  correctPercentage: number;
  currentStreak: number;
  longestStreak: number;

  // Time tracking
  totalTimeSpent: number; // minutes
  lastPracticeDate?: number;

  // Per-rule breakdown
  ruleProgress: {
    ruleId: string;
    sentencesCompleted: number;
    sentencesTotal: number;
    averageMastery: number;
  }[];
}
