# Firestore Database Structure

## ✅ NEW FLAT STRUCTURE (Current)

All collections are at the top level - clean, fast, and scalable.

```
firestore/
├── users/{email}           # ONE document per person (email = ID)
├── batches/{batchId}       # Top-level batches
├── tasks/{taskId}          # Top-level writing tasks
├── submissions/{submissionId}  # Student submissions
├── progress/{progressId}   # Daily learning stats
├── vocabulary/{wordId}     # Global word bank
└── flashcards/{flashcardId}    # Student SRS data
```

---

## 📋 Collection Details

### 1. `users/{email}` - User Accounts

**Document ID**: Email address (e.g., `student@testmanship.com`)

```typescript
{
  // Identity
  userId: "student@testmanship.com",  // Same as document ID
  email: "student@testmanship.com",
  firstName: "Max",
  lastName: "Mustermann",
  role: "STUDENT" | "TEACHER",
  photoURL?: string,

  // Student-only fields (if role === "STUDENT")
  cefrLevel: "A2",
  teacherId: "teacher@testmanship.com",  // Teacher's email
  batchId: "BATCH_001",                  // Current batch
  wordsLearned: 342,
  wordsMastered: 187,
  currentStreak: 7,
  dailyGoal: 25,

  // Teacher-only fields (if role === "TEACHER")
  totalStudents: 45,
  activeBatches: 3,

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Why email as ID?**
- ✅ One unique identifier (no confusion!)
- ✅ Direct lookup: `doc('users', email)`
- ✅ No need to query by email
- ✅ Simplifies authentication flow

**Query Examples**:
```typescript
// Get user by email
const userRef = doc(db, 'users', 'student@testmanship.com');
const userDoc = await getDoc(userRef);

// Get all students in a batch
const q = query(
  collection(db, 'users'),
  where('role', '==', 'STUDENT'),
  where('batchId', '==', 'BATCH_001')
);

// Get all students of a teacher
const q = query(
  collection(db, 'users'),
  where('role', '==', 'STUDENT'),
  where('teacherId', '==', 'teacher@testmanship.com')
);
```

---

### 2. `batches/{batchId}` - Student Groups

**Document ID**: Generated (e.g., `BATCH_1762699367631`)

```typescript
{
  batchId: "BATCH_001",
  teacherId: "teacher@testmanship.com",  // Who created it

  name: "Morning Batch A2",
  description: "Beginner German class",
  currentLevel: "A2",

  isActive: true,
  startDate: timestamp,
  endDate: timestamp | null,

  studentCount: 15,  // Computed

  levelHistory: [
    {
      level: "A1",
      startDate: timestamp,
      endDate: timestamp,
      modifiedBy: "teacher@testmanship.com",
      notes: "Starting level"
    },
    {
      level: "A2",
      startDate: timestamp,
      endDate: null,
      modifiedBy: "teacher@testmanship.com"
    }
  ],

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Query Examples**:
```typescript
// Get teacher's batches
const q = query(
  collection(db, 'batches'),
  where('teacherId', '==', 'teacher@testmanship.com')
);

// Get active batches only
const q = query(
  collection(db, 'batches'),
  where('teacherId', '==', 'teacher@testmanship.com'),
  where('isActive', '==', true)
);

// Get single batch
const batchRef = doc(db, 'batches', 'BATCH_001');
const batchDoc = await getDoc(batchRef);
```

---

### 3. `tasks/{taskId}` - Writing Assignments

**Document ID**: Generated (e.g., `TASK_1762699400000`)

```typescript
{
  taskId: "TASK_123",
  batchId: "BATCH_001",                  // Which batch
  teacherId: "teacher@testmanship.com",  // Who created it

  title: "Write about your family",
  instructions: "Describe your family in 200 words...",
  category: "essay" | "letter" | "email" | "story" | ...,
  level: "A2",

  status: "draft" | "assigned" | "completed",
  priority: "low" | "medium" | "high",

  assignedDate: timestamp | null,
  dueDate: timestamp,
  estimatedDuration: 45,  // minutes

  assignedStudents: [
    "student1@testmanship.com",
    "student2@testmanship.com"
  ],
  completedStudents: [
    "student1@testmanship.com"
  ],

  minWords: 150,
  maxWords: 250,
  totalPoints: 100,

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Query Examples**:
```typescript
// Get batch tasks
const q = query(
  collection(db, 'tasks'),
  where('batchId', '==', 'BATCH_001')
);

// Get student's tasks (FAST with index!)
const q = query(
  collection(db, 'tasks'),
  where('assignedStudents', 'array-contains', 'student@testmanship.com')
);

// Get teacher's tasks
const q = query(
  collection(db, 'tasks'),
  where('teacherId', '==', 'teacher@testmanship.com')
);
```

---

### 4. `submissions/{submissionId}` - Student Work

**Document ID**: Generated (e.g., `SUB_1762699500000`)

```typescript
{
  submissionId: "SUB_123",
  taskId: "TASK_123",
  studentId: "student@testmanship.com",
  batchId: "BATCH_001",

  content: "Meine Familie ist sehr groß...",
  wordCount: 187,

  status: "draft" | "submitted" | "graded" | "returned",

  startedAt: timestamp,
  submittedAt: timestamp,
  gradedAt: timestamp,

  score: 85,
  maxScore: 100,
  feedback: "Good work! Watch your grammar...",
  gradedBy: "teacher@testmanship.com",

  version: 2,
  revisions: [
    {
      version: 1,
      content: "...",
      wordCount: 150,
      savedAt: timestamp
    }
  ],

  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Query Examples**:
```typescript
// Get student's submissions
const q = query(
  collection(db, 'submissions'),
  where('studentId', '==', 'student@testmanship.com')
);

// Get submissions for a task
const q = query(
  collection(db, 'submissions'),
  where('taskId', '==', 'TASK_123')
);

// Get pending grading for teacher
const q = query(
  collection(db, 'submissions'),
  where('status', '==', 'submitted'),
  where('batchId', '==', 'BATCH_001')
);
```

---

### 5. `progress/{progressId}` - Daily Stats

**Document ID**: Format: `PROG_{YYYYMMDD}_{email}`

```typescript
{
  progressId: "PROG_20250110_student@testmanship.com",
  userId: "student@testmanship.com",
  date: "2025-01-10",  // YYYY-MM-DD

  wordsStudied: 25,
  wordsCorrect: 20,
  wordsIncorrect: 5,
  timeSpent: 30,  // minutes

  sessionsCompleted: 3,
  cardsReviewed: 45,
  sentencesCreated: 8,

  createdAt: timestamp
}
```

**Query Examples**:
```typescript
// Get student's progress for a date range
const q = query(
  collection(db, 'progress'),
  where('userId', '==', 'student@testmanship.com'),
  where('date', '>=', '2025-01-01'),
  where('date', '<=', '2025-01-07'),
  orderBy('date', 'desc')
);

// Get today's progress
const progressId = `PROG_20250110_student@testmanship.com`;
const progressRef = doc(db, 'progress', progressId);
const progressDoc = await getDoc(progressRef);
```

---

## 🔗 Relationships

All collections are connected through **email addresses and IDs**:

```
User (student@testmanship.com)
  ↓ batchId
Batch (BATCH_001)
  ↓ teacherId
User (teacher@testmanship.com)

Task (TASK_123)
  ↓ batchId → Batch (BATCH_001)
  ↓ assignedStudents → [student emails]

Submission (SUB_123)
  ↓ taskId → Task (TASK_123)
  ↓ studentId → User (student@testmanship.com)
```

---

## 📊 Required Firestore Indexes

```javascript
// tasks collection
{
  collection: 'tasks',
  fields: [
    { field: 'batchId', order: 'asc' },
    { field: 'dueDate', order: 'desc' }
  ]
}

{
  collection: 'tasks',
  fields: [
    { field: 'teacherId', order: 'asc' },
    { field: 'batchId', order: 'asc' }
  ]
}

{
  collection: 'tasks',
  fields: [
    { field: 'assignedStudents', arrayConfig: 'CONTAINS' },
    { field: 'dueDate', order: 'desc' }
  ]
}

// submissions collection
{
  collection: 'submissions',
  fields: [
    { field: 'taskId', order: 'asc' },
    { field: 'submittedAt', order: 'desc' }
  ]
}

{
  collection: 'submissions',
  fields: [
    { field: 'status', order: 'asc' },
    { field: 'batchId', order: 'asc' }
  ]
}

// users collection
{
  collection: 'users',
  fields: [
    { field: 'role', order: 'asc' },
    { field: 'batchId', order: 'asc' }
  ]
}

{
  collection: 'users',
  fields: [
    { field: 'role', order: 'asc' },
    { field: 'teacherId', order: 'asc' }
  ]
}

// progress collection
{
  collection: 'progress',
  fields: [
    { field: 'userId', order: 'asc' },
    { field: 'date', order: 'desc' }
  ]
}
```

---

## 🚀 Performance Benefits

### Old Structure Problems:
- ❌ Nested collections: `users/{teacherId}/batches/{batchId}/tasks`
- ❌ Required `collectionGroup` queries (scans ALL subcollections!)
- ❌ Slow queries (no composite indexes possible)
- ❌ Complex permission rules

### New Structure Benefits:
- ✅ Top-level collections = direct access
- ✅ Simple queries with composite indexes
- ✅ Fast lookups (document ID = email)
- ✅ Easy to scale and optimize

---

## 🔒 Security Rules Example

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{email} {
      // Users can read their own document
      allow read: if request.auth.token.email == email;

      // Teachers can read their students
      allow read: if request.auth.token.email == resource.data.teacherId;

      // Users can update their own document
      allow update: if request.auth.token.email == email;
    }

    // Batches collection
    match /batches/{batchId} {
      // Teacher who created batch can read/write
      allow read, write: if request.auth.token.email == resource.data.teacherId;

      // Students in batch can read
      allow read: if request.auth.token.email in get(/databases/$(database)/documents/users/$(request.auth.token.email)).data.batchId == batchId;
    }

    // Tasks collection
    match /tasks/{taskId} {
      // Teacher can read/write their tasks
      allow read, write: if request.auth.token.email == resource.data.teacherId;

      // Students can read tasks assigned to them
      allow read: if request.auth.token.email in resource.data.assignedStudents;
    }

    // Submissions collection
    match /submissions/{submissionId} {
      // Students can read/write their own submissions
      allow read, write: if request.auth.token.email == resource.data.studentId;

      // Teachers can read/grade submissions in their batches
      allow read, write: if request.auth.token.email == get(/databases/$(database)/documents/batches/$(resource.data.batchId)).data.teacherId;
    }
  }
}
```

---

## 📝 Summary

This flat structure provides:
- ✅ **Simplicity**: One ID per person (email)
- ✅ **Speed**: Direct document access
- ✅ **Scalability**: Top-level collections
- ✅ **Clarity**: Clear relationships
- ✅ **Performance**: Efficient indexes

No more nested confusion! 🎉
