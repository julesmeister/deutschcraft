/**
 * Review Quiz Service - Turso Implementation
 * Handles fill-in-the-blank quizzes for reviewing writing corrections
 */

import { db } from '@/turso/client';
import { ReviewQuiz, QuizBlank } from '@/lib/models/writing';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert database row to ReviewQuiz object
 */
function rowToReviewQuiz(row: any): ReviewQuiz {
  return {
    quizId: row.quiz_id as string,
    submissionId: row.submission_id as string,
    userId: row.user_id as string,
    exerciseId: row.exercise_id as string,
    exerciseType: row.exercise_type as string,
    sourceType: row.source_type as 'ai' | 'teacher' | 'reference',
    originalText: row.original_text as string,
    correctedText: row.corrected_text as string,
    blanks: JSON.parse(row.blanks as string) as QuizBlank[],
    answers: row.answers ? JSON.parse(row.answers as string) : {},
    score: row.score as number,
    correctAnswers: row.correct_answers as number,
    totalBlanks: row.total_blanks as number,
    status: row.status as 'in-progress' | 'completed',
    startedAt: row.started_at as number,
    completedAt: row.completed_at as number | undefined,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get quiz by ID
 */
export async function getReviewQuiz(quizId: string): Promise<ReviewQuiz | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM writing_review_quizzes WHERE quiz_id = ? LIMIT 1',
      args: [quizId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToReviewQuiz(result.rows[0]);
  } catch (error) {
    console.error('[reviewQuizService:turso] Error fetching quiz:', error);
    throw error;
  }
}

/**
 * Get all quizzes for a user
 */
export async function getUserReviewQuizzes(
  userId: string,
  status?: 'in-progress' | 'completed'
): Promise<ReviewQuiz[]> {
  try {
    let sql = 'SELECT * FROM writing_review_quizzes WHERE user_id = ?';
    const args: any[] = [userId];

    if (status) {
      sql += ' AND status = ?';
      args.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToReviewQuiz);
  } catch (error) {
    console.error('[reviewQuizService:turso] Error fetching user quizzes:', error);
    throw error;
  }
}

/**
 * Get quiz statistics for a user
 */
export interface QuizStats {
  totalQuizzes: number;
  totalPoints: number;
  totalCorrectAnswers: number;
  totalBlanks: number;
}

export async function getUserQuizStats(userId: string): Promise<QuizStats> {
  try {
    const result = await db.execute({
      sql: `SELECT
              COUNT(*) as total_quizzes,
              SUM(correct_answers * 10) as total_points,
              SUM(correct_answers) as total_correct,
              SUM(total_blanks) as total_blanks
            FROM writing_review_quizzes
            WHERE user_id = ? AND status = 'completed'`,
      args: [userId],
    });

    const row = result.rows[0];
    return {
      totalQuizzes: (row.total_quizzes as number) || 0,
      totalPoints: (row.total_points as number) || 0,
      totalCorrectAnswers: (row.total_correct as number) || 0,
      totalBlanks: (row.total_blanks as number) || 0,
    };
  } catch (error) {
    console.error('[reviewQuizService:turso] Error fetching quiz stats:', error);
    return {
      totalQuizzes: 0,
      totalPoints: 0,
      totalCorrectAnswers: 0,
      totalBlanks: 0,
    };
  }
}

/**
 * Get quizzes for a specific submission
 */
export async function getSubmissionQuizzes(submissionId: string): Promise<ReviewQuiz[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM writing_review_quizzes WHERE submission_id = ? ORDER BY created_at DESC',
      args: [submissionId],
    });

    return result.rows.map(rowToReviewQuiz);
  } catch (error) {
    console.error('[reviewQuizService:turso] Error fetching submission quizzes:', error);
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new review quiz
 */
export async function createReviewQuiz(
  quiz: Omit<ReviewQuiz, 'quizId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const quizId = `QUIZ_${Date.now()}_${quiz.userId}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO writing_review_quizzes (
              quiz_id, submission_id, user_id, exercise_id, exercise_type,
              source_type, original_text, corrected_text, blanks, answers,
              score, correct_answers, total_blanks, status,
              started_at, completed_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        quizId,
        quiz.submissionId || null,
        quiz.userId,
        quiz.exerciseId,
        quiz.exerciseType,
        quiz.sourceType,
        quiz.originalText,
        quiz.correctedText,
        JSON.stringify(quiz.blanks),
        JSON.stringify(quiz.answers),
        quiz.score,
        quiz.correctAnswers,
        quiz.totalBlanks,
        quiz.status,
        quiz.startedAt,
        quiz.completedAt || null,
        now,
        now,
      ],
    });

    return quizId;
  } catch (error) {
    console.error('[reviewQuizService:turso] Error creating quiz:', error);
    throw error;
  }
}

/**
 * Update quiz answers and scoring
 */
export async function updateQuizAnswers(
  quizId: string,
  answers: Record<number, string>,
  correctAnswers: number,
  score: number
): Promise<void> {
  try {
    await db.execute({
      sql: `UPDATE writing_review_quizzes
            SET answers = ?, correct_answers = ?, score = ?, updated_at = ?
            WHERE quiz_id = ?`,
      args: [JSON.stringify(answers), correctAnswers, score, Date.now(), quizId],
    });
  } catch (error) {
    console.error('[reviewQuizService:turso] Error updating quiz answers:', error);
    throw error;
  }
}

/**
 * Complete a quiz
 */
export async function completeQuiz(quizId: string): Promise<void> {
  try {
    await db.execute({
      sql: `UPDATE writing_review_quizzes
            SET status = 'completed', completed_at = ?, updated_at = ?
            WHERE quiz_id = ?`,
      args: [Date.now(), Date.now(), quizId],
    });
  } catch (error) {
    console.error('[reviewQuizService:turso] Error completing quiz:', error);
    throw error;
  }
}

/**
 * Delete a quiz
 */
export async function deleteReviewQuiz(quizId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM writing_review_quizzes WHERE quiz_id = ?',
      args: [quizId],
    });
  } catch (error) {
    console.error('[reviewQuizService:turso] Error deleting quiz:', error);
    throw error;
  }
}
