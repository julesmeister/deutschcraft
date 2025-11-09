# Activity Timeline Components

Reusable activity timeline and card components for displaying user actions, notifications, progress updates, and more.

## Components

### `<ActivityTimeline />` - Timeline Container
Displays a vertical timeline of activities with optional connector lines.

### `<ActivityCard />` - Card Wrapper
Card container for timeline content with optional header and actions.

### `<ActivityTag />` - Tag/Badge
Colored tag for categorizing activities (can be used standalone).

---

## Basic Usage

### Simple Activity Timeline

```tsx
import { ActivityTimeline, ActivityCard } from '@/components/ui/activity';
import { CheckCircle, Upload, Trophy } from 'lucide-react';

export function RecentActivity() {
  const activities = [
    {
      id: '1',
      icon: <CheckCircle className="h-4 w-4 text-white" />,
      iconColor: 'bg-emerald-500',
      title: 'Completed Lesson 5',
      description: 'German Articles - Der, Die, Das',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      icon: <Upload className="h-4 w-4 text-white" />,
      iconColor: 'bg-blue-500',
      title: 'Uploaded Assignment',
      description: 'Essay: Mein Wochenende',
      timestamp: '5 hours ago',
    },
    {
      id: '3',
      icon: <Trophy className="h-4 w-4 text-white" />,
      iconColor: 'bg-amber-500',
      title: 'Achievement Unlocked',
      description: '7-day streak!',
      timestamp: 'Yesterday',
    },
  ];

  return (
    <ActivityCard title="Recent Activity">
      <ActivityTimeline items={activities} />
    </ActivityCard>
  );
}
```

### With Tags

```tsx
import { ActivityTimeline } from '@/components/ui/activity';

const activities = [
  {
    id: '1',
    title: 'Grammar Practice',
    description: 'Completed 20 exercises on verb conjugation',
    timestamp: '1 hour ago',
    tags: [
      { label: 'A2 Level', color: 'blue' },
      { label: 'Grammar', color: 'purple' },
    ],
  },
  {
    id: '2',
    title: 'Vocabulary Quiz',
    description: '18/20 correct answers',
    timestamp: '3 hours ago',
    tags: [
      { label: 'B1 Level', color: 'green' },
      { label: '90% Score', color: 'amber' },
    ],
  },
];

<ActivityTimeline items={activities} />
```

### Without Connector Lines

```tsx
<ActivityTimeline items={activities} showConnector={false} />
```

### Custom Metadata

```tsx
const activities = [
  {
    id: '1',
    title: 'New Message',
    description: 'From your teacher',
    timestamp: '5 min ago',
    metadata: (
      <button className="text-sm text-blue-500 hover:underline">
        Read Message →
      </button>
    ),
  },
];

<ActivityTimeline items={activities} />
```

---

## API Reference

### ActivityTimeline Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ActivityItem[]` | - | Array of activity items |
| `showConnector` | `boolean` | `true` | Show connector lines between items |
| `className` | `string?` | - | Additional CSS classes |

### ActivityItem Interface

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier |
| `title` | `string` | ✅ | Activity title |
| `icon` | `ReactNode?` | ❌ | Icon element (defaults to dot) |
| `iconColor` | `string?` | ❌ | Icon background color (e.g., 'bg-blue-500') |
| `description` | `string?` | ❌ | Activity description |
| `timestamp` | `string?` | ❌ | Time/date display |
| `tags` | `Tag[]?` | ❌ | Array of tags |
| `metadata` | `ReactNode?` | ❌ | Custom content (buttons, links, etc.) |

### ActivityTag Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Tag text |
| `color` | `'blue' \| 'green' \| 'amber' \| 'red' \| 'pink' \| 'purple' \| 'gray'` | `'gray'` | Color variant |
| `icon` | `ReactNode?` | - | Optional icon (shows as dot) |

### ActivityCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Card content |
| `title` | `string?` | - | Card header title |
| `subtitle` | `string?` | - | Card header subtitle |
| `actions` | `ReactNode?` | - | Header action buttons |
| `shadow` | `boolean` | `false` | Add shadow effect |
| `className` | `string?` | - | Additional CSS classes |

---

## Advanced Examples

### Student Progress Timeline

```tsx
import { ActivityTimeline, ActivityCard } from '@/components/ui/activity';
import { BookOpen, FileText, Award, Calendar } from 'lucide-react';

export function StudentProgressTimeline() {
  const progress = [
    {
      id: '1',
      icon: <Award className="h-4 w-4 text-white" />,
      iconColor: 'bg-amber-500',
      title: 'Level Up!',
      description: 'Advanced to B1 - Intermediate',
      timestamp: 'Today at 3:30 PM',
      tags: [
        { label: 'Milestone', color: 'amber' },
      ],
    },
    {
      id: '2',
      icon: <FileText className="h-4 w-4 text-white" />,
      iconColor: 'bg-blue-500',
      title: 'Assignment Submitted',
      description: 'Essay: "Meine Familie" - Waiting for review',
      timestamp: 'Today at 2:15 PM',
      tags: [
        { label: 'Writing', color: 'blue' },
        { label: 'Pending', color: 'gray' },
      ],
    },
    {
      id: '3',
      icon: <BookOpen className="h-4 w-4 text-white" />,
      iconColor: 'bg-emerald-500',
      title: 'Lesson Completed',
      description: 'German Prepositions with Dative',
      timestamp: 'Today at 10:00 AM',
      tags: [
        { label: 'Grammar', color: 'purple' },
        { label: '100%', color: 'green' },
      ],
    },
    {
      id: '4',
      icon: <Calendar className="h-4 w-4 text-white" />,
      iconColor: 'bg-purple-500',
      title: 'Practice Session',
      description: '30 flashcards reviewed',
      timestamp: 'Yesterday at 5:45 PM',
      tags: [
        { label: 'Vocabulary', color: 'blue' },
      ],
    },
  ];

  return (
    <ActivityCard
      title="Your Progress"
      subtitle="Recent learning activities"
      shadow
    >
      <ActivityTimeline items={progress} />
    </ActivityCard>
  );
}
```

### Teacher Activity Feed

```tsx
import { ActivityTimeline, ActivityCard } from '@/components/ui/activity';
import { UserPlus, CheckSquare, MessageCircle } from 'lucide-react';

export function TeacherActivityFeed() {
  const activities = [
    {
      id: '1',
      icon: <UserPlus className="h-4 w-4 text-white" />,
      iconColor: 'bg-blue-500',
      title: 'New Student',
      description: 'Emma Schmidt joined your class',
      timestamp: '10 minutes ago',
      metadata: (
        <button className="text-sm text-blue-500 hover:underline">
          View Profile
        </button>
      ),
    },
    {
      id: '2',
      icon: <CheckSquare className="h-4 w-4 text-white" />,
      iconColor: 'bg-emerald-500',
      title: 'Assignment Graded',
      description: 'Graded 5 submissions for "German Articles"',
      timestamp: '2 hours ago',
      tags: [
        { label: '5 Students', color: 'blue' },
      ],
    },
    {
      id: '3',
      icon: <MessageCircle className="h-4 w-4 text-white" />,
      iconColor: 'bg-purple-500',
      title: 'New Message',
      description: 'Question from Max about homework',
      timestamp: '5 hours ago',
      metadata: (
        <button className="text-sm text-purple-500 hover:underline">
          Reply
        </button>
      ),
    },
  ];

  return (
    <ActivityCard
      title="Activity Feed"
      actions={
        <button className="text-sm text-blue-500 hover:underline">
          View All
        </button>
      }
    >
      <ActivityTimeline items={activities} />
    </ActivityCard>
  );
}
```

### Notifications List

```tsx
import { ActivityTimeline } from '@/components/ui/activity';
import { Bell } from 'lucide-react';

export function NotificationsList() {
  const notifications = [
    {
      id: '1',
      title: 'Assignment Due Soon',
      description: 'Essay due tomorrow at 5:00 PM',
      timestamp: '1 hour ago',
      iconColor: 'bg-red-500',
      icon: <Bell className="h-4 w-4 text-white" />,
      tags: [
        { label: 'Urgent', color: 'red' },
      ],
    },
    {
      id: '2',
      title: 'Teacher Comment',
      description: 'Your teacher left feedback on your essay',
      timestamp: '3 hours ago',
      iconColor: 'bg-blue-500',
      metadata: (
        <button className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600">
          Read Feedback
        </button>
      ),
    },
  ];

  return (
    <ActivityTimeline items={notifications} showConnector={false} />
  );
}
```

### Simple Dots (No Icons)

```tsx
const activities = [
  {
    id: '1',
    title: 'Logged in',
    timestamp: '9:00 AM',
    iconColor: 'bg-emerald-500',
    // No icon provided - will show as a dot
  },
  {
    id: '2',
    title: 'Started lesson',
    timestamp: '9:05 AM',
    iconColor: 'bg-blue-500',
  },
  {
    id: '3',
    title: 'Completed quiz',
    timestamp: '9:30 AM',
    iconColor: 'bg-purple-500',
  },
];

<ActivityTimeline items={activities} />
```

### Minimal Timeline

```tsx
// No descriptions, timestamps, or tags - just titles
const activities = [
  { id: '1', title: 'Step 1: Create account' },
  { id: '2', title: 'Step 2: Choose level' },
  { id: '3', title: 'Step 3: Start learning' },
];

<ActivityTimeline items={activities} />
```

---

## Use Cases in Testmanship

### 1. Student Dashboard - Recent Activity
```tsx
- Completed lessons
- Submitted assignments
- Achieved streaks
- Unlocked achievements
```

### 2. Teacher Dashboard - Class Activity
```tsx
- New student enrollments
- Assignment submissions
- Messages/questions
- Grading completed
```

### 3. Notifications Center
```tsx
- Assignment due dates
- Teacher feedback
- System announcements
- Achievement unlocks
```

### 4. Progress Tracking
```tsx
- Level progression
- Daily goals met
- Vocabulary milestones
- Practice sessions
```

### 5. Assignment Status
```tsx
- Submitted
- In review
- Graded
- Returned
```

---

## Styling & Customization

### Icon Colors

Use Tailwind background classes:
- `bg-blue-500` - Info/general
- `bg-emerald-500` - Success/completion
- `bg-amber-500` - Warning/achievements
- `bg-red-500` - Urgent/important
- `bg-purple-500` - Premium/special
- `bg-neutral-400` - Default/neutral

### Tag Colors

Available color variants:
- `blue` - Informational
- `green` - Success/positive
- `amber` - Warning/attention
- `red` - Error/urgent
- `pink` - Creative/fun
- `purple` - Premium/special
- `gray` - Default/neutral

---

## Best Practices

✅ **DO:**
- Keep titles short (1-5 words)
- Use descriptions for context (1-2 sentences)
- Use relative timestamps ("2 hours ago")
- Group related tags together
- Use icons consistently across types

❌ **DON'T:**
- Overload with too many tags (max 3)
- Write long descriptions
- Mix different icon styles
- Show too many items (paginate after 10-15)
- Use vague titles like "Activity" or "Update"

---

## Accessibility

✅ **Screen Reader Support**
- Semantic HTML structure
- Clear hierarchies
- Descriptive text

✅ **Visual Indicators**
- Color-coded icons
- Clear timestamps
- Readable text contrast
