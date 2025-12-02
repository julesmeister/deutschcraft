/**
 * Flashcard Selection Utility
 * Handles SRS-based card filtering and selection with strict interval enforcement
 */

import { FlashcardReview } from '@/lib/models/progress';

export interface FlashcardSelectionResult {
  cards: any[];
  nextDueInfo?: {
    count: number;
    nextDueDate: number;
  };
  upcomingCards: any[];
}

export interface FlashcardSettings {
  randomizeOrder: boolean;
  cardsPerSession: number;
}

/**
 * Apply flashcard settings to flashcard array with STRICT SRS enforcement
 * Only shows cards that are due NOW or are brand new (never seen)
 */
export function applyFlashcardSettings(
  flashcards: any[],
  flashcardReviews: FlashcardReview[],
  settings: FlashcardSettings
): FlashcardSelectionResult {
  const now = Date.now();

  // 1. STRICTLY FILTER TO ONLY DUE CARDS
  // Only include: new cards (never seen) OR cards with nextReviewDate <= now
  const dueCards = flashcards.filter(card => {
    const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);

    // New cards (never seen) are always included
    if (!progress) {
      console.log('[FlashcardSelection] ✅ Including NEW card:', {
        id: card.id,
        german: card.german,
        reason: 'Never seen before',
      });
      return true;
    }

    // Only include cards that are actually due for review RIGHT NOW
    const isDue = (progress.nextReviewDate || 0) <= now;

    if (isDue) {
      console.log('[FlashcardSelection] ✅ Including DUE card:', {
        id: card.id,
        german: card.german,
        nextReviewDate: new Date(progress.nextReviewDate || 0).toISOString(),
        wasOverdueBy: (now - (progress.nextReviewDate || 0)) / (1000 * 60 * 60) + ' hours',
      });
    } else {
      console.log('[FlashcardSelection] ❌ Skipping card NOT due yet:', {
        id: card.id,
        german: card.german,
        nextReviewDate: new Date(progress.nextReviewDate || 0).toISOString(),
        hoursUntilDue: ((progress.nextReviewDate || 0) - now) / (1000 * 60 * 60),
      });
    }

    return isDue;
  });

  // Calculate next due info for cards not yet due
  const notDueCards = flashcards.filter(card => {
    const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);
    return progress && (progress.nextReviewDate || 0) > now;
  }).sort((a, b) => {
    const progressA = flashcardReviews.find(r => r.flashcardId === a.id || r.wordId === a.id);
    const progressB = flashcardReviews.find(r => r.flashcardId === b.id || r.wordId === b.id);
    return (progressA?.nextReviewDate || 0) - (progressB?.nextReviewDate || 0);
  }).map(card => {
    // Add the nextReviewDate to each card for display
    const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);
    return {
      ...card,
      nextReviewDate: progress?.nextReviewDate || Date.now(),
    };
  });

  const nextDueInfo = notDueCards.length > 0
    ? {
        count: notDueCards.length,
        nextDueDate: flashcardReviews.find(r => r.flashcardId === notDueCards[0].id || r.wordId === notDueCards[0].id)?.nextReviewDate || Date.now(),
      }
    : undefined;

  // 2. PRIORITY SORTING within due cards
  let processedCards = dueCards.sort((a, b) => {
    const progressA = flashcardReviews.find(r => r.flashcardId === a.id || r.wordId === a.id);
    const progressB = flashcardReviews.find(r => r.flashcardId === b.id || r.wordId === b.id);

    // New cards first
    if (!progressA && progressB) return -1;
    if (progressA && !progressB) return 1;
    if (!progressA && !progressB) return 0;

    // Among due cards, prioritize by next review date (earlier = higher priority)
    return (progressA.nextReviewDate || 0) - (progressB.nextReviewDate || 0);
  });

  // 3. APPLY RANDOMIZATION (only among due cards)
  if (settings.randomizeOrder) {
    // Separate new cards from due review cards
    const newCards = processedCards.filter(card => {
      const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);
      return !progress;
    });
    const dueReviewCards = processedCards.filter(card => {
      const progress = flashcardReviews.find(r => r.flashcardId === card.id || r.wordId === card.id);
      return progress;
    });

    // Randomize each group separately
    processedCards = [
      ...newCards.sort(() => Math.random() - 0.5),
      ...dueReviewCards.sort(() => Math.random() - 0.5),
    ];
  }

  // 4. APPLY SESSION LIMIT
  const cardsPerSession = settings.cardsPerSession !== -1 && settings.cardsPerSession > 0
    ? settings.cardsPerSession
    : 20; // Default to 20 if unlimited

  const finalCards = processedCards.slice(0, cardsPerSession);

  console.log('[FlashcardSelection] STRICT SRS Selection:', {
    totalAvailable: flashcards.length,
    dueForReview: dueCards.length,
    newCards: dueCards.filter(c => !flashcardReviews.find(r => r.flashcardId === c.id || r.wordId === c.id)).length,
    reviewCards: dueCards.filter(c => flashcardReviews.find(r => r.flashcardId === c.id || r.wordId === c.id)).length,
    selectedForSession: finalCards.length,
    notDueCards: flashcards.length - dueCards.length,
    nextDueInfo,
  });

  // If no due cards, show detailed breakdown
  if (finalCards.length === 0 && flashcards.length > 0) {
    console.log('[FlashcardSelection] ✅ No cards due for review! Breakdown:', {
      totalCards: flashcards.length,
      cardsWithProgress: flashcards.filter(c => flashcardReviews.find(r => r.flashcardId === c.id || r.wordId === c.id)).length,
      newCards: flashcards.filter(c => !flashcardReviews.find(r => r.flashcardId === c.id || r.wordId === c.id)).length,
      futureReviews: notDueCards.length,
      sampleFutureCard: notDueCards[0] ? {
        german: notDueCards[0].german,
        nextReview: new Date(flashcardReviews.find(r => r.flashcardId === notDueCards[0].id || r.wordId === notDueCards[0].id)?.nextReviewDate || 0).toISOString(),
      } : null,
    });
  }

  return {
    cards: finalCards,
    nextDueInfo,
    upcomingCards: notDueCards.slice(0, 15), // Return up to 15 upcoming cards for display
  };
}
