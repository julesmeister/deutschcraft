/**
 * Exercise Override Service - Database abstraction layer for teacher exercise overrides
 *
 * This service handles all exercise override operations (create, modify, hide, reorder).
 * Teachers can customize exercises globally for all their students.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Firestore operations are isolated here
 * - Hooks call these functions instead of using Firestore directly
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  ExerciseOverride,
  CreateExerciseOverrideInput,
  UpdateExerciseOverrideInput,
} from '../../models/exerciseOverride';
import { CEFRLevel } from '../../models/cefr';

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create a new exercise override
 * @param teacherEmail - Email of teacher creating the override
 * @param override - Override data
 * @returns Created exercise override
 */
export async function createExerciseOverride(
  teacherEmail: string,
  override: CreateExerciseOverrideInput
): Promise<ExerciseOverride> {
  try {
    const overrideId = `${teacherEmail}_${override.exerciseId}`;
    const overrideRef = doc(db, 'exercise-overrides', overrideId);

    const now = Date.now();
    const fullOverride: ExerciseOverride = {
      ...override,
      overrideId,
      teacherEmail,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(overrideRef, fullOverride);
    return fullOverride;
  } catch (error) {
    console.error('[exerciseOverrideService] Error creating override:', error);
    throw error;
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all overrides for a specific teacher
 * Optionally filter by level and lesson number
 * @param teacherEmail - Teacher's email
 * @param level - Optional CEFR level filter
 * @param lessonNumber - Optional lesson number filter
 * @returns Array of exercise overrides
 */
export async function getTeacherOverrides(
  teacherEmail: string,
  level?: CEFRLevel,
  lessonNumber?: number
): Promise<ExerciseOverride[]> {
  try {
    const overridesRef = collection(db, 'exercise-overrides');
    let q = query(overridesRef, where('teacherEmail', '==', teacherEmail));

    // Note: Additional filtering by level/lesson is done client-side
    // to avoid complex composite index requirements
    const snapshot = await getDocs(q);
    let overrides = snapshot.docs.map(doc => doc.data() as ExerciseOverride);

    // Client-side filtering
    if (level) {
      overrides = overrides.filter(
        o => o.level === level || o.exerciseData?.level === level
      );
    }

    if (lessonNumber !== undefined) {
      overrides = overrides.filter(
        o => o.lessonNumber === lessonNumber || o.exerciseData?.lessonNumber === lessonNumber
      );
    }

    return overrides;
  } catch (error) {
    console.error('[exerciseOverrideService] Error fetching overrides:', error);
    throw error;
  }
}

/**
 * Get a single override by ID
 * @param overrideId - Override document ID
 * @returns Exercise override or null if not found
 */
export async function getExerciseOverride(
  overrideId: string
): Promise<ExerciseOverride | null> {
  try {
    const overrideRef = doc(db, 'exercise-overrides', overrideId);
    const overrideDoc = await getDoc(overrideRef);

    if (!overrideDoc.exists()) {
      return null;
    }

    return overrideDoc.data() as ExerciseOverride;
  } catch (error) {
    console.error('[exerciseOverrideService] Error fetching override:', error);
    throw error;
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update an existing exercise override
 * @param overrideId - Override document ID
 * @param updates - Partial updates to apply
 * @returns Updated exercise override
 */
export async function updateExerciseOverride(
  overrideId: string,
  updates: UpdateExerciseOverrideInput
): Promise<ExerciseOverride> {
  try {
    const overrideRef = doc(db, 'exercise-overrides', overrideId);

    const updateData = {
      ...updates,
      updatedAt: Date.now(),
    };

    await updateDoc(overrideRef, updateData);

    // Fetch and return the updated override
    const updatedDoc = await getDoc(overrideRef);
    return updatedDoc.data() as ExerciseOverride;
  } catch (error) {
    console.error('[exerciseOverrideService] Error updating override:', error);
    throw error;
  }
}

/**
 * Bulk update display order for multiple exercises
 * Used when teacher reorders exercises via drag-and-drop
 * @param orderUpdates - Array of {overrideId, displayOrder, exerciseId, teacherEmail, level, lessonNumber} pairs
 */
export async function bulkUpdateDisplayOrder(
  orderUpdates: { overrideId: string; displayOrder: number; exerciseId?: string; teacherEmail?: string; level?: CEFRLevel; lessonNumber?: number }[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const now = Date.now();

    for (const { overrideId, displayOrder, exerciseId, teacherEmail, level, lessonNumber } of orderUpdates) {
      const ref = doc(db, 'exercise-overrides', overrideId);

      // Check if document exists
      const docSnap = await getDoc(ref);

      if (docSnap.exists()) {
        // Update existing document
        batch.update(ref, {
          displayOrder,
          updatedAt: now,
        });
      } else if (exerciseId && teacherEmail) {
        // Create new document with displayOrder override
        batch.set(ref, {
          overrideId,
          teacherEmail,
          exerciseId,
          overrideType: 'modify',
          level,
          lessonNumber,
          displayOrder,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await batch.commit();
  } catch (error) {
    console.error('[bulkUpdateDisplayOrder] Error bulk updating orders:', error);
    throw error;
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete an exercise override
 * @param overrideId - Override document ID
 */
export async function deleteExerciseOverride(overrideId: string): Promise<void> {
  try {
    const overrideRef = doc(db, 'exercise-overrides', overrideId);
    await deleteDoc(overrideRef);
  } catch (error) {
    console.error('[exerciseOverrideService] Error deleting override:', error);
    throw error;
  }
}

/**
 * Delete all overrides for a specific exercise (all teachers)
 * WARNING: This is a dangerous operation, use with caution
 * @param exerciseId - Exercise ID to delete overrides for
 */
export async function deleteOverridesByExercise(exerciseId: string): Promise<void> {
  try {
    const overridesRef = collection(db, 'exercise-overrides');
    const q = query(overridesRef, where('exerciseId', '==', exerciseId));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('[exerciseOverrideService] Error deleting overrides by exercise:', error);
    throw error;
  }
}
