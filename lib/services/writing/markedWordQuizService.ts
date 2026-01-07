/**
 * Marked Word Quiz Service
 * Generates quizzes from student-marked words in answers
 */

import { QuizBlank } from "@/lib/models/writing";
import {
  MarkedWord,
  StudentAnswerSubmission,
} from "@/lib/models/studentAnswers";

export interface MarkedWordQuizItem {
  sentence: string;
  blank: QuizBlank;
  exerciseId: string;
  itemNumber: string;
  sentenceId: string; // For tracking completion
}

export interface SRSStats {
  dueNow: number;
  waiting: {
    "1d": number;
    "3d": number;
    "7d": number;
    "14d": number;
    "30d": number;
  };
}

/**
 * Get optimized SRS data (Due items + Stats)
 * Uses persistent storage in Turso mode for performance
 */
export async function getOptimizedSRSData(
  studentId: string
): Promise<{ items: MarkedWordQuizItem[]; stats: SRSStats }> {
  const useTurso = process.env.NEXT_PUBLIC_USE_TURSO === "true";

  if (useTurso) {
    const { getDueMarkedWordsWithContext, getSRSStats } = await import(
      "@/lib/services/turso/markedWordProgressService"
    );

    const [dueItems, stats] = await Promise.all([
      getDueMarkedWordsWithContext(studentId),
      getSRSStats(studentId),
    ]);

    // Convert to MarkedWordQuizItem
    const quizItems: MarkedWordQuizItem[] = dueItems.map((item) => ({
      sentence: item.sentence,
      blank: {
        index: 0,
        correctAnswer: item.progress.word,
        position: item.progress.wordStartIndex,
        hint: `${item.progress.word.length} characters`,
      },
      exerciseId: item.progress.exerciseId,
      itemNumber: item.progress.itemNumber,
      sentenceId: `${item.progress.exerciseId}_${item.progress.itemNumber}_${item.progress.wordStartIndex}`,
    }));

    return { items: quizItems, stats };
  } else {
    // Firebase fallback (original logic)
    const items = await getMarkedWordsAsQuizItems(studentId, []);
    return calculateSRS(studentId, items);
  }
}

/**
 * Helper to fetch marked words and convert to quiz items
 */
export async function getMarkedWordsAsQuizItems(
  studentId: string,
  exerciseIds: string[]
): Promise<MarkedWordQuizItem[]> {
  const quizItems: MarkedWordQuizItem[] = [];

  // Get answers with marked words
  const useTurso = process.env.NEXT_PUBLIC_USE_TURSO === "true";
  let answersWithMarks: StudentAnswerSubmission[];

  if (useTurso) {
    const { getMarkedWordsForLesson } = await import(
      "@/lib/services/turso/studentAnswerService"
    );
    answersWithMarks = await getMarkedWordsForLesson(studentId, exerciseIds);
  } else {
    // Firebase: fetch answers and filter for marked words
    const { collection, query, where, getDocs } = await import(
      "firebase/firestore"
    );
    const { db } = await import("@/lib/firebase");

    const answersRef = collection(db, "studentAnswers");

    // Firestore has a limit of 10 items for 'in' queries
    if (!exerciseIds || exerciseIds.length === 0) {
      // Fetch all answers for student
      const q = query(answersRef, where("studentId", "==", studentId));
      const snapshot = await getDocs(q);
      const answers = snapshot.docs
        .map((doc) => doc.data() as StudentAnswerSubmission)
        .filter((a) => a.markedWords && a.markedWords.length > 0);
      answersWithMarks = answers;
    } else {
      const chunks = [];
      for (let i = 0; i < exerciseIds.length; i += 10) {
        chunks.push(exerciseIds.slice(i, i + 10));
      }

      answersWithMarks = [];
      for (const chunk of chunks) {
        const q = query(
          answersRef,
          where("studentId", "==", studentId),
          where("exerciseId", "in", chunk)
        );

        const snapshot = await getDocs(q);
        const answers = snapshot.docs
          .map((doc) => doc.data() as StudentAnswerSubmission)
          .filter((a) => a.markedWords && a.markedWords.length > 0);

        answersWithMarks.push(...answers);
      }
    }
  }

  // Generate quiz items (each marked word = one quiz item)
  for (const answer of answersWithMarks) {
    if (!answer.markedWords || answer.markedWords.length === 0) continue;

    for (const markedWord of answer.markedWords) {
      // Strip punctuation for answer checking
      const cleanWord = markedWord.word.replace(/[^\w\säöüÄÖÜß]+$/g, "");

      const blank: QuizBlank = {
        index: quizItems.length,
        correctAnswer: cleanWord,
        position: markedWord.startIndex,
        hint: `${cleanWord.length} characters`,
      };

      const sentenceId = `${answer.exerciseId}_${answer.itemNumber}_${markedWord.startIndex}`;

      quizItems.push({
        sentence: answer.studentAnswer,
        blank,
        exerciseId: answer.exerciseId,
        itemNumber: answer.itemNumber,
        sentenceId,
      });
    }
  }

  return quizItems;
}

/**
 * Calculate SRS stats and prioritize items
 */
export async function calculateSRS(
  studentId: string,
  quizItems: MarkedWordQuizItem[]
): Promise<{ items: MarkedWordQuizItem[]; stats: SRSStats }> {
  // Fetch past practice attempts to prioritize items
  const { getCompletedQuizzesForUser } = await import("./reviewQuizService");
  const history = await getCompletedQuizzesForUser(studentId);

  // Group attempts by word to calculate streak
  // Key: sentence + "|" + blankAnswer
  const attemptsMap = new Map<
    string,
    { timestamp: number; isCorrect: boolean }[]
  >();

  for (const quiz of history) {
    // We only care about single-blank practice quizzes
    if (!quiz.blanks || quiz.blanks.length !== 1) continue;

    const key = `${quiz.originalText}|${quiz.blanks[0].correctAnswer}`;
    const completedAt = quiz.completedAt || quiz.updatedAt || 0;
    const isCorrect = (quiz.correctAnswers || 0) > 0;

    if (!attemptsMap.has(key)) {
      attemptsMap.set(key, []);
    }
    attemptsMap.get(key)!.push({ timestamp: completedAt, isCorrect });
  }

  // Calculate stats for each word
  const wordStats = new Map<
    string,
    { lastAttempt: number; consecutiveCorrect: number }
  >();

  attemptsMap.forEach((attempts, key) => {
    // Sort by date descending (newest first)
    attempts.sort((a, b) => b.timestamp - a.timestamp);

    let consecutiveCorrect = 0;
    for (const attempt of attempts) {
      if (attempt.isCorrect) {
        consecutiveCorrect++;
      } else {
        break; // Stop at first failure
      }
    }

    wordStats.set(key, {
      lastAttempt: attempts[0].timestamp,
      consecutiveCorrect,
    });
  });

  const now = Date.now();
  const prioritizedItems: { item: MarkedWordQuizItem; priority: number }[] = [];

  const stats: SRSStats = {
    dueNow: 0,
    waiting: {
      "1d": 0,
      "3d": 0,
      "7d": 0,
      "14d": 0,
      "30d": 0,
    },
  };

  for (const item of quizItems) {
    const key = `${item.sentence}|${item.blank.correctAnswer}`;
    const wordStat = wordStats.get(key);

    let priority = 0;
    let isDue = false;

    if (!wordStat) {
      // Priority 3: Never attempted (New)
      priority = 3;
      isDue = true;
    } else {
      const hoursSince = (now - wordStat.lastAttempt) / (1000 * 60 * 60);

      // Determine required gap based on consecutive correct answers
      let requiredGapHours = 0;
      if (wordStat.consecutiveCorrect === 1) requiredGapHours = 24;
      else if (wordStat.consecutiveCorrect === 2) requiredGapHours = 24 * 3;
      else if (wordStat.consecutiveCorrect === 3) requiredGapHours = 24 * 7;
      else if (wordStat.consecutiveCorrect === 4) requiredGapHours = 24 * 14;
      else if (wordStat.consecutiveCorrect >= 5) requiredGapHours = 24 * 30;

      if (wordStat.consecutiveCorrect > 0) {
        if (hoursSince < requiredGapHours) {
          // Mastered recently enough: Skip and count as waiting
          if (requiredGapHours === 24) stats.waiting["1d"]++;
          else if (requiredGapHours === 24 * 3) stats.waiting["3d"]++;
          else if (requiredGapHours === 24 * 7) stats.waiting["7d"]++;
          else if (requiredGapHours === 24 * 14) stats.waiting["14d"]++;
          else if (requiredGapHours === 24 * 30) stats.waiting["30d"]++;

          continue;
        } else {
          // Priority 1: Due for review
          priority = 1;
          isDue = true;
        }
      } else {
        // Priority 2: Failed recently (Retry)
        priority = 2;
        isDue = true;
      }
    }

    if (isDue) {
      stats.dueNow++;
      prioritizedItems.push({ item, priority });
    }
  }

  // Shuffle first to ensure randomness within same priority groups
  const shuffledWithPriority = shuffleArray(prioritizedItems);

  // Sort by priority (descending: 3 -> 2 -> 1)
  shuffledWithPriority.sort((a, b) => b.priority - a.priority);

  return {
    items: shuffledWithPriority.map((x) => x.item),
    stats,
  };
}

/**
 * Generate quiz items from marked words
 */
export async function generateMarkedWordQuiz(
  studentId: string,
  exerciseIds: string[]
): Promise<{ items: MarkedWordQuizItem[]; stats: SRSStats }> {
  const useTurso = process.env.NEXT_PUBLIC_USE_TURSO === "true";

  if (useTurso) {
    const {
      getDueMarkedWordsForExercisesWithContext,
      getSRSStatsForExercises,
    } = await import("@/lib/services/turso/markedWordProgressService");

    const [dueItems, stats] = await Promise.all([
      getDueMarkedWordsForExercisesWithContext(studentId, exerciseIds),
      getSRSStatsForExercises(studentId, exerciseIds),
    ]);

    // Convert to MarkedWordQuizItem
    const quizItems: MarkedWordQuizItem[] = dueItems.map((item) => ({
      sentence: item.sentence,
      blank: {
        index: 0,
        correctAnswer: item.progress.word,
        position: item.progress.wordStartIndex,
        hint: `${item.progress.word.length} characters`,
      },
      exerciseId: item.progress.exerciseId,
      itemNumber: item.progress.itemNumber,
      sentenceId: `${item.progress.exerciseId}_${item.progress.itemNumber}_${item.progress.wordStartIndex}`,
    }));

    return { items: quizItems, stats };
  } else {
    // Legacy Firebase/JSON behavior
    const quizItems = await getMarkedWordsAsQuizItems(studentId, exerciseIds);
    return calculateSRS(studentId, quizItems);
  }
}

/**
 * Get only SRS stats for marked words without generating quiz
 */
export async function getSRSStats(
  studentId: string,
  exerciseIds: string[]
): Promise<SRSStats> {
  const useTurso = process.env.NEXT_PUBLIC_USE_TURSO === "true";

  if (useTurso) {
    const { getSRSStatsForExercises } = await import(
      "@/lib/services/turso/markedWordProgressService"
    );
    return getSRSStatsForExercises(studentId, exerciseIds);
  } else {
    const quizItems = await getMarkedWordsAsQuizItems(studentId, exerciseIds);
    const { stats } = await calculateSRS(studentId, quizItems);
    return stats;
  }
}

/**
 * Get count of marked words for a lesson
 */
export async function getMarkedWordCount(
  studentId: string,
  exerciseIds: string[]
): Promise<number> {
  const useTurso = process.env.NEXT_PUBLIC_USE_TURSO === "true";

  if (useTurso) {
    const { getMarkedWordsForLesson } = await import(
      "@/lib/services/turso/studentAnswerService"
    );
    const answers = await getMarkedWordsForLesson(studentId, exerciseIds);
    return answers.reduce((sum, a) => sum + (a.markedWords?.length || 0), 0);
  } else {
    // Firebase: fetch and count
    const { collection, query, where, getDocs } = await import(
      "firebase/firestore"
    );
    const { db } = await import("@/lib/firebase");

    const answersRef = collection(db, "studentAnswers");

    // Process in chunks
    const chunks = [];
    for (let i = 0; i < exerciseIds.length; i += 10) {
      chunks.push(exerciseIds.slice(i, i + 10));
    }

    let totalCount = 0;
    for (const chunk of chunks) {
      const q = query(
        answersRef,
        where("studentId", "==", studentId),
        where("exerciseId", "in", chunk)
      );

      const snapshot = await getDocs(q);
      const answers = snapshot.docs.map(
        (doc) => doc.data() as StudentAnswerSubmission
      );

      for (const answer of answers) {
        if (answer.markedWords) {
          totalCount += answer.markedWords.length;
        }
      }
    }

    return totalCount;
  }
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
