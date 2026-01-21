/**
 * Student Answer Stats Service - Turso Implementation
 * Dashboard and statistics functions for student answers
 */

import { db } from "@/turso/client";
import { StudentAnswerSubmission } from "@/lib/models/studentAnswers";

/**
 * Convert database row to StudentAnswerSubmission object
 */
function rowToStudentAnswer(row: any): StudentAnswerSubmission {
  const markedWords = row.marked_words
    ? JSON.parse(row.marked_words as string)
    : undefined;

  return {
    studentId: row.student_id as string,
    studentName: row.student_name as string,
    exerciseId: row.exercise_id as string,
    itemNumber: row.item_number as string,
    studentAnswer: row.student_answer as string,
    submittedAt: row.submitted_at as number,
    isCorrect:
      row.is_correct !== null ? (row.is_correct as boolean) : undefined,
    markedWords,
  };
}

/**
 * Answer Hub statistics
 */
export interface AnswerHubStats {
  totalAnswers: number;
  exercisesAttempted: number;
  correctAnswers: number;
  recentAnswers: StudentAnswerSubmission[];
}

/**
 * Get Answer Hub statistics for a student
 */
export async function getAnswerHubStats(
  studentId: string
): Promise<AnswerHubStats> {
  try {
    const statsResult = await db.execute({
      sql: `SELECT
              COUNT(*) as total,
              COUNT(DISTINCT exercise_id) as exercises,
              SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM student_answers
            WHERE student_id = ?`,
      args: [studentId],
    });

    const recentResult = await db.execute({
      sql: `SELECT * FROM student_answers
            WHERE student_id = ?
            ORDER BY submitted_at DESC
            LIMIT 10`,
      args: [studentId],
    });

    const stats = statsResult.rows[0];
    return {
      totalAnswers: (stats.total as number) || 0,
      exercisesAttempted: (stats.exercises as number) || 0,
      correctAnswers: (stats.correct as number) || 0,
      recentAnswers: recentResult.rows.map(rowToStudentAnswer),
    };
  } catch (error) {
    console.error(
      "[studentAnswerStatsService] Error fetching answer hub stats:",
      error
    );
    return {
      totalAnswers: 0,
      exercisesAttempted: 0,
      correctAnswers: 0,
      recentAnswers: [],
    };
  }
}

/**
 * Get aggregated exercise interaction stats for a student in a specific lesson
 */
export async function getLessonInteractionStats(
  studentId: string,
  exerciseIds: string[]
): Promise<
  Record<string, { submissionCount: number; lastSubmittedAt: number }>
> {
  if (exerciseIds.length === 0) return {};

  try {
    const placeholders = exerciseIds.map(() => "?").join(",");
    const sql = `
      SELECT
        exercise_id,
        COUNT(*) as submission_count,
        MAX(submitted_at) as last_submitted
      FROM student_answers
      WHERE student_id = ?
      AND exercise_id IN (${placeholders})
      GROUP BY exercise_id
    `;

    const args = [studentId, ...exerciseIds];
    const result = await db.execute({ sql, args });

    const stats: Record<
      string,
      { submissionCount: number; lastSubmittedAt: number }
    > = {};

    for (const row of result.rows) {
      const exerciseId = row.exercise_id as string;
      stats[exerciseId] = {
        submissionCount: row.submission_count as number,
        lastSubmittedAt: row.last_submitted as number,
      };
    }

    return stats;
  } catch (error) {
    console.error(
      "[studentAnswerStatsService] Error fetching lesson stats:",
      error
    );
    return {};
  }
}

/**
 * Recent answer activity for dashboard
 */
export interface RecentAnswerActivity {
  exerciseId: string;
  itemNumber: string;
  submittedAt: number;
  exerciseTitle?: string;
}

/**
 * Get the last 5 answers the student submitted (ascending order - oldest to newest)
 */
export async function getRecentAnswerActivity(
  studentId: string,
  limit: number = 5
): Promise<RecentAnswerActivity[]> {
  try {
    const result = await db.execute({
      sql: `
        SELECT * FROM (
          SELECT
            sa.exercise_id,
            sa.item_number,
            sa.submitted_at,
            COALESCE(
              json_extract(eo.exercise_data, '$.title'),
              json_extract(eo.exercise_data, '$.exerciseNumber')
            ) as exercise_title
          FROM student_answers sa
          LEFT JOIN exercise_overrides eo ON sa.exercise_id = eo.exercise_id
          WHERE sa.student_id = ?
          ORDER BY sa.submitted_at DESC
          LIMIT ?
        ) ORDER BY submitted_at ASC
      `,
      args: [studentId, limit],
    });

    return result.rows.map((row) => ({
      exerciseId: row.exercise_id as string,
      itemNumber: row.item_number as string,
      submittedAt: row.submitted_at as number,
      exerciseTitle: row.exercise_title as string | undefined,
    }));
  } catch (error) {
    console.error(
      "[studentAnswerStatsService] Error fetching recent answers:",
      error
    );
    return [];
  }
}
