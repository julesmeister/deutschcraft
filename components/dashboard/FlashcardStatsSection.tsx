/**
 * FlashcardStatsSection Component
 * Displays flashcard statistics for a student
 */

import { TabBar } from '@/components/ui/TabBar';

interface StudyStats {
  totalCards: number;
  cardsLearned: number;
  cardsMastered: number;
  streak: number;
  accuracy: number;
}

interface FlashcardStatsSectionProps {
  stats: StudyStats;
}

export function FlashcardStatsSection({ stats }: FlashcardStatsSectionProps) {
  return (
    <>
      {/* Learning Progress TabBar */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-6">Learning Progress</h2>
        <TabBar
          variant="stats"
          tabs={[
            {
              id: 'total',
              label: 'Total Cards',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ),
              value: stats.totalCards.toLocaleString(),
            },
            {
              id: 'mastered',
              label: 'Cards Mastered',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              value: stats.cardsMastered.toLocaleString(),
            },
            {
              id: 'streak',
              label: 'Day Streak',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              ),
              value: `${stats.streak} days`,
            },
            {
              id: 'accuracy',
              label: 'Accuracy Rate',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              value: `${stats.accuracy}%`,
            },
          ]}
        />
      </div>
    </>
  );
}
