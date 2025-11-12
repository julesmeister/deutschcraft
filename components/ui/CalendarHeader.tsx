'use client';

import React from 'react';
import { format } from 'date-fns';
import { CalendarView } from '@/lib/models/calendar';

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday?: () => void;
}

export default function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday
}: CalendarHeaderProps) {
  const viewButtons: { value: CalendarView; label: string }[] = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    { value: 'day', label: 'Day' }
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-5 gap-2">
      {/* Title */}
      <div className="flex flex-row gap-2">
        <h2 className="text-2xl font-bold text-neutral-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Today Button (optional) */}
      {onToday && (
        <div className="flex flex-row gap-2">
          <button
            onClick={onToday}
            className="px-4 py-2 text-sm font-semibold text-neutral-600 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none focus:shadow-sm"
          >
            Today
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-row gap-2">
        {/* View Toggle */}
        <div className="inline-flex relative">
          {viewButtons.map((btn, index) => (
            <button
              key={btn.value}
              type="button"
              title={`${btn.label} view`}
              aria-pressed={view === btn.value}
              onClick={() => onViewChange(btn.value)}
              className={`
                px-8 py-2 h-12 text-sm font-semibold capitalize
                border border-solid border-neutral-300
                focus:outline-none focus:shadow-sm
                hover:text-neutral-900 hover:bg-neutral-50
                disabled:cursor-not-allowed disabled:opacity-65
                ${
                  index === 0
                    ? 'rounded-l-xl'
                    : index === viewButtons.length - 1
                    ? 'rounded-r-xl -ml-px'
                    : 'rounded-none -ml-px'
                }
                ${
                  view === btn.value
                    ? 'text-white bg-blue-500 z-10'
                    : 'text-neutral-600 bg-white'
                }
              `}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="inline-flex relative">
          <button
            type="button"
            title="Previous"
            onClick={onPrevious}
            className="px-2.5 py-2 h-12 text-sm font-semibold text-neutral-600 bg-white border border-solid border-neutral-300 rounded-l-xl hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none focus:shadow-sm"
          >
            <span className="text-xl">‹</span>
          </button>
          <button
            type="button"
            title="Next"
            onClick={onNext}
            className="px-2.5 py-2 h-12 text-sm font-semibold text-neutral-600 bg-white border border-solid border-neutral-300 rounded-r-xl -ml-px hover:bg-neutral-50 hover:text-neutral-900 focus:outline-none focus:shadow-sm"
          >
            <span className="text-xl">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}
