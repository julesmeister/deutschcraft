# Pagination Pattern - Database Agnostic

This document explains the pagination pattern used in Testmanship Web V2 for fetching large datasets efficiently while maintaining database abstraction.

## Architecture

```
Component (UI)
    ↓ uses
Hook (Business Logic)
    ↓ calls
Service (Database Abstraction)
    ↓ queries
Database (Firestore/PostgreSQL/MongoDB)
```

## Example: Session Pagination

### 1. Service Layer (`lib/services/sessionService.ts`)

**Purpose**: Abstracts all database operations. Easy to swap databases.

```typescript
export interface RecentSession {
  date: string;
  cardsReviewed: number;
  accuracy: number;
  timeSpent: number;
}

export interface PaginationResult {
  sessions: RecentSession[];
  hasMore: boolean;
  cursor: any; // Database-specific cursor
}

export async function fetchSessions(
  userId: string,
  pageSize: number = 8,
  cursor?: any
): Promise<PaginationResult> {
  // FIRESTORE IMPLEMENTATION
  // To switch databases, just replace this implementation

  const progressRef = collection(db, 'progress');
  let progressQuery;

  if (cursor) {
    progressQuery = query(
      progressRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      startAfter(cursor),
      limit(pageSize)
    );
  } else {
    progressQuery = query(
      progressRef,
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(progressQuery);
  const sessions = snapshot.docs.map(doc => transformDoc(doc));

  return {
    sessions,
    hasMore: sessions.length === pageSize,
    cursor: snapshot.docs[snapshot.docs.length - 1],
  };
}
```

### 2. Hook Layer (`lib/hooks/useSessionPagination.ts`)

**Purpose**: Manages pagination state and caching. Database-agnostic.

```typescript
export function useSessionPagination(userId: string | undefined, itemsPerPage: number = 8) {
  const [sessions, setSessions] = useState<RecentSession[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCache, setPageCache] = useState<Map<number, PageCache>>(new Map());
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (pageNumber: number) => {
    if (!userId) return;

    // Check cache first
    const cached = pageCache.get(pageNumber);
    if (cached) {
      setSessions(cached.sessions);
      setCurrentPage(pageNumber);
      return;
    }

    setIsLoading(true);

    try {
      let cursor = null;
      if (pageNumber > 1) {
        const prevPage = pageCache.get(pageNumber - 1);
        cursor = prevPage?.cursor;
      }

      // Call service (database agnostic!)
      const result = await fetchSessions(userId, itemsPerPage, cursor);

      setSessions(result.sessions);
      setCurrentPage(pageNumber);
      setHasMore(result.hasMore);

      // Cache the result
      const newCache = new Map(pageCache);
      newCache.set(pageNumber, {
        sessions: result.sessions,
        cursor: result.cursor,
      });
      setPageCache(newCache);
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, itemsPerPage, pageCache]);

  return {
    sessions,
    currentPage,
    isLoading,
    hasMore,
    goToPage: (page: number) => fetchPage(page),
    fetchPage,
    reset: () => {
      setSessions([]);
      setCurrentPage(1);
      setPageCache(new Map());
    },
  };
}
```

### 3. Component Layer

```typescript
export default function StudentProfilePage() {
  const [student, setStudent] = useState<StudentData | null>(null);

  // Use the hook
  const sessionPagination = useSessionPagination(student?.email, 8);

  // Fetch first page when student loads
  useEffect(() => {
    if (student?.email) {
      sessionPagination.fetchPage(1);
    }
  }, [student?.email]);

  return (
    <RecentActivityTimeline
      sessions={sessionPagination.sessions}
      currentPage={sessionPagination.currentPage}
      onPageChange={sessionPagination.goToPage}
      isLoading={sessionPagination.isLoading}
      hasMore={sessionPagination.hasMore}
    />
  );
}
```

## Benefits

### 1. Database Agnostic
**To switch databases**, only edit `sessionService.ts`:

```typescript
// PostgreSQL Example
export async function fetchSessions(
  userId: string,
  pageSize: number = 8,
  cursor?: any
): Promise<PaginationResult> {
  const offset = cursor || 0;

  const result = await sql`
    SELECT date, cards_reviewed, accuracy, time_spent
    FROM progress
    WHERE user_id = ${userId}
    ORDER BY date DESC
    LIMIT ${pageSize}
    OFFSET ${offset}
  `;

  return {
    sessions: result.rows,
    hasMore: result.rows.length === pageSize,
    cursor: offset + pageSize,
  };
}
```

### 2. Efficient Data Fetching
- **Initial Load**: Fetches only 8 records
- **Pagination**: Fetches 8 more when needed
- **Caching**: Visited pages load instantly
- **Bandwidth**: Minimal Firestore reads

### 3. Clean Separation
- **Service**: Database operations only
- **Hook**: State management and caching
- **Component**: UI and user interaction

### 4. Reusable Pattern
Use this pattern for any paginated data:

```typescript
// lib/services/writingService.ts
export async function fetchWritingSubmissions(userId, pageSize, cursor) { ... }

// lib/hooks/useWritingPagination.ts
export function useWritingPagination(userId, pageSize) { ... }

// Component
const writingPagination = useWritingPagination(student?.email, 10);
```

## Firestore vs PostgreSQL

### Firestore Cursor Pagination
```typescript
// Cursor = last document from previous page
startAfter(cursor)
```

### PostgreSQL Offset Pagination
```typescript
// Cursor = numeric offset
OFFSET ${cursor}
```

### MongoDB Cursor Pagination
```typescript
// Cursor = _id of last document
find({ _id: { $gt: cursor } })
```

## Cache Strategy

The hook caches pages in a Map:

```
Page 1: [sessions 1-8,  cursor: doc8]
Page 2: [sessions 9-16, cursor: doc16]
Page 3: [sessions 17-24, cursor: doc24]
```

**Benefits**:
- Going back to Page 1: Instant (cached)
- Going to Page 4: One fetch (uses Page 3's cursor)
- Switching tabs: Resets cache (fresh data)

## Best Practices

### 1. Always Use Services
❌ Don't query database directly in components:
```typescript
// BAD
const snapshot = await getDocs(query(collection(db, 'progress'), ...));
```

✅ Use service layer:
```typescript
// GOOD
const result = await fetchSessions(userId, 8, cursor);
```

### 2. Keep Hooks Database-Agnostic
Hooks should only:
- Manage state
- Handle caching
- Call services

Hooks should NOT:
- Import firebase/firestore
- Build queries
- Know database details

### 3. Type Everything
```typescript
export interface PaginationResult<T> {
  data: T[];
  hasMore: boolean;
  cursor: any;
}

export async function fetchPaginated<T>(
  collection: string,
  pageSize: number,
  cursor?: any
): Promise<PaginationResult<T>> { ... }
```

### 4. Handle Edge Cases
```typescript
// No more data
if (sessions.length === 0) {
  setHasMore(false);
}

// Invalid cursor
if (!prevPage) {
  console.error('Cannot paginate without previous page');
  return;
}

// User switches while loading
if (abortController.signal.aborted) return;
```

## Migration Path

### Current State
- Using Firestore with cursor pagination
- Service layer abstracts database
- Easy to switch databases

### To Migrate to PostgreSQL

**Step 1**: Update service implementation
```typescript
// lib/services/sessionService.ts
export async function fetchSessions(...) {
  // Replace Firestore code with PostgreSQL
  const result = await sql`SELECT ...`;
  return { sessions: result.rows, hasMore, cursor };
}
```

**Step 2**: Test
- No changes to hooks needed
- No changes to components needed
- Just test the service layer

**Step 3**: Deploy
- Change environment variable
- Deploy new version

## Related Patterns

This pattern is consistent with:
- `lib/database/` - Main database abstraction layer
- `lib/services/progressService.ts` - Progress tracking
- `lib/services/writingProgressService.ts` - Writing progress

## Summary

✅ **Service Layer**: Database operations (easy to swap)
✅ **Hook Layer**: State & caching (database-agnostic)
✅ **Component Layer**: UI only (clean)
✅ **Efficient**: Fetch 8 at a time, cache visited pages
✅ **Flexible**: Works with any database
✅ **Maintainable**: Clear separation of concerns
