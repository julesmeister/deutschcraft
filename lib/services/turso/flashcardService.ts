/**
 * Flashcard Service - Turso Implementation
 * Database abstraction layer for flashcard operations using Turso DB
 *
 * This service has been split into smaller modules to maintain the 300-line guideline:
 * - flashcards/vocabulary.ts - Flashcard and vocabulary word operations
 * - flashcards/progress.ts - Progress tracking and daily progress
 *
 * This file maintains backward compatibility by re-exporting all functions.
 * All imports continue to work as before:
 * import { getFlashcardsByLevel } from '@/lib/services/turso/flashcardService';
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Turso operations are isolated in the flashcards/ modules
 * - Hooks call these functions instead of using Turso directly
 * - Easy to swap database by changing module implementations
 */

// Re-export all functions from the modular flashcards service
export * from './flashcards';
