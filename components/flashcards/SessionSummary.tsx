'use client';

import { Button } from '@/components/ui/Button';
import { TabBar } from '@/components/ui/TabBar';

interface SessionSummaryProps {
  stats: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  totalCards: number;
  timeSpent: number; // in seconds
  onReview: () => void;
  onFinish: () => void;
}

export function SessionSummary({
  stats,
  totalCards,
  timeSpent,
  onReview,
  onFinish,
}: SessionSummaryProps) {
  const totalReviewed = stats.again + stats.hard + stats.good + stats.easy;
  const accuracy = totalReviewed > 0
    ? Math.round(((stats.good + stats.easy) / totalReviewed) * 100)
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Session Complete!</h2>
        <p className="text-gray-600">Great work! Here's how you did:</p>
      </div>

      {/* Main Stats using TabBar */}
      <div className="mb-6">
        <TabBar
          variant="stats"
          tabs={[
            {
              id: 'cards',
              label: 'Cards Reviewed',
              icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              ),
              value: totalReviewed,
            },
            {
              id: 'accuracy',
              label: 'Accuracy',
              icon: (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ),
              value: `${accuracy}%`,
            },
          ]}
        />
      </div>

      {/* Detailed Breakdown using TabBar */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Review Breakdown</h3>
        <TabBar
          variant="stats"
          tabs={[
            {
              id: 'again',
              label: 'Forgotten',
              icon: <div className="w-4 h-4 rounded-full bg-red-500"></div>,
              value: stats.again,
            },
            {
              id: 'hard',
              label: 'Hard',
              icon: <div className="w-4 h-4 rounded-full bg-amber-500"></div>,
              value: stats.hard,
            },
            {
              id: 'good',
              label: 'Good',
              icon: <div className="w-4 h-4 rounded-full bg-blue-500"></div>,
              value: stats.good,
            },
            {
              id: 'easy',
              label: 'Easy',
              icon: <div className="w-4 h-4 rounded-full bg-emerald-500"></div>,
              value: stats.easy,
            },
          ]}
        />
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Time Spent</div>
          <div className="text-xl font-black text-gray-900">{formatTime(timeSpent)}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Avg per Card</div>
          <div className="text-xl font-black text-gray-900">
            {totalReviewed > 0 ? `${Math.round(timeSpent / totalReviewed)}s` : '0s'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onReview}
          variant="secondary"
          size="lg"
          className="flex-1"
        >
          Review Forgotten Cards
        </Button>
        <Button
          onClick={onFinish}
          variant="primary"
          size="lg"
          className="flex-1"
        >
          Finish Session
        </Button>
      </div>

      {/* Encouragement Message */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {accuracy >= 80 ? (
            "🌟 Excellent work! You're mastering these cards!"
          ) : accuracy >= 60 ? (
            "👍 Good job! Keep practicing to improve your recall."
          ) : (
            "💪 Keep going! Consistent practice is the key to mastery."
          )}
        </p>
      </div>
    </div>
  );
}
