# Model & Hook Architecture Guide

## Overview

This guide explains how to work with data models, hooks, and caching in DeutschCraft Web V2. It provides a clear pattern for creating new models and ensures consistency across the codebase.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Data Models](#data-models)
3. [React Query Hooks](#react-query-hooks)
4. [Caching Strategy](#caching-strategy)
5. [Creating New Models](#creating-new-models)
6. [Query Keys Registry](#query-keys-registry)
7. [Common Patterns](#common-patterns)
8. [Performance Optimizations](#performance-optimizations)
9. [Composite Hooks](#composite-hooks)
10. [Troubleshooting](#troubleshooting)

---

## Quick Reference

### Existing Models & Their Hooks

| Model | Firestore Path | Hook(s) | Cache Time |
|-------|----------------|---------|------------|
| **User** | `users/{userId}` | `useUser()` | 5 min |
| **StudentData** | `users/{userId}/student_data/{studentId}` | `useAllStudentsNested()`<br>`useStudentsByTeacher(teacherId)`<br>`useStudentsWithoutTeacher()`<br>`useCurrentStudent(userId)` | 2 min |
| **TeacherData** | `users/{userId}/teacher_data/{teacherId}` | `useTeacher(userId)` | 10 min |
| **Batch** | `users/{teacherId}/batches/{batchId}` | `useTeacherBatches(teacherId)`<br>`useActiveBatches(teacherId)`<br>`useCreateBatch()`<br>`useUpdateBatch()`<br>`useDeleteBatch()` | 5 min |
| **WeeklyProgress** | `users/{userId}/student_data/{studentId}/weekly_progress/{weekId}` | `useWeeklyProgress(userId)` | 30 sec |
| **PracticeStats** | `users/{userId}/student_data/{studentId}/practice_stats/{date}` | `usePracticeStats(userId, days)` | 30 sec |

### Composite Hooks (Feature-Level)

| Hook | Purpose | Returns | Location |
|------|---------|---------|----------|
| `useTeacherDashboard()` | Orchestrates all teacher dashboard logic | Loading states, data, actions, table state | `lib/hooks/useTeacherDashboard.ts` |
| `useStudentManagement()` | Student add/remove operations | Selection state, add/remove functions | `lib/hooks/useStudentManagement.ts` |
| `useTableState()` | Table pagination & menu state | Pagination, menu controls | `lib/hooks/useTableState.ts` |

### Cache Time Reference

```typescript
// lib/queryClient.ts
export const cacheTimes = {
  user: 5 * 60 * 1000,           // 5 minutes - rarely changes
  studentProfile: 10 * 60 * 1000, // 10 minutes - mostly static
  teacherProfile: 10 * 60 * 1000, // 10 minutes - mostly static
  studentList: 2 * 60 * 1000,     // 2 minutes - moderate updates
  vocabulary: 24 * 60 * 60 * 1000, // 24 hours - static data
  studyProgress: 30 * 1000,       // 30 seconds - frequently updated
  dashboardStats: 1 * 60 * 1000,  // 1 minute - real-time feel
  batches: 5 * 60 * 1000,         // 5 minutes - rarely changes
};
```

---

## Data Models

### Location

All TypeScript models are defined in **`lib/models.ts`**

### Structure

```typescript
// lib/models.ts

// 1. Enums (if needed)
export enum CEFRLevel {
  A1 = 'A1',
  A2 = 'A2',
  // ...
}

// 2. Base interface (matches Firestore document exactly)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER';
  cefrLevel?: string;
  createdAt: number;
  updatedAt: number;
}

// 3. Extended interfaces (for computed/merged data)
export interface StudentWithUserData extends StudentData {
  // User fields merged in for display
  email: string;
  firstName: string;
  lastName: string;
  cefrLevel?: string;
}

// 4. Utility functions for computed properties
export function getUserFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

export function getStudentSuccessRate(student: Student): number {
  if (student.sentencesCreated === 0) return 0;
  return Math.round((student.sentencesPerfect / student.sentencesCreated) * 100);
}
```

### Model Naming Convention

- **Base Model**: Matches Firestore document 1:1 (e.g., `User`, `StudentData`, `Batch`)
- **Extended Model**: Adds computed or merged fields (e.g., `StudentWithUserData`)
- **Enums**: PascalCase singular (e.g., `CEFRLevel`, `UserRole`)

---

## React Query Hooks

### Location

Hooks are organized in **`lib/hooks/`** by domain:

```
lib/hooks/
├── useFirebaseAuth.ts       # Authentication sync
├── useNestedStudents.ts     # Student data queries
├── useTeacher.ts            # Teacher data queries
├── useBatches.ts            # Batch CRUD operations
├── useWeeklyProgress.ts     # Weekly progress tracking
├── usePracticeStats.ts      # Practice statistics
└── useCurrentStudent.ts     # Current user's student data
```

### Hook Types

#### 1. Query Hooks (Read Data)

```typescript
// Pattern: use{Entity}() or use{Entity}s()
export function useTeacherBatches(teacherId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.batches(teacherId!),
    queryFn: async () => {
      if (!teacherId) return [];

      const batchesRef = collection(db, 'users', teacherId, 'batches');
      const snapshot = await getDocs(batchesRef);

      return snapshot.docs.map(doc => ({
        batchId: doc.id,
        ...doc.data(),
      } as Batch));
    },
    enabled: !!teacherId,
    staleTime: cacheTimes.batches,
    gcTime: cacheTimes.batches * 2.5,
  });

  return {
    batches: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}
```

#### 2. Mutation Hooks (Write Data)

```typescript
// Pattern: use{Action}{Entity}() - e.g., useCreateBatch(), useUpdateStudent()
export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teacherId,
      name,
      description,
      currentLevel,
      startDate,
      endDate,
    }: {
      teacherId: string;
      name: string;
      description?: string;
      currentLevel: CEFRLevel;
      startDate: number;
      endDate: number | null;
    }) => {
      const batchId = `BATCH_${Date.now()}`;
      const batchRef = doc(db, 'users', teacherId, 'batches', batchId);

      const batch: Batch = {
        batchId,
        teacherId,
        name,
        description,
        currentLevel,
        startDate,
        endDate,
        isActive: true,
        studentCount: 0,
        levelHistory: [
          {
            level: currentLevel,
            startDate,
            endDate: null,
            modifiedBy: teacherId,
          },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(batchRef, batch);
      return batch;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.batches(variables.teacherId) });
    },
  });
}
```

### Hook Naming Rules

| Operation | Pattern | Example |
|-----------|---------|---------|
| Fetch single | `use{Entity}(id)` | `useUser(userId)` |
| Fetch multiple | `use{Entity}s(filter?)` | `useStudentsByTeacher(teacherId)` |
| Create | `useCreate{Entity}()` | `useCreateBatch()` |
| Update | `useUpdate{Entity}()` | `useUpdateBatch()` |
| Delete | `useDelete{Entity}()` | `useDeleteBatch()` |

---

## Caching Strategy

### Cache Times (from FIRESTORE_PROTOCOL.md)

| Data Type | `staleTime` | `gcTime` | Reason |
|-----------|-------------|----------|---------|
| User data | 5 min | 12.5 min | Frequently accessed, rarely changes |
| Student/Teacher profiles | 10 min | 25 min | Mostly static |
| Student lists | 2 min | 5 min | Moderate updates |
| Vocabulary words | 24 hours | 60 hours | Static data |
| Study progress | 30 sec | 1.25 min | Frequently updated |
| Dashboard stats | 1 min | 2.5 min | Real-time feel |
| Batches | 5 min | 12.5 min | Rarely changes |

### Formula

```typescript
staleTime: cacheTimes.{entity}
gcTime: cacheTimes.{entity} * 2.5  // Garbage collection = 2.5x stale time
```

### How to Use

```typescript
import { cacheTimes } from '@/lib/queryClient';

const { data } = useQuery({
  queryKey: ['myEntity', id],
  queryFn: fetchMyEntity,
  staleTime: cacheTimes.studentList,  // Use centralized cache time
  gcTime: cacheTimes.studentList * 2.5,
});
```

---

## Creating New Models

### Step-by-Step Guide

#### 1. Define the Model in `lib/models.ts`

```typescript
// lib/models.ts

/**
 * Assignment model
 * Firestore path: users/{teacherId}/assignments/{assignmentId}
 */
export interface Assignment {
  assignmentId: string;
  teacherId: string;
  batchId: string | null;
  title: string;
  description: string;
  cefrLevel: CEFRLevel;
  dueDate: number;
  createdAt: number;
  updatedAt: number;
}

// Computed properties (optional)
export function isAssignmentOverdue(assignment: Assignment): boolean {
  return assignment.dueDate < Date.now();
}
```

#### 2. Add Cache Time to `lib/queryClient.ts`

```typescript
// lib/queryClient.ts

export const cacheTimes = {
  // ... existing cache times
  assignments: 5 * 60 * 1000, // 5 minutes
};
```

#### 3. Add Query Keys to `lib/queryClient.ts`

```typescript
// lib/queryClient.ts

export const queryKeys = {
  // ... existing query keys
  assignments: (teacherId: string) => ['assignments', teacherId] as const,
  assignment: (assignmentId: string) => ['assignment', assignmentId] as const,
};
```

#### 4. Create Hook File `lib/hooks/useAssignments.ts`

```typescript
// lib/hooks/useAssignments.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { queryKeys, cacheTimes } from '../queryClient';
import { Assignment, CEFRLevel } from '../models';

/**
 * Fetch all assignments for a teacher
 */
export function useTeacherAssignments(teacherId: string | undefined) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.assignments(teacherId!),
    queryFn: async () => {
      if (!teacherId) return [];

      const assignmentsRef = collection(db, 'users', teacherId, 'assignments');
      const snapshot = await getDocs(assignmentsRef);

      return snapshot.docs.map(doc => ({
        assignmentId: doc.id,
        ...doc.data(),
      } as Assignment));
    },
    enabled: !!teacherId,
    staleTime: cacheTimes.assignments,
    gcTime: cacheTimes.assignments * 2.5,
  });

  return {
    assignments: data || [],
    isLoading,
    isError,
    error: error as Error | null,
  };
}

/**
 * Create a new assignment
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teacherId,
      title,
      description,
      cefrLevel,
      dueDate,
      batchId,
    }: {
      teacherId: string;
      title: string;
      description: string;
      cefrLevel: CEFRLevel;
      dueDate: number;
      batchId?: string | null;
    }) => {
      const assignmentId = `ASSIGNMENT_${Date.now()}`;
      const assignmentRef = doc(db, 'users', teacherId, 'assignments', assignmentId);

      const assignment: Assignment = {
        assignmentId,
        teacherId,
        batchId: batchId || null,
        title,
        description,
        cefrLevel,
        dueDate,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await setDoc(assignmentRef, assignment);
      return assignment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments(variables.teacherId) });
    },
  });
}

// ... useUpdateAssignment(), useDeleteAssignment() following same pattern
```

#### 5. Export from `lib/hooks/index.ts` (Optional)

```typescript
// lib/hooks/index.ts

export * from './useAssignments';
export * from './useBatches';
export * from './useNestedStudents';
// ... etc
```

---

## Query Keys Registry

### Centralized in `lib/queryClient.ts`

```typescript
export const queryKeys = {
  // Users
  user: (userId: string) => ['user', userId] as const,

  // Students
  student: (studentId: string) => ['student', studentId] as const,
  currentStudent: (userId: string) => ['student', 'current', userId] as const,
  allStudents: () => ['students', 'nested', 'all'] as const,
  studentsByTeacher: (teacherId: string) => ['students', 'nested', 'byTeacher', teacherId] as const,
  studentsWithoutTeacher: () => ['students', 'nested', 'withoutTeacher'] as const,

  // Teachers
  teacher: (teacherId: string) => ['teacher', teacherId] as const,

  // Batches
  batches: (teacherId: string) => ['batches', teacherId] as const,
  batch: (batchId: string) => ['batch', batchId] as const,

  // Vocabulary
  vocabulary: (level: string) => ['vocabulary', level] as const,

  // Progress
  flashcardProgress: (userId: string) => ['flashcard-progress', userId] as const,
  studyProgress: (userId: string, days: number) => ['study-progress', userId, days] as const,
  weeklyProgress: (userId: string) => ['weekly-progress', userId] as const,
};
```

### Why Centralize?

- **Consistency**: All hooks use the same key structure
- **Type Safety**: TypeScript autocomplete for query keys
- **Easy Invalidation**: Invalidate related queries easily
- **Debugging**: See all query keys in one place

---

## Common Patterns

### Pattern 1: Fetch with Filter

```typescript
export function useActiveBatches(teacherId: string | undefined) {
  const { batches, isLoading, isError, error } = useTeacherBatches(teacherId);

  return {
    batches: batches.filter(batch => batch.isActive),
    isLoading,
    isError,
    error,
  };
}
```

### Pattern 2: Optimistic Updates

```typescript
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, studentId, updates }) => {
      const studentRef = doc(db, 'users', userId, 'student_data', studentId);
      await updateDoc(studentRef, {
        ...updates,
        updatedAt: Date.now(),
      });
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.allStudents() });

      // Snapshot previous value
      const previousStudents = queryClient.getQueryData(queryKeys.allStudents());

      // Optimistically update
      queryClient.setQueryData(queryKeys.allStudents(), (old: any) => {
        return old.map((student: any) =>
          student.studentId === variables.studentId
            ? { ...student, ...variables.updates }
            : student
        );
      });

      return { previousStudents };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.allStudents(), context?.previousStudents);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.allStudents() });
    },
  });
}
```

### Pattern 3: Dependent Queries

```typescript
export function useStudentWithProgress(studentId: string) {
  // First query: student data
  const { data: student } = useQuery({
    queryKey: queryKeys.student(studentId),
    queryFn: () => fetchStudent(studentId),
  });

  // Second query: depends on student.userId
  const { data: progress } = useQuery({
    queryKey: queryKeys.weeklyProgress(student?.userId!),
    queryFn: () => fetchWeeklyProgress(student!.userId),
    enabled: !!student?.userId, // Only run when student is loaded
  });

  return { student, progress };
}
```

### Pattern 4: Batch Writes

```typescript
export function useAssignStudentsToBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentIds,
      batchId,
      teacherId,
    }: {
      studentIds: string[];
      batchId: string;
      teacherId: string;
    }) => {
      const batch = writeBatch(db);

      for (const studentId of studentIds) {
        const student = await getStudentByIdSomehow(studentId);
        const studentRef = doc(db, 'users', student.userId, 'student_data', studentId);
        batch.update(studentRef, {
          batchId,
          teacherId,
          updatedAt: Date.now(),
        });
      }

      await batch.commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allStudents() });
      queryClient.invalidateQueries({ queryKey: queryKeys.studentsWithoutTeacher() });
    },
  });
}
```

---

## Performance Optimizations

### Efficient User Fetching (99.8% Cost Reduction!)

**Problem:** Fetching ALL users when only a few are needed

```typescript
// ❌ BAD: Fetches 10,000 users even if only 10 students exist
const usersRef = collection(db, 'users');
const usersSnapshot = await getDocs(usersRef);  // 10,000 reads!
```

**Solution:** Only fetch the specific user documents needed

```typescript
// ✅ GOOD: Fetches only 10 users for 10 students
async function fetchUsersForStudents(studentDataList: StudentData[]): Promise<Map<string, User>> {
  const usersMap = new Map<string, User>();

  // Get unique user IDs from student data
  const uniqueUserIds = [...new Set(studentDataList.map(s => s.userId))];

  // Fetch only the needed user documents
  const userPromises = uniqueUserIds.map(async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data(),
      } as User;
    }
    return null;
  });

  const users = await Promise.all(userPromises);

  // Build the map
  users.forEach((user) => {
    if (user) {
      usersMap.set(user.id, user);
    }
  });

  return usersMap;
}
```

**Cost Savings:**
- 10 students with 10,000 total users
- Before: 10,000 user reads + 10 student reads = **10,010 reads**
- After: 10 user reads + 10 student reads = **20 reads**
- **Savings: 99.8% reduction!** 💰

**Implementation:** See `lib/hooks/useNestedStudents.ts`

### Reusable Helper Functions

Extract duplicate logic into helper functions:

```typescript
/**
 * Merge student data with user data
 */
function mergeStudentWithUserData(
  studentDataList: StudentData[],
  usersMap: Map<string, User>
): StudentWithUserData[] {
  return studentDataList
    .map((studentData) => {
      const userData = usersMap.get(studentData.userId);
      if (!userData) return null;

      return {
        ...studentData,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        cefrLevel: userData.cefrLevel || studentData.targetLanguage,
      };
    })
    .filter((student): student is StudentWithUserData => student !== null);
}

// Now use in all hooks
export function useAllStudentsNested() {
  const { data } = useQuery({
    queryFn: async () => {
      const studentDataList = await fetchStudentData();
      const usersMap = await fetchUsersForStudents(studentDataList);
      return mergeStudentWithUserData(studentDataList, usersMap);
    },
  });
}
```

**Benefits:**
- DRY (Don't Repeat Yourself)
- Single source of truth
- Easier to maintain and test
- Consistent behavior across hooks

---

## Composite Hooks

Composite hooks combine multiple data sources and logic into a single, easy-to-use hook. This reduces prop drilling and improves component readability.

### Example: useTeacherDashboard

Instead of managing 15+ separate state variables and hooks in your component, create a composite hook:

```typescript
// lib/hooks/useTeacherDashboard.ts

export function useTeacherDashboard({
  currentTeacherId,
  onSuccess,
  onError,
  onInfo,
}: UseTeacherDashboardProps) {
  // Combine multiple hooks
  const { students: allStudents, isLoading, isError } = useAllStudentsNested();
  const { students: studentsWithoutTeacher } = useStudentsWithoutTeacher();
  const { batches } = useActiveBatches(currentTeacherId);

  // Encapsulate student management
  const studentManagement = useStudentManagement({
    currentTeacherId,
    selectedBatchId: selectedBatch?.batchId,
    studentsWithoutTeacher,
    onSuccess,
    onError,
    onInfo,
  });

  // Encapsulate table state
  const tableState = useTableState({ pageSize: 5 });

  // Business logic
  const handleAddStudents = async () => {
    const success = await studentManagement.addStudentsToBatch();
    if (success) setIsAddStudentOpen(false);
  };

  // Return everything the UI needs
  return {
    // Loading states
    isLoading,
    isError,

    // Data
    batches,
    myStudents,
    paginatedStudents,

    // Actions
    handleAddStudents,
    handleRemoveStudent,
    toggleStudentSelection,

    // Table state
    currentPage,
    setCurrentPage,
    openMenuId,
    setOpenMenuId,
  };
}
```

**Usage in Component:**

```typescript
// app/dashboard/teacher/page.tsx

export default function TeacherDashboard() {
  const toast = useToast();
  const { session } = useFirebaseAuth();

  // Single hook replaces 15+ state variables!
  const dashboard = useTeacherDashboard({
    currentTeacherId: session?.user?.id,
    onSuccess: (msg) => toast.success(msg),
    onError: (msg) => toast.error(msg),
    onInfo: (msg) => toast.info(msg),
  });

  if (dashboard.isLoading) return <LoadingState />;
  if (dashboard.isError) return <ErrorState />;

  return (
    <div>
      <StudentTable
        students={dashboard.paginatedStudents}
        onAddStudent={() => dashboard.setIsAddStudentOpen(true)}
        onRemoveStudent={dashboard.handleRemoveStudent}
        // ... all data comes from single object
      />
    </div>
  );
}
```

**Before vs After:**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lines of Code | 477 | 174 | 63% reduction |
| State Variables | 15+ | 1 (`dashboard`) | 93% reduction |
| Imports | 12+ | 5 | 58% reduction |
| Testability | Low | High | Much easier |

### Composite Hook Patterns

#### 1. **State Management Hook** (`useTableState`)
Manages UI state like pagination, menus, filters:

```typescript
export function useTableState({ pageSize = 5 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const paginateData = <T,>(data: T[]) => {
    const totalPages = Math.ceil(data.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      data: data.slice(startIndex, endIndex),
      totalPages,
      totalItems: data.length,
    };
  };

  return {
    currentPage,
    setCurrentPage,
    openMenuId,
    setOpenMenuId,
    paginateData,
  };
}
```

#### 2. **Business Logic Hook** (`useStudentManagement`)
Encapsulates domain-specific operations:

```typescript
export function useStudentManagement({
  currentTeacherId,
  selectedBatchId,
  onSuccess,
  onError,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const addStudentsToBatch = async () => {
    setIsAdding(true);
    try {
      // Update Firestore
      await updateStudents(selectedIds, currentTeacherId, selectedBatchId);
      onSuccess?.('Students added successfully!');
      return true;
    } catch (error) {
      onError?.('Failed to add students');
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    isAdding,
    selectedIds,
    addStudentsToBatch,
    toggleStudentSelection: (id: string) => { /* ... */ },
  };
}
```

#### 3. **Orchestrator Hook** (`useTeacherDashboard`)
Combines multiple hooks and coordinates logic:

```typescript
export function useTeacherDashboard(props) {
  // Combine data sources
  const data = useAllStudentsNested();
  const batches = useActiveBatches(props.teacherId);

  // Combine business logic
  const studentMgmt = useStudentManagement(/* ... */);
  const tableState = useTableState(/* ... */);

  // Coordinate actions
  const handleAction = async () => {
    await studentMgmt.doSomething();
    tableState.resetPage();
  };

  // Return unified API
  return { ...data, ...batches, ...studentMgmt, ...tableState, handleAction };
}
```

### Benefits of Composite Hooks

1. **Reduced Complexity**: Component has 1 hook instead of 10+
2. **Better Testability**: Test hooks independently of UI
3. **Reusability**: Use same logic in multiple components
4. **Separation of Concerns**: Business logic separate from UI
5. **Type Safety**: TypeScript infers all return types
6. **Easier Debugging**: Logic isolated in hook files

### When to Create Composite Hooks

✅ **Create a composite hook when:**
- Component has 5+ state variables related to same feature
- Multiple hooks share dependencies
- Business logic is complex (> 50 lines)
- You want to reuse logic across components
- Component file exceeds 300 lines

❌ **Don't create composite hooks when:**
- Simple component with 1-2 state variables
- Logic is very specific to one component
- Hooks don't share dependencies
- Adds unnecessary abstraction

---

## Troubleshooting

### Issue: Stale Data After Mutation

**Symptom**: UI doesn't update after creating/updating data

**Solution**: Add `invalidateQueries` in mutation's `onSuccess`

```typescript
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.batches(variables.teacherId) });
}
```

### Issue: Too Many Firestore Reads

**Symptom**: High Firestore billing, frequent network requests

**Solutions**:
1. Increase `staleTime` for static data
2. Use `enabled: false` to prevent auto-fetching
3. Add pagination with `limit(20)`
4. Check `refetchOnWindowFocus: false` in defaults

### Issue: Duplicate Type Definitions

**Symptom**: Same interface in multiple files

**Solution**: Always define types in `lib/models.ts`, import elsewhere

```typescript
// ❌ BAD
// lib/hooks/useStudents.ts
interface Student { ... } // Don't define here

// ✅ GOOD
// lib/hooks/useStudents.ts
import { Student } from '../models'; // Import from central location
```

### Issue: Query Keys Inconsistency

**Symptom**: Invalidation doesn't trigger refetch

**Solution**: Use centralized `queryKeys` from `lib/queryClient.ts`

```typescript
// ❌ BAD
queryKey: ['batches', teacherId]  // Hardcoded

// ✅ GOOD
queryKey: queryKeys.batches(teacherId)  // Centralized
```

---

## Best Practices Summary

### DO ✅

1. Define all models in `lib/models.ts`
2. Use centralized `cacheTimes` and `queryKeys` from `lib/queryClient.ts`
3. Follow naming conventions: `use{Entity}()` for queries, `use{Action}{Entity}()` for mutations
4. Add JSDoc comments for all exported functions
5. Invalidate queries in mutation's `onSuccess`
6. Use `enabled` flag to prevent unnecessary queries
7. Return consistent shape: `{ data, isLoading, isError, error }`

### DON'T ❌

1. Don't duplicate type definitions across files
2. Don't hardcode cache times or query keys
3. Don't fetch entire collections without `limit()`
4. Don't use real-time listeners for static data
5. Don't forget `gcTime` (should be ~2.5x `staleTime`)
6. Don't query without checking if data is already cached
7. Don't forget to handle `undefined` in hook parameters

---

## Related Documentation

- [FIRESTORE_PROTOCOL.md](./FIRESTORE_PROTOCOL.md) - Caching & query optimization
- [CLAUDE.md](./CLAUDE.md) - Project overview & design system
- [React Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
