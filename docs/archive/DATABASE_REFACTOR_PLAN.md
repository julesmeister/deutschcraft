# Database Structure Refactor Plan

## Problem with Current Structure

### Issues:
1. **Nested batches** under teachers make queries slow and complex
2. **Duplicate user data** - `users/{userId}` AND `users/{userId}/student_data/{studentId}`
3. **Confusing IDs** - email vs userId vs studentId all refer to same person
4. **Hard to query** - Need to know teacherId to find batches/tasks
5. **CollectionGroup queries everywhere** - Performance overhead

### Current Mess:
```
users/
  {userId}/                           # Google ID: 112039787846420694747
    email: "student@gmail.com"
    firstName: "John"
    role: "STUDENT"

    student_data/                     # Redundant!
      {studentId}/                    # Another ID for same person
        userId: "112039787846420694747"
        email: "student@gmail.com"    # Duplicate!
        firstName: "John"             # Duplicate!
        wordsLearned: 100
        batchId: "BATCH_123"

    batches/                          # Only if teacher
      {batchId}/
        teacherId: "112039787846420694747"
        writing_tasks/
          {taskId}/
```

## New Clean Structure

### Firestore Collections (Top-Level):

#### 1. `users/{userId}` - ONE document per person
```typescript
{
  // Identity (use email as document ID)
  userId: "student@testmanship.com",  // Email = Primary Key
  email: "student@testmanship.com",   // Same as userId
  firstName: "John",
  lastName: "Doe",
  role: "STUDENT" | "TEACHER",

  // Student-specific (only if role = STUDENT)
  cefrLevel: "A2",
  teacherId: "teacher@testmanship.com",  // Reference to teacher's email
  batchId: "BATCH_123",                  // Reference to batch

  // Learning stats (only if role = STUDENT)
  wordsLearned: 100,
  wordsMastered: 50,
  currentStreak: 5,
  dailyGoal: 20,

  // Teacher-specific (only if role = TEACHER)
  totalStudents: 45,      // Computed field
  activeBatches: 3,       // Computed field

  // Common
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Why email as ID?**
- One unique identifier
- No confusion between userId, studentId, email
- Easy to query by email (common use case)
- Google Sign-In gives us email directly

#### 2. `batches/{batchId}` - Top-level collection
```typescript
{
  batchId: "BATCH_1762699367631",
  teacherId: "teacher@testmanship.com",  // Who created it

  name: "Morning Batch A2",
  description: "Beginner morning class",
  currentLevel: "A2",

  isActive: true,
  startDate: timestamp,
  endDate: timestamp | null,

  studentCount: 25,  // Computed

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Query examples:**
```typescript
// Get teacher's batches
batches.where('teacherId', '==', teacherEmail)

// Get all batches
batches.where('isActive', '==', true)

// Get batch by ID
doc('batches', batchId)
```

#### 3. `tasks/{taskId}` - Top-level collection
```typescript
{
  taskId: "TASK_1762699400000",
  batchId: "BATCH_123",
  teacherId: "teacher@testmanship.com",

  title: "Write about your family",
  instructions: "Describe your family in 200 words...",
  category: "essay",
  level: "A2",

  status: "draft" | "assigned" | "completed",
  priority: "low" | "medium" | "high",

  assignedStudents: [
    "student1@testmanship.com",
    "student2@testmanship.com"
  ],

  dueDate: timestamp,
  minWords: 150,
  maxWords: 250,

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Query examples:**
```typescript
// Get batch tasks
tasks.where('batchId', '==', batchId)

// Get student's tasks
tasks.where('assignedStudents', 'array-contains', studentEmail)

// Get teacher's tasks (all batches)
tasks.where('teacherId', '==', teacherEmail)
```

#### 4. `submissions/{submissionId}` - Top-level collection
```typescript
{
  submissionId: "SUB_1762699500000",
  taskId: "TASK_123",
  studentId: "student@testmanship.com",  // Email

  content: "Meine Familie ist sehr groß...",
  wordCount: 187,

  status: "draft" | "submitted" | "graded",

  submittedAt: timestamp | null,
  gradedAt: timestamp | null,

  score: 85,
  feedback: "Good work! Watch your grammar...",
  gradedBy: "teacher@testmanship.com",

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Query examples:**
```typescript
// Get student's submissions
submissions.where('studentId', '==', studentEmail)

// Get task submissions
submissions.where('taskId', '==', taskId)
```

#### 5. `progress/{progressId}` - Daily/weekly tracking
```typescript
{
  progressId: "PROG_20250110_student@testmanship.com",
  userId: "student@testmanship.com",
  date: "2025-01-10",  // YYYY-MM-DD

  wordsStudied: 25,
  wordsCorrect: 20,
  timeSpent: 30,  // minutes

  createdAt: timestamp
}
```

## Migration Steps

### Phase 1: Update Models (No database changes)
1. ✅ Update TypeScript interfaces in `lib/models.ts`
2. ✅ Simplify User model (merge student_data fields)
3. ✅ Create new Batch, Task, Submission interfaces

### Phase 2: Create New Hooks
1. Update `useBatches.ts` - Query top-level collection
2. Update `useWritingTasks.ts` - Query top-level collection
3. Update `useStudents.ts` - Query top-level users collection
4. Update `useCurrentStudent.ts` - Just fetch user document

### Phase 3: Update UI Components
1. Update all dashboard components to use new hooks
2. Remove nested queries
3. Remove collectionGroup queries

### Phase 4: Database Migration Script
```typescript
// migrate-database.ts
async function migrateToNewStructure() {
  // 1. Migrate users - flatten student_data
  const users = await getDocs(collection(db, 'users'));
  for (const userDoc of users.docs) {
    const studentData = await getDocs(
      collection(db, 'users', userDoc.id, 'student_data')
    );

    if (studentData.docs.length > 0) {
      // Merge student_data into user document
      const merged = {
        ...userDoc.data(),
        ...studentData.docs[0].data(),
        userId: userDoc.data().email,  // Use email as ID
      };

      // Create new flat user document
      await setDoc(doc(db, 'users', merged.email), merged);
    }
  }

  // 2. Move batches to top-level
  const teachers = await getDocs(
    query(collection(db, 'users'), where('role', '==', 'TEACHER'))
  );

  for (const teacher of teachers.docs) {
    const batches = await getDocs(
      collection(db, 'users', teacher.id, 'batches')
    );

    for (const batch of batches.docs) {
      // Move to top-level batches collection
      await setDoc(doc(db, 'batches', batch.id), {
        ...batch.data(),
        teacherId: teacher.data().email,
      });

      // 3. Move tasks to top-level
      const tasks = await getDocs(
        collection(db, 'users', teacher.id, 'batches', batch.id, 'writing_tasks')
      );

      for (const task of tasks.docs) {
        await setDoc(doc(db, 'tasks', task.id), {
          ...task.data(),
          batchId: batch.id,
          teacherId: teacher.data().email,
        });
      }
    }
  }
}
```

## Benefits of New Structure

### 1. Simplicity
- ✅ One user = one document
- ✅ One ID per person (email)
- ✅ Top-level collections = easy queries

### 2. Performance
- ✅ No nested queries
- ✅ No collectionGroup scans
- ✅ Direct document access
- ✅ Efficient indexes

### 3. Scalability
- ✅ Can add indexes on any field
- ✅ Batch operations easier
- ✅ Sharding possible

### 4. Developer Experience
- ✅ Intuitive structure
- ✅ Clear relationships
- ✅ Easy to debug
- ✅ Standard Firebase patterns

## Comparison

### Old Query (Slow):
```typescript
// Find student's tasks - REQUIRES collectionGroup
const tasksQuery = collectionGroup(db, 'writing_tasks');
const snapshot = await getDocs(tasksQuery);
const filtered = snapshot.docs.filter(doc =>
  doc.data().assignedStudents.includes(studentId)
);
// Scans EVERY task document in database!
```

### New Query (Fast):
```typescript
// Find student's tasks - Direct query
const tasksQuery = query(
  collection(db, 'tasks'),
  where('assignedStudents', 'array-contains', studentEmail)
);
const snapshot = await getDocs(tasksQuery);
// Uses index, returns only matching docs!
```

## Implementation Priority

### Phase 1: Critical (Do First)
1. Flatten `users` - merge student_data
2. Move `batches` to top-level
3. Move `tasks` to top-level
4. Update all hooks

### Phase 2: Important (Do Soon)
1. Update UI components
2. Test all queries
3. Remove old nested collections
4. Update security rules

### Phase 3: Nice to Have (Do Later)
1. Add computed fields (studentCount, etc.)
2. Add cloud functions for counters
3. Optimize indexes
4. Add caching layer

## File Changes Required

1. `lib/models.ts` - Simplify interfaces
2. `lib/hooks/useBatches.ts` - Top-level queries
3. `lib/hooks/useWritingTasks.ts` - Top-level queries
4. `lib/hooks/useStudents.ts` - Simplified queries
5. `lib/hooks/useStudentTasks.ts` - No collectionGroup
6. `app/dashboard/student/page.tsx` - Updated hooks
7. `app/dashboard/tasks/page.tsx` - Updated hooks
8. `firestore.rules` - Update security rules

## Decision: Use Email as Primary Key?

### Option A: Email as Document ID (Recommended ✅)
```
users/student@testmanship.com/
users/teacher@testmanship.com/
```

**Pros:**
- One ID to rule them all
- No confusion
- Direct lookup by email
- Email is unique and immutable

**Cons:**
- Can't change email easily
- Email in URL (not a big deal)

### Option B: Generated ID with email field
```
users/112039787846420694747/
  email: "student@testmanship.com"
```

**Pros:**
- Can change email
- Numeric ID

**Cons:**
- Still need to query by email (extra index)
- Two IDs to track

**Recommendation: Use Option A (email as ID)**

## Next Steps

Would you like me to:
1. **Implement the new structure** (create migration script)
2. **Update all hooks** to use top-level collections
3. **Keep current structure** but clean it up
4. **Something else**?

Let me know and I'll refactor the entire database structure!
