/**
 * Batch Service - Database abstraction layer for batch operations
 *
 * This service handles all batch (class group) operations.
 * To switch databases, only this file needs to be modified.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Firestore operations are isolated here
 * - Hooks call these functions instead of using Firestore directly
 * - Easy to swap to PostgreSQL/MongoDB by changing implementation
 */

import { db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { Batch, CEFRLevel, BatchLevelHistory } from "../../models";

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all batches for a teacher
 * @param teacherEmail - Teacher's email
 * @returns Array of batches with updated student counts
 */
export async function getBatchesByTeacher(
  teacherEmail: string
): Promise<Batch[]> {
  try {
    const batchesRef = collection(db, "batches");
    const q = query(batchesRef, where("teacherId", "==", teacherEmail));
    const snapshot = await getDocs(q);

    const batches = snapshot.docs.map((doc) => ({
      batchId: doc.id,
      ...doc.data(),
    })) as Batch[];

    // Calculate student count for each batch
    const batchesWithCounts = await Promise.all(
      batches.map(async (batch) => {
        const studentCount = await getBatchStudentCount(batch.batchId);
        return {
          ...batch,
          studentCount,
        };
      })
    );

    // Sort by createdAt DESC (Newest first)
    return batchesWithCounts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("[batchService] Error fetching batches by teacher:", error);
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
    const batchRef = doc(db, "batches", batchId);
    const batchDoc = await getDoc(batchRef);

    if (!batchDoc.exists()) {
      return null;
    }

    return {
      batchId: batchDoc.id,
      ...batchDoc.data(),
    } as Batch;
  } catch (error) {
    console.error("[batchService] Error fetching batch:", error);
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
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("batchId", "==", batchId),
      where("role", "==", "STUDENT")
    );
    const snapshot = await getDocs(q);

    return snapshot.size;
  } catch (error) {
    console.error("[batchService] Error fetching batch student count:", error);
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
    const batchRef = doc(db, "batches", batchId);

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
      levelHistory: [
        {
          level: batchData.currentLevel,
          startDate: batchData.startDate,
          endDate: null,
          modifiedBy: batchData.teacherId,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(batchRef, batch);
    return batch;
  } catch (error) {
    console.error("[batchService] Error creating batch:", error);
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
    const batchRef = doc(db, "batches", batchId);
    await updateDoc(batchRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("[batchService] Error updating batch:", error);
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

    const batchRef = doc(db, "batches", batchId);
    await updateDoc(batchRef, {
      currentLevel: newLevel,
      levelHistory: updatedLevelHistory,
      updatedAt: now,
    });
  } catch (error) {
    console.error("[batchService] Error updating batch level:", error);
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
    const batchRef = doc(db, "batches", batchId);
    await updateDoc(batchRef, {
      isActive: false,
      endDate: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error("[batchService] Error archiving batch:", error);
    throw error;
  }
}

// ============================================================================
// POSTGRESQL MIGRATION EXAMPLE (commented out)
// ============================================================================

/*
// To switch to PostgreSQL, replace the implementations above with:

import { sql } from '@vercel/postgres';

export async function getBatchesByTeacher(teacherEmail: string): Promise<Batch[]> {
  const result = await sql`
    SELECT * FROM batches
    WHERE teacher_id = ${teacherEmail}
    ORDER BY created_at DESC
  `;

  return result.rows as Batch[];
}

export async function getBatch(batchId: string): Promise<Batch | null> {
  const result = await sql`
    SELECT * FROM batches
    WHERE batch_id = ${batchId}
    LIMIT 1
  `;

  return result.rows.length > 0 ? result.rows[0] as Batch : null;
}

export async function getBatchStudentCount(batchId: string): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) as count FROM users
    WHERE batch_id = ${batchId} AND role = 'STUDENT'
  `;

  return result.rows[0].count;
}

export async function createBatch(batchData: {
  teacherId: string;
  name: string;
  description?: string;
  currentLevel: CEFRLevel;
  startDate: number;
  endDate: number | null;
}): Promise<Batch> {
  const batchId = `BATCH_${Date.now()}`;

  const result = await sql`
    INSERT INTO batches (
      batch_id, teacher_id, name, description, current_level,
      start_date, end_date, is_active, student_count,
      level_history, created_at, updated_at
    )
    VALUES (
      ${batchId}, ${batchData.teacherId}, ${batchData.name},
      ${batchData.description}, ${batchData.currentLevel},
      ${batchData.startDate}, ${batchData.endDate}, true, 0,
      ${JSON.stringify([{
        level: batchData.currentLevel,
        startDate: batchData.startDate,
        endDate: null,
        modifiedBy: batchData.teacherId,
      }])},
      NOW(), NOW()
    )
    RETURNING *
  `;

  return result.rows[0] as Batch;
}

export async function updateBatch(batchId: string, updates: Partial<Batch>): Promise<void> {
  const fields = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');

  const values = [batchId, ...Object.values(updates)];

  await sql.query(
    `UPDATE batches SET ${fields}, updated_at = NOW() WHERE batch_id = $1`,
    values
  );
}

export async function archiveBatch(batchId: string): Promise<void> {
  await sql`
    UPDATE batches
    SET is_active = false, end_date = NOW(), updated_at = NOW()
    WHERE batch_id = ${batchId}
  `;
}
*/
