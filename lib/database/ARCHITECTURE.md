# Database Abstraction Layer - Architecture

## Visual Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                          │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  React      │  │   API       │  │  Server     │              │
│  │  Hooks      │  │   Routes    │  │  Actions    │              │
│  │             │  │             │  │             │              │
│  │ useStudents │  │ /api/users  │  │ getUserData │              │
│  │ useTeacher  │  │ /api/auth   │  │ createUser  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                       │
│         └────────────────┼────────────────┘                       │
│                          │                                        │
│                  import { db }                                    │
│                          │                                        │
└──────────────────────────┼────────────────────────────────────────┘
                           │
                           ↓
┌───────────────────────────────────────────────────────────────────┐
│                   ABSTRACTION LAYER                               │
│                   lib/database/                                   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  index.ts                                               │     │
│  │  export const db = getDatabaseProvider()                │     │
│  └────────────────────────┬────────────────────────────────┘     │
│                           │                                       │
│  ┌────────────────────────┴────────────────────────────────┐     │
│  │  factory.ts                                             │     │
│  │  - getDatabaseProvider()                                │     │
│  │  - Reads NEXT_PUBLIC_DATABASE_TYPE                      │     │
│  │  - Returns appropriate provider                         │     │
│  └────────────────────────┬────────────────────────────────┘     │
│                           │                                       │
│  ┌────────────────────────┴────────────────────────────────┐     │
│  │  types.ts                                               │     │
│  │  - BaseRepository<T>                                    │     │
│  │  - UserRepository, StudentRepository, etc.              │     │
│  │  - DatabaseProvider interface                           │     │
│  │  - QueryOptions, WhereCondition, etc.                   │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                   │
└──────────────────────────┬────────────────────────────────────────┘
                           │
                           ↓
┌───────────────────────────────────────────────────────────────────┐
│                    PROVIDER LAYER                                 │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Firestore     │  │   PostgreSQL    │  │    MongoDB      │  │
│  │   Provider      │  │   Provider      │  │    Provider     │  │
│  │   (ACTIVE)      │  │   (EXAMPLE)     │  │   (FUTURE)      │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                     │            │
│           ↓                    ↓                     ↓            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ User Repository │  │ User Repository │  │ User Repository │  │
│  │ Student Repo    │  │ Student Repo    │  │ Student Repo    │  │
│  │ Teacher Repo    │  │ Teacher Repo    │  │ Teacher Repo    │  │
│  │ Flashcard Repo  │  │ Flashcard Repo  │  │ Flashcard Repo  │  │
│  │ Progress Repo   │  │ Progress Repo   │  │ Progress Repo   │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘  │
│           │                    │                     │            │
└───────────┼────────────────────┼─────────────────────┼────────────┘
            │                    │                     │
            ↓                    ↓                     ↓
┌───────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                              │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │    Firestore    │  │   PostgreSQL    │  │    MongoDB      │  │
│  │                 │  │                 │  │                 │  │
│  │  users/         │  │  users table    │  │  users coll.    │  │
│  │  students/      │  │  students table │  │  students coll. │  │
│  │  teachers/      │  │  teachers table │  │  teachers coll. │  │
│  │  ...            │  │  ...            │  │  ...            │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Application Layer

**Purpose:** Your application code that needs to access data

**Components:**
- React Hooks (useStudents, useTeacher, etc.)
- API Routes (/api/users, /api/students, etc.)
- Server Actions (for Next.js 13+ server components)

**Usage:**
```typescript
import { db } from '@/lib/database';

// In hooks
const { data: students } = await db.students.findByTeacherId(teacherId);

// In API routes
const user = await db.users.findByEmail(email);

// In server actions
const student = await db.students.create({ ... });
```

**Key Point:** Application code NEVER imports database-specific libraries (Firestore, pg, mongodb, etc.)

---

### 2. Abstraction Layer

**Purpose:** Provides a consistent interface regardless of database

**Files:**
- `index.ts` - Main entry point, exports `db` singleton
- `factory.ts` - Creates appropriate provider based on config
- `types.ts` - TypeScript interfaces and types

**Key Interfaces:**

#### BaseRepository<T>
```typescript
interface BaseRepository<T> {
  create(data): Promise<T>
  findById(id): Promise<T | null>
  findMany(options): Promise<QueryResult<T>>
  update(id, data): Promise<T>
  delete(id): Promise<void>
  // ... more methods
}
```

#### Entity Repositories
```typescript
interface StudentRepository extends BaseRepository<Student> {
  findByUserId(userId): Promise<Student | null>
  findByTeacherId(teacherId, options?): Promise<QueryResult<Student>>
  findActiveStudents(teacherId?): Promise<Student[]>
  updateStats(studentId, stats): Promise<Student>
}
```

#### DatabaseProvider
```typescript
interface DatabaseProvider {
  users: UserRepository
  students: StudentRepository
  teachers: TeacherRepository
  vocabularyWords: VocabularyWordRepository
  flashcards: FlashcardRepository
  flashcardProgress: FlashcardProgressRepository
  studyProgress: StudyProgressRepository

  connect(): Promise<void>
  disconnect(): Promise<void>
  transaction<T>(callback): Promise<T>
}
```

**Configuration:**
```typescript
// Factory reads environment variable
const dbType = process.env.NEXT_PUBLIC_DATABASE_TYPE || 'firestore'

// Returns appropriate provider
return dbType === 'firestore'
  ? new FirestoreDatabaseProvider(db)
  : new PostgresDatabaseProvider(config)
```

---

### 3. Provider Layer

**Purpose:** Database-specific implementations of the abstractions

#### Firestore Provider (Production Ready)

**Structure:**
```
firestore/
├── provider.ts              # FirestoreDatabaseProvider
├── base-repository.ts       # Common Firestore operations
└── repositories/
    ├── user.repository.ts
    ├── student.repository.ts
    ├── teacher.repository.ts
    ├── vocabulary-word.repository.ts
    ├── flashcard.repository.ts
    ├── flashcard-progress.repository.ts
    └── study-progress.repository.ts
```

**Example Implementation:**
```typescript
// FirestoreStudentRepository extends FirestoreBaseRepository
async findByTeacherId(teacherId: string): Promise<QueryResult<Student>> {
  return this.findMany({
    where: [{ field: 'teacherId', operator: '==', value: teacherId }],
    orderBy: [{ field: 'lastActiveDate', direction: 'desc' }],
  });
}

// FirestoreBaseRepository converts to Firestore queries
protected buildQuery(options: QueryOptions): Query<DocumentData> {
  const constraints: QueryConstraint[] = [];

  options.where?.forEach(condition => {
    constraints.push(where(condition.field, condition.operator, condition.value));
  });

  options.orderBy?.forEach(order => {
    constraints.push(orderBy(order.field, order.direction));
  });

  return query(this.getCollectionRef(), ...constraints);
}
```

#### PostgreSQL Provider (Example/Reference)

**Structure:**
```
postgres/
├── provider.ts              # PostgresDatabaseProvider
├── base-repository.ts       # Common SQL operations
└── repositories/
    └── student.repository.ts  # Example implementation
```

**Example Implementation:**
```typescript
// PostgresStudentRepository extends PostgresBaseRepository
async findByTeacherId(teacherId: string): Promise<QueryResult<Student>> {
  // SQL: SELECT * FROM students
  //      WHERE teacher_id = $1
  //      ORDER BY last_active_date DESC
  return this.findMany({
    where: [{ field: 'teacher_id', operator: '==', value: teacherId }],
    orderBy: [{ field: 'last_active_date', direction: 'desc' }],
  });
}

// PostgresBaseRepository converts to SQL
protected buildWhereClause(conditions): { sql: string; params: any[] } {
  const clauses = conditions.map((c, i) =>
    `${c.field} ${c.operator} $${i + 1}`
  );
  return {
    sql: `WHERE ${clauses.join(' AND ')}`,
    params: conditions.map(c => c.value)
  };
}
```

---

### 4. Database Layer

**Purpose:** Actual database storage

#### Firestore Collections
```
users/
  {userId}/
    email: string
    name: string
    role: 'student' | 'teacher'

students/
  {studentId}/
    userId: string
    teacherId: string
    wordsLearned: number
    currentLevel: string
    ...

teachers/
  {teacherId}/
    userId: string
    totalStudents: number
    ...
```

#### PostgreSQL Tables
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  role VARCHAR(20),
  ...
)

students (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  teacher_id UUID REFERENCES teachers(id),
  words_learned INTEGER,
  current_level VARCHAR(2),
  ...
)
```

---

## Data Flow Examples

### Creating a Student

```
┌──────────────────┐
│ Component        │  const student = await db.students.create({ ... })
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Factory          │  Returns active provider (Firestore)
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Firestore        │  FirestoreStudentRepository.create()
│ Provider         │    ↓
│                  │  FirestoreBaseRepository.create()
│                  │    - Adds timestamps
│                  │    - Calls addDoc()
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Firestore DB     │  Document created in students/ collection
└──────────────────┘
```

### Switching to PostgreSQL

```
┌──────────────────┐
│ Component        │  const student = await db.students.create({ ... })
└────────┬─────────┘                     (SAME CODE!)
         ↓
┌──────────────────┐
│ Factory          │  Returns PostgreSQL provider
│                  │  (based on env var change)
└────────┬─────────┘
         ↓
┌──────────────────┐
│ PostgreSQL       │  PostgresStudentRepository.create()
│ Provider         │    ↓
│                  │  PostgresBaseRepository.create()
│                  │    - Adds timestamps
│                  │    - Executes INSERT query
└────────┬─────────┘
         ↓
┌──────────────────┐
│ PostgreSQL DB    │  Row inserted in students table
└──────────────────┘
```

---

## Query Translation Examples

### Application Code (Same for all databases)
```typescript
const result = await db.students.findMany({
  where: [
    { field: 'teacherId', operator: '==', value: 'teacher123' },
    { field: 'currentLevel', operator: '==', value: 'B1' }
  ],
  orderBy: [{ field: 'wordsLearned', direction: 'desc' }],
  limit: 20
});
```

### Firestore Translation
```typescript
query(
  collection(db, 'students'),
  where('teacherId', '==', 'teacher123'),
  where('currentLevel', '==', 'B1'),
  orderBy('wordsLearned', 'desc'),
  limit(20)
)
```

### PostgreSQL Translation
```sql
SELECT * FROM students
WHERE teacher_id = 'teacher123'
  AND current_level = 'B1'
ORDER BY words_learned DESC
LIMIT 20
```

### MongoDB Translation
```javascript
db.collection('students').find({
  teacherId: 'teacher123',
  currentLevel: 'B1'
})
.sort({ wordsLearned: -1 })
.limit(20)
```

---

## Key Design Patterns

### 1. Repository Pattern
- Encapsulates data access logic
- Each entity has its own repository
- Consistent interface across entities

### 2. Factory Pattern
- Creates appropriate provider based on config
- Single point of provider selection
- Easy to extend with new providers

### 3. Strategy Pattern
- Different database implementations
- Same interface, different strategies
- Swappable at runtime (via config)

### 4. Singleton Pattern
- Single database instance throughout app
- Efficient connection pooling
- Consistent state

---

## Benefits Summary

### For Developers
- ✅ Write code once, works with any database
- ✅ Clean, readable code
- ✅ Full TypeScript support
- ✅ Easy to test
- ✅ Consistent patterns

### For Application
- ✅ Database independence
- ✅ Easy migration path
- ✅ No vendor lock-in
- ✅ Flexible architecture
- ✅ Future-proof

### For Operations
- ✅ Switch databases without code changes
- ✅ Run multiple databases simultaneously
- ✅ Easy to add caching
- ✅ Simple monitoring
- ✅ Clear separation of concerns
