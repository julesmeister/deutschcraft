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
}

export async function savePracticeResult({
  userId,
  exerciseId,
  sentence,
  blank,
  isCorrect,
  points,
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

    // Revalidate paths if necessary (e.g. dashboard)
    revalidatePath("/dashboard");

    return { success: true, quizId: quiz.quizId };
  } catch (error) {
    return { success: false, error: "Failed to save result" };
  }
}
