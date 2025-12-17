/**
 * Grammar Service - Database abstraction layer for grammar exercises
 *
 * This service provides a unified interface for grammar exercise operations
 * and automatically switches between Firebase and Turso based on environment.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All database operations are isolated in firebase.ts and turso.ts
 * - Hooks call these functions instead of using database directly
 * - Easy to swap databases by changing USE_TURSO environment variable
 */

// Determine which database to use
const USE_TURSO = process.env.NEXT_PUBLIC_USE_TURSO === 'true';

// Import from the appropriate implementation
const implementation = USE_TURSO
  ? require('./turso')
  : require('./firebase');

// Re-export all functions
export const {
  // Grammar Rules
  getAllGrammarRules,
  getGrammarRulesByLevel,
  getGrammarRule,
  saveGrammarRule,

  // Grammar Sentences
  getSentencesByRule,
  getSentencesByLevel,
  getSentence,
  saveGrammarSentence,

  // Grammar Reviews (Progress)
  getGrammarReviews,
  getSingleGrammarReview,
  getReviewsByRule,
  getDueGrammarSentences,
  saveGrammarReview,
  saveGrammarReviewHistory,
} = implementation;
