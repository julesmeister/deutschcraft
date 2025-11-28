/**
 * WritingStatsSection Component
 * Displays writing statistics for a student
 */

import { TabBar } from '@/components/ui/TabBar';
import { WritingStats } from '@/lib/models/writing';
import { useUserQuizStats } from '@/lib/hooks/useReviewQuizzes';

interface WritingStatsSectionProps {
  writingStats: WritingStats | null | undefined;
  studentEmail?: string | null;
}

export function WritingStatsSection({ writingStats, studentEmail }: WritingStatsSectionProps) {
  const { data: quizStats } = useUserQuizStats(studentEmail || null);

  // Combine writing stats and quiz stats into one row
  const allTabs = [
    {
      id: 'exercises',
      label: 'Total Exercises',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      value: writingStats?.totalExercisesCompleted.toLocaleString() || '0',
    },
    {
      id: 'words',
      label: 'Words Written',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      value: writingStats?.totalWordsWritten.toLocaleString() || '0',
    },
    {
      id: 'score',
      label: 'Avg Writing Score',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      value: `${writingStats?.averageOverallScore || 0}%`,
    },
    ...(quizStats && quizStats.totalQuizzes > 0 ? [{
      id: 'quiz-score',
      label: 'Avg Quiz Score',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      value: `${quizStats.averageScore}%`,
    }] : []),
    {
      id: 'writing-streak',
      label: 'Writing Streak',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      value: `${writingStats?.currentStreak || 0} days`,
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-6">Learning Progress</h2>
      <TabBar
        variant="stats"
        tabs={allTabs}
      />
    </div>
  );
}
