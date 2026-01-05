# Multi-Layered Cache Invalidation System

## Problem Statement

After completing a flashcard practice session, category due counts were not updating immediately. Users had to manually refresh the page to see updated progress. This created a poor user experience and made it unclear whether their progress was being saved.

### Root Cause

The original implementation used React Query's `invalidateQueries()` which only marks data as **stale** but doesn't force an immediate refetch. Combined with a 500ms setTimeout anti-pattern, the cache wasn't being updated until the next component render or manual page refresh.

## Solution: 6-Layer Cache Invalidation System

### Layer 1: Force Immediate Refetch (Not Just Invalidate)

**Location**: `app/dashboard/student/flashcards/hooks/useFlashcardSessionManager.ts:135-149`

```typescript
// ❌ OLD: Only marks data as stale
queryClient.invalidateQueries({ queryKey: queryKeys.flashcardProgress(userEmail) });

// ✅ NEW: Forces immediate data fetch
await Promise.all([
  queryClient.refetchQueries({
    queryKey: queryKeys.flashcardProgress(userEmail),
    type: 'active',
  }),
  queryClient.refetchQueries({
    queryKey: queryKeys.weeklyProgress(userEmail),
    type: 'active',
  }),
  queryClient.refetchQueries({
    queryKey: ["todayProgress", userEmail],
    type: 'active',
  }),
]);
```

**Benefits**:
- Immediate database fetch (no waiting for next render)
- Parallel refetch of all related queries (performance optimization)
- Only refetches active queries (avoids wasted work)

### Layer 2: Bypass Cache with cancelRefetch

**Location**: `app/dashboard/student/flashcards/hooks/useFlashcardData.ts:51`

```typescript
// Force cache bypass on manual refresh triggers
refetchReviews({ cancelRefetch: true });
```

**Benefits**:
- Cancels any in-flight requests
- Bypasses React Query cache entirely
- Ensures fresh data from database

### Layer 3: Loading State Management

**Location**: `app/dashboard/student/flashcards/hooks/useFlashcardSessionManager.ts:128,157`

```typescript
setIsRefreshingData(true);
try {
  await Promise.all([/* refetch queries */]);
} finally {
  setIsRefreshingData(false);
}
```

**UI Feedback**: `app/dashboard/student/flashcards/page.tsx:144-154`

```tsx
{isRefreshingData && (
  <div data-refreshing="true" className="...">
    <div className="flex items-center gap-2">
      <div className="animate-spin ..." />
      <span>Updating progress...</span>
    </div>
  </div>
)}
```

**Benefits**:
- Clear visual feedback to users
- Green badge indicates successful session completion
- Prevents user confusion during data refresh

### Layer 4: Deduplication Prevention

**Location**: `app/dashboard/student/flashcards/hooks/useFlashcardData.ts:49-50`

```typescript
// Check if we're already refreshing
const isAlreadyRefreshing = document.querySelector('[data-refreshing="true"]');
if (!isAlreadyRefreshing) {
  refetchReviews({ cancelRefetch: true });
}
```

**Problem Solved**:
- Prevents double refetch (session manager + useEffect)
- `data-refreshing="true"` attribute serves as coordination flag
- Reduces unnecessary database calls

### Layer 5: Optimistic UI Updates

**Location**: `app/dashboard/student/flashcards/page.tsx:76-77`

```typescript
onSessionComplete: (reviewedCards) => {
  if (reviewedCards) {
    setRecentReviews((prev) => ({ ...prev, ...reviewedCards }));
  }
  setStatsRefreshKey((prev) => prev + 1);
}
```

**Due Count Calculation**: `app/dashboard/student/flashcards/hooks/useFlashcardData.ts:147-150`

```typescript
// Priority 1: Check recent local reviews (Optimistic UI)
if (recentReview && now - recentReview.timestamp < 60 * 60 * 1000) {
  isDue = recentReview.difficulty === "again";
}
// Priority 2: Check server data
else {
  isDue = progress && (progress.nextReviewDate || 0) <= now;
}
```

**Benefits**:
- Instant UI feedback (no waiting for database)
- Due counts update immediately based on local session data
- Server data is authority after 1 hour (prevents stale optimistic data)

### Layer 6: Automatic Recalculation via useMemo

**Location**: `app/dashboard/student/flashcards/hooks/useFlashcardData.ts:111-174`

```typescript
const { categoryDueCounts } = useMemo(() => {
  // Calculate due counts for all categories
  // This automatically recalculates when flashcardReviews changes
  // (which happens after refetch completes)
}, [categoryIndex, flashcardReviews, reviewsMap, recentReviews]);
```

**Benefits**:
- Automatic recalculation when fresh data arrives
- No manual trigger needed
- Efficient: only recalculates when dependencies change

## Data Flow Diagram

```
User completes practice session
  ↓
handleBackToCategories() called
  ↓
[Layer 3] Set isRefreshingData = true
  ↓                                           [Layer 5] Update recentReviews
[Layer 1] Force immediate parallel refetch     (optimistic UI)
  - flashcardProgress                           ↓
  - weeklyProgress                          Due counts show immediately
  - todayProgress                           (based on local data)
  ↓
[Layer 2] cancelRefetch: true
(bypass cache, force fresh data)
  ↓
Fresh data arrives from database
  ↓
[Layer 6] useMemo recalculates due counts
(triggered by flashcardReviews change)
  ↓
CategoryButtonGrid re-renders
(due counts now reflect server truth)
  ↓
[Layer 3] Set isRefreshingData = false
  ↓
✅ User sees updated progress!
```

## Performance Optimizations

### Eliminated Redundant Operations

**Before**:
- ❌ 2 database writes per card (daily progress)
- ❌ 2 refetches (session manager + useEffect)
- ❌ 500ms setTimeout before refetch
- ❌ Loading 667KB for "Review All" mode

**After**:
- ✅ 1 database write per session (50% reduction)
- ✅ 1 refetch with deduplication check
- ✅ Immediate refetch (no arbitrary delay)
- ✅ 200-card pagination limit for "Review All"

### Combined Operations

**Before**: 5 separate useMemo hooks
```typescript
const categoryIndex = useMemo(() => { /* ... */ }, [rawCategoryIndex]);
const displayCategories = useMemo(() => { /* ... */ }, [categoryIndex]);
const categoryDueCounts = useMemo(() => { /* ... */ }, [/* ... */]);
// etc.
```

**After**: 2 combined useMemo hooks
```typescript
const { categoryIndex, displayCategories } = useMemo(() => {
  // Calculate both in single pass
}, [rawCategoryIndex]);

const { categoryDueCounts, categoryAttemptCounts, categoryCompletionStatus } = useMemo(() => {
  // Calculate all progress stats in single iteration
}, [categoryIndex, flashcardReviews, reviewsMap, recentReviews]);
```

## Development Logging

Console logs are included for debugging (development mode only):

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[SessionManager] 🔄 Starting cache refresh after session complete');
  // ... refetch happens
  console.log('[SessionManager] ✅ Cache refresh complete - fresh data loaded');
}

if (process.env.NODE_ENV === 'development') {
  const totalDue = Array.from(dueCounts.values()).reduce((sum, count) => sum + count, 0);
  console.log(`[FlashcardData] 📊 Due counts recalculated: ${totalDue} cards across ${dueCounts.size} categories`);
}
```

**Benefits**:
- Easy to verify cache refresh is working
- Track performance of due count calculations
- No console noise in production

## Testing Checklist

✅ **Test 1: Complete all cards in a category**
1. Open flashcards page
2. Select a category with due cards
3. Complete all flashcards
4. Return to categories
5. **Expected**: Green "Updating progress..." indicator appears
6. **Expected**: Category shows 0 due count (no manual refresh needed)

✅ **Test 2: Partial completion**
1. Start practice session
2. Complete only some cards (mix of again/hard/good/easy)
3. Return to categories
4. **Expected**: Due count updates to reflect only unfinished cards

✅ **Test 3: Review All mode**
1. Select "Review All" with many categories
2. **Expected**: Loads max 200 cards (not all 1500+)
3. Console log shows: "Loaded X cards from Y/Z categories"

✅ **Test 4: Optimistic UI**
1. Complete a card with "again" (forgot)
2. **Expected**: Due count updates immediately (before refetch completes)
3. **Expected**: After refetch, due count remains accurate

## Files Modified

### Core Cache Invalidation
- `app/dashboard/student/flashcards/hooks/useFlashcardSessionManager.ts`
  - Replaced `invalidateQueries` with `refetchQueries`
  - Added `isRefreshingData` state
  - Removed 500ms setTimeout anti-pattern
  - Added development logging

- `app/dashboard/student/flashcards/hooks/useFlashcardData.ts`
  - Added `cancelRefetch: true` option
  - Added deduplication check
  - Combined useMemo hooks
  - Added development logging

- `app/dashboard/student/flashcards/page.tsx`
  - Added `isRefreshingData` to destructured values
  - Added green "Updating progress..." indicator
  - Added `data-refreshing="true"` attribute

### Performance Optimizations
- `lib/hooks/useFlashcardSession.ts`
  - Batch daily progress saves at session end
  - Extracted keyboard shortcuts to separate hook

- `lib/hooks/useFlashcardKeyboard.ts` (NEW)
  - Extracted 73-line keyboard shortcuts logic

- `lib/services/turso/flashcards/progressRead.ts`
  - Split from 354 lines to 160 lines
  - Basic queries only

- `lib/services/turso/flashcards/progressReadAdvanced.ts` (NEW)
  - Advanced queries (115 lines)

- `lib/services/turso/flashcards/progressMappers.ts` (NEW)
  - Row mapping helpers (56 lines)

- `lib/utils/flashcardSelection.ts`
  - Wrapped 9 console.logs in NODE_ENV checks

## Migration from Old System

### Before (Broken)
```typescript
setTimeout(() => {
  queryClient.invalidateQueries({ queryKey: queryKeys.flashcardProgress(userEmail) });
}, 500);
```

### After (Working)
```typescript
setIsRefreshingData(true);
try {
  await Promise.all([
    queryClient.refetchQueries({
      queryKey: queryKeys.flashcardProgress(userEmail),
      type: 'active',
    }),
    // ... other queries
  ]);
} finally {
  setIsRefreshingData(false);
}
```

## Lessons Learned

1. **`invalidateQueries` ≠ `refetchQueries`**
   - `invalidateQueries`: Marks data as stale, refetches on next render
   - `refetchQueries`: Forces immediate fetch, returns Promise

2. **Avoid setTimeout for cache invalidation**
   - Arbitrary delays don't solve race conditions
   - Use proper async/await patterns instead

3. **Optimistic UI requires both layers**
   - Local state for instant feedback
   - Server refetch for source of truth

4. **Deduplication prevents wasted work**
   - Multiple triggers can cause redundant fetches
   - Use coordination flags (data attributes, refs, etc.)

5. **Loading states improve UX**
   - Users need to know when operations are in progress
   - Different colors for different states (blue=loading, green=updating)

## Future Enhancements

- [ ] Add WebSocket support for real-time progress updates
- [ ] Implement service worker for offline caching
- [ ] Add optimistic mutations for faster perceived performance
- [ ] Consider IndexedDB for client-side flashcard caching
- [ ] Add analytics to track cache hit rates

## References

- React Query refetchQueries: https://tanstack.com/query/v4/docs/react/reference/QueryClient#queryclientrefetchqueries
- Optimistic Updates: https://tanstack.com/query/v4/docs/react/guides/optimistic-updates
- useMemo optimization: https://react.dev/reference/react/useMemo
