/**
 * useStudentDashboardStats Hook
 * Consolidates all stats calculations for the student dashboard
 */

import { useMemo } from 'react';
import { useStudyStats } from './useFlashcards';
import { useWritingStats } from './useWritingExercises';
import { useGrammarReviews } from './useGrammarExercises';
import { useAnswerHubStats } from './useAnswerHubStats';
import { StudentStatCardProps } from '@/components/dashboard/StudentStatsCard';

interface UseStudentDashboardStatsProps {
  userEmail?: string;
  currentLevelDisplay: string;
}

export function useStudentDashboardStats({
  userEmail,
  currentLevelDisplay,
}: UseStudentDashboardStatsProps) {
  // Get real-time study stats
  const { stats: studyStats } = useStudyStats(userEmail);

  // Get writing stats
  const { data: writingStats } = useWritingStats(userEmail);

  // Get grammar stats
  const { reviews: grammarReviews } = useGrammarReviews(userEmail);

  // Get Answer Hub stats
  const { stats: answerHubStats } = useAnswerHubStats(userEmail || null);

  // Calculate grammar statistics
  const grammarStats = useMemo(() => {
    if (!grammarReviews || grammarReviews.length === 0) {
      return {
        sentencesPracticed: 0,
        accuracyRate: 0,
      };
    }

    const sentencesPracticed = grammarReviews.filter(r => r.repetitions > 0).length;
    const totalCorrect = grammarReviews.reduce((sum, r) => sum + r.correctCount, 0);
    const totalIncorrect = grammarReviews.reduce((sum, r) => sum + r.incorrectCount, 0);
    const accuracyRate = totalCorrect + totalIncorrect > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;

    return {
      sentencesPracticed,
      accuracyRate,
    };
  }, [grammarReviews]);

  // Format Answer Hub last activity
  const answerHubLastActive = useMemo(() => {
    if (!answerHubStats.lastActivityAt) {
      return 'Never';
    }

    const lastActivity = new Date(answerHubStats.lastActivityAt);
    const now = new Date();
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return lastActivity.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }, [answerHubStats.lastActivityAt]);

  // Build stats array
  const stats: StudentStatCardProps[] = [
    { label: 'Words Learned', value: studyStats.cardsLearned, icon: '📚', color: 'text-violet-600' },
    { label: 'Words Mastered', value: studyStats.cardsMastered, icon: '✨', color: 'text-emerald-600' },
    { label: 'Writing Exercises', value: writingStats?.totalExercisesCompleted || 0, icon: '✍️', color: 'text-blue-600' },
    { label: 'Words Written', value: writingStats?.totalWordsWritten || 0, icon: '📝', color: 'text-purple-600' },
    { label: 'Current Streak', value: studyStats.streak, icon: '🔥', color: 'text-orange-600', suffix: ' days' },
    { label: 'Current Level', value: 0, displayValue: currentLevelDisplay, icon: '🎯', color: 'text-amber-600', isText: true },
    { label: 'Answer Hub Last Active', value: 0, displayValue: answerHubLastActive, icon: '🕐', color: 'text-indigo-600', isText: true },
    { label: 'Answer Hub Answers', value: answerHubStats.totalAnswersSubmitted || 0, icon: '💡', color: 'text-cyan-600' },
    { label: 'Grammar Sentences', value: grammarStats.sentencesPracticed, icon: '📝', color: 'text-teal-600' },
  ];

  return {
    stats,
    studyStats,
    writingStats,
  };
}
