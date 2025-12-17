/**
 * Category Progress Tracking Utility
 * Calculates completion status for vocabulary categories
 */

import { FlashcardReview } from '@/lib/models/progress';

export type CompletionStatus = 'completed' | 'in-progress' | 'not-started';

export interface CategoryProgressData {
  attemptedCategories: Set<string>;
  categoryAttemptCounts: Map<string, number>;
  categoryTotalCounts: Map<string, number>;
  categoryCompletionStatus: Map<string, CompletionStatus>;
}

/**
 * Calculate category progress based on flashcard reviews
 * Returns completion status, attempt counts, and total counts for each category
 */
export function calculateCategoryProgress(
  levelFlashcards: any[],
  flashcardReviews: FlashcardReview[]
): CategoryProgressData {
  const attemptedCategories = new Set<string>();
  const categoryAttemptCounts = new Map<string, number>();
  const categoryTotalCounts = new Map<string, number>();

  // Count total cards per category
  levelFlashcards.forEach((card: any) => {
    const categoryId = card.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    categoryTotalCounts.set(categoryId, (categoryTotalCounts.get(categoryId) || 0) + 1);
  });

  // Count attempted cards per category
  flashcardReviews.forEach(review => {
    // Remove -dupN suffix from review IDs if present
    const cleanWordId = review.wordId?.replace(/-dup\d+$/, '');
    const cleanFlashcardId = review.flashcardId?.replace(/-dup\d+$/, '');

    // Try multiple ID matching strategies
    const flashcard = levelFlashcards.find((card: any) =>
      // Exact match
      card.id === review.wordId ||
      card.id === review.flashcardId ||
      // String conversion
      review.wordId?.toString() === card.id?.toString() ||
      review.flashcardId?.toString() === card.id?.toString() ||
      // Match with cleaned IDs (without -dupN suffix)
      card.id === cleanWordId ||
      card.id === cleanFlashcardId
    );

    if (flashcard) {
      const categoryId = flashcard.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      attemptedCategories.add(categoryId);
      categoryAttemptCounts.set(categoryId, (categoryAttemptCounts.get(categoryId) || 0) + 1);
    }
  });

  // Determine completion status for each category
  const categoryCompletionStatus = new Map<string, CompletionStatus>();
  categoryTotalCounts.forEach((total, categoryId) => {
    const attempted = categoryAttemptCounts.get(categoryId) || 0;

    let status: CompletionStatus;
    if (attempted >= total && total > 0) {
      status = 'completed';
    } else if (attempted > 0) {
      status = 'in-progress';
    } else {
      status = 'not-started';
    }

    categoryCompletionStatus.set(categoryId, status);
  });

  return {
    attemptedCategories,
    categoryAttemptCounts,
    categoryTotalCounts,
    categoryCompletionStatus,
  };
}
