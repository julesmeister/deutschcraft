/**
 * AnswerHubStatsSection Component
 * Displays Answer Hub statistics for a student
 */

import { TabBar } from '@/components/ui/TabBar';
import { AnswerHubStats } from '@/lib/models/answerHub';

interface AnswerHubStatsSectionProps {
  stats: AnswerHubStats;
  isLoading?: boolean;
}

export function AnswerHubStatsSection({
  stats,
  isLoading = false
}: AnswerHubStatsSectionProps) {
  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-6">Answer Hub Activity</h2>
        <div className="animate-pulse">
          <div className="h-20 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Answer Hub Stats TabBar */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-6">Answer Hub Activity</h2>
        <TabBar
          variant="stats"
          tabs={[
            {
              id: 'total-answers',
              label: 'Total Answers',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              value: stats.totalAnswersSubmitted.toLocaleString(),
            },
            {
              id: 'streak',
              label: 'Activity Streak',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              ),
              value: `${stats.activityStreak} days`,
            },
            {
              id: 'exercises',
              label: 'Exercises Attempted',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
              value: stats.exercisesAttempted.toLocaleString(),
            },
            {
              id: 'last-activity',
              label: 'Last Activity',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              value: new Date(stats.lastActivityAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
            },
          ]}
        />
      </div>
    </>
  );
}
