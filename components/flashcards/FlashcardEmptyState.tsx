'use client';

import { Button } from '@/components/ui/Button';

interface FlashcardEmptyStateProps {
  flashcards: any[];
  nextDueInfo?: {
    count: number;
    nextDueDate: number;
  };
  upcomingCards: any[];
  onBack: () => void;
}

export function FlashcardEmptyState({
  flashcards,
  nextDueInfo,
  upcomingCards,
  onBack,
}: FlashcardEmptyStateProps) {
  // Helper functions for formatting
  const formatTimeUntilDue = (dueDate: number) => {
    const now = Date.now();
    const diffMs = dueDate - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}w`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)}mo`;
    } else {
      return `${Math.floor(diffDays / 365)}y`;
    }
  };

  const formatDueDate = (dueDate: number) => {
    const date = new Date(dueDate);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return `today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Empty state - No cards due for review
  if (flashcards.length === 0) {
    return (
      <div>
        {/* Subtle header info */}
        {nextDueInfo && nextDueInfo.count > 0 && (
          <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">✅ All caught up!</h3>
                <p className="text-sm text-gray-600">You&apos;ve reviewed all cards that are due right now.</p>
              </div>
              <div className="text-sm text-gray-700 sm:text-right">
                <p><span className="font-semibold">{nextDueInfo.count}</span> cards scheduled</p>
                <p className="text-xs text-gray-500">Next: {formatDueDate(nextDueInfo.nextDueDate)} ({formatTimeUntilDue(nextDueInfo.nextDueDate)})</p>
              </div>
            </div>
          </div>
        )}

        {!nextDueInfo && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No flashcards found</h3>
            <p className="text-gray-600 mb-6">This category doesn&apos;t have any flashcards yet.</p>
            <Button onClick={onBack} variant="primary">
              Back to Categories
            </Button>
          </div>
        )}

        {/* Upcoming Cards Grid - Full Width */}
        {upcomingCards.length > 0 && (
          <div className="mb-6">
            <h4 className="text-base font-semibold text-gray-700 mb-4">Review Schedule</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {upcomingCards.map((card, index) => {
                const dueDate = card.nextReviewDate || Date.now();
                return (
                  <div
                    key={card.id || index}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex flex-col gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm truncate">{card.german}</p>
                        <p className="text-gray-500 text-xs truncate">{card.english}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs font-medium text-blue-600">
                          {formatTimeUntilDue(dueDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
