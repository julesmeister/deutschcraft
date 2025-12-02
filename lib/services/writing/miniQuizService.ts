/**
 * Mini Quiz Service
 * Saves quiz results from mini blank exercises
 */

import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ReviewQuiz, QuizBlank } from '@/lib/models/writing';

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
  correctAnswers: number
): Promise<void> {
  try {
    const quizzesRef = collection(db, 'writing-review-quizzes');
    const now = Date.now();

    const quiz: Omit<ReviewQuiz, 'quizId'> = {
      submissionId,
      userId,
      exerciseId: 'mini-exercise', // Special ID for mini exercises
      exerciseType: 'translation', // Default type
      sourceType: 'ai',
      originalText: sentence, // Use sentence as both original and corrected
      correctedText: sentence,
      blanks,
      answers,
      score: points, // Store points in the score field
      correctAnswers,
      totalBlanks: blanks.length,
      status: 'completed',
      startedAt: now,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    await addDoc(quizzesRef, quiz);
    console.log('[miniQuizService] Quiz result saved:', { points, correctAnswers, totalBlanks: blanks.length });
  } catch (error) {
    console.error('[miniQuizService] Error saving quiz result:', error);
    throw error;
  }
}
