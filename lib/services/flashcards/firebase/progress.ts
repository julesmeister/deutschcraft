/**
 * Progress Service Module - Flashcard Progress Tracking
 *
 * This module handles all flashcard progress read/write operations.
 * Separated from flashcardService.ts to maintain files under 300 lines.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 */

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
  orderBy,
  limit as firestoreLimit,
  increment,
} from "firebase/firestore";
import {
  FlashcardProgress,
  StudyProgress,
  CardState,
  CategoryStats,
} from "../../../models";
import {
  getVocabularyMetadata,
  getDisplayCategories,
} from "@/lib/services/vocabularyData";

// ============================================================================
// READ OPERATIONS - Progress
// ============================================================================

/**
 * Get flashcard progress for a user
 * @param userId - User's email
 * @returns Array of flashcard progress objects
 */
export async function getFlashcardProgress(
  userId: string
): Promise<FlashcardProgress[]> {
  try {
    const progressRef = collection(db, "flashcard-progress");
    const q = query(
      progressRef,
      where("userId", "==", userId),
      firestoreLimit(2000) // Increased limit to fetch all progress
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data()) as FlashcardProgress[];
  } catch (error) {
    console.error(
      "[flashcardService] Error fetching flashcard progress:",
      error
    );
    throw error;
  }
}

/**
 * Get single flashcard progress
 * @param userId - User's email
 * @param flashcardId - Flashcard ID
 * @returns Flashcard progress object or null
 */
export async function getSingleFlashcardProgress(
  userId: string,
  flashcardId: string
): Promise<FlashcardProgress | null> {
  try {
    const progressId = `${userId}_${flashcardId}`;
    const progressRef = doc(db, "flashcard-progress", progressId);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      return null;
    }

    return progressDoc.data() as FlashcardProgress;
  } catch (error) {
    console.error(
      "[flashcardService] Error fetching single flashcard progress:",
      error
    );
    throw error;
  }
}

/**
 * Get study progress for a user (last 30 days)
 * @param userId - User's email
 * @returns Array of study progress objects
 */
export async function getStudyProgress(
  userId: string
): Promise<StudyProgress[]> {
  try {
    const studyProgressRef = collection(db, "progress");
    const q = query(
      studyProgressRef,
      where("userId", "==", userId),
      orderBy("date", "desc"),
      firestoreLimit(30)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data()) as StudyProgress[];
  } catch (error) {
    console.error("[flashcardService] Error fetching study progress:", error);
    throw error;
  }
}

/**
 * Get flashcard progress by card state
 * @param userId - User's email
 * @param state - Card state to filter by
 * @param limit - Maximum number of cards to return
 * @returns Array of flashcard progress objects
 */
export async function getFlashcardProgressByState(
  userId: string,
  state: CardState,
  limit = 100
): Promise<FlashcardProgress[]> {
  try {
    const progressRef = collection(db, "flashcard-progress");
    const q = query(
      progressRef,
      where("userId", "==", userId),
      where("state", "==", state),
      orderBy("nextReviewDate", "asc"),
      firestoreLimit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data()) as FlashcardProgress[];
  } catch (error) {
    console.error(
      "[flashcardService] Error fetching flashcard progress by state:",
      error
    );
    throw error;
  }
}

/**
 * Get due flashcards for review
 * @param userId - User's email
 * @param limit - Maximum number of cards to return
 * @returns Array of flashcard progress objects that are due for review
 */
export async function getDueFlashcards(
  userId: string,
  limit = 100
): Promise<FlashcardProgress[]> {
  try {
    const now = Date.now();
    const progressRef = collection(db, "flashcard-progress");
    const q = query(
      progressRef,
      where("userId", "==", userId),
      where("nextReviewDate", "<=", now),
      orderBy("nextReviewDate", "asc"),
      firestoreLimit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data()) as FlashcardProgress[];
  } catch (error) {
    console.error("[flashcardService] Error fetching due flashcards:", error);
    throw error;
  }
}

/**
 * Get struggling flashcards
 * Uses multiple criteria to identify struggling cards
 * @param userId - User's email
 * @param limit - Maximum number of cards to return
 * @returns Array of flashcard progress objects for struggling cards
 */
export async function getStrugglingFlashcards(
  userId: string,
  limit = 100
): Promise<FlashcardProgress[]> {
  try {
    // Get all user progress and filter in-memory (since we need OR logic)
    const allProgress = await getFlashcardProgress(userId);

    // Filter for struggling cards
    const struggling = allProgress.filter(
      (progress) =>
        progress.masteryLevel < 40 ||
        progress.consecutiveIncorrect >= 2 ||
        progress.lapseCount >= 3 ||
        progress.state === "lapsed" ||
        progress.state === "relearning"
    );

    // Sort by mastery level (lowest first) and limit
    return struggling
      .sort((a, b) => a.masteryLevel - b.masteryLevel)
      .slice(0, limit);
  } catch (error) {
    console.error(
      "[flashcardService] Error fetching struggling flashcards:",
      error
    );
    throw error;
  }
}

/**
 * Get flashcard progress grouped by category
 * Uses static JSON data for vocabulary metadata to avoid expensive Firestore lookups
 * @param userId - User's email
 * @returns Array of category statistics
 */
export async function getCategoryProgress(
  userId: string
): Promise<CategoryStats[]> {
  try {
    // 1. Fetch user's progress
    const progressData = await getFlashcardProgress(userId);

    if (progressData.length === 0) {
      return [];
    }

    // 2. Aggregate stats using in-memory metadata lookup
    const statsMap = new Map<
      string,
      { total: number; learned: number; mastered: number }
    >();

    for (const progress of progressData) {
      // Look up metadata from JSON file instead of DB
      const metadata = getVocabularyMetadata(progress.wordId);
      const tags = getDisplayCategories(metadata);

      for (const tag of tags) {
        const current = statsMap.get(tag) || {
          total: 0,
          learned: 0,
          mastered: 0,
        };

        current.total++;
        if ((progress.repetitions || 0) > 0) current.learned++;
        if ((progress.masteryLevel || 0) >= 70) current.mastered++;

        statsMap.set(tag, current);
      }
    }

    // 3. Convert to array and sort
    const statsArray: CategoryStats[] = Array.from(statsMap.entries()).map(
      ([category, stats]) => ({
        category,
        total: stats.total,
        learned: stats.learned,
        mastered: stats.mastered,
        percentage: stats.total
          ? Math.round((stats.learned / stats.total) * 100)
          : 0,
      })
    );

    // Sort by learned count descending
    return statsArray.sort((a, b) => b.learned - a.learned);
  } catch (error) {
    console.error(
      "[flashcardService] Error fetching category progress:",
      error
    );
    throw error;
  }
}

// ============================================================================
// WRITE OPERATIONS - Progress
// ============================================================================

/**
 * Save or update flashcard progress
 * @param progressId - Combined ID (userId_flashcardId)
 * @param progressData - Flashcard progress data
 */
export async function saveFlashcardProgress(
  progressId: string,
  progressData: Partial<FlashcardProgress>
): Promise<void> {
  try {
    const progressRef = doc(db, "flashcard-progress", progressId);
    const progressDoc = await getDoc(progressRef);

    // Filter out undefined values (Firestore doesn't accept undefined)
    const cleanData = Object.fromEntries(
      Object.entries(progressData).filter(([_, value]) => value !== undefined)
    );

    if (progressDoc.exists()) {
      // Update existing progress
      await updateDoc(progressRef, {
        ...cleanData,
        updatedAt: Date.now(),
      } as any);
    } else {
      // Create new progress
      await setDoc(progressRef, {
        ...cleanData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.error("[flashcardService] Error saving flashcard progress:", error);
    throw error;
  }
}

/**
 * Save or update daily study progress
 * @param userId - User's email
 * @param stats - Study statistics
 */
export async function saveDailyProgress(
  userId: string,
  stats: {
    cardsReviewed: number;
    timeSpent: number;
    correctCount: number;
    incorrectCount: number;
  }
): Promise<void> {
  try {
    // Format: PROG_YYYYMMDD_email
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const progressId = `PROG_${today}_${userId}`;
    const progressRef = doc(db, "progress", progressId);

    // Get existing progress for today
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
      // Update existing progress (increment)
      await updateDoc(progressRef, {
        cardsReviewed: increment(stats.cardsReviewed),
        timeSpent: increment(stats.timeSpent),
        wordsCorrect: increment(stats.correctCount),
        wordsIncorrect: increment(stats.incorrectCount),
        sessionsCompleted: increment(1),
      });
    } else {
      // Create new progress entry
      await setDoc(progressRef, {
        progressId,
        userId,
        date: new Date().toISOString().split("T")[0],
        wordsStudied: stats.cardsReviewed,
        wordsCorrect: stats.correctCount,
        wordsIncorrect: stats.incorrectCount,
        timeSpent: stats.timeSpent,
        sessionsCompleted: 1,
        cardsReviewed: stats.cardsReviewed,
        sentencesCreated: 0,
        createdAt: Date.now(),
      });
    }
  } catch (error) {
    console.error("[flashcardService] Error saving daily progress:", error);
    throw error;
  }
}
