# Activity Tracking Integration Guide

This document explains how to integrate activity logging into existing features.

## How to Log Activities

Import the activity service:
```typescript
import {
  logFlashcardCreated,
  logFlashcardReviewed,
  logWritingSubmitted,
  logLevelChange,
  logStreakMilestone,
  logLogin,
  logPracticeSession,
} from '@/lib/services/activityService';
```

## Integration Points

### 1. Flashcard Creation
**Location**: When a flashcard is created (e.g., in flashcard creation form submit handler)

```typescript
// After successfully creating flashcard in Firestore
await logFlashcardCreated(
  studentEmail,
  studentName,
  flashcardId,
  1 // word count
);
```

### 2. Flashcard Review
**Location**: When a student reviews/practices flashcards

```typescript
// After student completes a flashcard review
await logFlashcardReviewed(
  studentEmail,
  studentName,
  flashcardId
);
```

### 3. Writing Submission
**Location**: In writing submission handler (e.g., `/app/dashboard/student/writing/*/page.tsx`)

```typescript
// After successfully submitting writing
await logWritingSubmitted(
  studentEmail,
  studentName,
  writingType, // 'Translation', 'Creative', etc.
  wordCount
);
```

### 4. Level Change
**Location**: When student's CEFR level is updated

```typescript
// After level change in settings or automatic progression
await logLevelChange(
  studentEmail,
  studentName,
  oldLevel, // 'A1'
  newLevel  // 'A2'
);
```

### 5. Streak Milestone
**Location**: When checking/updating daily streak

```typescript
// After updating streak, check for milestones (7, 14, 30, 60, 100 days)
const milestones = [7, 14, 30, 60, 100];
if (milestones.includes(currentStreak)) {
  await logStreakMilestone(
    studentEmail,
    studentName,
    currentStreak
  );
}
```

### 6. Login
**Location**: In authentication callback or dashboard load

```typescript
// After successful login
await logLogin(
  session.user.email,
  session.user.name || session.user.email.split('@')[0]
);
```

### 7. Practice Session
**Location**: After completing a timed practice session

```typescript
// After practice session ends
await logPracticeSession(
  studentEmail,
  studentName,
  durationMinutes
);
```

## Example: Complete Flashcard Integration

```typescript
// app/dashboard/student/flashcards/create/page.tsx
import { logFlashcardCreated } from '@/lib/services/activityService';
import { useSession } from 'next-auth/react';

const handleCreateFlashcard = async (flashcardData) => {
  const { data: session } = useSession();

  // 1. Create flashcard in Firestore
  const flashcardId = await createFlashcard(flashcardData);

  // 2. Log the activity
  if (session?.user?.email) {
    await logFlashcardCreated(
      session.user.email,
      session.user.name || session.user.email.split('@')[0],
      flashcardId,
      1
    );
  }

  // 3. Show success message
  toast.success('Flashcard created!');
};
```

## Example: Writing Submission Integration

```typescript
// app/dashboard/student/writing/translation/page.tsx
import { logWritingSubmitted } from '@/lib/services/activityService';

const handleSubmitWriting = async () => {
  // 1. Submit writing to Firestore
  await submitWriting(submissionData);

  // 2. Log the activity
  if (session?.user?.email) {
    await logWritingSubmitted(
      session.user.email,
      session.user.name || session.user.email.split('@')[0],
      'Translation Exercise',
      userText.split(/\s+/).length // word count
    );
  }

  // 3. Navigate or show success
  toast.success('Writing submitted!');
};
```

## Viewing Activities

Activities will automatically appear in:
1. **Analytics Dashboard** (`/dashboard/analytics`) - Shows recent activities for all students
2. **Student Detail Pages** - Can be extended to show per-student activity feed

## Activity Types Reference

| Type | Icon | Description |
|------|------|-------------|
| `FLASHCARD_CREATED` | 🎴 | Student created flashcard(s) |
| `FLASHCARD_REVIEWED` | ✅ | Student reviewed flashcard |
| `WRITING_SUBMITTED` | ✍️ | Student submitted writing exercise |
| `WRITING_REVIEWED` | 📝 | Teacher reviewed student writing |
| `LEVEL_CHANGED` | ⬆️ | Student progressed to new level |
| `STREAK_MILESTONE` | 🔥 | Student reached streak milestone |
| `LOGIN` | 👤 | Student logged in |
| `PRACTICE_SESSION` | 📚 | Student completed practice session |

## Next Steps

To integrate activity tracking:
1. Find the relevant component where the action occurs
2. Import the appropriate log function
3. Call it after the successful completion of the action
4. Make sure to pass student email and name from session

The analytics dashboard will automatically display these activities!
