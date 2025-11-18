/**
 * Enhanced SRS (Spaced Repetition System) Algorithm
 *
 * Improvements over basic SuperMemo 2:
 * - Card state management (New, Learning, Review, Relearning, Lapsed)
 * - Mastery decay based on overdue cards
 * - Consecutive failure tracking for struggling cards
 * - Better lapse handling with relearning state
 */

import { FlashcardProgress, CardState } from '../models/progress';

type DifficultyLevel = 'again' | 'hard' | 'good' | 'easy';

/**
 * Calculate mastery decay based on time overdue
 * If a card is overdue, reduce its mastery level
 */
export function calculateMasteryDecay(
  currentMastery: number,
  nextReviewDate: number,
  now: number = Date.now()
): number {
  if (nextReviewDate >= now) {
    // Not overdue, no decay
    return currentMastery;
  }

  const daysOverdue = (now - nextReviewDate) / (24 * 60 * 60 * 1000);

  // Decay formula: lose 2% per day overdue, minimum 0%
  const decayRate = 2; // percent per day
  const decayAmount = Math.min(currentMastery, daysOverdue * decayRate);

  return Math.max(0, currentMastery - decayAmount);
}

/**
 * Determine card state based on performance and history
 */
export function determineCardState(
  currentProgress: FlashcardProgress | null,
  difficulty: DifficultyLevel
): CardState {
  // Brand new card starts in 'new' state
  if (!currentProgress) {
    return 'new';
  }

  const { state, repetitions, lapseCount } = currentProgress;

  // Handle "again" response (forgot the card)
  if (difficulty === 'again') {
    // If card was in review state and forgotten, it's lapsed
    if (state === 'review') {
      return 'lapsed';
    }
    // Otherwise, back to learning/relearning
    return lapseCount > 0 ? 'relearning' : 'learning';
  }

  // Transition from learning -> review
  if ((state === 'learning' || state === 'new') && repetitions >= 2) {
    return 'review';
  }

  // Transition from relearning -> review
  if (state === 'relearning' && repetitions >= 3) {
    return 'review';
  }

  // Transition from lapsed -> relearning
  if (state === 'lapsed') {
    return 'relearning';
  }

  // Otherwise, maintain current state
  return state;
}

/**
 * Enhanced SuperMemo 2 Algorithm with Card States
 * Calculate next review interval, ease factor, and mastery
 */
export function calculateSRSData(
  currentProgress: FlashcardProgress | null,
  difficulty: DifficultyLevel,
  currentLevel?: string
) {
  const now = Date.now();

  // Initialize defaults for new cards
  let repetitions = currentProgress?.repetitions || 0;
  let easeFactor = currentProgress?.easeFactor || 2.5;
  let interval = currentProgress?.interval || 0;
  let consecutiveCorrect = currentProgress?.consecutiveCorrect || 0;
  let consecutiveIncorrect = currentProgress?.consecutiveIncorrect || 0;
  let lapseCount = currentProgress?.lapseCount || 0;
  let lastLapseDate = currentProgress?.lastLapseDate || null;

  // Determine new card state
  const newState = determineCardState(currentProgress, difficulty);

  // Calculate mastery decay if card is overdue
  const currentMastery = currentProgress
    ? calculateMasteryDecay(
        currentProgress.masteryLevel,
        currentProgress.nextReviewDate,
        now
      )
    : 0;

  // Update consecutive counts
  if (difficulty === 'again') {
    consecutiveCorrect = 0;
    consecutiveIncorrect += 1;
    lapseCount += 1;
    lastLapseDate = now;
    repetitions = 0; // Reset for relearning
  } else {
    consecutiveCorrect += 1;
    consecutiveIncorrect = 0;
  }

  // SuperMemo 2 algorithm with state-aware modifications
  switch (difficulty) {
    case 'again':
      // Forgot - Reset to short intervals
      interval = newState === 'lapsed' ? 0.1 : 1; // 2.4 hours or 1 day
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;

    case 'hard':
      // Difficult - Small increase
      repetitions += 1;
      if (newState === 'learning' || newState === 'relearning') {
        interval = Math.max(1, interval * 1.2);
      } else {
        interval = Math.max(1, interval * 1.2);
      }
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      break;

    case 'good':
      // Correct - Normal increase
      repetitions += 1;
      if (newState === 'learning' || newState === 'relearning') {
        // Learning steps: 1 day -> 3 days -> 7 days
        if (repetitions === 1) {
          interval = 1;
        } else if (repetitions === 2) {
          interval = 3;
        } else {
          interval = 7;
        }
      } else {
        // Review state: use ease factor
        interval = Math.max(1, Math.round(interval * easeFactor));
      }
      break;

    case 'easy':
      // Very easy - Large increase
      repetitions += 1;
      if (newState === 'learning' || newState === 'relearning') {
        // Skip learning steps
        interval = repetitions === 1 ? 4 : 10;
      } else {
        interval = Math.max(1, Math.round(interval * easeFactor * 1.3));
      }
      easeFactor = Math.min(2.5, easeFactor + 0.15);
      break;
  }

  // Cap interval at reasonable max (6 months)
  interval = Math.min(interval, 180);

  // Calculate next review date
  const nextReviewDate = now + interval * 24 * 60 * 60 * 1000;

  // Calculate new mastery level (0-100)
  let newMastery = 0;

  if (difficulty === 'again') {
    // Forgotten: drop mastery significantly
    newMastery = Math.max(0, currentMastery - 30);
  } else {
    // Base mastery on repetitions and state
    if (newState === 'learning' || newState === 'new') {
      // Learning: 0% -> 20% -> 40% -> 60%
      newMastery = Math.min(60, repetitions * 20);
    } else if (newState === 'relearning') {
      // Relearning: starts at 20%, max 70%
      newMastery = Math.min(70, 20 + repetitions * 15);
    } else if (newState === 'review') {
      // Review: 60% - 100% based on consecutive correct and ease factor
      const baseReview = 60 + Math.min(25, consecutiveCorrect * 5);
      newMastery = Math.min(100, Math.round(baseReview * (easeFactor / 2.5)));
    }

    // Bonus for difficulty
    if (difficulty === 'easy') {
      newMastery = Math.min(100, newMastery + 5);
    }

    // Ensure it's higher than current (learning increases mastery)
    newMastery = Math.max(currentMastery, newMastery);
  }

  return {
    state: newState,
    repetitions,
    easeFactor,
    interval,
    nextReviewDate,
    masteryLevel: newMastery,
    consecutiveCorrect,
    consecutiveIncorrect,
    lapseCount,
    lastLapseDate,
    level: currentLevel,
  };
}

/**
 * Check if a card is considered "struggling"
 */
export function isStruggling(progress: FlashcardProgress): boolean {
  return (
    // Low mastery
    progress.masteryLevel < 40 ||
    // Recent consecutive failures
    progress.consecutiveIncorrect >= 2 ||
    // High lapse count
    progress.lapseCount >= 3 ||
    // In lapsed or relearning state
    progress.state === 'lapsed' ||
    progress.state === 'relearning'
  );
}

/**
 * Check if a card is due for review
 */
export function isDue(progress: FlashcardProgress, now: number = Date.now()): boolean {
  return progress.nextReviewDate <= now;
}

/**
 * Check if a card is new (never reviewed)
 */
export function isNew(progress: FlashcardProgress | null): boolean {
  return !progress || progress.state === 'new';
}
