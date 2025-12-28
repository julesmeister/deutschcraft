import { db } from "../../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
} from "firebase/firestore";
import { WritingStats, WritingProgress } from "../../../models/writing";

const WRITING_STATS_COLLECTION = "writing_stats";
const WRITING_PROGRESS_COLLECTION = "writing_progress";

export async function getWritingStats(userId: string): Promise<WritingStats> {
  const docRef = doc(db, WRITING_STATS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return {
      userId,
      totalExercisesCompleted: 0,
      totalTranslations: 0,
      totalCreativeWritings: 0,
      totalWordsWritten: 0,
      totalTimeSpent: 0,
      averageGrammarScore: 0,
      averageVocabularyScore: 0,
      averageCoherenceScore: 0,
      averageOverallScore: 0,
      exercisesByLevel: {},
      currentStreak: 0,
      longestStreak: 0,
      recentScores: [],
      updatedAt: Date.now(),
    };
  }

  return { userId, ...docSnap.data() } as WritingStats;
}

export async function updateWritingStats(
  userId: string,
  updates: Partial<WritingStats>
): Promise<void> {
  const docRef = doc(db, WRITING_STATS_COLLECTION, userId);
  await setDoc(docRef, { ...updates, updatedAt: Date.now() }, { merge: true });
}

export async function getWritingProgress(
  userId: string
): Promise<WritingProgress | null> {
  const docRef = doc(db, WRITING_PROGRESS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { userId, ...docSnap.data() } as WritingProgress;
}

export async function updateWritingProgress(
  userId: string,
  updates: Partial<WritingProgress>
): Promise<void> {
  const docRef = doc(db, WRITING_PROGRESS_COLLECTION, userId);
  await setDoc(docRef, { ...updates, updatedAt: Date.now() }, { merge: true });
}
