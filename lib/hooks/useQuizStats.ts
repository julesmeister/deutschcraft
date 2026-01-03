/**
 * Hook for Quiz Statistics
 * Fetches user's quiz performance stats
 */

import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ReviewQuiz } from '@/lib/models/writing';

export interface QuizStats {
  totalQuizzes: number;
  totalPoints: number;
  totalCorrectAnswers: number;
  totalBlanks: number;
}

/**
 * Calculate points for a quiz sentence
 * 10 points per correct answer
 */
export function calculateQuizPoints(correctAnswers: number, totalBlanks: number): number {
  if (totalBlanks === 0) return 0;
  // 10 points per correct answer (not proportional)
  return correctAnswers * 10;
}

/**
 * Get user's quiz statistics
 */
async function getUserQuizStats(userId: string): Promise<QuizStats> {
  const USE_TURSO = 
    process.env.NEXT_PUBLIC_DATABASE_PROVIDER === 'turso' || 
    process.env.NEXT_PUBLIC_DATABASE_TYPE === 'turso' || 
    process.env.NEXT_PUBLIC_USE_TURSO === 'true';

  if (USE_TURSO) {
    try {
      const { getUserQuizStats } = await import('@/lib/services/turso/reviewQuizService');
      return await getUserQuizStats(userId);
    } catch (error) {
      console.error('Error fetching quiz stats from Turso:', error);
      return {
        totalQuizzes: 0,
        totalPoints: 0,
        totalCorrectAnswers: 0,
        totalBlanks: 0,
      };
    }
  }

  try {
    const quizzesRef = collection(db, 'writing-review-quizzes');
    const q = query(
      quizzesRef,
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        totalQuizzes: 0,
        totalPoints: 0,
        totalCorrectAnswers: 0,
        totalBlanks: 0,
      };
    }

    let totalPoints = 0;
    let totalCorrectAnswers = 0;
    let totalBlanks = 0;

    snapshot.docs.forEach(doc => {
      const quiz = doc.data() as ReviewQuiz;
      // Calculate points for this quiz (10 points per sentence)
      const points = calculateQuizPoints(quiz.correctAnswers, quiz.totalBlanks);
      totalPoints += points;
      totalCorrectAnswers += quiz.correctAnswers;
      totalBlanks += quiz.totalBlanks;
    });

    return {
      totalQuizzes: snapshot.size,
      totalPoints,
      totalCorrectAnswers,
      totalBlanks,
    };
  } catch (error) {
    console.error('Error fetching quiz stats:', error);
    return {
      totalQuizzes: 0,
      totalPoints: 0,
      totalCorrectAnswers: 0,
      totalBlanks: 0,
    };
  }
}

export function useQuizStats(userId?: string) {
  return useQuery({
    queryKey: ['user-quiz-stats', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await getUserQuizStats(userId);
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
}
