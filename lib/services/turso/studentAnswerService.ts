/**
 * Student Answer Service - Turso Implementation
 * Handles student responses to exercises
 */

import { db } from "@/turso/client";
import {
  StudentAnswerSubmission,
  StudentExerciseAnswers,
  groupAnswersByStudent,
} from "@/lib/models/studentAnswers";
import { syncMarkedWordsProgress } from "./markedWordProgressService";

// Re-export stats functions for backwards compatibility
export {
  getAnswerHubStats,
  getLessonInteractionStats,
  getRecentAnswerActivity,
  type AnswerHubStats,
  type RecentAnswerActivity,
} from "./studentAnswerStatsService";

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

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all answers for a specific exercise
 */
export async function getExerciseAnswers(
  exerciseId: string
): Promise<StudentAnswerSubmission[]> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM student_answers WHERE exercise_id = ? ORDER BY submitted_at DESC",
      args: [exerciseId],
    });
    return result.rows.map(rowToStudentAnswer);
  } catch (error) {
    console.error(
      "[studentAnswerService] Error fetching exercise answers:",
      error
    );
    throw error;
  }
}

/**
 * Get all answers for a specific exercise (grouped by student)
 */
export async function getExerciseAnswersGrouped(
  exerciseId: string
): Promise<StudentExerciseAnswers[]> {
  try {
    const answers = await getExerciseAnswers(exerciseId);
    return groupAnswersByStudent(answers);
  } catch (error) {
    console.error(
      "[studentAnswerService] Error fetching grouped answers:",
      error
    );
    throw error;
  }
}

/**
 * Get all answers for a specific student
 */
export async function getStudentAnswers(
  studentId: string,
  exerciseId?: string
): Promise<StudentAnswerSubmission[]> {
  try {
    let sql = "SELECT * FROM student_answers WHERE student_id = ?";
    const args: any[] = [studentId];

    if (exerciseId) {
      sql += " AND exercise_id = ?";
      args.push(exerciseId);
    }
    sql += " ORDER BY submitted_at DESC";

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToStudentAnswer);
  } catch (error) {
    console.error(
      "[studentAnswerService] Error fetching student answers:",
      error
    );
    throw error;
  }
}

/**
 * Get a specific answer
 */
export async function getAnswer(
  studentId: string,
  exerciseId: string,
  itemNumber: string
): Promise<StudentAnswerSubmission | null> {
  try {
    const answerId = `${studentId}_${exerciseId}_${itemNumber}`;
    const result = await db.execute({
      sql: "SELECT * FROM student_answers WHERE answer_id = ? LIMIT 1",
      args: [answerId],
    });

    if (result.rows.length === 0) return null;
    return rowToStudentAnswer(result.rows[0]);
  } catch (error) {
    console.error("[studentAnswerService] Error fetching answer:", error);
    throw error;
  }
}

/**
 * Get all answers for a specific student for a list of exercises
 */
export async function getStudentAnswersForExercises(
  studentId: string,
  exerciseIds: string[]
): Promise<StudentAnswerSubmission[]> {
  if (exerciseIds.length === 0) return [];

  try {
    const placeholders = exerciseIds.map(() => "?").join(",");
    const sql = `
      SELECT * FROM student_answers
      WHERE student_id = ?
      AND exercise_id IN (${placeholders})
      ORDER BY exercise_id, item_number
    `;
    const args = [studentId, ...exerciseIds];
    const result = await db.execute({ sql, args });
    return result.rows.map(rowToStudentAnswer);
  } catch (error) {
    console.error(
      "[studentAnswerService] Error fetching student answers for exercises:",
      error
    );
    throw error;
  }
}

/**
 * Get all answers for a list of exercises (for all students)
 */
export async function getAllAnswersForExercises(
  exerciseIds: string[]
): Promise<StudentAnswerSubmission[]> {
  if (exerciseIds.length === 0) return [];

  try {
    const placeholders = exerciseIds.map(() => "?").join(",");
    const sql = `
      SELECT * FROM student_answers
      WHERE exercise_id IN (${placeholders})
      ORDER BY exercise_id, item_number, submitted_at DESC
    `;
    const result = await db.execute({ sql, args: [...exerciseIds] });
    return result.rows.map(rowToStudentAnswer);
  } catch (error) {
    console.error(
      "[studentAnswerService] Error fetching all answers for exercises:",
      error
    );
    throw error;
  }
}

/**
 * Get all marked words for a lesson (for quiz generation)
 */
export async function getMarkedWordsForLesson(
  studentId: string,
  exerciseIds: string[]
): Promise<StudentAnswerSubmission[]> {
  if (exerciseIds.length === 0) return [];

  try {
    const placeholders = exerciseIds.map(() => "?").join(",");
    const sql = `
      SELECT * FROM student_answers
      WHERE student_id = ?
      AND exercise_id IN (${placeholders})
      AND marked_words IS NOT NULL
      AND marked_words != '[]'
      ORDER BY submitted_at DESC
    `;
    const args = [studentId, ...exerciseIds];
    const result = await db.execute({ sql, args });
    return result.rows.map(rowToStudentAnswer);
  } catch (error) {
    console.error(
      "[studentAnswerService] Error fetching marked words:",
      error
    );
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Save a student's answer
 */
export async function saveStudentAnswer(
  answer: Omit<StudentAnswerSubmission, "submittedAt"> & {
    submittedAt?: number;
  }
): Promise<string> {
  try {
    const answerId = `${answer.studentId}_${answer.exerciseId}_${answer.itemNumber}`;
    const submittedAt = answer.submittedAt || Date.now();

    await db.execute({
      sql: `INSERT OR REPLACE INTO student_answers (
              answer_id, student_id, student_name, exercise_id, item_number,
              student_answer, is_correct, submitted_at, marked_words
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        answerId,
        answer.studentId,
        answer.studentName,
        answer.exerciseId,
        answer.itemNumber,
        answer.studentAnswer,
        answer.isCorrect !== undefined ? (answer.isCorrect ? 1 : 0) : null,
        submittedAt,
        answer.markedWords ? JSON.stringify(answer.markedWords) : null,
      ],
    });

    if (answer.markedWords) {
      await syncMarkedWordsProgress(
        answer.studentId,
        answer.exerciseId,
        answer.itemNumber,
        answer.markedWords
      );
    }

    return answerId;
  } catch (error) {
    console.error("[studentAnswerService] Error saving answer:", error);
    throw error;
  }
}

/**
 * Update answer correctness (for grading)
 */
export async function gradeAnswer(
  studentId: string,
  exerciseId: string,
  itemNumber: string,
  isCorrect: boolean
): Promise<void> {
  try {
    const answerId = `${studentId}_${exerciseId}_${itemNumber}`;
    await db.execute({
      sql: "UPDATE student_answers SET is_correct = ? WHERE answer_id = ?",
      args: [isCorrect ? 1 : 0, answerId],
    });
  } catch (error) {
    console.error("[studentAnswerService] Error grading answer:", error);
    throw error;
  }
}

/**
 * Delete a student's answer
 */
export async function deleteStudentAnswer(
  studentId: string,
  exerciseId: string,
  itemNumber: string
): Promise<void> {
  try {
    const answerId = `${studentId}_${exerciseId}_${itemNumber}`;
    await db.execute({
      sql: "DELETE FROM student_answers WHERE answer_id = ?",
      args: [answerId],
    });
  } catch (error) {
    console.error("[studentAnswerService] Error deleting answer:", error);
    throw error;
  }
}

/**
 * Update marked words for a student answer
 */
export async function updateMarkedWords(
  studentId: string,
  exerciseId: string,
  itemNumber: string,
  markedWords: any[]
): Promise<void> {
  try {
    const answerId = `${studentId}_${exerciseId}_${itemNumber}`;
    await db.execute({
      sql: "UPDATE student_answers SET marked_words = ? WHERE answer_id = ?",
      args: [JSON.stringify(markedWords), answerId],
    });

    await syncMarkedWordsProgress(
      studentId,
      exerciseId,
      itemNumber,
      markedWords
    );
  } catch (error) {
    console.error(
      "[studentAnswerService] Error updating marked words:",
      error
    );
    throw error;
  }
}

/**
 * Delete all answers for an exercise
 */
export async function deleteExerciseAnswers(exerciseId: string): Promise<void> {
  try {
    await db.execute({
      sql: "DELETE FROM student_answers WHERE exercise_id = ?",
      args: [exerciseId],
    });
  } catch (error) {
    console.error(
      "[studentAnswerService] Error deleting exercise answers:",
      error
    );
    throw error;
  }
}
