'use client';

import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';
import { CalendarEvent } from '@/lib/models/calendar';
import CalendarEventItem from './CalendarEventItem';

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventCreate?: (date: Date) => void;
}

export default function CalendarGrid({
  currentDate,
  events,
  onEventClick,
  onDateClick,
  onEventCreate
}: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = event.end ? new Date(event.end) : eventStart;

      // Check if the date falls within the event range
      return (
        (isSameDay(date, eventStart) ||
          isSameDay(date, eventEnd) ||
          (date > eventStart && date < eventEnd))
      );
    });
  };

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <table className="w-full h-full border-separate border-spacing-0 table-fixed text-sm">
        {/* Header */}
        <thead>
          <tr>
            {weekDays.map((day) => (
              <th
                key={day}
                className="border-b border-neutral-200 py-3 text-neutral-900 font-normal"
              >
                <div>
                  <span className="inline-block px-1">{day}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Days Grid */}
        <tbody>
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
            <tr key={weekIndex}>
              {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isDayToday = isToday(day);

                return (
                  <td
                    key={day.toISOString()}
                    className={`
                      border border-neutral-200 align-top p-0 h-32 min-h-[8rem]
                      ${
                        isCurrentMonth
                          ? 'bg-neutral-50'
                          : 'bg-[repeating-linear-gradient(45deg,#e5e7eb_0_1px,#0000_0_50%)] bg-[length:10px_10px] opacity-80'
                      }
                    `}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="relative min-h-full p-1">
                      {/* Day Number */}
                      <div className="flex flex-row-reverse mb-1">
                        <button
                          className={`
                            w-8 h-8 p-1 flex items-center justify-center font-semibold rounded-full
                            hover:bg-neutral-100 transition-colors
                            ${isDayToday ? 'text-blue-500 border border-blue-500' : ''}
                            ${!isCurrentMonth ? 'opacity-70' : ''}
                          `}
                        >
                          {format(day, 'd')}
                        </button>
                      </div>

                      {/* Events */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <CalendarEventItem
                            key={event.id}
                            event={event}
                            onClick={() => onEventClick?.(event)}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-neutral-500 px-2 py-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
