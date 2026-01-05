/**
 * Smart Mini Exercise Service
 * Intelligent sentence selection and tracking with spaced repetition
 */

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { WritingSubmission, QuizBlank } from "@/lib/models/writing";
import {
  MiniExerciseSentence,
  MiniExerciseAttempt,
} from "@/lib/models/miniExercise";
import { generateQuizBlanks } from "@/lib/utils/quizGenerator";
import {
  splitIntoSentences,
  applyCorrectionsSentenceLevel,
  generateSentenceId,
  calculatePriority,
} from "./utils";

/**
 * Index all sentences from a submission
 * Called when a submission is reviewed/corrected
 */
export async function indexSubmissionSentences(
  submission: WritingSubmission
): Promise<void> {
  try {
    // Get corrected text
    let correctedText = "";
    let sourceType: "ai" | "teacher" | "reference" = "ai";

    if (submission.teacherCorrectedVersion) {
      correctedText = submission.teacherCorrectedVersion;
      sourceType = "teacher";
    } else if (submission.aiCorrectedVersion) {
      correctedText = submission.aiCorrectedVersion;
      sourceType = "ai";
    } else if (
      submission.aiFeedback &&
      submission.aiFeedback.grammarErrors.length > 0
    ) {
      correctedText = applyCorrectionsSentenceLevel(
        submission.content,
        submission.aiFeedback.grammarErrors
      );
      sourceType = "ai";
    } else {
      return;
    }

    // Split both original and corrected into sentences
    const originalSentences = splitIntoSentences(submission.content);
    const correctedSentences = splitIntoSentences(correctedText);

    const now = Date.now();

    // Index each sentence
    for (let i = 0; i < correctedSentences.length; i++) {
      const correctedSentence = correctedSentences[i];
      const originalSentence = originalSentences[i] || correctedSentence;

      // Generate blanks to check if this sentence has corrections
      const blanks = generateQuizBlanks(originalSentence, correctedSentence);

      // Only index sentences with corrections (blanks)
      if (blanks.length === 0) {
        continue;
      }

      const sentenceId = generateSentenceId(submission.submissionId, i);

      // Check if sentence already exists
      const sentenceDocRef = doc(db, "mini-exercise-sentences", sentenceId);
      const existingDoc = await getDoc(sentenceDocRef);

      if (existingDoc.exists()) {
        continue;
      }

      // Create new sentence record
      const sentenceData: Omit<MiniExerciseSentence, "sentenceId"> = {
        submissionId: submission.submissionId,
        userId: submission.userId,
        sentence: correctedSentence,
        originalSentence,
        sentenceIndex: i,
        exerciseId: submission.exerciseId,
        exerciseType: submission.exerciseType,
        sourceType,
        submittedAt: submission.submittedAt || submission.createdAt,
        timesShown: 0,
        timesCompleted: 0,
        totalCorrectAnswers: 0,
        totalBlanks: 0,
        totalPoints: 0,
        averageAccuracy: 0,
        consecutiveCorrect: 0,
        needsReview: true, // New sentences need review
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(sentenceDocRef, sentenceData);
    }
  } catch (error) {
    console.error("[smartMiniExercise] Error indexing sentences:", error);
    throw error;
  }
}

/**
 * Get smart sentence selection for practice
 * Uses spaced repetition and performance tracking
 */
export async function getSmartMiniExercise(userId: string): Promise<{
  sentence: string;
  originalSentence: string;
  blanks: QuizBlank[];
  sentenceId: string;
  submissionId: string;
  sourceType: "ai" | "teacher" | "reference";
  exerciseType: string;
  submittedAt: number;
} | null> {
  try {
    const sentencesRef = collection(db, "mini-exercise-sentences");
    // 1. Get new sentences (never shown)
    // Equality filters usually don't need composite index
    const qNew = query(
      sentencesRef,
      where("userId", "==", userId),
      where("timesShown", "==", 0),
      limit(20)
    );

    // 2. Get review sentences (shown long ago)
    // Requires composite index on [userId, lastShownAt]
    const qReview = query(
      sentencesRef,
      where("userId", "==", userId),
      orderBy("lastShownAt", "asc"),
      limit(30)
    );

    let allDocs = [];

    try {
      // Try to fetch both new and review items
      const [newSnapshot, reviewSnapshot] = await Promise.all([
        getDocs(qNew),
        getDocs(qReview),
      ]);
      allDocs = [...newSnapshot.docs, ...reviewSnapshot.docs];

      // If we have no docs from refined queries, try a fallback to ensure we find *something*
      // This handles the case where maybe indexes are missing or data is in a weird state
      if (allDocs.length === 0) {
        const qFallback = query(
          sentencesRef,
          where("userId", "==", userId),
          limit(50)
        );
        const fallbackSnapshot = await getDocs(qFallback);
        allDocs = fallbackSnapshot.docs;
      }
    } catch (error) {
      console.warn(
        "[smartMiniExercise] Advanced queries failed (likely missing index), using fallback:",
        error
      );
      // Fallback to simple query if indexes are missing
      const qFallback = query(
        sentencesRef,
        where("userId", "==", userId),
        limit(50)
      );
      const snapshot = await getDocs(qFallback);
      allDocs = snapshot.docs;
    }

    if (allDocs.length === 0) {
      return null;
    }

    // Calculate priority for each sentence
    const sentencesWithPriority = allDocs.map((doc) => {
      const sentence = {
        sentenceId: doc.id,
        ...doc.data(),
      } as MiniExerciseSentence;
      return {
        sentence,
        priority: calculatePriority(sentence),
      };
    });

    // Sort by priority (highest first)
    sentencesWithPriority.sort((a, b) => b.priority - a.priority);

    // Take top 10 and randomly select from them (to add variety)
    const topCandidates = sentencesWithPriority.slice(0, 10);
    const selected =
      topCandidates[Math.floor(Math.random() * topCandidates.length)];

    const sentence = selected.sentence;

    // Generate blanks
    const blanks = generateQuizBlanks(
      sentence.originalSentence,
      sentence.sentence
    );

    // Update timesShown
    const sentenceDocRef = doc(
      db,
      "mini-exercise-sentences",
      sentence.sentenceId
    );
    await updateDoc(sentenceDocRef, {
      timesShown: sentence.timesShown + 1,
      lastShownAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      sentence: sentence.sentence,
      originalSentence: sentence.originalSentence,
      blanks,
      sentenceId: sentence.sentenceId,
      submissionId: sentence.submissionId,
      sourceType: sentence.sourceType,
      exerciseId: sentence.exerciseId,
      exerciseTitle: sentence.exerciseTitle,
      exerciseType: sentence.exerciseType,
      submittedAt: sentence.submittedAt,
    };
  } catch (error) {
    console.error("[smartMiniExercise] Error getting smart exercise:", error);
    return null;
  }
}

/**
 * Record a practice attempt
 */
export async function recordMiniExerciseAttempt(
  sentenceId: string,
  userId: string,
  answers: Record<number, string>,
  correctAnswers: number,
  totalBlanks: number,
  points: number
): Promise<void> {
  try {
    const accuracy = Math.round((correctAnswers / totalBlanks) * 100);
    const now = Date.now();

    // 1. Create attempt record
    const attemptsRef = collection(db, "mini-exercise-attempts");
    const attemptData: Omit<MiniExerciseAttempt, "attemptId"> = {
      sentenceId,
      userId,
      answers,
      correctAnswers,
      totalBlanks,
      points,
      accuracy,
      completedAt: now,
      createdAt: now,
    };

    await addDoc(attemptsRef, attemptData);

    // 2. Update sentence statistics
    const sentenceDocRef = doc(db, "mini-exercise-sentences", sentenceId);
    const sentenceDoc = await getDoc(sentenceDocRef);

    if (!sentenceDoc.exists()) {
      console.error("[smartMiniExercise] Sentence not found:", sentenceId);
      return;
    }

    const sentence = sentenceDoc.data() as MiniExerciseSentence;

    // Calculate new averages
    const newTimesCompleted = sentence.timesCompleted + 1;
    const newTotalCorrectAnswers =
      sentence.totalCorrectAnswers + correctAnswers;
    const newTotalBlanks = sentence.totalBlanks + totalBlanks;
    const newTotalPoints = sentence.totalPoints + points;
    const newAverageAccuracy = Math.round(
      (newTotalCorrectAnswers / newTotalBlanks) * 100
    );

    // Update consecutive correct streak
    let newConsecutiveCorrect = sentence.consecutiveCorrect;
    if (accuracy === 100) {
      newConsecutiveCorrect += 1;
    } else {
      newConsecutiveCorrect = 0;
    }

    // Determine if needs review
    // Mastered = 3+ consecutive perfect attempts OR 90%+ accuracy after 5+ attempts
    const isMastered =
      newConsecutiveCorrect >= 3 ||
      (newTimesCompleted >= 5 && newAverageAccuracy >= 90);

    const needsReview = !isMastered;

    await updateDoc(sentenceDocRef, {
      timesCompleted: newTimesCompleted,
      totalCorrectAnswers: newTotalCorrectAnswers,
      totalBlanks: newTotalBlanks,
      totalPoints: newTotalPoints,
      averageAccuracy: newAverageAccuracy,
      consecutiveCorrect: newConsecutiveCorrect,
      needsReview,
      lastCompletedAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("[smartMiniExercise] Error recording attempt:", error);
    throw error;
  }
}
