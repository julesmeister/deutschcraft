# Student Data Model & Stats Flow

## Overview
This document maps the complete data flow for student statistics, flashcard progress, and how everything connects together.

---

## Data Models

### 1. User Model (`lib/models/user.ts`)
```typescript
interface User {
  userId: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  flashcardSettings?: {
    cardsPerSession: number;    // -1 = unlimited
    autoPlayAudio: boolean;
    showExamples: boolean;
    randomizeOrder: boolean;
  };
}
```

**Firestore Collection**: `users`
**Document ID**: User's email address

---

### 2. Student Model (`lib/models/student.ts`)
```typescript
interface Student {
  studentId: string;
  userId: string;
  email: string;
  currentLevel: CEFRLevel;      // A1, A2, B1, B2, C1, C2

  // Learning Stats
  wordsLearned: number;          // Total unique words learned (masteryLevel >= 70)
  currentStreak: number;         // Days in a row with activity
  totalStudyTime: number;        // Total minutes studied
  cardsReviewed: number;         // Total cards reviewed (all time)

  // Accuracy
  totalCorrect: number;          // Total correct answers
  totalIncorrect: number;        // Total incorrect answers

  // Progress tracking
  lastStudyDate: string;         // ISO date string
  createdAt: number;
  updatedAt: number;
}
```

**Firestore Collection**: `students`
**Document ID**: User's email address

---

### 3. FlashcardProgress Model (`lib/models/flashcard.ts`)
```typescript
interface FlashcardProgress {
  progressId: string;            // Format: {userId}_{flashcardId}
  userId: string;
  flashcardId: string;
  wordId: string;

  // SRS (Spaced Repetition System) Data
  repetitions: number;           // Number of times reviewed
  easeFactor: number;            // 1.3 to 2.5 (difficulty multiplier)
  interval: number;              // Days until next review
  nextReviewDate: number;        // Timestamp
  masteryLevel: number;          // 0-100 (based on SRS algorithm)

  // Review counts
  correctCount: number;
  incorrectCount: number;

  // Timestamps
  lastReviewDate: number;
  createdAt: number;
  updatedAt: number;
}
```

**Firestore Collection**: `flashcard-progress`
**Document ID**: `{userId}_{flashcardId}`

**Mastery Calculation**:
- 0-19: New/Forgotten
- 20-39: Learning (1-2 reps)
- 40-69: Reviewing (3-5 reps)
- 70-100: Mastered (6+ reps)

---

### 4. DailyProgress Model (`lib/models/progress.ts`)
```typescript
interface StudyProgress {
  progressId: string;            // Format: PROG_YYYYMMDD_{email}
  userId: string;
  date: string;                  // ISO date string (YYYY-MM-DD)

  // Daily stats
  wordsStudied: number;          // Cards reviewed today
  wordsCorrect: number;          // Correct answers today
  wordsIncorrect: number;        // Incorrect answers today
  timeSpent: number;             // Minutes studied today
  cardsReviewed: number;         // Total cards reviewed today
  sessionsCompleted: number;     // Number of sessions completed

  // Additional
  sentencesCreated: number;      // For future sentence practice

  createdAt: number;
}
```

**Firestore Collection**: `progress`
**Document ID**: `PROG_YYYYMMDD_{email}` (e.g., `PROG_20250111_user@example.com`)

---

## Data Flow: Flashcard Practice Session

### Phase 1: User Starts Practice
**File**: `app/dashboard/student/flashcards/page.tsx`

1. User clicks category or "Start Practice"
2. Flashcards loaded from `lib/data/remnote/levels/{level}.json`
3. Settings applied from `useFlashcardSettings()`
   - Apply `cardsPerSession` limit
   - Apply `randomizeOrder`
4. `FlashcardPractice` component rendered

---

### Phase 2: User Reviews Cards
**File**: `components/flashcards/FlashcardPractice.tsx`
**Hook**: `lib/hooks/useFlashcardSession.ts`

For each card:
1. User sees German word
2. User clicks "Show Answer" (or Space/Enter)
3. User rates difficulty: Forgotten(1) / Hard(2) / Good(3) / Easy(4)

**On difficulty selection**:
```typescript
// lib/hooks/useFlashcardSession.ts - handleDifficulty()
const handleDifficulty = async (difficulty: DifficultyLevel) => {
  // 1. Update local state
  setMasteryStats(prev => ({...prev, [difficulty]: prev[difficulty] + 1}))

  // 2. Show toast notification
  toast.addToast(message, variant)

  // 3. Save to Firestore
  if (session?.user?.email && currentCard.wordId) {
    await saveReview(
      session.user.email,
      currentCard.id,
      currentCard.wordId,
      difficulty
    )
  }

  // 4. If last card, complete session
  if (isLastCard) {
    await handleSessionComplete(updatedStats)
  } else {
    handleNext()
  }
}
```

---

### Phase 3: Save Individual Review
**File**: `lib/hooks/useFlashcardMutations.ts`

```typescript
const saveReview = async (userId, flashcardId, wordId, difficulty) => {
  // 1. Get existing progress
  const progressId = `${userId}_${flashcardId}`
  const progressRef = doc(db, 'flashcard-progress', progressId)
  const progressDoc = await getDoc(progressRef)

  // 2. Calculate new SRS data using SuperMemo 2
  const srsData = calculateSRSData(currentProgress, difficulty)

  // 3. Update/create progress document
  await setDoc(progressRef, {
    flashcardId,
    userId,
    wordId,
    repetitions: srsData.repetitions,
    easeFactor: srsData.easeFactor,
    interval: srsData.interval,
    nextReviewDate: srsData.nextReviewDate,
    masteryLevel: srsData.masteryLevel,    // 0-100
    lastReviewDate: Date.now(),
    correctCount: difficulty === 'again' ? prev : prev + 1,
    incorrectCount: difficulty === 'again' ? prev + 1 : prev,
    updatedAt: Date.now()
  })
}
```

**SuperMemo 2 Algorithm**:
- `again`: repetitions = 0, interval = 1 day, easeFactor -= 0.2
- `hard`: repetitions += 1, interval *= 1.2, easeFactor -= 0.15
- `good`: repetitions += 1, interval = [1, 6, or interval * easeFactor]
- `easy`: repetitions += 1, interval = [4, 10, or interval * easeFactor * 1.3], easeFactor += 0.15

---

### Phase 4: Complete Session
**File**: `lib/hooks/useFlashcardSession.ts`

```typescript
const handleSessionComplete = async (finalStats) => {
  // 1. Calculate session stats
  const totalReviewed = finalStats.again + finalStats.hard +
                        finalStats.good + finalStats.easy
  const correctCount = finalStats.good + finalStats.easy
  const incorrectCount = finalStats.again + finalStats.hard
  const timeSpent = Math.ceil((Date.now() - sessionStartTime) / 60000)

  // 2. Save to daily progress
  if (session?.user?.email) {
    await saveDailyProgress(session.user.email, {
      cardsReviewed: totalReviewed,
      timeSpent,
      correctCount,
      incorrectCount
    })
  }

  // 3. Show summary
  setShowSummary(true)
}
```

---

### Phase 5: Save Daily Progress
**File**: `lib/hooks/useFlashcardMutations.ts`

```typescript
const saveDailyProgress = async (userId, stats) => {
  // 1. Generate document ID
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const progressId = `PROG_${today}_${userId}`
  const progressRef = doc(db, 'progress', progressId)

  // 2. Get existing progress for today
  const progressDoc = await getDoc(progressRef)

  if (progressDoc.exists()) {
    // Update existing (increment values)
    await updateDoc(progressRef, {
      cardsReviewed: increment(stats.cardsReviewed),
      timeSpent: increment(stats.timeSpent),
      wordsCorrect: increment(stats.correctCount),
      wordsIncorrect: increment(stats.incorrectCount),
      sessionsCompleted: increment(1)
    })
  } else {
    // Create new entry
    await setDoc(progressRef, {
      progressId,
      userId,
      date: new Date().toISOString().split('T')[0],
      wordsStudied: stats.cardsReviewed,
      wordsCorrect: stats.correctCount,
      wordsIncorrect: stats.incorrectCount,
      timeSpent: stats.timeSpent,
      sessionsCompleted: 1,
      cardsReviewed: stats.cardsReviewed,
      sentencesCreated: 0,
      createdAt: Date.now()
    })
  }
}
```

---

## Stats Display: Flashcards Page

### File: `app/dashboard/student/flashcards/page.tsx`

```typescript
const { stats, isLoading } = useStudyStats(
  session?.user?.email,
  statsRefreshKey  // Refreshes when session completes
)
```

### Hook: `lib/hooks/useFlashcards.ts - useStudyStats()`

```typescript
export function useStudyStats(userId?: string, refreshKey?: number) {
  useEffect(() => {
    // 1. Query flashcard-progress collection
    const progressRef = collection(db, 'flashcard-progress')
    const progressQuery = query(progressRef, where('userId', '==', userId))
    const progressSnapshot = await getDocs(progressQuery)
    const progressData = progressSnapshot.docs.map(doc => doc.data())

    // 2. Calculate stats
    const totalCards = progressData.length
    const cardsLearned = progressData.filter(p => p.masteryLevel >= 70).length
    const totalCorrect = progressData.reduce((sum, p) => sum + p.correctCount, 0)
    const totalIncorrect = progressData.reduce((sum, p) => sum + p.incorrectCount, 0)
    const accuracy = totalAttempts > 0
      ? Math.round((totalCorrect / totalAttempts) * 100)
      : 100

    // 3. Query progress collection for streak
    const studyProgressRef = collection(db, 'progress')
    const studyQuery = query(
      studyProgressRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(30)
    )
    const studySnapshot = await getDocs(studyQuery)
    const studyData = studySnapshot.docs.map(doc => doc.data())

    // 4. Calculate streak
    let streak = 0
    const today = new Date()
    for (let i = 0; i < studyData.length; i++) {
      const progressDate = new Date(studyData[i].date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      if (progressDate.getTime() === expectedDate.getTime()) {
        streak++
      } else {
        break
      }
    }

    setStats({ totalCards, cardsLearned, streak, accuracy })
  }, [userId, refreshKey])
}
```

---

## Current Issues & Debugging

### Issue: Stats not updating after session

**Possible causes**:

1. **Data not being saved**:
   - Check browser console for "Saving daily progress:" log
   - Check browser console for "Daily progress saved successfully!" log
   - Check Firestore console for documents in `progress` collection

2. **Stats not refreshing**:
   - `statsRefreshKey` should increment when `handleBackToCategories()` is called
   - Check if `useEffect` in `useStudyStats` is re-running

3. **Wrong user ID**:
   - Verify `session?.user?.email` is correct
   - Check if it matches document IDs in Firestore

4. **Query permissions**:
   - Check Firestore rules allow reading `flashcard-progress` and `progress`

### Debugging Steps:

1. **Open browser console** (F12 → Console)
2. **Complete a flashcard session**
3. **Look for these logs**:
   ```
   Saving daily progress: { userId, cardsReviewed, timeSpent, correctCount, incorrectCount }
   Daily progress saved successfully!
   Study stats calculated: { userId, totalCards, cardsLearned, totalCorrect, totalIncorrect, accuracy }
   ```

4. **Check Firestore Console**:
   - Go to Firebase Console → Firestore Database
   - Check `flashcard-progress` collection for documents
   - Check `progress` collection for today's document (format: `PROG_YYYYMMDD_email`)

5. **Verify data flow**:
   - After completing session, click "Finish Session"
   - Verify `handleBackToCategories()` is called
   - Verify `statsRefreshKey` increments
   - Verify `useStudyStats` hook re-runs

---

## Data Collections Summary

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `users` | `{email}` | User profile & settings |
| `students` | `{email}` | Student-specific data (NOT CURRENTLY USED) |
| `flashcard-progress` | `{userId}_{flashcardId}` | Individual card progress & SRS data |
| `progress` | `PROG_YYYYMMDD_{email}` | Daily study statistics |
| `flashcards` | `{flashcardId}` | NOT USED - cards loaded from JSON files |

**Note**: Currently, the `students` collection is NOT being used or updated. Stats are calculated on-the-fly from `flashcard-progress` and `progress` collections.

---

## Next Steps to Fix Stats

1. **Add more logging** to trace data flow
2. **Verify Firestore permissions** allow writes
3. **Check if documents are actually being created** in Firestore
4. **Ensure `statsRefreshKey` mechanism works** properly
5. **Consider creating a `useEffect` listener** in `useStudyStats` to watch Firestore in real-time instead of manual refresh
6. **Add error handling** to display toast notifications if saves fail

---

## Connected Systems & Components

### 1. Student Dashboard Overview (`app/dashboard/student/page.tsx`)
**Purpose**: Main student landing page showing high-level stats

**Displays**:
- Welcome message with student name
- Quick access cards to Flashcards, Syllabus, Tasks, Chat
- Overall progress metrics (pulled from same stats as flashcards page)

**Connected to**:
- `useStudyStats()` hook for overall statistics
- `useFirebaseAuth()` for user session
- Links to flashcards, syllabus, tasks, and chat pages

**Significance**: First page students see after login - should reflect accurate learning progress

---

### 2. Flashcards Landing Page (`app/dashboard/student/flashcards/page.tsx`)
**Purpose**: Browse and select flashcard categories by CEFR level

**Displays**:
- 4 stat cards: Available Cards, Cards Learned, Day Streak, Accuracy
- CEFR level selector (A1-C2)
- Category grid showing vocabulary categories for selected level
- "Start Practice" button

**Data Sources**:
- `useStudyStats(userId, refreshKey)` - calculates stats from Firestore
- `useRemNoteCategories(level)` - loads categories from JSON
- `useRemNoteTotalCards(level)` - counts total available cards
- `useFlashcardSettings()` - loads user preferences

**Connected Files**:
- `lib/hooks/useFlashcards.ts` - stats calculation
- `lib/hooks/useRemNoteCategories.ts` - category loading
- `lib/hooks/useFlashcardSettings.ts` - settings management
- `lib/data/remnote/levels/{level}.json` - flashcard data
- `lib/data/categories/{level}.json` - category definitions

**Significance**: Central hub for flashcard learning - stats here must reflect actual progress

---

### 3. Flashcard Practice Component (`components/flashcards/FlashcardPractice.tsx`)
**Purpose**: Main practice interface during flashcard review

**Contains Sub-components**:
- `MasteryStats` - shows session stats (Forgotten/Hard/Good/Easy counts)
- `FlashcardCard` - displays the actual card with flip animation
- `DifficultyButtons` - shows 4 difficulty options after flipping
- `KeyboardShortcutsLegend` - displays available keyboard shortcuts
- `SessionSummary` - end-of-session results screen

**Props Received**:
- `flashcards` array - cards to practice
- `categoryName` - display name
- `level` - CEFR level
- `onBack` - callback to return to categories
- `showExamples` - whether to show example sentences

**Connected to**:
- `useFlashcardSession()` hook - manages all session state and logic

**Significance**: Where actual learning happens - every interaction here should save to Firestore

---

### 4. Session Summary Component (`components/flashcards/SessionSummary.tsx`)
**Purpose**: Displays results after completing a flashcard session

**Displays**:
- Total cards reviewed
- Accuracy percentage
- Breakdown by difficulty (Forgotten, Hard, Good, Easy) with progress bars
- Time spent and average time per card
- "Review Forgotten Cards" button
- "Finish Session" button

**Props Received**:
- `stats` - object with counts for each difficulty level
- `totalCards` - total number of cards in session
- `timeSpent` - seconds spent in session
- `onReview` - callback to review failed cards again
- `onFinish` - callback to exit session

**Significance**: Last screen before returning to categories - triggers stats refresh via `onFinish` callback

---

### 5. Settings Page - Flashcards Tab (`components/ui/settings/FlashcardSettingsTab.tsx`)
**Purpose**: Configure flashcard practice preferences

**Settings Available**:
- Cards per session (10, 20, 30, 50, 100, unlimited)
- Auto-play audio (not implemented yet)
- Show examples (controls example sentences display)
- Randomize order (shuffles cards before practice)

**Data Flow**:
- Loads settings from `users/{email}/flashcardSettings`
- Auto-saves on change (no manual save button)
- Shows toast notification on successful save

**Connected to**:
- `useFlashcardSettings()` hook
- Applied in flashcards page when starting practice
- Affects `FlashcardCard` component (showExamples prop)

**Significance**: User preferences control the practice experience

---

### 6. Syllabus Page (`app/dashboard/student/syllabus/page.tsx`)
**Purpose**: Displays structured German curriculum by CEFR level

**Features**:
- CEFR level selector dropdown
- Study intensity calculator (hours/day affects total weeks)
- Weekly schedule breakdown
- Topics organized by week with descriptions

**Data Sources**:
- `lib/data/syllabus-data.ts` - curriculum structure
- Each level (A1-C2) has defined topics, grammar points, and timelines

**NOT Connected to Flashcards**:
- Syllabus is informational/planning only
- Does not track progress or completion
- No data saved to Firestore

**Significance**: Reference material for study planning - separate from actual practice/progress

---

### 7. Tasks Page (`app/dashboard/tasks/page.tsx`)
**Purpose**: Task management system (NOT flashcard-related)

**Features**:
- Create, edit, delete tasks
- Organize by status (pending/in-progress/completed)
- Set priority levels
- Expand/collapse task details

**NOT Connected to Flashcards**:
- Separate system for general task management
- Uses `tasks` Firestore collection
- No impact on flashcard statistics

**Significance**: General productivity tool - unrelated to learning progress

---

### 8. Chat Page (`app/dashboard/chat/page.tsx`)
**Purpose**: AI-powered German language chat assistant

**Features**:
- Conversation interface with AI
- German language practice through chat
- Message history

**Data Storage**:
- `conversations` Firestore collection
- Stores message history per user

**NOT Directly Connected to Flashcards**:
- Separate learning mode
- Does not update flashcard statistics
- Could potentially integrate in future (track German usage)

**Significance**: Alternative learning method - currently isolated from flashcard progress

---

## Data Generation & Management

### 9. Parse RemNote Script (`scripts/parse-remnote.ts`)
**Purpose**: Generates flashcard JSON files from source data

**What it does**:
1. Reads vocabulary from `lib/data/syllabus/{level}/*.json` files
2. Reads vocabulary from `remnote-german/German.md` file
3. Assigns CEFR levels based on word complexity
4. Categorizes vocabulary into learning categories
5. Generates consolidated JSON files

**Output Files**:
- `lib/data/remnote/levels/{level}.json` - flashcards by level
- `lib/data/remnote/all-flashcards.json` - all flashcards combined
- `lib/data/remnote/stats.json` - vocabulary statistics
- `lib/data/remnote/{category}.json` - flashcards by category

**When to Run**:
- After adding/editing vocabulary in `lib/data/syllabus/`
- Run command: `npx tsx scripts/parse-remnote.ts`

**Significance**: This is the SOURCE of all flashcard data - must be regenerated when vocabulary changes

---

### 10. Vocabulary Source Files (`lib/data/syllabus/{level}/*.json`)
**Purpose**: Raw vocabulary data organized by CEFR level

**Structure**:
```
lib/data/syllabus/
├── a1/
│   ├── greetings.json
│   ├── family.json
│   ├── irregular-verbs.json
│   └── ... (22 files total)
├── a2/
│   ├── feelings.json
│   ├── nature.json
│   ├── reflexive-verbs.json
│   └── ... (21 files total)
├── b1/
│   ├── conjunctions.json
│   ├── positional-verbs.json
│   ├── separable-verbs.json
│   └── ... (11 files total)
├── b2/
│   ├── academic.json
│   ├── idioms.json
│   ├── separable-verbs.json
│   └── ... (7 files total)
├── c1/ (5 files)
└── c2/ (2 files)
```

**Format**: Array of `{ german: string, english: string }` objects

**Significance**:
- Direct source for ALL vocabulary in the app
- Must run parse-remnote.ts after changes
- Determines what appears in practice sessions

---

### 11. Category Definitions (`lib/data/categories/{level}.json`)
**Purpose**: Defines display categories for each CEFR level

**Contains**:
- Category ID (used for filtering)
- Display name
- Icon emoji
- Description
- Example words
- Priority (display order)

**Used by**:
- `useRemNoteCategories()` hook
- Flashcards landing page category grid

**Significance**: Controls how vocabulary is organized and presented to users

---

### 12. RemNote Source Data (`remnote-german/German.md`)
**Purpose**: Additional vocabulary from RemNote study notes

**Contains**:
- ~972 flashcards from personal study notes
- Hierarchical structure with categories
- Advanced vocabulary (mostly B1-C1)

**Significance**:
- Supplements syllabus vocabulary
- Provides real-world study material
- Combined with syllabus data during parsing

---

## Authentication & Session Management

### 13. Firebase Auth Hook (`lib/hooks/useFirebaseAuth.ts`)
**Purpose**: Manages user authentication state

**Provides**:
- `session` - current user session object
- `session.user.email` - used as userId throughout app
- `loading` - auth loading state
- `signIn()`, `signOut()` functions

**Used by**: Every component that needs user identification

**Significance**:
- User email is the PRIMARY KEY for all data
- All Firestore queries depend on this
- If session is null/undefined, no data is saved/loaded

---

### 14. Firebase Configuration (`lib/firebase.ts`)
**Purpose**: Initializes Firebase services

**Exports**:
- `app` - Firebase app instance
- `auth` - Authentication service
- `db` - Firestore database instance
- `storage` - Firebase storage (not used yet)

**Significance**: Central connection to Firebase - all data operations go through this

---

## UI Components (Shared)

### 15. Toast Notifications (`components/ui/toast/`)
**Files**:
- `Toast.tsx` - individual toast component
- `ToastProvider.tsx` - context provider
- `index.ts` - exports

**Used for**:
- Difficulty rating feedback ("Good recall! 👍")
- Settings saved confirmation
- Error messages
- Success notifications

**Connected to**:
- `useFlashcardSession()` - shows toast after each card rating
- `useFlashcardSettings()` - shows toast after settings save

**Significance**: User feedback mechanism - confirms actions are happening

---

### 16. Stat Card Components (`components/ui/StatCardSimple.tsx`)
**Purpose**: Display metric cards on dashboards

**Props**:
- `label` - stat name
- `value` - stat value (number or string)
- `icon` - emoji icon
- `bgColor` - background color class
- `iconBgColor` - icon background color class

**Used on**:
- Student dashboard main page
- Flashcards landing page (4 stat cards)

**Significance**: Visual representation of progress - must show accurate data

---

## Progress Tracking & Analytics (Future)

### 17. Teacher Dashboard (`app/dashboard/teacher/page.tsx`)
**Purpose**: Teacher view of all students (NOT FULLY IMPLEMENTED)

**Intended Features**:
- List of all students
- Individual student progress
- Class-wide statistics
- Assignment management

**Connection to Flashcards**:
- Would read from same `flashcard-progress` and `progress` collections
- Could view student stats across all levels
- Could track class progress

**Current Status**: Basic structure exists, not fully connected

**Significance**: Future feature for monitoring student progress at scale

---

### 18. Study Sessions Collection (POTENTIAL FUTURE)
**Purpose**: NOT CURRENTLY IMPLEMENTED - could track detailed session data

**What it could store**:
- Session start/end times
- Cards reviewed in each session
- Difficulty ratings per card
- Session accuracy
- Time per card

**Benefits**:
- More granular analytics
- Session-by-session progress
- Better streak calculation
- Session history

**Significance**: Would provide richer data for progress tracking

---

## Key Integration Points

### Where Stats SHOULD Update:

1. **On Difficulty Rating**:
   - Individual card progress saved to `flashcard-progress`
   - Updates: repetitions, easeFactor, masteryLevel, correctCount/incorrectCount

2. **On Session Complete**:
   - Daily progress saved to `progress` collection
   - Updates: cardsReviewed, timeSpent, wordsCorrect, wordsIncorrect, sessionsCompleted

3. **On Returning to Categories**:
   - `statsRefreshKey` incremented
   - Triggers `useStudyStats()` to re-query Firestore
   - Re-calculates: Cards Learned, Accuracy, Streak

### Where Stats are DISPLAYED:

1. **Flashcards Landing Page** - 4 stat cards at top
2. **Student Dashboard** - Overview stats
3. **Session Summary** - Per-session stats (doesn't query Firestore)
4. **During Practice** - Live mastery stats (local state only)

---

## Critical Dependencies

### Must Be Working For Stats to Update:

1. ✅ Firebase initialized (`lib/firebase.ts`)
2. ✅ User authenticated (`useFirebaseAuth()`)
3. ✅ User email available (`session?.user?.email`)
4. ⚠️ Firestore permissions allow read/write
5. ⚠️ Network connection to Firebase
6. ⚠️ Flashcards have valid `wordId` field
7. ✅ Toast provider wraps practice page
8. ✅ Stats refresh mechanism (`statsRefreshKey`)

### Common Failure Points:

- **User email undefined** → no data saved (userId is null)
- **Firestore permissions denied** → silent save failures
- **Network issues** → saves queued but not executed
- **Missing wordId** → skips save entirely
- **Stats not refreshing** → old data displayed
- **Console errors** → check browser console for Firebase errors

---

## File Reference Map

```
Core Practice Flow:
├── app/dashboard/student/flashcards/page.tsx          (landing page, stats display)
├── components/flashcards/FlashcardPractice.tsx        (practice interface)
├── components/flashcards/SessionSummary.tsx           (results screen)
├── lib/hooks/useFlashcardSession.ts                   (session logic)
└── lib/hooks/useFlashcardMutations.ts                 (saves to Firestore)

Stats Calculation:
├── lib/hooks/useFlashcards.ts                         (useStudyStats hook)
└── Queries: flashcard-progress + progress collections

Data Sources:
├── lib/data/remnote/levels/{level}.json               (flashcard data)
├── lib/data/syllabus/{level}/*.json                   (vocabulary source)
└── scripts/parse-remnote.ts                           (generates JSON files)

Settings:
├── components/ui/settings/FlashcardSettingsTab.tsx    (UI)
├── lib/hooks/useFlashcardSettings.ts                  (logic)
└── Firestore: users/{email}/flashcardSettings

Authentication:
├── lib/hooks/useFirebaseAuth.ts                       (session management)
└── lib/firebase.ts                                    (Firebase config)

Models (TypeScript Interfaces):
├── lib/models/user.ts                                 (User)
├── lib/models/student.ts                              (Student - NOT USED)
├── lib/models/flashcard.ts                            (FlashcardProgress)
└── lib/models/progress.ts                             (StudyProgress)

UI Components:
├── components/ui/toast/                               (notifications)
└── components/ui/StatCardSimple.tsx                   (stat display cards)

Other Pages (Not Connected):
├── app/dashboard/student/syllabus/page.tsx            (reference only)
├── app/dashboard/tasks/page.tsx                       (task management)
└── app/dashboard/chat/page.tsx                        (AI chat)
```
