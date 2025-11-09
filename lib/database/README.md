# Database Abstraction Layer

This directory contains a database-agnostic abstraction layer that allows you to easily switch between different database providers (Firestore, PostgreSQL, MongoDB, etc.) without changing your application code.

## Architecture

```
lib/database/
├── types.ts                      # Generic interfaces and types
├── factory.ts                    # Provider factory pattern
├── index.ts                      # Main entry point
├── firestore/                    # Firestore implementation
│   ├── provider.ts              # Firestore provider
│   ├── base-repository.ts       # Base CRUD operations
│   └── repositories/            # Entity-specific repositories
│       ├── user.repository.ts
│       ├── student.repository.ts
│       ├── teacher.repository.ts
│       └── ...
├── postgres/                     # PostgreSQL implementation (future)
│   ├── provider.ts
│   ├── base-repository.ts
│   └── repositories/
└── mongodb/                      # MongoDB implementation (future)
    ├── provider.ts
    ├── base-repository.ts
    └── repositories/
```

## Key Concepts

### 1. Repository Pattern
Each entity (User, Student, Teacher, etc.) has a repository that handles all database operations for that entity. Repositories implement common CRUD operations plus entity-specific queries.

### 2. Database Provider
The `DatabaseProvider` interface defines the contract that all database implementations must follow. This ensures that switching databases only requires changing configuration, not code.

### 3. Factory Pattern
The factory (`factory.ts`) creates the appropriate database provider based on environment configuration.

## Usage

### Basic Usage

```typescript
import { db } from '@/lib/database';

// Create
const user = await db.users.create({
  email: 'student@example.com',
  name: 'Max Mustermann',
  role: 'student',
});

// Read
const foundUser = await db.users.findByEmail('student@example.com');
const allTeachers = await db.users.findByRole('teacher');

// Update
const updated = await db.users.update(user.id, {
  name: 'Max Updated',
});

// Delete
await db.users.delete(user.id);
```

### Advanced Queries

```typescript
// Query with filters, ordering, and pagination
const { data: students, hasNextPage, lastCursor } = await db.students.findMany({
  where: [
    { field: 'teacherId', operator: '==', value: 'teacher123' },
    { field: 'currentLevel', operator: '==', value: CEFRLevel.B1 },
  ],
  orderBy: [
    { field: 'wordsLearned', direction: 'desc' },
  ],
  limit: 20,
});

// Pagination (next page)
const { data: nextPage } = await db.students.findMany({
  where: [{ field: 'teacherId', operator: '==', value: 'teacher123' }],
  limit: 20,
  startAfter: lastCursor,
});
```

### Batch Operations

```typescript
// Create multiple records
const students = await db.students.createBatch([
  { userId: 'user1', targetLanguage: 'German', ... },
  { userId: 'user2', targetLanguage: 'German', ... },
]);

// Update multiple records
const updated = await db.students.updateBatch([
  { id: 'student1', data: { wordsLearned: 100 } },
  { id: 'student2', data: { wordsLearned: 150 } },
]);

// Delete multiple records
await db.students.deleteBatch(['student1', 'student2']);
```

### Transactions

```typescript
// Execute operations in a transaction
await db.transaction(async (repositories) => {
  // All operations within this callback will be transactional
  const user = await repositories.users.create({ ... });
  const student = await repositories.students.create({
    userId: user.id,
    ...
  });

  // If any operation fails, all will be rolled back
});
```

### Entity-Specific Methods

Each repository has entity-specific methods beyond basic CRUD:

```typescript
// Student repository
const student = await db.students.findByUserId('user123');
const activeStudents = await db.students.findActiveStudents('teacher123');
await db.students.updateStats('student123', {
  wordsLearned: 100,
  currentStreak: 7,
});

// Teacher repository
const teacher = await db.teachers.findByUserId('user456');
await db.teachers.updateStudentCount('teacher123', 1); // Increment by 1

// Flashcard Progress repository
const dueCards = await db.flashcardProgress.findDueForReview('user123');
await db.flashcardProgress.updateAfterReview('progress123', true, nextDate);

// Study Progress repository
const todayProgress = await db.studyProgress.getTodayProgress('user123');
const weeklyProgress = await db.studyProgress.getWeeklyProgress('user123');
```

## Switching Databases

To switch from Firestore to PostgreSQL (or another database):

1. **Set environment variable:**
   ```bash
   NEXT_PUBLIC_DATABASE_TYPE=postgres
   ```

2. **Add connection details:**
   ```bash
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=testmanship
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=secret
   ```

3. **Implement the PostgreSQL provider** (see `postgres/provider.ts`)

4. **No code changes needed!** Your application code using `db.users.findByEmail()` will work the same.

## Implementing a New Database Provider

To add support for a new database (e.g., PostgreSQL):

1. **Create provider directory:**
   ```
   lib/database/postgres/
   ├── provider.ts
   ├── base-repository.ts
   └── repositories/
   ```

2. **Implement `BaseRepository` interface:**
   ```typescript
   // postgres/base-repository.ts
   export abstract class PostgresBaseRepository<T> implements BaseRepository<T> {
     async create(data) { /* SQL INSERT */ }
     async findById(id) { /* SQL SELECT */ }
     // ... implement all methods
   }
   ```

3. **Implement entity repositories:**
   ```typescript
   // postgres/repositories/user.repository.ts
   export class PostgresUserRepository extends PostgresBaseRepository<User> implements UserRepository {
     async findByEmail(email: string) {
       // SELECT * FROM users WHERE email = ?
     }
   }
   ```

4. **Implement `DatabaseProvider`:**
   ```typescript
   // postgres/provider.ts
   export class PostgresDatabaseProvider implements DatabaseProvider {
     users: PostgresUserRepository;
     students: PostgresStudentRepository;
     // ... all repositories
   }
   ```

5. **Update factory:**
   ```typescript
   // factory.ts
   case 'postgres':
     return new PostgresDatabaseProvider(postgresConfig);
   ```

## Testing

```typescript
import { createDatabaseProvider, resetDatabaseProvider } from '@/lib/database';

// Create a test provider
const testDb = createDatabaseProvider({
  type: 'firestore',
  // ... test config
});

// Use in tests
const user = await testDb.users.create({ ... });

// Clean up
resetDatabaseProvider();
```

## Best Practices

1. **Always use the abstraction layer** - Don't import Firestore directly in application code
2. **Use repositories for all database operations** - Don't write raw queries in components
3. **Keep entity-specific logic in repositories** - Complex queries belong in repository methods
4. **Use transactions for multi-step operations** - Ensure data consistency
5. **Handle errors appropriately** - Repositories throw errors, handle them in your application

## Migration Guide

If you have existing code using Firestore directly:

**Before:**
```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const studentsRef = collection(db, 'students');
const q = query(studentsRef, where('teacherId', '==', teacherId));
const snapshot = await getDocs(q);
const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

**After:**
```typescript
import { db } from '@/lib/database';

const { data: students } = await db.students.findByTeacherId(teacherId);
```

## Future Enhancements

- [ ] Implement PostgreSQL provider
- [ ] Implement MongoDB provider
- [ ] Add database migrations support
- [ ] Add query builder for complex queries
- [ ] Add caching layer
- [ ] Add connection pooling
- [ ] Add performance monitoring
- [ ] Add query logging
