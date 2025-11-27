/**
 * DayViewCalendar Component
 * Day timeline view for schedule with hourly slots and mini calendar
 */

'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayTimeline } from './DayTimeline';
import { MiniCalendar } from './MiniCalendar';

interface DayViewEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color?: 'blue' | 'pink' | 'indigo' | 'gray';
}

interface DayViewCalendarProps {
  selectedDate: Date;
  events: DayViewEvent[];
  onDateChange: (date: Date) => void;
  onEventClick?: (event: DayViewEvent) => void;
  onEventUpdate?: (eventId: string, newStartTime: string, newEndTime: string) => void;
}

// Helper to get week days around selected date
function getWeekDays(selectedDate: Date): Array<{ date: Date; day: string; dayNum: number; isSelected: boolean }> {
  const days = [];
  const today = new Date(selectedDate);
  today.setHours(0, 0, 0, 0);

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
  onEventUpdate,
}: DayViewCalendarProps) {
  const [calendarMonth, setCalendarMonth] = useState(new Date(selectedDate));

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

  const handlePrevMonth = () => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCalendarMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCalendarMonth(newMonth);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow">
      {/* Main Day View */}
      <div className="flex-1 flex flex-col">
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

            <button
              onClick={() => onDateChange(new Date())}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {selectedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </button>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 overflow-y-auto">
          <DayTimeline
            events={events}
            onEventClick={onEventClick}
            onEventUpdate={onEventUpdate}
          />
        </div>
      </div>

      {/* Mini Calendar Sidebar */}
      <MiniCalendar
        selectedDate={selectedDate}
        calendarMonth={calendarMonth}
        onDateChange={onDateChange}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
    </div>
  );
}
