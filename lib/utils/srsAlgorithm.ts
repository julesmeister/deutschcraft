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

type DifficultyLevel = 'again' | 'hard' | 'good' | 'easy' | 'expert';

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

    case 'expert':
      // Mastered - Very long interval, maximum ease
      repetitions += 1;
      // Set to maximum ease factor for this card
      easeFactor = 2.5;
      // Calculate a very long interval (at least 1 year)
      if (newState === 'learning' || newState === 'relearning') {
        // Skip directly to long interval
        interval = 365;
      } else {
        // Multiply current interval by 3x, minimum 1 year
        interval = Math.max(365, Math.round(interval * easeFactor * 3));
      }
      break;
  }

  // Cap interval at reasonable max (6 months for non-expert, 2 years for expert)
  const maxInterval = difficulty === 'expert' ? 730 : 180;
  interval = Math.min(interval, maxInterval);

  // Calculate next review date
  const nextReviewDate = now + interval * 24 * 60 * 60 * 1000;

  // Log SRS calculation for debugging
  if (process.env.NODE_ENV === 'development') {
    const daysUntilReview = Math.round(interval);
    console.log(`📅 [SRS] Difficulty: ${difficulty} | Interval: ${daysUntilReview} days | State: ${newState} | Next: ${new Date(nextReviewDate).toLocaleDateString()}`);
  }

  // Calculate new mastery level (0-100)
  let newMastery = 0;

  if (difficulty === 'again') {
    // Forgotten: drop mastery significantly
    newMastery = Math.max(0, currentMastery - 30);
  } else if (difficulty === 'expert') {
    // Expert: Set to 100% mastery - card is fully mastered
    newMastery = 100;
  } else {
    // Base mastery on repetitions and state
    // Use UPDATED repetitions count for accurate mastery calculation
    if (newState === 'learning' || newState === 'new') {
      // Learning: First correct = 20%, Second = 40%, Third = 60%
      // Use the incremental progression based on how many times they got it right
      const masteryFromReps = Math.min(60, repetitions * 20);
      newMastery = Math.max(currentMastery, masteryFromReps);
    } else if (newState === 'relearning') {
      // Relearning: Progressive increase with each correct answer
      const masteryFromReps = Math.min(70, 20 + repetitions * 15);
      newMastery = Math.max(currentMastery, masteryFromReps);
    } else if (newState === 'review') {
      // Review: 60% - 100% based on consecutive correct and ease factor
      // Start at 60%, add 5% per consecutive correct (max +25%)
      const consecutiveBonus = Math.min(25, consecutiveCorrect * 5);
      const baseReview = 60 + consecutiveBonus;
      // Apply ease factor multiplier
      const easeMultiplier = easeFactor / 2.5;
      newMastery = Math.min(100, Math.round(baseReview * easeMultiplier));

      // Always ensure mastery increases in review state
      newMastery = Math.max(currentMastery + 2, newMastery);
    }

    // Bonus for difficulty
    if (difficulty === 'easy') {
      newMastery = Math.min(100, newMastery + 5);
    } else if (difficulty === 'good') {
      newMastery = Math.min(100, newMastery + 2);
    }
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
