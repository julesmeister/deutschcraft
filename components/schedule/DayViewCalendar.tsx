/**
 * DayViewCalendar Component
 * Day timeline view for schedule with hourly slots
 */

'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface DayViewEvent {
  id: string;
  title: string;
  startTime: string; // Format: "HH:MM" (24h)
  endTime: string; // Format: "HH:MM" (24h)
  color?: 'blue' | 'pink' | 'indigo' | 'gray';
}

interface DayViewCalendarProps {
  selectedDate: Date;
  events: DayViewEvent[];
  onDateChange: (date: Date) => void;
  onEventClick?: (event: DayViewEvent) => void;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  pink: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
  indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
};

// Generate array of hours (12AM - 11PM)
const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
  const period = i < 12 ? 'AM' : 'PM';
  return { value: i, label: `${hour}${period}` };
});

// Helper to convert "HH:MM" to grid row (each row = 30min)
function timeToGridRow(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 2 + (minutes >= 30 ? 1 : 0) + 1; // +1 for CSS grid (1-indexed)
}

// Helper to get week days around selected date
function getWeekDays(selectedDate: Date): Array<{ date: Date; day: string; dayNum: number; isSelected: boolean }> {
  const days = [];
  const today = new Date(selectedDate);
  today.setHours(0, 0, 0, 0);

  // Get day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = today.getDay();

  // Start from 3 days before
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 3);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    days.push({
      date,
      day: dayNames[date.getDay()],
      dayNum: date.getDate(),
      isSelected: date.getTime() === today.getTime(),
    });
  }

  return days;
}

export function DayViewCalendar({
  selectedDate,
  events,
  onDateChange,
  onEventClick,
}: DayViewCalendarProps) {
  const weekDays = getWeekDays(selectedDate);

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow">
      {/* Week Day Selector */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center gap-2">
              {weekDays.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => onDateChange(day.date)}
                  className={`flex flex-col items-center justify-center w-12 h-14 rounded-lg transition-colors ${
                    day.isSelected
                      ? 'bg-gray-900 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-xs font-medium ${
                    day.isSelected ? 'text-white' : 'text-gray-500'
                  }`}>
                    {day.day}
                  </span>
                  <span className={`text-lg font-semibold mt-0.5 ${
                    day.isSelected ? 'text-white' : 'text-gray-900'
                  }`}>
                    {day.dayNum}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            Today
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          {/* Time Labels Column */}
          <div className="w-20 flex-shrink-0 border-r border-gray-200">
            <div className="h-12"></div> {/* Spacer for alignment */}
            {hours.map((hour) => (
              <div key={hour.value} className="h-16 border-t border-gray-200 pr-2 text-right">
                <span className="text-xs font-medium text-gray-500 -mt-2 inline-block">
                  {hour.label}
                </span>
              </div>
            ))}
          </div>

          {/* Events Column */}
          <div className="flex-1 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="h-12"></div> {/* Spacer */}
              {hours.map((hour) => (
                <div key={hour.value} className="h-16 border-t border-gray-200"></div>
              ))}
            </div>

            {/* Events Positioned Absolutely */}
            <div className="relative" style={{ minHeight: '1600px' }}>
              <div className="h-12"></div> {/* Spacer */}

              {events.map((event) => {
                const startRow = timeToGridRow(event.startTime);
                const endRow = timeToGridRow(event.endTime);
                const duration = endRow - startRow;

                // Position: each row is 32px (h-16 / 2)
                const top = 48 + (startRow - 1) * 32; // 48px spacer + rows
                const height = duration * 32;

                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className={`absolute left-2 right-2 rounded-lg px-3 py-2 text-left transition-colors ${
                      colorClasses[event.color || 'blue']
                    }`}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {event.title}
                        </p>
                        <p className="text-xs mt-0.5">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>
                      <MoreHorizontal className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
