# Database Migration Guide

This guide explains how to switch databases in the Testmanship Web V2 application using the database abstraction layer.

## Overview

The application now uses a **database abstraction layer** that separates your application code from the specific database implementation. This means you can switch from Firestore to PostgreSQL (or any other database) without changing your application code.

## Architecture

```
Application Code
    ↓
Database Abstraction Layer (lib/database/)
    ↓
Provider (Firestore, PostgreSQL, MongoDB, etc.)
    ↓
Actual Database
```

### Key Components

1. **Generic Interfaces** (`lib/database/types.ts`)
   - Define database-agnostic operations
   - Common CRUD operations
   - Query interfaces

2. **Provider Implementations** (`lib/database/[firestore|postgres|mongodb]/`)
   - Database-specific implementations
   - All implement the same interfaces
   - Swappable without code changes

3. **Factory Pattern** (`lib/database/factory.ts`)
   - Creates the correct provider based on configuration
   - Single point of configuration

## Current Status

### ✅ Fully Implemented
- **Firestore Provider**: Production-ready, currently in use
  - All repositories implemented
  - Used by existing hooks (`useStudents`, `useTeacher`, etc.)
  - Tested and working

### 🚧 Example Implementation
- **PostgreSQL Provider**: Reference implementation provided
  - Shows the structure needed
  - Includes SQL schema
  - Needs completion for production use

### 📝 Not Started
- **MongoDB Provider**: Not implemented
  - Can be added following the same pattern

## How to Switch Databases

### Option 1: Stay with Firestore (Current)

No action needed! The abstraction layer is already in use with Firestore.

```bash
# .env.local
NEXT_PUBLIC_DATABASE_TYPE=firestore
```

### Option 2: Switch to PostgreSQL

1. **Install Dependencies**
   ```bash
   npm install pg @types/pg
   ```

2. **Set Up PostgreSQL Database**
   ```bash
   # Install PostgreSQL on your machine or use a hosted service
   # Create database
   createdb testmanship

   # Run schema (see lib/database/postgres/README.md)
   psql testmanship < schema.sql
   ```

3. **Update Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_DATABASE_TYPE=postgres
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=testmanship
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=your_password
   ```

4. **Complete PostgreSQL Implementation**
   - See `lib/database/postgres/README.md`
   - Implement all repository methods
   - Test thoroughly

5. **Migrate Data** (if needed)
   - Export from Firestore
   - Import to PostgreSQL
   - See migration script examples in `scripts/`

6. **Update and Deploy**
   ```bash
   npm run build
   npm run start
   ```

### Option 3: Implement MongoDB

Follow the same pattern as PostgreSQL:

1. Create `lib/database/mongodb/` directory
2. Implement `MongoDBBaseRepository`
3. Implement all entity repositories
4. Create `MongoDBDatabaseProvider`
5. Update factory to support MongoDB
6. Configure environment variables

## Code Examples

### Before (Direct Firestore Usage)

```typescript
// ❌ Old way - tightly coupled to Firestore
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const studentsRef = collection(db, 'students');
const q = query(studentsRef, where('teacherId', '==', teacherId));
const snapshot = await getDocs(q);
const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

### After (Using Abstraction Layer)

```typescript
// ✅ New way - database-agnostic
import { db } from '@/lib/database';

const { data: students } = await db.students.findByTeacherId(teacherId);
```

### Benefits

1. **Same code works with any database** - Just change environment variable
2. **Cleaner code** - No more Firestore query building in components
3. **Type-safe** - Full TypeScript support
4. **Testable** - Easy to mock database in tests
5. **Consistent** - Same patterns across all entities

## Migration Strategies

### Strategy 1: Gradual Migration (Recommended)

1. Keep Firestore as primary database
2. Set up PostgreSQL as secondary
3. Dual-write to both databases
4. Read from Firestore, validate with PostgreSQL
5. Once validated, switch reads to PostgreSQL
6. Remove Firestore writes

### Strategy 2: Big Bang Migration

1. Set up PostgreSQL
2. Export all Firestore data
3. Import to PostgreSQL
4. Switch environment variable
5. Deploy

### Strategy 3: Parallel Run

1. Run both databases simultaneously
2. Compare results for consistency
3. Gradually shift traffic to new database
4. Decommission old database

## Testing Your Migration

### 1. Unit Tests

```typescript
import { createDatabaseProvider } from '@/lib/database';

describe('Student Repository', () => {
  let db: DatabaseProvider;

  beforeEach(() => {
    db = createDatabaseProvider({
      type: 'postgres',
      // test config
    });
  });

  it('should find student by user ID', async () => {
    const student = await db.students.findByUserId('user123');
    expect(student).toBeDefined();
  });
});
```

### 2. Integration Tests

```typescript
// Test that Firestore and PostgreSQL return same results
const firestoreDb = createDatabaseProvider({ type: 'firestore' });
const postgresDb = createDatabaseProvider({ type: 'postgres' });

const firestoreStudent = await firestoreDb.students.findById('student123');
const postgresStudent = await postgresDb.students.findById('student123');

expect(firestoreStudent).toEqual(postgresStudent);
```

### 3. Load Tests

- Test query performance under load
- Compare Firestore vs PostgreSQL performance
- Identify bottlenecks

## Performance Considerations

### Firestore
- **Pros**:
  - Automatic scaling
  - Real-time updates
  - Built-in caching
  - No server management
- **Cons**:
  - More expensive at scale
  - Limited query capabilities
  - No joins

### PostgreSQL
- **Pros**:
  - Complex queries and joins
  - Lower cost at scale
  - Full SQL capabilities
  - Mature ecosystem
- **Cons**:
  - Requires server management
  - Need to handle scaling
  - No built-in real-time

### Query Patterns to Watch

```typescript
// This works great in Firestore
await db.students.findByTeacherId(teacherId, { limit: 20 });

// But PostgreSQL might be faster for complex queries
// SELECT s.*, u.name, u.email
// FROM students s
// JOIN users u ON s.user_id = u.id
// WHERE s.teacher_id = $1
// LIMIT 20
```

## Rollback Plan

If something goes wrong:

1. **Immediate**: Change environment variable back
   ```bash
   NEXT_PUBLIC_DATABASE_TYPE=firestore
   ```

2. **Redeploy**: Push previous working version

3. **Investigate**: Check logs for errors

4. **Fix**: Address issues before trying again

## Monitoring

After switching databases, monitor:

1. **Query Performance**
   - Response times
   - Slow query logs
   - Error rates

2. **Database Metrics**
   - Connection pool usage
   - CPU/Memory usage
   - Storage growth

3. **Application Metrics**
   - API response times
   - Error rates
   - User-reported issues

## Support

If you encounter issues:

1. Check `lib/database/README.md`
2. Review provider-specific README files
3. Check application logs
4. Test with sample queries

## Database Schema Comparison

### Firestore Collections

```
users/
  {userId}/
    - email
    - name
    - role

students/
  {studentId}/
    - userId
    - teacherId
    - wordsLearned
    - ...
```

### PostgreSQL Tables

```sql
users (id, email, name, role)
students (id, student_id, user_id, teacher_id, words_learned, ...)
```

### Field Naming

- Firestore: `camelCase` (e.g., `wordsLearned`)
- PostgreSQL: `snake_case` (e.g., `words_learned`)

The abstraction layer handles these conversions automatically.

## Future Enhancements

Planned features for the database abstraction layer:

- [ ] Database migrations support
- [ ] Automatic data synchronization between databases
- [ ] Query builder for complex operations
- [ ] Caching layer
- [ ] Performance monitoring
- [ ] Automatic failover
- [ ] Read replicas support

## Conclusion

The database abstraction layer gives you flexibility to:

- Start with Firestore for rapid development
- Switch to PostgreSQL when you need complex queries
- Use MongoDB if you prefer document storage
- Mix databases for different use cases

All while keeping your application code clean and database-agnostic!
