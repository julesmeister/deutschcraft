import { CEFRLevel } from './cefr';

/**
 * SavedVocabulary Model
 * Path: saved-vocabulary/{savedVocabId}
 * Document ID Format: {userId}_{wordId}
 *
 * Tracks vocabulary words saved by students from flashcards for later practice.
 * Students need to use each word 5 times in writing exercises to complete the goal.
 */
export interface SavedVocabulary {
  // Identity
  savedVocabId: string;        // Format: {userId}_{wordId}
  userId: string;               // Student's email
  wordId: string;               // Reference to vocabulary word
  flashcardId?: string;         // Optional reference to flashcard

  // Word data (denormalized for quick access and persistence)
  german: string;
  english: string;
  level: CEFRLevel;
  category?: string;
  examples?: string[];

  // Usage tracking
  timesUsed: number;            // Counter: 0-5
  targetUses: number;           // Default: 5 (goal for completion)
  completed: boolean;           // true when timesUsed >= targetUses

  // Timestamps
  savedAt: number;              // When the word was saved
  lastUsedAt?: number;          // Last time word was marked as used
  completedAt?: number;         // When the word reached target uses
  updatedAt: number;            // Last update timestamp
}

/**
 * SavedVocabularyInput
 * Used when creating a new saved vocabulary entry
 */
export interface SavedVocabularyInput {
  wordId: string;
  flashcardId?: string;
  german: string;
  english: string;
  level: CEFRLevel;
  category?: string;
  examples?: string[];
}

/**
 * IncrementResult
 * Result returned after incrementing usage counter
 */
export interface IncrementResult {
  wordId: string;
  completed: boolean;
  timesUsed: number;
}
