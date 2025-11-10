'use client';

import { Button } from '@/components/ui/Button';

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

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
          <div className="text-4xl font-black text-blue-600 mb-2">{totalReviewed}</div>
          <div className="text-sm font-semibold text-blue-700 uppercase">Cards Reviewed</div>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
          <div className="text-4xl font-black text-emerald-600 mb-2">{accuracy}%</div>
          <div className="text-sm font-semibold text-emerald-700 uppercase">Accuracy</div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Review Breakdown</h3>
        <div className="space-y-3">
          {/* Forgotten */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="font-semibold text-gray-700">Forgotten (Need Review)</span>
            </div>
            <span className="text-2xl font-black text-red-600">{stats.again}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{ width: `${totalReviewed > 0 ? (stats.again / totalReviewed) * 100 : 0}%` }}
            />
          </div>

          {/* Hard */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <span className="font-semibold text-gray-700">Hard (Difficult)</span>
            </div>
            <span className="text-2xl font-black text-amber-600">{stats.hard}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full"
              style={{ width: `${totalReviewed > 0 ? (stats.hard / totalReviewed) * 100 : 0}%` }}
            />
          </div>

          {/* Good */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="font-semibold text-gray-700">Good (Correct)</span>
            </div>
            <span className="text-2xl font-black text-blue-600">{stats.good}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${totalReviewed > 0 ? (stats.good / totalReviewed) * 100 : 0}%` }}
            />
          </div>

          {/* Easy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
              <span className="font-semibold text-gray-700">Easy (Mastered)</span>
            </div>
            <span className="text-2xl font-black text-emerald-600">{stats.easy}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${totalReviewed > 0 ? (stats.easy / totalReviewed) * 100 : 0}%` }}
            />
          </div>
        </div>
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
