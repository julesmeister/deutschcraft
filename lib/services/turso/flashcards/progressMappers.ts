/**
 * Turso Flashcard Service - Progress Mappers
 * Helper functions to map database rows to domain models
 */

import { FlashcardProgress, StudyProgress } from "@/lib/models";

/**
 * Map database row to FlashcardProgress model
 * Handles legacy FLASH_ prefix cleanup
 */
export function rowToFlashcardProgress(row: any): FlashcardProgress {
  // Strip FLASH_ prefix if present to match domain model IDs
  const rawId = row.flashcard_id as string;
  const flashcardId = rawId.startsWith("FLASH_")
    ? rawId.replace("FLASH_", "")
    : rawId;

  return {
    flashcardId,
    userId: row.user_id as string,
    wordId: row.word_id as string,
    level: row.level as string | undefined,
    state: row.state as "new" | "learning" | "review" | "relearning" | "lapsed",
    repetitions: row.repetitions as number,
    easeFactor: row.ease_factor as number,
    interval: row.interval as number,
    nextReviewDate: row.next_review_date as number,
    correctCount: row.correct_count as number,
    incorrectCount: row.incorrect_count as number,
    consecutiveCorrect: row.consecutive_correct as number,
    consecutiveIncorrect: row.consecutive_incorrect as number,
    lastReviewDate: row.last_review_date as number | null | undefined,
    masteryLevel: row.mastery_level as number,
    lapseCount: row.lapse_count as number,
    lastLapseDate: row.last_lapse_date as number | null | undefined,
    firstSeenAt: row.first_seen_at as number | undefined,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

/**
 * Map database row to StudyProgress model
 */
export function rowToStudyProgress(row: any): StudyProgress {
  return {
    progressId: row.progress_id as string,
    userId: row.user_id as string,
    date: row.date as string,
    wordsStudied: row.words_studied as number,
    wordsCorrect: row.words_correct as number,
    wordsIncorrect: row.words_incorrect as number,
    timeSpent: row.time_spent as number,
    sessionsCompleted: row.sessions_completed as number,
    cardsReviewed: row.cards_reviewed as number,
    sentencesCreated: row.sentences_created as number,
    createdAt: row.created_at as number,
  };
}
