# Calendar Component Documentation

A reusable, feature-rich calendar component for teacher scheduling in the Testmanship platform.

## Features

✓ **Multiple Views**: Month, Week (coming soon), and Day (coming soon) views
✓ **Event Management**: Display, click, and create events
✓ **Color Coding**: 6 predefined color schemes for different event types
✓ **All-Day Events**: Support for both timed and all-day events
✓ **Multi-Day Events**: Events can span multiple days
✓ **Navigation**: Previous/Next month navigation with "Today" button
✓ **Responsive Design**: Works on desktop, tablet, and mobile
✓ **Accessible**: Proper ARIA labels and keyboard navigation support

## Installation

The calendar component uses `date-fns` for date manipulation. It's already installed, but if you need to reinstall:

```bash
npm install date-fns --legacy-peer-deps
```

## Components

### 1. Calendar (Main Component)
The root component that orchestrates all calendar functionality.

**Location**: `components/ui/Calendar.tsx`

**Props**:
```typescript
interface CalendarProps {
  events?: CalendarEvent[];           // Array of events to display
  onEventClick?: (event: CalendarEvent) => void;  // Callback when event is clicked
  onDateClick?: (date: Date) => void;  // Callback when date cell is clicked
  onEventCreate?: (date: Date) => void;  // Callback for creating new events
  className?: string;                  // Additional CSS classes
}
```

### 2. CalendarHeader
Displays the current month/year and navigation controls.

**Location**: `components/ui/CalendarHeader.tsx`

### 3. CalendarGrid
Renders the month view grid with dates and events.

**Location**: `components/ui/CalendarGrid.tsx`

### 4. CalendarEventItem
Displays individual event items within calendar cells.

**Location**: `components/ui/CalendarEventItem.tsx`

## Data Models

**Location**: `lib/models/calendar.ts`

### CalendarEvent
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  color?: EventColor;  // 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'yellow'
  description?: string;
  location?: string;
  attendees?: string[];
  metadata?: Record<string, any>;
}
```

### ScheduledSession (Extended CalendarEvent)
```typescript
interface ScheduledSession extends CalendarEvent {
  studentId: string;
  studentName: string;
  teacherId: string;
  sessionType: 'lesson' | 'review' | 'exam' | 'consultation';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
}
```

## Usage Examples

### Basic Usage

```tsx
import Calendar from '@/components/ui/Calendar';

export default function TeacherSchedule() {
  const events = [
    {
      id: '1',
      title: 'German Lesson',
      start: new Date(2025, 10, 15, 10, 0),
      end: new Date(2025, 10, 15, 11, 0),
      color: 'blue'
    }
  ];

  return (
    <Calendar events={events} />
  );
}
```

### With Event Handlers

```tsx
import Calendar from '@/components/ui/Calendar';
import { CalendarEvent } from '@/lib/models/calendar';

export default function TeacherSchedule() {
  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
    // Open event details modal
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // Show available time slots
  };

  const handleEventCreate = (date: Date) => {
    console.log('Create event on:', date);
    // Open create event form
  };

  return (
    <Calendar
      events={events}
      onEventClick={handleEventClick}
      onDateClick={handleDateClick}
      onEventCreate={handleEventCreate}
    />
  );
}
```

### Teacher Scheduling Example

```tsx
import Calendar from '@/components/ui/Calendar';
import { ScheduledSession } from '@/lib/models/calendar';

export default function TeacherDashboard() {
  const sessions: ScheduledSession[] = [
    {
      id: '1',
      title: 'A2 Lesson - Anna Schmidt',
      start: new Date(2025, 10, 15, 14, 0),
      end: new Date(2025, 10, 15, 15, 0),
      studentId: 'student-123',
      studentName: 'Anna Schmidt',
      teacherId: 'teacher-456',
      sessionType: 'lesson',
      status: 'scheduled',
      color: 'blue',
      notes: 'Focus on B1 grammar'
    },
    {
      id: '2',
      title: 'Exam Review - Max Müller',
      start: new Date(2025, 10, 16, 10, 0),
      end: new Date(2025, 10, 16, 11, 0),
      studentId: 'student-789',
      studentName: 'Max Müller',
      teacherId: 'teacher-456',
      sessionType: 'review',
      status: 'scheduled',
      color: 'green'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Schedule</h1>
      <Calendar events={sessions} />
    </div>
  );
}
```

## Color Coding Guide

The calendar supports 6 color schemes:

| Color    | Use Case                    | CSS Class         |
|----------|----------------------------|-------------------|
| `blue`   | Regular lessons            | `bg-sky-200`      |
| `green`  | Reviews & assessments      | `bg-green-200`    |
| `red`    | Exams & important events   | `bg-red-100`      |
| `orange` | All-day events             | `bg-orange-200`   |
| `purple` | Special sessions           | `bg-violet-300`   |
| `yellow` | Office hours/availability  | `bg-amber-200`    |

## Customization

### Custom Styling

Add custom classes via the `className` prop:

```tsx
<Calendar
  events={events}
  className="shadow-lg rounded-2xl"
/>
```

### Custom Event Colors

Extend the color classes in `CalendarEventItem.tsx`:

```typescript
const eventColorClasses: Record<string, string> = {
  blue: 'bg-sky-200 text-neutral-900',
  // Add your custom colors here
  pink: 'bg-pink-200 text-neutral-900',
};
```

## API Integration

### Fetching Events from Backend

```tsx
import { useEffect, useState } from 'react';
import Calendar from '@/components/ui/Calendar';

export default function TeacherSchedule() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/api/teacher/schedule')
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []);

  return <Calendar events={events} />;
}
```

### Creating Events

```tsx
const handleEventCreate = async (date: Date) => {
  const newEvent = {
    title: 'New Lesson',
    start: date,
    // ... other fields
  };

  const response = await fetch('/api/teacher/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newEvent)
  });

  if (response.ok) {
    // Refresh events
  }
};
```

## Future Enhancements

- [ ] Week view implementation
- [ ] Day view implementation
- [ ] Drag and drop event rescheduling
- [ ] Recurring events support
- [ ] Event filtering by type/status
- [ ] Export to iCal/Google Calendar
- [ ] Time zone support
- [ ] Conflict detection for overlapping events

## File Structure

```
components/ui/
├── Calendar.tsx                 # Main component
├── CalendarHeader.tsx           # Header with navigation
├── CalendarGrid.tsx             # Month view grid
├── CalendarEventItem.tsx        # Individual event display
├── Calendar.example.tsx         # Usage examples
└── CALENDAR-README.md           # This file

lib/models/
└── calendar.ts                  # Type definitions
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- ✓ ARIA labels for all interactive elements
- ✓ Keyboard navigation support
- ✓ Focus indicators
- ✓ Screen reader friendly
- ✓ Semantic HTML structure

## Performance

- Uses `date-fns` for efficient date calculations
- Minimal re-renders with React optimization
- CSS-based styling (no runtime style generation)
- Lazy loading support for large event datasets

## Troubleshooting

### Events not showing up
- Check that event dates are valid Date objects or ISO strings
- Verify events are within the displayed month range
- Check browser console for errors

### Styling issues
- Ensure Tailwind CSS is properly configured
- Check that all dependencies are installed
- Verify no CSS conflicts with global styles

### Date-fns errors
- Make sure `date-fns` is installed: `npm install date-fns --legacy-peer-deps`
- Check that dates are valid JavaScript Date objects

## Support

For issues or questions, check:
- Example file: `components/ui/Calendar.example.tsx`
- Type definitions: `lib/models/calendar.ts`
- Project documentation: `CLAUDE.md`
