/**
 * Writing Exercises Service
 * Handles fetching and managing writing exercises
 */

import { db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {
  TranslationExercise,
  CreativeWritingExercise,
  WritingExerciseType,
} from '../../models/writing';
import { CEFRLevel } from '../../models/cefr';

// ============================================================================
// WRITING EXERCISES
// ============================================================================

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
    const exercisesRef = collection(db, 'writing-exercises');
    let q;

    if (exerciseType) {
      q = query(
        exercisesRef,
        where('level', '==', level),
        where('type', '==', exerciseType),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        exercisesRef,
        where('level', '==', level),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      exerciseId: doc.id,
      ...doc.data(),
    })) as (TranslationExercise | CreativeWritingExercise)[];
  } catch (error) {
    console.error('[exercises] Error fetching writing exercises:', error);
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
    const exerciseRef = doc(db, 'writing-exercises', exerciseId);
    const exerciseSnap = await getDoc(exerciseRef);

    if (!exerciseSnap.exists()) return null;

    return {
      exerciseId: exerciseSnap.id,
      ...exerciseSnap.data(),
    } as TranslationExercise | CreativeWritingExercise;
  } catch (error) {
    console.error('[exercises] Error fetching writing exercise:', error);
    throw error;
  }
}
