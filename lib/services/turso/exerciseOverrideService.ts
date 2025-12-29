/**
 * Exercise Override Service - Turso Implementation
 * Handles teacher customizations to exercises in the Answer Hub
 */

import { db } from '@/turso/client';
import {
  ExerciseOverride,
  CreateExerciseOverrideInput,
  UpdateExerciseOverrideInput,
  OverrideType,
} from '@/lib/models/exerciseOverride';
import { CEFRLevel } from '@/lib/models/cefr';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToExerciseOverride(row: any): ExerciseOverride {
  return {
    overrideId: row.override_id as string,
    teacherEmail: row.teacher_email as string,
    exerciseId: row.exercise_id as string,
    overrideType: row.override_type as OverrideType,
    level: row.level as CEFRLevel | undefined,
    lessonNumber: row.lesson_number as number | undefined,
    exerciseData: row.exercise_data ? JSON.parse(row.exercise_data as string) : undefined,
    modifications: row.modifications ? JSON.parse(row.modifications as string) : undefined,
    displayOrder: row.display_order as number | undefined,
    isHidden: Boolean(row.is_hidden),
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
    notes: row.notes as string | undefined,
  };
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

export async function createExerciseOverride(
  teacherEmail: string,
  override: CreateExerciseOverrideInput
): Promise<ExerciseOverride> {
  try {
    const overrideId = `${teacherEmail}_${override.exerciseId}`;
    const now = Date.now();

    await db.execute({
      sql: `INSERT INTO exercise_overrides (
              override_id, teacher_email, exercise_id, override_type,
              level, lesson_number, exercise_data, modifications,
              display_order, is_hidden, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        overrideId,
        teacherEmail,
        override.exerciseId,
        override.overrideType,
        override.level || null,
        override.lessonNumber || null,
        override.exerciseData ? JSON.stringify(override.exerciseData) : null,
        override.modifications ? JSON.stringify(override.modifications) : null,
        override.displayOrder || null,
        override.isHidden ? 1 : 0,
        override.notes || null,
        now,
        now,
      ],
    });

    const result = await db.execute({
      sql: 'SELECT * FROM exercise_overrides WHERE override_id = ?',
      args: [overrideId],
    });

    return rowToExerciseOverride(result.rows[0]);
  } catch (error) {
    console.error('[exerciseOverrideService:turso] Error creating override:', error);
    throw error;
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getExerciseOverride(
  teacherEmail: string,
  exerciseId: string
): Promise<ExerciseOverride | null> {
  try {
    const overrideId = `${teacherEmail}_${exerciseId}`;
    const result = await db.execute({
      sql: 'SELECT * FROM exercise_overrides WHERE override_id = ?',
      args: [overrideId],
    });

    if (result.rows.length === 0) return null;
    return rowToExerciseOverride(result.rows[0]);
  } catch (error) {
    console.error('[exerciseOverrideService:turso] Error fetching override:', error);
    throw error;
  }
}

export async function getTeacherOverrides(
  teacherEmail: string,
  filters?: {
    level?: CEFRLevel;
    lessonNumber?: number;
    overrideType?: OverrideType;
  }
): Promise<ExerciseOverride[]> {
  try {
    let sql = 'SELECT * FROM exercise_overrides WHERE teacher_email = ?';
    const args: any[] = [teacherEmail];

    if (filters?.level) {
      sql += ' AND level = ?';
      args.push(filters.level);
    }

    if (filters?.lessonNumber !== undefined) {
      sql += ' AND lesson_number = ?';
      args.push(filters.lessonNumber);
    }

    if (filters?.overrideType) {
      sql += ' AND override_type = ?';
      args.push(filters.overrideType);
    }

    // Explicitly sort by display_order, then fallback to created_at
    sql += ' ORDER BY display_order ASC, created_at ASC';

    const result = await db.execute({ sql, args });
    return result.rows.map(rowToExerciseOverride);
  } catch (error) {
    console.error('[exerciseOverrideService:turso] Error fetching teacher overrides:', error);
    throw error;
  }
}

export async function getHiddenExercises(teacherEmail: string): Promise<ExerciseOverride[]> {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM exercise_overrides
            WHERE teacher_email = ? AND is_hidden = 1
            ORDER BY created_at DESC`,
      args: [teacherEmail],
    });

    return result.rows.map(rowToExerciseOverride);
  } catch (error) {
    console.error('[exerciseOverrideService:turso] Error fetching hidden exercises:', error);
    throw error;
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

export async function updateExerciseOverride(
  teacherEmail: string,
  exerciseId: string,
  updates: UpdateExerciseOverrideInput
): Promise<ExerciseOverride> {
  try {
    const overrideId = `${teacherEmail}_${exerciseId}`;
    const setClauses: string[] = [];
    const args: any[] = [];

    if (updates.overrideType !== undefined) {
      setClauses.push('override_type = ?');
      args.push(updates.overrideType);
    }

    if (updates.level !== undefined) {
      setClauses.push('level = ?');
      args.push(updates.level);
    }

    if (updates.lessonNumber !== undefined) {
      setClauses.push('lesson_number = ?');
      args.push(updates.lessonNumber);
    }

    if (updates.exerciseData !== undefined) {
      setClauses.push('exercise_data = ?');
      args.push(JSON.stringify(updates.exerciseData));
    }

    if (updates.modifications !== undefined) {
      setClauses.push('modifications = ?');
      args.push(JSON.stringify(updates.modifications));
    }

    if (updates.displayOrder !== undefined) {
      setClauses.push('display_order = ?');
      args.push(updates.displayOrder);
    }

    if (updates.isHidden !== undefined) {
      setClauses.push('is_hidden = ?');
      args.push(updates.isHidden ? 1 : 0);
    }

    if (updates.notes !== undefined) {
      setClauses.push('notes = ?');
      args.push(updates.notes);
    }

    setClauses.push('updated_at = ?');
    args.push(Date.now());

    args.push(overrideId);

    await db.execute({
      sql: `UPDATE exercise_overrides SET ${setClauses.join(', ')} WHERE override_id = ?`,
      args,
    });

    const result = await db.execute({
      sql: 'SELECT * FROM exercise_overrides WHERE override_id = ?',
      args: [overrideId],
    });

    return rowToExerciseOverride(result.rows[0]);
  } catch (error) {
    console.error('[exerciseOverrideService:turso] Error updating override:', error);
    throw error;
  }
}

export async function updateDisplayOrders(
  teacherEmail: string,
  orderMap: Record<string, number>
): Promise<void> {
  try {
    for (const [exerciseId, displayOrder] of Object.entries(orderMap)) {
      const overrideId = `${teacherEmail}_${exerciseId}`;
      await db.execute({
        sql: 'UPDATE exercise_overrides SET display_order = ?, updated_at = ? WHERE override_id = ?',
        args: [displayOrder, Date.now(), overrideId],
      });
    }
  } catch (error) {
    console.error('[exerciseOverrideService:turso] Error updating display orders:', error);
    throw error;
  }
}

export async function bulkUpdateDisplayOrder(
  orderUpdates: { overrideId: string; displayOrder: number; exerciseId?: string; teacherEmail?: string; level?: CEFRLevel; lessonNumber?: number }[]
): Promise<void> {
  try {
    const now = Date.now();
    
    // Use db.batch with UPSERT for better performance and reliability
    const statements = orderUpdates.map(({ overrideId, displayOrder, exerciseId, teacherEmail, level, lessonNumber }) => {
      // If we don't have enough info to create, we can only update if exists (though usually we should have info)
      if (!exerciseId || !teacherEmail) {
        return {
          sql: 'UPDATE exercise_overrides SET display_order = ?, updated_at = ? WHERE override_id = ?',
          args: [displayOrder, now, overrideId],
        };
      }

      // UPSERT: Insert if new, Update display_order if exists
      return {
        sql: `INSERT INTO exercise_overrides (
                override_id, teacher_email, exercise_id, override_type,
                level, lesson_number, display_order, created_at, updated_at
              ) VALUES (?, ?, ?, 'modify', ?, ?, ?, ?, ?)
              ON CONFLICT(override_id) DO UPDATE SET
                display_order = excluded.display_order,
                updated_at = excluded.updated_at`,
        args: [
          overrideId,
          teacherEmail,
          exerciseId,
          level || null,
          lessonNumber || null,
          displayOrder,
          now,
          now,
        ],
      };
    });

    if (statements.length > 0) {
      await db.batch(statements);
    }
  } catch (error) {
    console.error('[exerciseOverrideService:turso] Error bulk updating orders:', error);
    throw error;
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

export async function deleteExerciseOverride(
  teacherEmail: string,
  exerciseId: string
): Promise<void> {
  try {
    const overrideId = `${teacherEmail}_${exerciseId}`;
    await db.execute({
      sql: 'DELETE FROM exercise_overrides WHERE override_id = ?',
      args: [overrideId],
    });
  } catch (error) {
    console.error('[exerciseOverrideService:turso] Error deleting override:', error);
    throw error;
  }
}

export async function deleteTeacherOverrides(teacherEmail: string): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM exercise_overrides WHERE teacher_email = ?',
      args: [teacherEmail],
    });
  } catch (error) {
    console.error('[exerciseOverrideService:turso] Error deleting teacher overrides:', error);
    throw error;
  }
}
