'use client';

import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import { CalendarEvent, CalendarView } from '@/lib/models/calendar';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths
} from 'date-fns';

interface CalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventCreate?: (date: Date) => void;
  className?: string;
}

export default function Calendar({
  events = [],
  onEventClick,
  onDateClick,
  onEventCreate,
  className = ''
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      {view === 'month' && (
        <CalendarGrid
          currentDate={currentDate}
          events={events}
          onEventClick={onEventClick}
          onDateClick={onDateClick}
          onEventCreate={onEventCreate}
        />
      )}

      {/* Week and day views can be added later */}
      {view === 'week' && (
        <div className="p-8 text-center text-neutral-500">
          Week view coming soon
        </div>
      )}

      {view === 'day' && (
        <div className="p-8 text-center text-neutral-500">
          Day view coming soon
        </div>
      )}
    </div>
  );
}
