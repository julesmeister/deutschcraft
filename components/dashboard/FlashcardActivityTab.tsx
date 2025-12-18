/**
 * FlashcardActivityTab Component
 * Displays flashcard session timeline
 */

import { ActivityTimeline, ActivityItem } from '@/components/ui/activity/ActivityTimeline';
import { Pagination } from '@/components/ui/Pagination';

interface RecentSession {
  date: string;
  cardsReviewed: number;
  accuracy: number;
  timeSpent: number;
}

interface FlashcardActivityTabProps {
  recentSessions: RecentSession[];
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export function FlashcardActivityTab({
  recentSessions,
  currentPage,
  onPageChange,
  isLoading = false,
  hasMore = true,
}: FlashcardActivityTabProps) {
  if (isLoading && recentSessions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-piku-purple"></div>
        <p className="mt-4 text-gray-600 font-semibold">Loading sessions...</p>
      </div>
    );
  }

  if (!isLoading && recentSessions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-lg font-semibold">No recent sessions</p>
        <p className="text-sm mt-2">This student hasn't practiced flashcards yet</p>
      </div>
    );
  }

  return (
    <>
      <ActivityTimeline
        items={recentSessions.map((session, index) => {
          const accuracyColor = session.accuracy >= 80 ? 'green' : session.accuracy >= 60 ? 'amber' : 'red';

          // Parse date - handle both YYYY-MM-DD and YYYYMMDD formats
          let dateStr = session.date;
          if (dateStr.length === 8 && !dateStr.includes('-')) {
            // YYYYMMDD format
            dateStr = dateStr.slice(0, 4) + '-' + dateStr.slice(4, 6) + '-' + dateStr.slice(6, 8);
          }

          return {
            id: `session-${index}`,
            icon: <span className="text-white text-sm">📚</span>,
            iconColor: 'bg-piku-purple',
            title: new Date(dateStr).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            description: `Reviewed ${session.cardsReviewed} cards in ${session.timeSpent} minutes`,
            tags: [
              {
                label: `${session.accuracy}% Accuracy`,
                color: accuracyColor,
                icon: session.accuracy >= 80 ? '✓' : undefined,
              },
              {
                label: `${session.cardsReviewed} cards`,
                color: 'blue',
              },
              {
                label: `${session.timeSpent} min`,
                color: 'gray',
              },
            ],
          } as ActivityItem;
        })}
        showConnector={true}
        showPagination={false}
      />

      {/* Pagination - For server-side, show many pages assuming more data */}
      <Pagination
        currentPage={currentPage}
        totalPages={hasMore ? currentPage + 5 : currentPage}
        onPageChange={onPageChange}
      />
    </>
  );
}
