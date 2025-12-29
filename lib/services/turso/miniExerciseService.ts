/**
 * Mini Exercise Service - Turso Implementation
 * Handles sentence-level practice tracking from corrected writing submissions
 */

import { db } from "@/turso/client";
import {
  MiniExerciseSentence,
  MiniExerciseAttempt,
  MiniExerciseProgress,
} from "@/lib/models/miniExercise";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToSentence(row: any): MiniExerciseSentence {
  return {
    sentenceId: row.sentence_id as string,
    submissionId: row.submission_id as string,
    userId: row.user_id as string,
    sentence: row.sentence as string,
    originalSentence: row.original_sentence as string,
    sentenceIndex: row.sentence_index as number,
    exerciseId: row.exercise_id as string,
    exerciseType: row.exercise_type as string,
    exerciseTitle: row.exercise_title as string | undefined,
    sourceType: row.source_type as "ai" | "teacher" | "reference",
    submittedAt: row.submitted_at as number,
    timesShown: row.times_shown as number,
    timesCompleted: row.times_completed as number,
    totalCorrectAnswers: row.total_correct_answers as number,
    totalBlanks: row.total_blanks as number,
    totalPoints: row.total_points as number,
    lastShownAt: row.last_shown_at as number | undefined,
    lastCompletedAt: row.last_completed_at as number | undefined,
    averageAccuracy: row.average_accuracy as number,
    consecutiveCorrect: row.consecutive_correct as number,
    needsReview: Boolean(row.needs_review),
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

function rowToAttempt(row: any): MiniExerciseAttempt {
  return {
    attemptId: row.attempt_id as string,
    sentenceId: row.sentence_id as string,
    userId: row.user_id as string,
    answers: JSON.parse(row.answers as string),
    correctAnswers: row.correct_answers as number,
    totalBlanks: row.total_blanks as number,
    points: row.points as number,
    accuracy: row.accuracy as number,
    completedAt: row.completed_at as number,
    createdAt: row.created_at as number,
  };
}

function rowToProgress(row: any): MiniExerciseProgress {
  return {
    userId: row.user_id as string,
    totalSentencesPracticed: row.total_sentences_practiced as number,
    totalAttempts: row.total_attempts as number,
    totalPoints: row.total_points as number,
    averageAccuracy: row.average_accuracy as number,
    currentStreak: row.current_streak as number,
    lastPracticeDate: row.last_practice_date as number,
    practiceGoal: row.practice_goal as number,
    todayProgress: row.today_progress as number,
    sentencesDueForReview: row.sentences_due_for_review as number,
    sentencesMastered: row.sentences_mastered as number,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

// ============================================================================
// SENTENCE OPERATIONS
// ============================================================================

export async function createSentence(
  sentence: Omit<
    MiniExerciseSentence,
    | "timesShown"
    | "timesCompleted"
    | "totalCorrectAnswers"
    | "totalBlanks"
    | "totalPoints"
    | "averageAccuracy"
    | "consecutiveCorrect"
    | "needsReview"
    | "createdAt"
    | "updatedAt"
  >
): Promise<MiniExerciseSentence> {
  try {
    const now = Date.now();
    await db.execute({
      sql: `INSERT INTO mini_exercise_sentences (
              sentence_id, submission_id, user_id, sentence, original_sentence,
              sentence_index, exercise_id, exercise_type, exercise_title,
              source_type, submitted_at, times_shown, times_completed,
              total_correct_answers, total_blanks, total_points,
              average_accuracy, consecutive_correct, needs_review,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        sentence.sentenceId,
        sentence.submissionId,
        sentence.userId,
        sentence.sentence,
        sentence.originalSentence,
        sentence.sentenceIndex,
        sentence.exerciseId,
        sentence.exerciseType,
        sentence.exerciseTitle || null,
        sentence.sourceType,
        sentence.submittedAt,
        0, // times_shown
        0, // times_completed
        0, // total_correct_answers
        0, // total_blanks
        0, // total_points
        0, // average_accuracy
        0, // consecutive_correct
        0, // needs_review
        now,
        now,
      ],
    });

    const result = await db.execute({
      sql: "SELECT * FROM mini_exercise_sentences WHERE sentence_id = ?",
      args: [sentence.sentenceId],
    });

    return rowToSentence(result.rows[0]);
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error creating sentence:",
      error
    );
    throw error;
  }
}

export async function getSentence(
  sentenceId: string
): Promise<MiniExerciseSentence | null> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM mini_exercise_sentences WHERE sentence_id = ?",
      args: [sentenceId],
    });

    if (result.rows.length === 0) return null;
    return rowToSentence(result.rows[0]);
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error fetching sentence:",
      error
    );
    throw error;
  }
}

export async function getUserSentences(
  userId: string,
  filters?: {
    needsReview?: boolean;
    limit?: number;
  }
): Promise<MiniExerciseSentence[]> {
  try {
    let sql = "SELECT * FROM mini_exercise_sentences WHERE user_id = ?";
    const args: any[] = [userId];

    if (filters?.needsReview !== undefined) {
      sql += " AND needs_review = ?";
      args.push(filters.needsReview ? 1 : 0);
    }

    sql += " ORDER BY last_shown_at ASC NULLS FIRST";

    if (filters?.limit) {
      sql += " LIMIT ?";
      args.push(filters.limit);
    }

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToSentence);
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error fetching user sentences:",
      error
    );
    throw error;
  }
}

export async function getSentencesForReview(
  userId: string,
  limit: number = 10
): Promise<MiniExerciseSentence[]> {
  return getUserSentences(userId, { needsReview: true, limit });
}

export async function updateSentenceStats(
  sentenceId: string,
  stats: {
    wasShown?: boolean;
    correctAnswers?: number;
    totalBlanks?: number;
    points?: number;
    wasPerfect?: boolean;
  }
): Promise<void> {
  try {
    // Get current sentence
    const sentence = await getSentence(sentenceId);
    if (!sentence) throw new Error("Sentence not found");

    const now = Date.now();
    const setClauses: string[] = [];
    const args: any[] = [];

    if (stats.wasShown) {
      setClauses.push("times_shown = times_shown + 1");
      setClauses.push("last_shown_at = ?");
      args.push(now);
    }

    if (stats.correctAnswers !== undefined && stats.totalBlanks !== undefined) {
      // Increment completion counter
      setClauses.push("times_completed = times_completed + 1");
      setClauses.push("last_completed_at = ?");
      args.push(now);

      // Update totals
      setClauses.push("total_correct_answers = total_correct_answers + ?");
      args.push(stats.correctAnswers);
      setClauses.push("total_blanks = total_blanks + ?");
      args.push(stats.totalBlanks);

      if (stats.points !== undefined) {
        setClauses.push("total_points = total_points + ?");
        args.push(stats.points);
      }

      // Calculate new average accuracy
      const newTotalCorrect =
        sentence.totalCorrectAnswers + stats.correctAnswers;
      const newTotalBlanks = sentence.totalBlanks + stats.totalBlanks;
      const newAccuracy =
        newTotalBlanks > 0 ? (newTotalCorrect / newTotalBlanks) * 100 : 0;
      setClauses.push("average_accuracy = ?");
      args.push(newAccuracy);

      // Update consecutive correct streak
      if (stats.wasPerfect) {
        setClauses.push("consecutive_correct = consecutive_correct + 1");
        // Mark as mastered if 3+ perfect attempts
        if (sentence.consecutiveCorrect + 1 >= 3) {
          setClauses.push("needs_review = 0");
        }
      } else {
        setClauses.push("consecutive_correct = 0");
        setClauses.push("needs_review = 1");
      }
    }

    setClauses.push("updated_at = ?");
    args.push(now);

    args.push(sentenceId);

    await db.execute({
      sql: `UPDATE mini_exercise_sentences SET ${setClauses.join(
        ", "
      )} WHERE sentence_id = ?`,
      args,
    });
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error updating sentence stats:",
      error
    );
    throw error;
  }
}

export async function deleteSentence(sentenceId: string): Promise<void> {
  try {
    await db.execute({
      sql: "DELETE FROM mini_exercise_sentences WHERE sentence_id = ?",
      args: [sentenceId],
    });
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error deleting sentence:",
      error
    );
    throw error;
  }
}

// ============================================================================
// ATTEMPT OPERATIONS
// ============================================================================

export async function recordAttempt(
  attempt: Omit<MiniExerciseAttempt, "createdAt">
): Promise<MiniExerciseAttempt> {
  try {
    const now = Date.now();
    await db.execute({
      sql: `INSERT INTO mini_exercise_attempts (
              attempt_id, sentence_id, user_id, answers,
              correct_answers, total_blanks, points, accuracy,
              completed_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        attempt.attemptId,
        attempt.sentenceId,
        attempt.userId,
        JSON.stringify(attempt.answers),
        attempt.correctAnswers,
        attempt.totalBlanks,
        attempt.points,
        attempt.accuracy,
        attempt.completedAt,
        now,
      ],
    });

    const result = await db.execute({
      sql: "SELECT * FROM mini_exercise_attempts WHERE attempt_id = ?",
      args: [attempt.attemptId],
    });

    return rowToAttempt(result.rows[0]);
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error recording attempt:",
      error
    );
    throw error;
  }
}

export async function getSentenceAttempts(
  sentenceId: string
): Promise<MiniExerciseAttempt[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM mini_exercise_attempts
            WHERE sentence_id = ?
            ORDER BY completed_at DESC`,
      args: [sentenceId],
    });

    return result.rows.map(rowToAttempt);
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error fetching sentence attempts:",
      error
    );
    throw error;
  }
}

export async function getUserAttempts(
  userId: string,
  limit?: number
): Promise<MiniExerciseAttempt[]> {
  try {
    let sql =
      "SELECT * FROM mini_exercise_attempts WHERE user_id = ? ORDER BY completed_at DESC";
    const args: any[] = [userId];

    if (limit) {
      sql += " LIMIT ?";
      args.push(limit);
    }

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToAttempt);
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error fetching user attempts:",
      error
    );
    throw error;
  }
}

// ============================================================================
// PROGRESS OPERATIONS
// ============================================================================

export async function getUserProgress(
  userId: string
): Promise<MiniExerciseProgress | null> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM mini_exercise_progress WHERE user_id = ?",
      args: [userId],
    });

    if (result.rows.length === 0) return null;
    return rowToProgress(result.rows[0]);
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error fetching user progress:",
      error
    );
    throw error;
  }
}

export async function initializeUserProgress(
  userId: string
): Promise<MiniExerciseProgress> {
  try {
    const now = Date.now();
    await db.execute({
      sql: `INSERT INTO mini_exercise_progress (
              user_id, total_sentences_practiced, total_attempts, total_points,
              average_accuracy, current_streak, practice_goal, today_progress,
              sentences_due_for_review, sentences_mastered, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, 0, 0, 0, 0, 0, 10, 0, 0, 0, now, now],
    });

    const result = await db.execute({
      sql: "SELECT * FROM mini_exercise_progress WHERE user_id = ?",
      args: [userId],
    });

    return rowToProgress(result.rows[0]);
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error initializing user progress:",
      error
    );
    throw error;
  }
}

export async function updateUserProgress(
  userId: string,
  updates: {
    sentenceCompleted?: boolean;
    points?: number;
    accuracy?: number;
    reviewCountChange?: number;
    masteredCountChange?: number;
  }
): Promise<void> {
  try {
    const progress = await getUserProgress(userId);
    if (!progress) {
      // Initialize if doesn't exist
      await initializeUserProgress(userId);
    }

    const now = Date.now();
    const setClauses: string[] = [];
    const args: any[] = [];

    if (updates.sentenceCompleted) {
      setClauses.push(
        "total_sentences_practiced = total_sentences_practiced + 1"
      );
      setClauses.push("total_attempts = total_attempts + 1");
      setClauses.push("today_progress = today_progress + 1");
    }

    if (updates.points !== undefined) {
      setClauses.push("total_points = total_points + ?");
      args.push(updates.points);
    }

    if (updates.accuracy !== undefined && progress) {
      // Recalculate average accuracy
      const totalAttempts = progress.totalAttempts + 1;
      const currentTotal = progress.averageAccuracy * progress.totalAttempts;
      const newAverage = (currentTotal + updates.accuracy) / totalAttempts;
      setClauses.push("average_accuracy = ?");
      args.push(newAverage);
    }

    if (updates.reviewCountChange !== undefined) {
      setClauses.push(
        "sentences_due_for_review = sentences_due_for_review + ?"
      );
      args.push(updates.reviewCountChange);
    }

    if (updates.masteredCountChange !== undefined) {
      setClauses.push("sentences_mastered = sentences_mastered + ?");
      args.push(updates.masteredCountChange);
    }

    setClauses.push("last_practice_date = ?");
    args.push(now);
    setClauses.push("updated_at = ?");
    args.push(now);

    args.push(userId);

    await db.execute({
      sql: `UPDATE mini_exercise_progress SET ${setClauses.join(
        ", "
      )} WHERE user_id = ?`,
      args,
    });
  } catch (error) {
    console.error(
      "[miniExerciseService:turso] Error updating user progress:",
      error
    );
    throw error;
  }
}
