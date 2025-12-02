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
    const flashcard = levelFlashcards.find((card: any) => card.id === review.wordId || card.id === review.flashcardId);
    if (flashcard) {
      const categoryId = flashcard.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      attemptedCategories.add(categoryId);
      categoryAttemptCounts.set(categoryId, (categoryAttemptCounts.get(categoryId) || 0) + 1);
    }
  });

  // Determine completion status for each category
  const categoryCompletionStatus = new Map<string, CompletionStatus>();
  attemptedCategories.forEach(categoryId => {
    const attempted = categoryAttemptCounts.get(categoryId) || 0;
    const total = categoryTotalCounts.get(categoryId) || 0;

    if (attempted >= total) {
      categoryCompletionStatus.set(categoryId, 'completed');
    } else if (attempted > 0) {
      categoryCompletionStatus.set(categoryId, 'in-progress');
    }
  });

  return {
    attemptedCategories,
    categoryAttemptCounts,
    categoryTotalCounts,
    categoryCompletionStatus,
  };
}
