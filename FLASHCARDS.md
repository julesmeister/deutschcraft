# Flashcards System - Quick Reference

## 🐛 Debugging Stats Issues

### Console Logging (Color-Coded)

Filter browser console for these emojis:
- 🔵 `[saveReview]` - Individual card saves
- 🟢 `[saveDailyProgress]` - Daily stats saves
- 🎴 `[useFlashcardSession]` - Session flow
- 📊 `[useStudyStats]` - Stats calculation

### Quick Debug Steps

1. **Start practice** → Look for `🎴 Session initialized` with email
2. **Rate a card (1-4)** → Look for `🔵 saveReview` logs and `✅ Save successful!`
3. **Complete session** → Look for `🟢 saveDailyProgress` and `✅ Create successful!`
4. **Check stats update** → Look for `📊 Final stats` with updated numbers

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `hasSession: false` | Not logged in | Check Firebase Auth |
| `Cannot save: No user email` | Auth failed | Wait 2s or check session |
| `Cannot save: No wordId` | Missing field | Run `npx tsx scripts/parse-remnote.ts` |
| `Missing permissions` | Firestore rules | Check `firestore.rules` |
| Stats show 0 | No data in Firestore | Open Firebase Console |
| No console logs | Code not running | Restart `npm run dev` |

### Recent Changes (2025-01-11)

✅ **Real-time listeners**: Stats auto-update when Firestore changes (no refresh needed)
✅ **Toast notifications**: Success/error messages for all saves
✅ **Input validation**: Checks for user email and flashcard ID before saving
✅ **Comprehensive logging**: Every save operation logged to console

---

## Core Data Models

### FlashcardProgress (`flashcard-progress` collection)
**Document ID**: `{userId}_{flashcardId}`

Key fields:
- `masteryLevel` (0-100): Based on SuperMemo 2 algorithm
- `repetitions`: Times reviewed
- `correctCount` / `incorrectCount`: Accuracy tracking
- `interval`: Days until next review
- `nextReviewDate`: Timestamp for SRS scheduling

### DailyProgress (`progress` collection)
**Document ID**: `PROG_YYYYMMDD_{email}` (e.g., `PROG_20250111_user@example.com`)

Key fields:
- `cardsReviewed`: Total cards today
- `wordsCorrect` / `wordsIncorrect`: Accuracy counts
- `timeSpent`: Minutes studied today
- `sessionsCompleted`: Number of sessions today

---

## Critical Data Flow

### 1. Rate Card → Save Review
**File**: `lib/hooks/useFlashcardSession.ts` → `lib/hooks/useFlashcardMutations.ts`

```
User rates card (1-4)
  ↓
handleDifficulty() logs attempt
  ↓
saveReview() called with userId, flashcardId, wordId, difficulty
  ↓
Calculate SuperMemo 2 data (repetitions, interval, masteryLevel)
  ↓
Save to flashcard-progress/{userId}_{flashcardId}
  ↓
Log "✅ [saveReview] Save successful!"
```

### 2. Complete Session → Save Daily Stats
**File**: `lib/hooks/useFlashcardSession.ts` → `lib/hooks/useFlashcardMutations.ts`

```
Last card rated
  ↓
handleSessionComplete() calculates totals
  ↓
saveDailyProgress() called with userId and stats
  ↓
Create/update document: PROG_YYYYMMDD_{email}
  ↓
Log "✅ [saveDailyProgress] Create successful!"
  ↓
Toast: "Progress saved successfully!"
```

### 3. Stats Display → Real-time Update
**File**: `lib/hooks/useFlashcards.ts - useStudyStats()`

```
Page loads or data changes in Firestore
  ↓
onSnapshot() listener triggers (real-time)
  ↓
Query flashcard-progress: count cards, calculate mastery
  ↓
Query progress: calculate streak from consecutive days
  ↓
Update stats: { totalCards, cardsLearned, streak, accuracy }
  ↓
Stats cards update automatically (no refresh)
```

---

## Key Files

### Practice Flow
- `app/dashboard/student/flashcards/page.tsx` - Landing page with stats
- `components/flashcards/FlashcardPractice.tsx` - Practice UI
- `lib/hooks/useFlashcardSession.ts` - Session logic
- `lib/hooks/useFlashcardMutations.ts` - Firestore saves

### Stats Calculation
- `lib/hooks/useFlashcards.ts` - `useStudyStats()` hook with real-time listeners

### Data Generation
- `scripts/parse-remnote.ts` - Generates flashcard JSON from vocabulary files
- `lib/data/syllabus/{level}/*.json` - Source vocabulary
- `lib/data/remnote/levels/{level}.json` - Generated flashcards

### Settings
- `lib/hooks/useFlashcardSettings.ts` - User preferences
- Saved to `users/{email}/flashcardSettings`

---

## Firestore Collections

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `users` | `{email}` | User profile & settings |
| `flashcard-progress` | `{userId}_{flashcardId}` | Individual card SRS data |
| `progress` | `PROG_YYYYMMDD_{email}` | Daily study stats |

**Note**: `students` collection exists in models but is **NOT CURRENTLY USED**. Stats are calculated on-demand from `flashcard-progress` and `progress` collections.

---

## SuperMemo 2 Algorithm (Quick Reference)

| Difficulty | Effect |
|------------|--------|
| **Forgotten (1)** | Reset to 0 reps, review tomorrow |
| **Hard (2)** | Small interval increase, lower ease |
| **Good (3)** | Normal progression (1d → 6d → multiply by ease) |
| **Easy (4)** | Fast progression, higher ease factor |

**Mastery Levels**:
- 0-19: New/Forgotten
- 20-39: Learning (1-2 reps)
- 40-69: Reviewing (3-5 reps)
- 70-100: Mastered (6+ reps) ← **Counts as "Cards Learned"**

---

## Testing Checklist

Before deploying, verify:
1. ✅ User can log in and session.user.email is defined
2. ✅ Console shows 🎴, 🔵, 🟢, 📊 logs during practice
3. ✅ Toast notifications appear after rating cards and completing session
4. ✅ Firebase Console shows documents in `flashcard-progress` and `progress`
5. ✅ Stats cards update automatically after session (no page refresh)
6. ✅ Cards Learned increases when mastery reaches 70%
7. ✅ Day Streak increments on consecutive days
8. ✅ Accuracy shows correct percentage

---

## Quick Fix Commands

```bash
# Restart dev server
npm run dev

# Regenerate flashcard JSON files (if vocabulary added/changed)
npx tsx scripts/parse-remnote.ts

# Check Firestore data (open Firebase Console)
# → Firestore Database → Browse collections
```
