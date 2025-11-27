/**
 * MiniCalendar Component
 * Month calendar sidebar for day view
 */

'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MiniCalendarProps {
  selectedDate: Date;
  calendarMonth: Date;
  onDateChange: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

interface MonthDay {
  date: Date;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

// Helper to generate month calendar days
function getMonthDays(selectedDate: Date, calendarMonth: Date): MonthDay[] {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  // First day of the month
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  const lastDate = lastDay.getDate();

  // Days from previous month
  const prevMonthLastDay = new Date(year, month, 0);
  const prevMonthLastDate = prevMonthLastDay.getDate();

  const days: MonthDay[] = [];

  // Add previous month's trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDate - i);
    days.push({
      date,
      dayNum: prevMonthLastDate - i,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    });
  }

  // Add current month's days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateNormalized = new Date(selectedDate);
  selectedDateNormalized.setHours(0, 0, 0, 0);

  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    days.push({
      date,
      dayNum: day,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      isSelected: date.getTime() === selectedDateNormalized.getTime(),
    });
  }

  // Add next month's leading days to complete the grid
  const remainingDays = 42 - days.length; // 6 rows × 7 days = 42
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      dayNum: day,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
    });
  }

  return days;
}

export function MiniCalendar({
  selectedDate,
  calendarMonth,
  onDateChange,
  onPrevMonth,
  onNextMonth,
}: MiniCalendarProps) {
  const monthDays = getMonthDays(selectedDate, calendarMonth);

  return (
    <div className="hidden lg:block w-80 border-l border-gray-200 px-6 py-10">
      <div className="flex items-center justify-center text-center text-gray-900">
        <button
          type="button"
          onClick={onPrevMonth}
          className="flex flex-shrink-0 items-center justify-center p-1.5 text-gray-500 hover:text-gray-600"
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-sm font-semibold">
          {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button
          type="button"
          onClick={onNextMonth}
          className="flex flex-shrink-0 items-center justify-center p-1.5 text-gray-500 hover:text-gray-600"
        >
          <span className="sr-only">Next month</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day of week headers */}
      <div className="mt-6 grid grid-cols-7 text-center text-xs leading-6 text-gray-500">
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
        <div>S</div>
      </div>

      {/* Calendar grid */}
      <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
        {monthDays.map((day, dayIdx) => (
          <button
            key={dayIdx}
            type="button"
            onClick={() => onDateChange(day.date)}
            className={`
              py-1.5 hover:bg-gray-100 focus:z-10 relative
              ${dayIdx === 0 ? 'rounded-tl-lg' : ''}
              ${dayIdx === 6 ? 'rounded-tr-lg' : ''}
              ${dayIdx === monthDays.length - 7 ? 'rounded-bl-lg' : ''}
              ${dayIdx === monthDays.length - 1 ? 'rounded-br-lg' : ''}
              ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
              ${day.isSelected && day.isToday ? 'font-semibold text-indigo-600' : ''}
              ${day.isSelected && !day.isToday ? 'font-semibold text-gray-900' : ''}
              ${!day.isSelected && day.isCurrentMonth && !day.isToday ? 'text-gray-900' : ''}
              ${!day.isSelected && !day.isCurrentMonth && !day.isToday ? 'text-gray-400' : ''}
              ${day.isToday && !day.isSelected ? 'font-semibold text-indigo-600' : ''}
            `}
          >
            <time
              dateTime={day.date.toISOString().split('T')[0]}
              className={`
                mx-auto flex h-7 w-7 items-center justify-center rounded-full
                ${day.isSelected && day.isToday ? 'bg-indigo-600 text-white' : ''}
                ${day.isSelected && !day.isToday ? 'bg-gray-900 text-white' : ''}
              `}
            >
              {day.dayNum}
            </time>
          </button>
        ))}
      </div>
    </div>
  );
}
