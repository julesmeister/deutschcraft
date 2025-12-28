/**
 * Writing Exercises Service
 * Handles fetching and managing writing exercises
 */

import { db } from "../../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  TranslationExercise,
  CreativeWritingExercise,
  WritingExerciseType,
} from "../../../models/writing";
import { CEFRLevel } from "../../../models/cefr";

export async function getWritingExercises(
  level: CEFRLevel,
  exerciseType?: WritingExerciseType
): Promise<(TranslationExercise | CreativeWritingExercise)[]> {
  try {
    const exercisesRef = collection(db, "writing_exercises");
    let q = query(
      exercisesRef,
      where("level", "==", level),
      orderBy("createdAt", "desc")
    );

    if (exerciseType) {
      q = query(q, where("type", "==", exerciseType));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      exerciseId: doc.id,
      ...doc.data(),
    })) as (TranslationExercise | CreativeWritingExercise)[];
  } catch (error) {
    console.error("Error fetching writing exercises:", error);
    throw error;
  }
}

export async function getWritingExercise(
  exerciseId: string
): Promise<TranslationExercise | CreativeWritingExercise | null> {
  try {
    const docRef = doc(db, "writing_exercises", exerciseId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    return {
      exerciseId: docSnap.id,
      ...docSnap.data(),
    } as TranslationExercise | CreativeWritingExercise;
  } catch (error) {
    console.error("Error fetching writing exercise:", error);
    throw error;
  }
}
