# Calendar Quick Start Guide

## Quick Setup (5 minutes)

### 1. Import the Component

```tsx
import Calendar from '@/components/ui/Calendar';
import { CalendarEvent } from '@/lib/models/calendar';
```

### 2. Create Events

```tsx
const events: CalendarEvent[] = [
  {
    id: '1',
    title: 'German Lesson',
    start: new Date(2025, 10, 15, 14, 0),
    end: new Date(2025, 10, 15, 15, 0),
    color: 'blue'
  }
];
```

### 3. Render the Calendar

```tsx
<Calendar events={events} />
```

## Common Patterns

### Pattern 1: Teacher Schedule
```tsx
export default function TeacherSchedulePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Schedule</h1>
      <Calendar
        events={teacherSessions}
        onEventClick={(event) => router.push(`/session/${event.id}`)}
      />
    </div>
  );
}
```

### Pattern 2: With Event Dialog
```tsx
const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

return (
  <>
    <Calendar
      events={events}
      onEventClick={setSelectedEvent}
    />
    {selectedEvent && (
      <EventDialog event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    )}
  </>
);
```

### Pattern 3: Create New Events
```tsx
const handleDateClick = (date: Date) => {
  setCreateEventDate(date);
  setShowCreateDialog(true);
};

<Calendar
  events={events}
  onDateClick={handleDateClick}
/>
```

## Event Colors

```tsx
// Lesson
{ color: 'blue' }

// Review/Assessment
{ color: 'green' }

// Exam
{ color: 'red' }

// All-Day Event
{ color: 'orange' }

// Special Session
{ color: 'purple' }

// Office Hours
{ color: 'yellow' }
```

## Event Types

### All-Day Event
```tsx
{
  id: '1',
  title: 'Conference',
  start: new Date(2025, 10, 15),
  allDay: true,
  color: 'orange'
}
```

### Timed Event
```tsx
{
  id: '2',
  title: 'Lesson',
  start: new Date(2025, 10, 15, 10, 0),
  end: new Date(2025, 10, 15, 11, 0),
  color: 'blue'
}
```

### Multi-Day Event
```tsx
{
  id: '3',
  title: 'Exam Period',
  start: new Date(2025, 10, 15),
  end: new Date(2025, 10, 17),
  color: 'red'
}
```

## Testing the Calendar

Run the example page:

```bash
# Create a test route
# File: app/calendar-demo/page.tsx

import CalendarExample from '@/components/ui/Calendar.example';

export default function CalendarDemoPage() {
  return <CalendarExample />;
}

# Then visit: http://localhost:3000/calendar-demo
```

## Integration Checklist

- [ ] Import Calendar component
- [ ] Import CalendarEvent type
- [ ] Create events array with proper types
- [ ] Add event handlers (optional)
- [ ] Style the container (optional)
- [ ] Test on different screen sizes
- [ ] Verify events display correctly
- [ ] Test event interactions

## Need Help?

See full documentation: `components/ui/CALENDAR-README.md`
See working examples: `components/ui/Calendar.example.tsx`
