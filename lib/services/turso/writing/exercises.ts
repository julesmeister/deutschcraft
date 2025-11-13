/**
 * Writing Exercises - Turso Implementation
 * Database operations for writing exercises
 */

import { db } from '@/turso/client';
import { TranslationExercise, CreativeWritingExercise, WritingExerciseType } from '@/lib/models/writing';
import { CEFRLevel } from '@/lib/models/cefr';
import { rowToExercise } from './helpers';

/**
 * Get writing exercises by level and type
 * @param level - CEFR level
 * @param exerciseType - Optional exercise type filter
 * @returns Array of exercises
 */
export async function getWritingExercises(
  level: CEFRLevel,
  exerciseType?: WritingExerciseType
): Promise<(TranslationExercise | CreativeWritingExercise)[]> {
  try {
    let sql = 'SELECT * FROM writing_exercises WHERE level = ?';
    const args: any[] = [level];

    if (exerciseType) {
      sql += ' AND type = ?';
      args.push(exerciseType);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToExercise);
  } catch (error) {
    console.error('[writingService:turso] Error fetching writing exercises:', error);
    throw error;
  }
}

/**
 * Get a single writing exercise by ID
 * @param exerciseId - Exercise ID
 * @returns Exercise object or null
 */
export async function getWritingExercise(
  exerciseId: string
): Promise<TranslationExercise | CreativeWritingExercise | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM writing_exercises WHERE exercise_id = ? LIMIT 1',
      args: [exerciseId],
    });

    if (result.rows.length === 0) return null;
    return rowToExercise(result.rows[0]);
  } catch (error) {
    console.error('[writingService:turso] Error fetching writing exercise:', error);
    throw error;
  }
}
