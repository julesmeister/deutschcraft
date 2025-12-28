/**
 * Batch Service - Turso Implementation
 * Database abstraction layer for batch operations using Turso DB
 */

import { db } from "@/turso/client";
import { Batch, CEFRLevel, BatchLevelHistory } from "@/lib/models";

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all batches for a teacher
 * @param teacherEmail - Teacher's email
 * @returns Array of batches
 */
export async function getBatchesByTeacher(
  teacherEmail: string
): Promise<Batch[]> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM batches WHERE teacher_id = ? ORDER BY created_at DESC",
      args: [teacherEmail],
    });

    const batches = result.rows.map(rowToBatch);

    // Populate student counts dynamically
    const batchesWithCounts = await Promise.all(
      batches.map(async (batch) => {
        const studentCount = await getBatchStudentCount(batch.batchId);
        return { ...batch, studentCount };
      })
    );

    return batchesWithCounts;
  } catch (error) {
    console.error(
      "[batchService:turso] Error fetching batches by teacher:",
      error
    );
    throw error;
  }
}

/**
 * Get a single batch by ID
 * @param batchId - Batch ID
 * @returns Batch object or null
 */
export async function getBatch(batchId: string): Promise<Batch | null> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM batches WHERE batch_id = ? LIMIT 1",
      args: [batchId],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return rowToBatch(result.rows[0]);
  } catch (error) {
    console.error("[batchService:turso] Error fetching batch:", error);
    throw error;
  }
}

/**
 * Get student count for a batch
 * @param batchId - Batch ID
 * @returns Number of students in batch
 */
export async function getBatchStudentCount(batchId: string): Promise<number> {
  try {
    const result = await db.execute({
      sql: `SELECT COUNT(*) as count FROM users
            WHERE batch_id = ? AND role = 'STUDENT'`,
      args: [batchId],
    });

    return (result.rows[0].count as number) || 0;
  } catch (error) {
    console.error(
      "[batchService:turso] Error fetching batch student count:",
      error
    );
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new batch
 * @param batchData - Batch data (without batchId)
 * @returns Created batch with generated batchId
 */
export async function createBatch(batchData: {
  teacherId: string;
  name: string;
  description?: string;
  currentLevel: CEFRLevel;
  startDate: number;
  endDate: number | null;
}): Promise<Batch> {
  try {
    const batchId = `BATCH_${Date.now()}`;
    const now = Date.now();

    const levelHistory: BatchLevelHistory[] = [
      {
        level: batchData.currentLevel,
        startDate: batchData.startDate,
        endDate: null,
        modifiedBy: batchData.teacherId,
      },
    ];

    const batch: Batch = {
      batchId,
      teacherId: batchData.teacherId,
      name: batchData.name,
      description: batchData.description,
      currentLevel: batchData.currentLevel,
      startDate: batchData.startDate,
      endDate: batchData.endDate,
      isActive: true,
      studentCount: 0,
      levelHistory,
      createdAt: now,
      updatedAt: now,
    };

    await db.execute({
      sql: `INSERT INTO batches (
              batch_id, teacher_id, name, description, current_level,
              start_date, end_date, is_active, student_count,
              level_history, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        batchId,
        batchData.teacherId,
        batchData.name,
        batchData.description || null,
        batchData.currentLevel,
        batchData.startDate,
        batchData.endDate,
        1, // is_active as integer (SQLite boolean)
        0,
        JSON.stringify(levelHistory),
        now,
        now,
      ],
    });

    return batch;
  } catch (error) {
    console.error("[batchService:turso] Error creating batch:", error);
    throw error;
  }
}

/**
 * Update batch details
 * @param batchId - Batch ID
 * @param updates - Partial batch data to update
 */
export async function updateBatch(
  batchId: string,
  updates: Partial<Batch>
): Promise<void> {
  try {
    const setClauses: string[] = [];
    const values: any[] = [];

    // Build dynamic SET clause
    if (updates.name !== undefined) {
      setClauses.push("name = ?");
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClauses.push("description = ?");
      values.push(updates.description);
    }
    if (updates.currentLevel !== undefined) {
      setClauses.push("current_level = ?");
      values.push(updates.currentLevel);
    }
    if (updates.startDate !== undefined) {
      setClauses.push("start_date = ?");
      values.push(updates.startDate);
    }
    if (updates.endDate !== undefined) {
      setClauses.push("end_date = ?");
      values.push(updates.endDate);
    }
    if (updates.isActive !== undefined) {
      setClauses.push("is_active = ?");
      values.push(updates.isActive ? 1 : 0);
    }
    if (updates.studentCount !== undefined) {
      setClauses.push("student_count = ?");
      values.push(updates.studentCount);
    }
    if (updates.levelHistory !== undefined) {
      setClauses.push("level_history = ?");
      values.push(JSON.stringify(updates.levelHistory));
    }

    if (setClauses.length === 0) {
      return; // Nothing to update
    }

    // Always update updated_at
    setClauses.push("updated_at = ?");
    values.push(Date.now());

    // Add WHERE clause batchId
    values.push(batchId);

    const sql = `UPDATE batches SET ${setClauses.join(
      ", "
    )} WHERE batch_id = ?`;

    await db.execute({ sql, args: values });
  } catch (error) {
    console.error("[batchService:turso] Error updating batch:", error);
    throw error;
  }
}

/**
 * Update batch level (adds to level history)
 * @param batchId - Batch ID
 * @param newLevel - New CEFR level
 * @param modifiedBy - Teacher's email
 * @param notes - Optional notes about the level change
 */
export async function updateBatchLevel(
  batchId: string,
  newLevel: CEFRLevel,
  modifiedBy: string,
  notes?: string
): Promise<void> {
  try {
    const currentBatch = await getBatch(batchId);
    if (!currentBatch) {
      throw new Error("Batch not found");
    }

    const now = Date.now();
    const updatedLevelHistory = [...currentBatch.levelHistory];

    // Close the current level period
    if (updatedLevelHistory.length > 0) {
      const lastIndex = updatedLevelHistory.length - 1;
      updatedLevelHistory[lastIndex] = {
        ...updatedLevelHistory[lastIndex],
        endDate: now,
      };
    }

    // Add new level to history
    const newLevelEntry: BatchLevelHistory = {
      level: newLevel,
      startDate: now,
      endDate: null,
      modifiedBy,
      notes,
    };
    updatedLevelHistory.push(newLevelEntry);

    await db.execute({
      sql: `UPDATE batches
            SET current_level = ?, level_history = ?, updated_at = ?
            WHERE batch_id = ?`,
      args: [newLevel, JSON.stringify(updatedLevelHistory), now, batchId],
    });
  } catch (error) {
    console.error("[batchService:turso] Error updating batch level:", error);
    throw error;
  }
}

/**
 * Archive/deactivate a batch
 * Marks as inactive instead of deleting
 * @param batchId - Batch ID
 */
export async function archiveBatch(batchId: string): Promise<void> {
  try {
    await db.execute({
      sql: `UPDATE batches
            SET is_active = ?, end_date = ?, updated_at = ?
            WHERE batch_id = ?`,
      args: [0, Date.now(), Date.now(), batchId],
    });
  } catch (error) {
    console.error("[batchService:turso] Error archiving batch:", error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function rowToBatch(row: any): Batch {
  return {
    batchId: row.batch_id as string,
    teacherId: row.teacher_id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    currentLevel: row.current_level as CEFRLevel,
    isActive: Boolean(row.is_active),
    startDate: row.start_date as number,
    endDate: row.end_date as number | null,
    studentCount: row.student_count as number,
    levelHistory: row.level_history
      ? JSON.parse(row.level_history as string)
      : [],
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}
