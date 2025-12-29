'use client';

import { useState } from 'react';
import { WeeklyProgressChart } from '@/components/dashboard/WeeklyProgressChart';

interface FlashcardProgressChartProps {
  weeklyData: number[];
  totalWords: number;
  totalRemNoteCards: number;
  stats: {
    cardsLearned: number;
    streak: number;
    accuracy: number;
  };
}

const PROGRESS_CHART_COLLAPSED_KEY = 'flashcards-progress-chart-collapsed';

export function FlashcardProgressChart({
  weeklyData,
  totalWords,
  totalRemNoteCards,
  stats,
}: FlashcardProgressChartProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load collapse state from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PROGRESS_CHART_COLLAPSED_KEY);
      return saved === 'true';
    }
    return false;
  });

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROGRESS_CHART_COLLAPSED_KEY, String(newState));
    }
  };

  return (
    <div className="mb-8 relative">
      {/* Collapsed State - Stats Bar */}
      {isCollapsed && (
        <>
          {/* Expand Button - Top Center */}
          <div className="flex justify-center">
            <button
              onClick={handleToggle}
              className="group relative bg-white border border-gray-200 border-b-0 px-8 py-1.5 rounded-t-lg hover:bg-gray-50 transition-all"
              aria-label="Expand progress chart"
            >
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="bg-white border border-gray-200 p-4 md:p-5">
            {/* Stats Grid - Horizontal with Wide Spacing */}
            <div className="flex items-center justify-center gap-8 md:gap-16 lg:gap-20">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-gray-900">{totalRemNoteCards}</div>
                <div className="text-[10px] md:text-xs text-gray-600 uppercase font-bold">Cards</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.cardsLearned}</div>
                <div className="text-[10px] md:text-xs text-gray-600 uppercase font-bold">Learned</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.streak}</div>
                <div className="text-[10px] md:text-xs text-gray-600 uppercase font-bold">Streak</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.accuracy}%</div>
                <div className="text-[10px] md:text-xs text-gray-600 uppercase font-bold">Accuracy</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Expanded State - Full Chart */}
      {!isCollapsed && (
        <>
          {/* Collapse Button - Top Center */}
          <div className="flex justify-center">
            <button
              onClick={handleToggle}
              className="group relative bg-white border border-gray-200 border-b-0 px-8 py-1.5 rounded-t-lg hover:bg-gray-50 transition-all"
              aria-label="Collapse progress chart"
            >
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
          <div className="bg-white border border-gray-200 relative overflow-hidden min-h-[240px] md:min-h-[280px]">
            {/* Use the same chart component from dashboard, but hide the View Details button */}
            <WeeklyProgressChart
              weeklyData={weeklyData}
              totalWords={totalWords}
              showViewDetailsButton={false}
            />

            {/* Stats Display - Top Right */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
              <div className="bg-white px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{totalRemNoteCards}</div>
                    <div className="text-[10px] md:text-xs text-gray-600 uppercase font-bold">Cards</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{stats.cardsLearned}</div>
                    <div className="text-[10px] md:text-xs text-gray-600 uppercase font-bold">Learned</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{stats.streak}</div>
                    <div className="text-[10px] md:text-xs text-gray-600 uppercase font-bold">Streak</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{stats.accuracy}%</div>
                    <div className="text-[10px] md:text-xs text-gray-600 uppercase font-bold">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
