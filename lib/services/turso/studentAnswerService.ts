/**
 * Student Answer Service - Turso Implementation
 * Handles student responses to exercises
 */

import { db } from '@/turso/client';
import { StudentAnswerSubmission, StudentExerciseAnswers, groupAnswersByStudent } from '@/lib/models/studentAnswers';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert database row to StudentAnswerSubmission object
 */
function rowToStudentAnswer(row: any): StudentAnswerSubmission {
  return {
    studentId: row.student_id as string,
    studentName: row.student_name as string,
    exerciseId: row.exercise_id as string,
    itemNumber: row.item_number as string,
    studentAnswer: row.student_answer as string,
    submittedAt: row.submitted_at as number,
    isCorrect: row.is_correct !== null ? (row.is_correct as boolean) : undefined,
  };
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all answers for a specific exercise
 */
export async function getExerciseAnswers(exerciseId: string): Promise<StudentAnswerSubmission[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM student_answers WHERE exercise_id = ? ORDER BY submitted_at DESC',
      args: [exerciseId],
    });

    return result.rows.map(rowToStudentAnswer);
  } catch (error) {
    console.error('[studentAnswerService:turso] Error fetching exercise answers:', error);
    throw error;
  }
}

/**
 * Get all answers for a specific exercise (grouped by student)
 */
export async function getExerciseAnswersGrouped(exerciseId: string): Promise<StudentExerciseAnswers[]> {
  try {
    const answers = await getExerciseAnswers(exerciseId);
    return groupAnswersByStudent(answers);
  } catch (error) {
    console.error('[studentAnswerService:turso] Error fetching grouped answers:', error);
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
    let sql = 'SELECT * FROM student_answers WHERE student_id = ?';
    const args: any[] = [studentId];

    if (exerciseId) {
      sql += ' AND exercise_id = ?';
      args.push(exerciseId);
    }

    sql += ' ORDER BY submitted_at DESC';

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToStudentAnswer);
  } catch (error) {
    console.error('[studentAnswerService:turso] Error fetching student answers:', error);
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
      sql: 'SELECT * FROM student_answers WHERE answer_id = ? LIMIT 1',
      args: [answerId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToStudentAnswer(result.rows[0]);
  } catch (error) {
    console.error('[studentAnswerService:turso] Error fetching answer:', error);
    throw error;
  }
}

/**
 * Get Answer Hub statistics for a student
 */
export interface AnswerHubStats {
  totalAnswers: number;
  exercisesAttempted: number;
  correctAnswers: number;
  recentAnswers: StudentAnswerSubmission[];
}

export async function getAnswerHubStats(studentId: string): Promise<AnswerHubStats> {
  try {
    // Get total count and correct count
    const statsResult = await db.execute({
      sql: `SELECT
              COUNT(*) as total,
              COUNT(DISTINCT exercise_id) as exercises,
              SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM student_answers
            WHERE student_id = ?`,
      args: [studentId],
    });

    // Get recent answers (last 10)
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
    console.error('[studentAnswerService:turso] Error fetching answer hub stats:', error);
    return {
      totalAnswers: 0,
      exercisesAttempted: 0,
      correctAnswers: 0,
      recentAnswers: [],
    };
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Save a student's answer
 */
export async function saveStudentAnswer(
  answer: Omit<StudentAnswerSubmission, 'submittedAt'> & { submittedAt?: number }
): Promise<string> {
  try {
    const answerId = `${answer.studentId}_${answer.exerciseId}_${answer.itemNumber}`;
    const submittedAt = answer.submittedAt || Date.now();

    // Use INSERT OR REPLACE to handle duplicates
    await db.execute({
      sql: `INSERT OR REPLACE INTO student_answers (
              answer_id, student_id, student_name, exercise_id, item_number,
              student_answer, is_correct, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        answerId,
        answer.studentId,
        answer.studentName,
        answer.exerciseId,
        answer.itemNumber,
        answer.studentAnswer,
        answer.isCorrect !== undefined ? (answer.isCorrect ? 1 : 0) : null,
        submittedAt,
      ],
    });

    return answerId;
  } catch (error) {
    console.error('[studentAnswerService:turso] Error saving answer:', error);
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
      sql: 'UPDATE student_answers SET is_correct = ? WHERE answer_id = ?',
      args: [isCorrect ? 1 : 0, answerId],
    });
  } catch (error) {
    console.error('[studentAnswerService:turso] Error grading answer:', error);
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
      sql: 'DELETE FROM student_answers WHERE answer_id = ?',
      args: [answerId],
    });
  } catch (error) {
    console.error('[studentAnswerService:turso] Error deleting answer:', error);
    throw error;
  }
}

/**
 * Delete all answers for an exercise
 */
export async function deleteExerciseAnswers(exerciseId: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM student_answers WHERE exercise_id = ?',
      args: [exerciseId],
    });
  } catch (error) {
    console.error('[studentAnswerService:turso] Error deleting exercise answers:', error);
    throw error;
  }
}
