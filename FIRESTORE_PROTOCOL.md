# Firestore Caching & Query Best Practices

## Overview
This document defines caching strategies and query patterns to minimize Firestore reads/writes and reduce costs.

---

## Caching Strategy

### React Query Cache Times

| Data Type | Cache Duration | Reason |
|-----------|---------------|---------|
| User data | 5 minutes | Frequently accessed, rarely changes |
| Student/Teacher profiles | 10 minutes | Mostly static |
| Student lists | 2 minutes | Moderate updates |
| Vocabulary words | 24 hours | Static data |
| Study progress | 30 seconds | Frequently updated |
| Dashboard stats | 1 minute | Real-time feel |

### Query Optimization Rules

**✅ DO:**
- Paginate with `limit(20)` + `startAfter()`
- Use `where()` to filter server-side
- Cache static data (vocabulary) for 24 hours
- Use batch reads for multiple documents
- Create composite indexes for complex queries

**❌ DON'T:**
- Fetch entire collections without limits
- Re-fetch on every component mount
- Use real-time listeners for static data
- Query without indexes in production

---

## Query Patterns

### Teacher Dashboard - Student List
```typescript
// ❌ BAD: Fetches all students
const students = await getDocs(collection(db, 'students'));

// ✅ GOOD: Paginated with filter
const studentsQuery = query(
  collection(db, 'students'),
  where('teacherId', '==', teacherId),
  orderBy('lastActiveDate', 'desc'),
  limit(20)
);
```

### Dashboard Stats
```typescript
// ❌ BAD: Multiple queries
const words = await getDocs(collection(db, 'vocabulary'));
const progress = await getDocs(collection(db, 'flashcard-progress'));

// ✅ GOOD: Pre-computed stats in student document
const statsQuery = query(
  collection(db, 'students'),
  where('userId', '==', userId),
  limit(1)
);
```

---

## Write Optimization

### Batch Writes (for multiple updates)
```typescript
const batch = writeBatch(db);
batch.update(studentRef, { wordsLearned: increment(1) });
batch.set(progressRef, progressData);
await batch.commit();
```

### Transactions (for critical updates)
```typescript
await runTransaction(db, async (transaction) => {
  const studentDoc = await transaction.get(studentRef);
  const newStreak = studentDoc.data().currentStreak + 1;
  transaction.update(studentRef, { currentStreak: newStreak });
});
```

---

## Required Composite Indexes

```
students: teacherId (asc), lastActiveDate (desc)
flashcard-progress: userId (asc), nextReviewDate (asc)
study-progress: userId (asc), date (desc)
```

---

## Real-Time vs Cached Data

| Use Real-Time (`onSnapshot`) | Use Cached (`getDocs` + React Query) |
|------------------------------|-------------------------------------|
| Chat messages | User profiles |
| Live collaboration | Student lists |
| Critical notifications | Vocabulary words |
| Active study sessions | Historical study data |
| | Settings |

---

## Cost Optimization

**Per 100k operations:**
- Reads: $0.036
- Writes: $0.108
- Deletes: $0.012

**Tips:**
- Cache static data (vocabulary) for 24 hours → Reduce reads by 95%
- Paginate (20 items vs 100) → 5x fewer reads
- Batch progress updates (every 5 actions) → 5x fewer writes
- Use `increment()` for counters → 2x fewer operations

---

## React Query Setup

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Query keys
export const queryKeys = {
  user: (userId: string) => ['user', userId],
  student: (studentId: string) => ['student', studentId],
  teacher: (teacherId: string) => ['teacher', teacherId],
  teacherStudents: (teacherId: string, page: number) => ['teacher', teacherId, 'students', page],
  vocabulary: (level: string) => ['vocabulary', level],
  flashcardProgress: (userId: string) => ['flashcard-progress', userId],
  studyProgress: (userId: string, days: number) => ['study-progress', userId, days],
};
```

### 9. **Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Students can read/write their own data
    match /students/{studentId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         resource.data.teacherId == request.auth.uid);
      allow write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Teachers can read their assigned students
    match /teachers/{teacherId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Vocabulary is read-only for all authenticated users
    match /vocabulary/{wordId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins via admin SDK
    }
  }
}
```

### 10. **Performance Monitoring**

```typescript
// Track query performance
const startTime = performance.now();
const data = await getDocs(query);
const duration = performance.now() - startTime;

if (duration > 1000) {
  console.warn(`Slow query detected: ${duration}ms`);
}
```

## Quick Reference

### DO's ✅
1. Use React Query for all Firestore reads
2. Implement pagination (20 items per page)
3. Cache static data (vocabulary) for 24 hours
4. Use batch writes for multiple updates
5. Create composite indexes for complex queries
6. Monitor read/write usage monthly

### DON'Ts ❌
1. Don't fetch entire collections
2. Don't use real-time listeners for static data
3. Don't query without indexes
4. Don't refetch on every mount
5. Don't write on every keystroke
6. Don't expose sensitive data in client queries
