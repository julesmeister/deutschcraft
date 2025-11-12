'use client';

import React, { useState } from 'react';
import Calendar from './Calendar';
import { CalendarEvent } from '@/lib/models/calendar';

/**
 * Calendar Component Example
 *
 * This example demonstrates how to use the Calendar component
 * for teacher scheduling in the Testmanship platform.
 */

export default function CalendarExample() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Sample events for demonstration
  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'German Lesson - Anna Schmidt',
      start: new Date(2025, 10, 1),
      allDay: true,
      color: 'orange',
      description: 'B1 Grammar Session'
    },
    {
      id: '2',
      title: 'Exam Review',
      start: new Date(2025, 10, 5, 0, 0),
      end: new Date(2025, 10, 7, 23, 59),
      color: 'red',
      description: 'Final exam preparation'
    },
    {
      id: '3',
      title: 'Consultation',
      start: new Date(2025, 10, 10, 0, 0),
      allDay: true,
      color: 'blue'
    },
    {
      id: '4',
      title: 'Consultation',
      start: new Date(2025, 10, 17, 0, 0),
      allDay: true,
      color: 'blue'
    },
    {
      id: '5',
      title: 'Lesson - Max Müller',
      start: new Date(2025, 10, 18, 18, 30),
      end: new Date(2025, 10, 18, 19, 30),
      color: 'blue',
      description: 'A2 Conversation Practice'
    },
    {
      id: '6',
      title: 'Writing Review',
      start: new Date(2025, 10, 18, 20, 0),
      end: new Date(2025, 10, 18, 21, 0),
      color: 'green'
    },
    {
      id: '7',
      title: 'Team Meeting',
      start: new Date(2025, 10, 18, 22, 30),
      end: new Date(2025, 10, 18, 23, 30),
      color: 'blue'
    },
    {
      id: '8',
      title: 'Office Hours',
      start: new Date(2025, 10, 19, 1, 30),
      end: new Date(2025, 10, 19, 3, 30),
      color: 'yellow'
    },
    {
      id: '9',
      title: 'Student Progress Review',
      start: new Date(2025, 10, 19, 15, 0),
      end: new Date(2025, 10, 19, 16, 0),
      color: 'purple'
    },
    {
      id: '10',
      title: 'Parent Conference',
      start: new Date(2025, 10, 23, 4, 0),
      end: new Date(2025, 10, 23, 5, 0),
      color: 'green'
    }
  ];

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    console.log('Event clicked:', event);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
  };

  const handleEventCreate = (date: Date) => {
    console.log('Create event for date:', date);
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Teacher Schedule Calendar
          </h1>
          <p className="text-neutral-600">
            Manage your lessons, consultations, and availability
          </p>
        </div>

        {/* Calendar Component */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Calendar
            events={sampleEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onEventCreate={handleEventCreate}
          />
        </div>

        {/* Selected Event Display */}
        {selectedEvent && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Selected Event
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Title:</span> {selectedEvent.title}
              </p>
              <p>
                <span className="font-semibold">Start:</span>{' '}
                {new Date(selectedEvent.start).toLocaleString()}
              </p>
              {selectedEvent.end && (
                <p>
                  <span className="font-semibold">End:</span>{' '}
                  {new Date(selectedEvent.end).toLocaleString()}
                </p>
              )}
              {selectedEvent.description && (
                <p>
                  <span className="font-semibold">Description:</span>{' '}
                  {selectedEvent.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-neutral-900 mb-3">
            Calendar Features
          </h3>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li>✓ Switch between Month, Week, and Day views</li>
            <li>✓ Navigate between months using arrow buttons</li>
            <li>✓ Click on events to view details</li>
            <li>✓ Click on dates to create new events</li>
            <li>✓ Color-coded events for different session types</li>
            <li>✓ Support for all-day and timed events</li>
            <li>✓ Multi-day event spanning</li>
            <li>✓ Today button to quickly return to current date</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
