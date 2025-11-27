/**
 * DayViewSection Component
 * Day calendar view for schedule page
 */

'use client';

import { DayViewCalendar } from './DayViewCalendar';

interface DayViewEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: 'blue' | 'pink' | 'indigo' | 'gray';
}

interface DayViewSectionProps {
  selectedDate: Date;
  events: DayViewEvent[];
  onDateChange: (date: Date) => void;
  onEventClick: (event: DayViewEvent) => void;
  onEventUpdate?: (eventId: string, newStartTime: string, newEndTime: string) => void;
}

export function DayViewSection({
  selectedDate,
  events,
  onDateChange,
  onEventClick,
  onEventUpdate,
}: DayViewSectionProps) {
  return (
    <DayViewCalendar
      selectedDate={selectedDate}
      events={events}
      onDateChange={onDateChange}
      onEventClick={onEventClick}
      onEventUpdate={onEventUpdate}
    />
  );
}
