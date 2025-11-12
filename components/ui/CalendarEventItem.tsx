'use client';

import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '@/lib/models/calendar';

interface CalendarEventItemProps {
  event: CalendarEvent;
  onClick?: () => void;
}

const eventColorClasses: Record<string, string> = {
  blue: 'bg-sky-200 text-neutral-900',
  green: 'bg-green-200 text-neutral-900',
  red: 'bg-red-100 text-neutral-900',
  orange: 'bg-orange-200 text-neutral-900',
  purple: 'bg-violet-300 text-neutral-900',
  yellow: 'bg-amber-200 text-neutral-900',
  default: 'bg-sky-200 text-neutral-900'
};

export default function CalendarEventItem({ event, onClick }: CalendarEventItemProps) {
  const colorClass = eventColorClasses[event.color || 'default'] || eventColorClasses.default;
  const showTime = !event.allDay;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className="w-full text-left text-xs rounded-md hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className={`${colorClass} p-2 rounded-md flex items-center overflow-hidden`}>
        {showTime && (
          <span className="mr-1 whitespace-nowrap">
            {format(new Date(event.start), 'h:mma').toLowerCase()}
          </span>
        )}
        <span className="font-bold truncate">{event.title}</span>
      </div>
    </button>
  );
}
