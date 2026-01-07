"use server";

import {
  createReviewQuiz,
  completeReviewQuiz,
} from "@/lib/services/writing/reviewQuizService";
import { QuizBlank } from "@/lib/models/writing";
import { revalidatePath } from "next/cache";

interface SavePracticeResultParams {
  userId: string;
  exerciseId: string;
  sentence: string;
  blank: QuizBlank;
  isCorrect: boolean;
  points: number;
  itemNumber?: string;
  wordStartIndex?: number;
}

export async function savePracticeResult({
  userId,
  exerciseId,
  sentence,
  blank,
  isCorrect,
  points,
  itemNumber,
  wordStartIndex,
}: SavePracticeResultParams) {
  try {
    // 1. Create a quiz record
    // We treat this single sentence practice as a mini-quiz
    const quiz = await createReviewQuiz(
      undefined, // submissionId (optional for practice)
      userId,
      exerciseId,
      "practice", // exerciseType
      "reference", // sourceType
      sentence, // originalText
      sentence, // correctedText
      [blank] // blanks
    );

    // 2. Mark it as completed immediately
    const answers: Record<number, string> = {};
    if (isCorrect) {
      answers[blank.index] = blank.correctAnswer;
    }

    await completeReviewQuiz(quiz.quizId, answers, points, isCorrect ? 1 : 0);

    // 3. Update SRS stats if it's a marked word practice (Turso only optimization)
    if (
      process.env.NEXT_PUBLIC_USE_TURSO === "true" &&
      itemNumber &&
      wordStartIndex !== undefined
    ) {
      const { updateMarkedWordStats } = await import(
        "@/lib/services/turso/markedWordProgressService"
      );
      await updateMarkedWordStats(
        userId,
        exerciseId,
        itemNumber,
        wordStartIndex,
        isCorrect
      );
    }

    // Revalidate paths if necessary (e.g. dashboard)
    revalidatePath("/dashboard");

    return { success: true, quizId: quiz.quizId };
  } catch (error) {
    return { success: false, error: "Failed to save result" };
  }
}
