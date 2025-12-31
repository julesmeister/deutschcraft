/**
 * Mini Quiz Service
 * Saves quiz results from mini blank exercises
 */

import { ReviewQuiz, QuizBlank } from "@/lib/models/writing";

/**
 * Save mini quiz result
 */
export async function saveMiniQuizResult(
  userId: string,
  submissionId: string,
  sentence: string,
  blanks: QuizBlank[],
  answers: Record<number, string>,
  points: number,
  correctAnswers: number,
  originalExerciseId?: string,
  originalExerciseTitle?: string
): Promise<void> {
  const now = Date.now();

  const quizData: Omit<ReviewQuiz, "quizId" | "createdAt" | "updatedAt"> = {
    submissionId,
    userId,
    exerciseId: originalExerciseId || "mini-exercise", // Use original ID if available
    exerciseType: "translation", // Default type
    sourceType: "ai",
    originalText: sentence, // Use sentence as both original and corrected
    correctedText: sentence,
    blanks,
    answers,
    score: points, // Store points in the score field
    correctAnswers,
    totalBlanks: blanks.length,
    status: "completed",
    startedAt: now,
    completedAt: now,
  };

  // Add extra field if needed for backward compatibility or display
  if (originalExerciseTitle) {
    (quizData as any).exerciseTitle = originalExerciseTitle;
  }

  try {
    // Check if we're using Turso
    if (process.env.NEXT_PUBLIC_USE_TURSO === "true") {
      const { createReviewQuiz } = await import(
        "@/lib/services/turso/reviewQuizService"
      );
      await createReviewQuiz(quizData);
    } else {
      // Fallback to Firebase
      const { db } = await import("@/lib/firebase");
      const { collection, addDoc } = await import("firebase/firestore");

      const quizzesRef = collection(db, "writing-review-quizzes");

      const quiz: Omit<ReviewQuiz, "quizId"> = {
        ...quizData,
        createdAt: now,
        updatedAt: now,
      };

      await addDoc(quizzesRef, quiz);
    }
  } catch (error) {
    console.error("[miniQuizService] Error saving quiz result:", error);
    throw error;
  }
}
