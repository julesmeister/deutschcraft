/**
 * DayTimeline Component
 * Hourly timeline with draggable events
 */

'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface DayViewEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color?: 'blue' | 'pink' | 'indigo' | 'gray';
}

interface ResizeState {
  eventId: string;
  direction: 'top' | 'bottom';
  startY: number;
  originalStartTime: string;
  originalEndTime: string;
}

interface DayTimelineProps {
  events: DayViewEvent[];
  onEventClick?: (event: DayViewEvent) => void;
  onEventUpdate?: (eventId: string, newStartTime: string, newEndTime: string) => void;
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
  return hours * 2 + (minutes >= 30 ? 1 : 0) + 1;
}

export function DayTimeline({ events, onEventClick, onEventUpdate }: DayTimelineProps) {
  const [resizing, setResizing] = useState<ResizeState | null>(null);
  const [localEvents, setLocalEvents] = useState<DayViewEvent[]>(events);

  // Update local events when props change
  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  // Helper to convert pixels to time
  const pixelsToMinutes = (pixels: number) => {
    return Math.round((pixels / 32) * 30);
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Handle mouse move for resizing
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizing.startY;
      const deltaMinutes = pixelsToMinutes(deltaY);

      const event = localEvents.find(ev => ev.id === resizing.eventId);
      if (!event) return;

      let newStartTime = resizing.originalStartTime;
      let newEndTime = resizing.originalEndTime;

      if (resizing.direction === 'top') {
        const newStartMinutes = Math.max(0, timeToMinutes(resizing.originalStartTime) + deltaMinutes);
        newStartTime = minutesToTime(newStartMinutes);

        const endMinutes = timeToMinutes(resizing.originalEndTime);
        if (endMinutes - newStartMinutes < 15) {
          newStartTime = minutesToTime(endMinutes - 15);
        }
      } else {
        const newEndMinutes = Math.min(24 * 60, timeToMinutes(resizing.originalEndTime) + deltaMinutes);
        newEndTime = minutesToTime(newEndMinutes);

        const startMinutes = timeToMinutes(resizing.originalStartTime);
        if (newEndMinutes - startMinutes < 15) {
          newEndTime = minutesToTime(startMinutes + 15);
        }
      }

      setLocalEvents(prev => prev.map(ev =>
        ev.id === resizing.eventId
          ? { ...ev, startTime: newStartTime, endTime: newEndTime }
          : ev
      ));
    };

    const handleMouseUp = () => {
      if (resizing && onEventUpdate) {
        const event = localEvents.find(ev => ev.id === resizing.eventId);
        if (event) {
          onEventUpdate(event.id, event.startTime, event.endTime);
        }
      }
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, localEvents, onEventUpdate]);

  return (
    <div className="flex">
      {/* Time Labels Column */}
      <div className="w-20 flex-shrink-0 border-r border-gray-200">
        <div className="h-12"></div>
        {hours.map((hour) => (
          <div key={hour.value} className="h-16 border-t border-gray-200 pr-2 text-right">
            <span className="text-xs font-medium text-gray-500 -mt-2 inline-block">
              {hour.label}
            </span>
          </div>
        ))}
      </div>

      {/* Events Column */}
      <div className="flex-1 relative overflow-hidden">
        {/* Grid Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-12"></div>
          {hours.map((hour) => (
            <div key={hour.value} className="h-16 border-t border-gray-200"></div>
          ))}
        </div>

        {/* Events Positioned Absolutely */}
        <div className="relative" style={{ minHeight: '1600px' }}>
          <div className="h-12"></div>

          {localEvents.map((event) => {
            const startRow = timeToGridRow(event.startTime);
            const endRow = timeToGridRow(event.endTime);
            const duration = endRow - startRow;

            const top = 48 + (startRow - 1) * 32;
            const height = duration * 32;

            return (
              <div
                key={event.id}
                className={`absolute left-2 right-2 rounded-lg group ${
                  colorClasses[event.color || 'blue']
                } ${resizing?.eventId === event.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                }}
              >
                {/* Top resize handle */}
                {onEventUpdate && (
                  <div
                    className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 hover:bg-blue-400 transition-opacity"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setResizing({
                        eventId: event.id,
                        direction: 'top',
                        startY: e.clientY,
                        originalStartTime: event.startTime,
                        originalEndTime: event.endTime,
                      });
                    }}
                  />
                )}

                {/* Event content */}
                <button
                  onClick={() => onEventClick?.(event)}
                  className="w-full h-full px-3 py-2 text-left"
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

                {/* Bottom resize handle */}
                {onEventUpdate && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 hover:bg-blue-400 transition-opacity"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setResizing({
                        eventId: event.id,
                        direction: 'bottom',
                        startY: e.clientY,
                        originalStartTime: event.startTime,
                        originalEndTime: event.endTime,
                      });
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
