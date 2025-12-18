/**
 * GrammarStatsSection Component
 * Displays grammar practice statistics for a student
 */

import { useMemo } from 'react';
import { useGrammarReviews } from '@/lib/hooks/useGrammarExercises';
import { TabBar } from '@/components/ui/TabBar';

interface GrammarStatsSectionProps {
  studentEmail?: string;
}

export function GrammarStatsSection({ studentEmail }: GrammarStatsSectionProps) {
  const { reviews, isLoading } = useGrammarReviews(studentEmail);

  // Calculate statistics from reviews
  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        sentencesPracticed: 0,
        rulesStudied: 0,
        averageMastery: 0,
        correctRate: 0,
      };
    }

    const sentencesPracticed = reviews.filter(r => r.repetitions > 0).length;
    const rulesStudied = new Set(reviews.map(r => r.ruleId)).size;
    const averageMastery = Math.round(
      reviews.reduce((sum, r) => sum + r.masteryLevel, 0) / reviews.length
    );

    const totalCorrect = reviews.reduce((sum, r) => sum + r.correctCount, 0);
    const totalIncorrect = reviews.reduce((sum, r) => sum + r.incorrectCount, 0);
    const correctRate = totalCorrect + totalIncorrect > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;

    return {
      sentencesPracticed,
      rulesStudied,
      averageMastery,
      correctRate,
    };
  }, [reviews]);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-6">Grammar Progress</h2>
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 mb-6">Grammar Progress</h2>
      <TabBar
        variant="stats"
        tabs={[
          {
            id: 'sentences',
            label: 'Sentences Practiced',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            value: stats.sentencesPracticed.toLocaleString(),
          },
          {
            id: 'rules',
            label: 'Rules Studied',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
            value: stats.rulesStudied.toLocaleString(),
          },
          {
            id: 'mastery',
            label: 'Average Mastery',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            value: `${stats.averageMastery}%`,
          },
          {
            id: 'accuracy',
            label: 'Accuracy Rate',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
            value: `${stats.correctRate}%`,
          },
        ]}
      />
    </div>
  );
}
