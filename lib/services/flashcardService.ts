/**
 * Flashcard Service - Database abstraction layer for flashcard operations
 *
 * This service handles flashcard, vocabulary, and progress operations.
 * To switch databases, only this file needs to be modified.
 *
 * Pattern: Service Layer (Database Agnostic Interface)
 * - All Firestore operations are isolated here
 * - Hooks call these functions instead of using Firestore directly
 * - Easy to swap to PostgreSQL/MongoDB by changing implementation
 */

import { db } from '../firebase';
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
} from 'firebase/firestore';
import {
  Flashcard,
  FlashcardProgress,
  VocabularyWord,
  StudyProgress,
} from '../models';
import { CEFRLevel } from '../models/cefr';

// ============================================================================
// READ OPERATIONS - Flashcards
// ============================================================================

/**
 * Get flashcards by level
 * @param level - CEFR level (A1-C2)
 * @returns Array of flashcard objects
 */
export async function getFlashcardsByLevel(level: CEFRLevel): Promise<Flashcard[]> {
  try {
    const flashcardsRef = collection(db, 'flashcards');
    const q = query(
      flashcardsRef,
      where('level', '==', level),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Flashcard[];
  } catch (error) {
    console.error('[flashcardService] Error fetching flashcards:', error);
    throw error;
  }
}

/**
 * Get vocabulary word by ID
 * @param wordId - Vocabulary word ID
 * @returns Vocabulary word object or null
 */
export async function getVocabularyWord(wordId: string): Promise<VocabularyWord | null> {
  try {
    const vocabRef = doc(db, 'vocabulary', wordId);
    const vocabDoc = await getDoc(vocabRef);

    if (!vocabDoc.exists()) {
      return null;
    }

    return vocabDoc.data() as VocabularyWord;
  } catch (error) {
    console.error('[flashcardService] Error fetching vocabulary word:', error);
    throw error;
  }
}

/**
 * Get all vocabulary words by level
 * @param level - CEFR level (A1-C2)
 * @returns Array of vocabulary words
 */
export async function getVocabularyByLevel(level: CEFRLevel): Promise<VocabularyWord[]> {
  try {
    const vocabRef = collection(db, 'vocabulary');
    const q = query(vocabRef, where('level', '==', level));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data()) as VocabularyWord[];
  } catch (error) {
    console.error('[flashcardService] Error fetching vocabulary:', error);
    throw error;
  }
}

// ============================================================================
// READ OPERATIONS - Progress
// ============================================================================

/**
 * Get flashcard progress for a user
 * @param userId - User's email
 * @returns Array of flashcard progress objects
 */
export async function getFlashcardProgress(userId: string): Promise<FlashcardProgress[]> {
  try {
    const progressRef = collection(db, 'flashcard-progress');
    const q = query(
      progressRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data()) as FlashcardProgress[];
  } catch (error) {
    console.error('[flashcardService] Error fetching flashcard progress:', error);
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
    const progressRef = doc(db, 'flashcard-progress', progressId);
    const progressDoc = await getDoc(progressRef);

    if (!progressDoc.exists()) {
      return null;
    }

    return progressDoc.data() as FlashcardProgress;
  } catch (error) {
    console.error('[flashcardService] Error fetching single flashcard progress:', error);
    throw error;
  }
}

/**
 * Get study progress for a user (last 30 days)
 * @param userId - User's email
 * @returns Array of study progress objects
 */
export async function getStudyProgress(userId: string): Promise<StudyProgress[]> {
  try {
    const studyProgressRef = collection(db, 'progress');
    const q = query(
      studyProgressRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      firestoreLimit(30)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data()) as StudyProgress[];
  } catch (error) {
    console.error('[flashcardService] Error fetching study progress:', error);
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
    const progressRef = doc(db, 'flashcard-progress', progressId);
    const progressDoc = await getDoc(progressRef);

    if (progressDoc.exists()) {
      // Update existing progress
      await updateDoc(progressRef, {
        ...progressData,
        updatedAt: Date.now(),
      } as any);
    } else {
      // Create new progress
      await setDoc(progressRef, {
        ...progressData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.error('[flashcardService] Error saving flashcard progress:', error);
    throw error;
  }
}

/**
 * Get practice statistics for a user
 * - Cards ready for practice (next review date is today or earlier)
 * - Words to review (cards reviewed but need another look)
 * @param userId - User's email
 * @returns Practice statistics
 */
export async function getPracticeStats(userId: string): Promise<{
  cardsReady: number;
  wordsToReview: number;
  totalCards: number;
}> {
  try {
    const progressRef = collection(db, 'flashcards');
    const q = query(
      progressRef,
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    let cardsReady = 0;
    let wordsToReview = 0;
    const now = Date.now();

    snapshot.docs.forEach((doc) => {
      const data = doc.data() as FlashcardProgress;

      // Check if card is due for review
      if (data.nextReviewDate && data.nextReviewDate <= now) {
        cardsReady++;
      }

      // Count words that have been reviewed at least once but aren't mastered
      if (data.correctCount > 0 && data.masteryLevel < 80) {
        wordsToReview++;
      }
    });

    return {
      cardsReady,
      wordsToReview,
      totalCards: snapshot.size,
    };
  } catch (error) {
    console.error('[flashcardService] Error getting practice stats:', error);
    throw error;
  }
}

/**
 * Get comprehensive study statistics for a user
 * - Total cards in progress
 * - Cards learned (reviewed at least once)
 * - Cards mastered (70%+ mastery level)
 * - Current study streak
 * - Overall accuracy percentage
 * @param userId - User's email
 * @returns Study statistics
 */
export async function getStudyStats(userId: string): Promise<{
  totalCards: number;
  cardsLearned: number;
  cardsMastered: number;
  streak: number;
  accuracy: number;
}> {
  try {
    // Import progressService for streak calculation
    const { fetchUserProgress, calculateStreak } = await import('./progressService');

    // Fetch flashcard progress
    const progressData = await getFlashcardProgress(userId);

    // Calculate stats from flashcard progress
    const totalCards = progressData.length;
    // Cards Learned = cards that have been reviewed at least once (repetitions > 0)
    const cardsLearned = progressData.filter(p => (p.repetitions || 0) > 0).length;
    // Cards Mastered = cards with 70%+ mastery
    const cardsMastered = progressData.filter(p => p.masteryLevel >= 70).length;

    const totalCorrect = progressData.reduce((sum, p) => sum + (p.correctCount || 0), 0);
    const totalIncorrect = progressData.reduce((sum, p) => sum + (p.incorrectCount || 0), 0);
    const totalAttempts = totalCorrect + totalIncorrect;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;

    // Fetch study progress for streak calculation
    const studyProgressData = await fetchUserProgress(userId, 30);
    const streak = calculateStreak(studyProgressData);

    return {
      totalCards,
      cardsLearned,
      cardsMastered,
      streak,
      accuracy,
    };
  } catch (error) {
    console.error('[flashcardService] Error getting study stats:', error);
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
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const progressId = `PROG_${today}_${userId}`;
    const progressRef = doc(db, 'progress', progressId);

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
        date: new Date().toISOString().split('T')[0],
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
    console.error('[flashcardService] Error saving daily progress:', error);
    throw error;
  }
}

// ============================================================================
// POSTGRESQL MIGRATION EXAMPLE (commented out)
// ============================================================================

/*
// To switch to PostgreSQL, replace the implementations above with:

import { sql } from '@vercel/postgres';

export async function getFlashcardsByLevel(level: CEFRLevel): Promise<Flashcard[]> {
  const result = await sql`
    SELECT * FROM flashcards
    WHERE level = ${level}
    ORDER BY created_at DESC
  `;

  return result.rows as Flashcard[];
}

export async function getFlashcardProgress(userId: string): Promise<FlashcardProgress[]> {
  const result = await sql`
    SELECT * FROM flashcard_progress
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `;

  return result.rows as FlashcardProgress[];
}

export async function saveFlashcardProgress(
  progressId: string,
  progressData: Partial<FlashcardProgress>
): Promise<void> {
  const { userId, flashcardId, wordId, repetitions, easeFactor, interval, nextReviewDate, masteryLevel, correctCount, incorrectCount } = progressData;

  await sql`
    INSERT INTO flashcard_progress (
      id, user_id, flashcard_id, word_id, repetitions, ease_factor, interval,
      next_review_date, mastery_level, correct_count, incorrect_count, updated_at
    )
    VALUES (
      ${progressId}, ${userId}, ${flashcardId}, ${wordId}, ${repetitions}, ${easeFactor}, ${interval},
      ${nextReviewDate}, ${masteryLevel}, ${correctCount}, ${incorrectCount}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      repetitions = EXCLUDED.repetitions,
      ease_factor = EXCLUDED.ease_factor,
      interval = EXCLUDED.interval,
      next_review_date = EXCLUDED.next_review_date,
      mastery_level = EXCLUDED.mastery_level,
      correct_count = EXCLUDED.correct_count,
      incorrect_count = EXCLUDED.incorrect_count,
      updated_at = NOW()
  `;
}

export async function saveDailyProgress(
  userId: string,
  stats: {
    cardsReviewed: number;
    timeSpent: number;
    correctCount: number;
    incorrectCount: number;
  }
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const progressId = `PROG_${today.replace(/-/g, '')}_${userId}`;

  await sql`
    INSERT INTO progress (
      id, user_id, date, cards_reviewed, time_spent, words_correct, words_incorrect, sessions_completed
    )
    VALUES (
      ${progressId}, ${userId}, ${today}, ${stats.cardsReviewed}, ${stats.timeSpent},
      ${stats.correctCount}, ${stats.incorrectCount}, 1
    )
    ON CONFLICT (id) DO UPDATE SET
      cards_reviewed = progress.cards_reviewed + EXCLUDED.cards_reviewed,
      time_spent = progress.time_spent + EXCLUDED.time_spent,
      words_correct = progress.words_correct + EXCLUDED.words_correct,
      words_incorrect = progress.words_incorrect + EXCLUDED.words_incorrect,
      sessions_completed = progress.sessions_completed + 1
  `;
}
*/
