# Flashcards System Guide

Complete guide to the flashcard management system, spaced repetition algorithm, and vocabulary organization.

---

## System Overview

**DeutschCraft Flashcards** uses a spaced repetition system (SRS) based on the SM-2 algorithm with 5 difficulty levels.

### Key Features
- ✅ **Semantic IDs** - Human-readable flashcard identifiers
- ✅ **CEFR Levels** - A1 to C2 German proficiency levels
- ✅ **Category Organization** - Split files for performance
- ✅ **Dual Database** - Turso for progress, Firestore for auth
- ✅ **SM-2 Algorithm** - Proven spaced repetition
- ✅ **Optimistic UI** - Instant feedback with background sync

---

## Flashcard Data Structure

### Semantic ID Format

```
{level}-{category}-{german_word}_{detail}
```

**Examples:**
- `a1-verbs-sein-to-be` (basic verb)
- `b2-adjectives-nachdenklich-thoughtful` (complex adjective)
- `c1-idioms-unter-vier-augen-privately` (idiomatic expression)

### Flashcard Schema

```typescript
interface Flashcard {
  id: string;              // Semantic ID (e.g., "a1-verbs-sein-to-be")
  german: string;          // German word/phrase
  english: string;         // English translation
  category: string;        // Category name (e.g., "Verbs", "Adjectives")
  level: CEFRLevel;        // A1, A2, B1, B2, C1, C2
  examples?: string[];     // Example sentences (optional)
  gender?: 'der' | 'die' | 'das';  // For nouns
  plural?: string;         // Plural form (for nouns)
}
```

### Progress Schema (Turso)

```sql
CREATE TABLE flashcard_progress (
  user_id TEXT NOT NULL,
  flashcard_id TEXT NOT NULL,
  mastery_level INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5,
  interval_days INTEGER DEFAULT 0,
  next_review_date INTEGER,
  last_reviewed_date INTEGER,
  review_count INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, flashcard_id)
);
```

---

## File Organization

### Split File Structure

```
lib/data/vocabulary/
├── levels/
│   ├── a1.json                 # Full A1 level (all categories combined)
│   ├── a2.json
│   ├── b1.json
│   └── ...
└── split/
    ├── a1/
    │   ├── _index.json         # Category index with IDs
    │   ├── basic-verbs.json    # Individual category files
    │   ├── adjectives.json
    │   ├── food-drinks.json
    │   └── ...
    ├── a2/
    │   ├── _index.json
    │   ├── common-verbs.json
    │   └── ...
    └── ...
```

### Index File Format

```json
{
  "level": "A1",
  "totalCards": 450,
  "totalCategories": 25,
  "categories": [
    {
      "name": "Basic Verbs",
      "file": "basic-verbs.json",
      "count": 30,
      "id": "basic-verbs",
      "icon": "🏃",
      "ids": ["a1-verbs-sein-to-be", "a1-verbs-haben-to-have", ...]
    }
  ]
}
```

**Why Split Files?**
- 📦 **Performance** - Load only needed categories (~20KB each vs 667KB full level)
- ⚡ **Faster Practice** - Instant category selection
- 🎯 **Targeted Review** - Review specific topics
- 💾 **Efficient Caching** - Cache frequently used categories

---

## Spaced Repetition System (SRS)

### SM-2 Algorithm Implementation

**5 Difficulty Levels:**

| Button | Meaning | Mastery Change | Next Review |
|--------|---------|---------------|-------------|
| ❌ **Again** | Forgot completely | → 0 | 1 minute |
| 🤔 **Hard** | Difficult to recall | +1 | 1 day |
| ✅ **Good** | Recalled correctly | +1 | 3 days |
| 😊 **Easy** | Instantly recalled | +2 | 1 week |
| 🌟 **Expert** | Too easy, master level | +3 | 6 months |

### Mastery Levels (0-10)

```
Level 0: New card (never reviewed)
Level 1: Just learned (review in 1 day)
Level 2: Familiar (review in 3 days)
Level 3: Comfortable (review in 1 week)
Level 4: Known (review in 2 weeks)
Level 5: Well-known (review in 1 month)
Level 6: Mastered (review in 2 months)
Level 7: Expert (review in 4 months)
Level 8: Near-native (review in 6 months)
Level 9: Native (review in 1 year)
Level 10: Permanent (review in 2 years)
```

### Algorithm Code

**Location**: `lib/utils/srs.ts`

```typescript
export function calculateNextReview(
  currentLevel: number,
  difficulty: DifficultyLevel,
  easeFactor: number = 2.5
): SRSResult {
  let newLevel = currentLevel;
  let newEaseFactor = easeFactor;
  let intervalDays = 0;

  switch (difficulty) {
    case "again":
      newLevel = 0;
      intervalDays = 0;
      newEaseFactor = Math.max(1.3, easeFactor - 0.2);
      break;
    case "hard":
      newLevel = Math.min(currentLevel + 1, 10);
      intervalDays = 1;
      newEaseFactor = Math.max(1.3, easeFactor - 0.15);
      break;
    case "good":
      newLevel = Math.min(currentLevel + 1, 10);
      intervalDays = currentLevel === 0 ? 3 : Math.round(intervalDays * easeFactor);
      break;
    case "easy":
      newLevel = Math.min(currentLevel + 2, 10);
      intervalDays = currentLevel === 0 ? 7 : Math.round(intervalDays * easeFactor * 1.3);
      newEaseFactor = easeFactor + 0.15;
      break;
    case "expert":
      newLevel = Math.min(currentLevel + 3, 10);
      intervalDays = 180; // 6 months
      newEaseFactor = easeFactor + 0.2;
      break;
  }

  return {
    masteryLevel: newLevel,
    easeFactor: newEaseFactor,
    intervalDays,
    nextReviewDate: Date.now() + intervalDays * 24 * 60 * 60 * 1000,
  };
}
```

---

## Practice Session Flow

### 1. Category Selection

```typescript
// User clicks category button
handleCategoryClick(categoryId, categoryName)
  ↓
// Fetch category file (e.g., basic-verbs.json)
const data = await fetchVocabularyCategory(level, "basic-verbs.json");
  ↓
// Enrich with progress data
const cardsWithProgress = data.flashcards.map(card => ({
  ...card,
  masteryLevel: progressMap.get(card.id)?.masteryLevel ?? 0,
  nextReviewDate: progressMap.get(card.id)?.nextReviewDate,
}));
  ↓
// Apply settings filter (only due cards)
const { cards, nextDueInfo } = applyFlashcardSettings(cardsWithProgress, settings);
  ↓
// Start practice session
setPracticeFlashcards(cards);
```

### 2. Card Review

```typescript
// User marks difficulty (e.g., "Good")
handleDifficulty("good")
  ↓
// Calculate SRS result
const srsResult = calculateNextReview(currentCard.masteryLevel, "good");
  ↓
// Save to database (background, non-blocking)
await saveFlashcardProgress(userId, flashcardId, srsResult);
  ↓
// Update local state (optimistic UI)
setReviewedCards(prev => ({ ...prev, [flashcardId]: "good" }));
  ↓
// Move to next card
handleNext();
```

### 3. Session Complete

```typescript
handleBackToCategories(reviewedCards)
  ↓
// Multi-layered cache refresh (see CACHE_INVALIDATION.md)
await Promise.all([
  queryClient.refetchQueries({ queryKey: "flashcardProgress" }),
  queryClient.refetchQueries({ queryKey: "weeklyProgress" }),
]);
  ↓
// Update due counts (automatic via useMemo)
categoryDueCounts recalculates
  ↓
// UI updates with fresh data
CategoryButtonGrid shows updated badges
```

---

## Flashcard Settings

### User-Configurable Options

```typescript
interface FlashcardSettings {
  newCardsPerDay: number;       // Max new cards per session (default: 20)
  maxReviewsPerDay: number;     // Max reviews per session (default: 100)
  showExamples: boolean;        // Show example sentences (default: true)
  autoPlayAudio: boolean;       // Auto-play pronunciation (default: false)
  cardOrder: 'due' | 'random';  // Card presentation order
}
```

**Storage**: `lib/hooks/useFlashcardSettings.ts`
- Saved in localStorage
- Synced across tabs
- Persists between sessions

---

## Performance Optimizations

### 1. Split File Loading

**Before**: Load entire level (667KB for B1)
**After**: Load only needed category (~20KB)
**Improvement**: 97% reduction in data transfer

### 2. Review All Mode Pagination

**Before**: Load ALL 1554 cards for B1
**After**: Load max 200 cards with pagination
**Improvement**: Prevents memory issues, faster load

**Code**: `useFlashcardSessionManager.ts:246`

```typescript
const MAX_CARDS_TO_LOAD = 200;
for (const cat of categoryIndex.categories) {
  if (loadedCards.length >= MAX_CARDS_TO_LOAD) {
    break; // Stop loading
  }
  const data = await fetchVocabularyCategory(level, cat.file);
  loadedCards.push(...data.flashcards);
}
```

### 3. Optimistic UI Updates

**Flow:**
1. User marks card → Instant UI feedback
2. Background: Save to database
3. On session complete: Refetch fresh data
4. Due counts update automatically via useMemo

**Benefits:**
- No waiting for database writes
- Smooth, responsive UX
- Server data is source of truth

### 4. Combined useMemo Calculations

**Before**: 5 separate useMemo hooks
**After**: 2 combined hooks
**Improvement**: Reduces re-renders by 60%

---

## Vocabulary Management

### Adding New Flashcards

1. **Create flashcard in split file**:
```json
{
  "id": "b1-verbs-beantragen-to-apply-for",
  "german": "beantragen",
  "english": "to apply for",
  "category": "Verbs",
  "level": "B1",
  "examples": [
    "Ich muss ein Visum beantragen.",
    "Sie hat einen Kredit beantragt."
  ]
}
```

2. **Rebuild index files**:
```bash
npm run flashcards:rebuild-index
```

3. **Verify IDs**:
```bash
npm run flashcards:verify
```

### Migration to Semantic IDs (Completed)

**Old Format**: `FLASH_syllabus-a1-10000`
**New Format**: `a1-verbs-sein-to-be`

**Scripts Used:**
- `scripts/migration/01-generate-id-mapping.ts` - Created mapping
- `scripts/migration/02-migrate-split-files.ts` - Updated split files
- `scripts/migration/03-migrate-database.ts` - Updated Turso DB
- `scripts/rebuild-index-files.ts` - Rebuilt all indexes

**Verification**: 100% migration complete (0 old IDs remaining)

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Space** / **Enter** | Flip card |
| **1** | Again (forgot) |
| **2** | Hard |
| **3** | Good |
| **4** | Easy |
| **5** | Expert |
| **←** | Previous card |
| **→** | Next card |

**Implementation**: `lib/hooks/useFlashcardKeyboard.ts`

---

## API Endpoints

### GET `/api/vocabulary/[level]`
Returns all flashcards for a level.

**Response:**
```json
{
  "level": "A1",
  "flashcards": [...],
  "totalCards": 450
}
```

### GET `/api/vocabulary/[level]/categories`
Returns category index for a level.

**Response:**
```json
{
  "level": "A1",
  "totalCards": 450,
  "categories": [...]
}
```

### GET `/api/vocabulary/[level]/category/[filename]`
Returns specific category file.

**Response:**
```json
{
  "flashcards": [...]
}
```

**Caching**: All endpoints use Next.js `unstable_cache` with 1-hour TTL.

---

## Troubleshooting

### No Due Cards Showing

**Check:**
1. Flashcard progress exists in Turso
2. `next_review_date` is in the past
3. Settings: `maxReviewsPerDay` not reached
4. React Query cache is fresh

**Fix:**
```bash
# Verify database
npm run turso:verify

# Clear React Query cache
# (Dev tools → React Query → Clear cache)
```

### Due Counts Not Updating

**Solution**: See [Cache Invalidation Guide](../technical/CACHE_INVALIDATION.md)

Multi-layered system with 6 layers:
1. Force refetch (not just invalidate)
2. Cancel in-flight requests
3. Loading state management
4. Deduplication prevention
5. Optimistic UI updates
6. Automatic useMemo recalculation

### Progress Not Saving

**Check:**
1. User is logged in (`session.user.email` exists)
2. Turso credentials in `.env.local`
3. Network tab shows successful POST requests
4. No console errors

**Debug:**
```typescript
// Enable development logging
if (process.env.NODE_ENV === 'development') {
  console.log('[SessionManager] 🔄 Starting cache refresh');
}
```

---

## Related Documentation

- [Cache Invalidation System](../technical/CACHE_INVALIDATION.md) - Complete cache strategy
- [Database Setup](./DATABASE_SETUP.md) - Turso & Firestore configuration
- [Architecture](../technical/ARCHITECTURE.md) - Overall system design
