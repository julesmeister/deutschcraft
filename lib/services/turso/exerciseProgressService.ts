/**
 * Exercise Progress Service - Turso Implementation
 * Tracks student progress on exercises and lessons
 */

import { db } from '@/turso/client';
import { ExerciseProgress, LessonProgress } from '@/lib/models/exerciseProgress';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToExerciseProgress(row: any): ExerciseProgress {
  return {
    exerciseId: row.exercise_id as string,
    studentId: row.student_id as string,
    status: row.status as 'new' | 'in_progress' | 'completed',
    itemsCompleted: row.items_completed as number,
    totalItems: row.total_items as number,
    lastAttemptedAt: row.last_attempted_at as number,
    completedAt: row.completed_at as number | undefined,
  };
}

function rowToLessonProgress(row: any): LessonProgress {
  return {
    lessonId: row.lesson_id as string,
    studentId: row.student_id as string,
    exercisesCompleted: row.exercises_completed as number,
    totalExercises: row.total_exercises as number,
    percentage: row.percentage as number,
    lastActivityAt: row.last_activity_at as number,
  };
}

// ============================================================================
// EXERCISE PROGRESS OPERATIONS
// ============================================================================

export async function getExerciseProgress(
  studentId: string,
  exerciseId: string
): Promise<ExerciseProgress | null> {
  try {
    const progressId = `${studentId}_${exerciseId}`;
    const result = await db.execute({
      sql: 'SELECT * FROM exercise_progress WHERE progress_id = ?',
      args: [progressId],
    });

    if (result.rows.length === 0) return null;
    return rowToExerciseProgress(result.rows[0]);
  } catch (error) {
    console.error('[exerciseProgressService:turso] Error fetching exercise progress:', error);
    throw error;
  }
}

export async function getStudentExerciseProgress(
  studentId: string,
  filters?: {
    status?: 'new' | 'in_progress' | 'completed';
  }
): Promise<ExerciseProgress[]> {
  try {
    let sql = 'SELECT * FROM exercise_progress WHERE student_id = ?';
    const args: any[] = [studentId];

    if (filters?.status) {
      sql += ' AND status = ?';
      args.push(filters.status);
    }

    sql += ' ORDER BY last_attempted_at DESC';

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToExerciseProgress);
  } catch (error) {
    console.error('[exerciseProgressService:turso] Error fetching student exercise progress:', error);
    throw error;
  }
}

export async function createExerciseProgress(
  studentId: string,
  exerciseId: string,
  totalItems: number
): Promise<ExerciseProgress> {
  try {
    const progressId = `${studentId}_${exerciseId}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO exercise_progress (
              progress_id, exercise_id, student_id, status,
              items_completed, total_items, last_attempted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [progressId, exerciseId, studentId, 'new', 0, totalItems, now],
    });

    const result = await db.execute({
      sql: 'SELECT * FROM exercise_progress WHERE progress_id = ?',
      args: [progressId],
    });

    return rowToExerciseProgress(result.rows[0]);
  } catch (error) {
    console.error('[exerciseProgressService:turso] Error creating exercise progress:', error);
    throw error;
  }
}

export async function updateExerciseProgress(
  studentId: string,
  exerciseId: string,
  updates: {
    itemsCompleted?: number;
    status?: 'new' | 'in_progress' | 'completed';
  }
): Promise<ExerciseProgress> {
  try {
    const progressId = `${studentId}_${exerciseId}`;
    const now = Date.now();

    // Get current progress to determine if completing
    const current = await getExerciseProgress(studentId, exerciseId);
    if (!current) {
      throw new Error('Exercise progress not found');
    }

    const setClauses: string[] = [];
    const args: any[] = [];

    if (updates.itemsCompleted !== undefined) {
      setClauses.push('items_completed = ?');
      args.push(updates.itemsCompleted);

      // Auto-update status based on items completed
      const newStatus =
        updates.itemsCompleted === 0
          ? 'new'
          : updates.itemsCompleted >= current.totalItems
          ? 'completed'
          : 'in_progress';

      setClauses.push('status = ?');
      args.push(newStatus);

      // Set completedAt when first completing
      if (newStatus === 'completed' && current.status !== 'completed') {
        setClauses.push('completed_at = ?');
        args.push(now);
      }
    } else if (updates.status) {
      setClauses.push('status = ?');
      args.push(updates.status);

      // Set completedAt when marking as completed
      if (updates.status === 'completed' && current.status !== 'completed') {
        setClauses.push('completed_at = ?');
        args.push(now);
      }
    }

    setClauses.push('last_attempted_at = ?');
    args.push(now);

    args.push(progressId);

    await db.execute({
      sql: `UPDATE exercise_progress SET ${setClauses.join(', ')} WHERE progress_id = ?`,
      args,
    });

    const result = await db.execute({
      sql: 'SELECT * FROM exercise_progress WHERE progress_id = ?',
      args: [progressId],
    });

    return rowToExerciseProgress(result.rows[0]);
  } catch (error) {
    console.error('[exerciseProgressService:turso] Error updating exercise progress:', error);
    throw error;
  }
}

export async function deleteExerciseProgress(
  studentId: string,
  exerciseId: string
): Promise<void> {
  try {
    const progressId = `${studentId}_${exerciseId}`;
    await db.execute({
      sql: 'DELETE FROM exercise_progress WHERE progress_id = ?',
      args: [progressId],
    });
  } catch (error) {
    console.error('[exerciseProgressService:turso] Error deleting exercise progress:', error);
    throw error;
  }
}

// ============================================================================
// LESSON PROGRESS OPERATIONS
// ============================================================================

export async function getLessonProgress(
  studentId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  try {
    const progressId = `${studentId}_${lessonId}`;
    const result = await db.execute({
      sql: 'SELECT * FROM lesson_progress WHERE progress_id = ?',
      args: [progressId],
    });

    if (result.rows.length === 0) return null;
    return rowToLessonProgress(result.rows[0]);
  } catch (error) {
    console.error('[exerciseProgressService:turso] Error fetching lesson progress:', error);
    throw error;
  }
}

export async function getStudentLessonProgress(studentId: string): Promise<LessonProgress[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM lesson_progress
            WHERE student_id = ?
            ORDER BY last_activity_at DESC`,
      args: [studentId],
    });

    return result.rows.map(rowToLessonProgress);
  } catch (error) {
    console.error('[exerciseProgressService:turso] Error fetching student lesson progress:', error);
    throw error;
  }
}

export async function createLessonProgress(
  studentId: string,
  lessonId: string,
  totalExercises: number
): Promise<LessonProgress> {
  try {
    const progressId = `${studentId}_${lessonId}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO lesson_progress (
              progress_id, lesson_id, student_id, exercises_completed,
              total_exercises, percentage, last_activity_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [progressId, lessonId, studentId, 0, totalExercises, 0, now],
    });

    const result = await db.execute({
      sql: 'SELECT * FROM lesson_progress WHERE progress_id = ?',
      args: [progressId],
    });

    return rowToLessonProgress(result.rows[0]);
  } catch (error) {
    console.error('[exerciseProgressService:turso] Error creating lesson progress:', error);
    throw error;
  }
}

export async function updateLessonProgress(
  studentId: string,
  lessonId: string,
  exercisesCompleted: number
): Promise<LessonProgress> {
  try {
    const progressId = `${studentId}_${lessonId}`;

    // Get current progress to calculate percentage
    const current = await getLessonProgress(studentId, lessonId);
    if (!current) {
      throw new Error('Lesson progress not found');
    }

    const percentage =
      current.totalExercises > 0
        ? Math.round((exercisesCompleted / current.totalExercises) * 100)
        : 0;

    const now = Date.now();

    await db.execute({
      sql: `UPDATE lesson_progress
            SET exercises_completed = ?, percentage = ?, last_activity_at = ?
            WHERE progress_id = ?`,
      args: [exercisesCompleted, percentage, now, progressId],
    });

    const result = await db.execute({
      sql: 'SELECT * FROM lesson_progress WHERE progress_id = ?',
      args: [progressId],
    });

    return rowToLessonProgress(result.rows[0]);
  } catch (error) {
    console.error('[exerciseProgressService:turso] Error updating lesson progress:', error);
    throw error;
  }
}

export async function incrementLessonProgress(
  studentId: string,
  lessonId: string
): Promise<LessonProgress> {
  try {
    const current = await getLessonProgress(studentId, lessonId);
    if (!current) {
      throw new Error('Lesson progress not found');
    }

    return updateLessonProgress(studentId, lessonId, current.exercisesCompleted + 1);
  } catch (error) {
    console.error('[exerciseProgressService:turso] Error incrementing lesson progress:', error);
    throw error;
  }
}

export async function deleteLessonProgress(studentId: string, lessonId: string): Promise<void> {
  try {
    const progressId = `${studentId}_${lessonId}`;
    await db.execute({
      sql: 'DELETE FROM lesson_progress WHERE progress_id = ?',
      args: [progressId],
    });
  } catch (error) {
    console.error('[exerciseProgressService:turso] Error deleting lesson progress:', error);
    throw error;
  }
}

// ============================================================================
// UTILITY OPERATIONS
// ============================================================================

export async function getOrCreateExerciseProgress(
  studentId: string,
  exerciseId: string,
  totalItems: number
): Promise<ExerciseProgress> {
  const existing = await getExerciseProgress(studentId, exerciseId);
  if (existing) return existing;
  return createExerciseProgress(studentId, exerciseId, totalItems);
}

export async function getOrCreateLessonProgress(
  studentId: string,
  lessonId: string,
  totalExercises: number
): Promise<LessonProgress> {
  const existing = await getLessonProgress(studentId, lessonId);
  if (existing) return existing;
  return createLessonProgress(studentId, lessonId, totalExercises);
}
