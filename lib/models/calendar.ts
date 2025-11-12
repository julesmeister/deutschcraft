/**
 * Calendar Models
 * Types and interfaces for the Calendar component
 */

export type CalendarView = 'month' | 'week' | 'day';

export type EventColor = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'yellow';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  color?: EventColor;
  description?: string;
  location?: string;
  attendees?: string[];
  metadata?: Record<string, any>;
}

export interface ScheduledSession extends CalendarEvent {
  studentId: string;
  studentName: string;
  teacherId: string;
  sessionType: 'lesson' | 'review' | 'exam' | 'consultation';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
}

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isRecurring: boolean;
  effectiveFrom?: Date;
  effectiveUntil?: Date;
}
