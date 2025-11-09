# PostgreSQL Implementation Guide

This directory contains an example PostgreSQL implementation of the database abstraction layer.

## Status: Not Production Ready

This is a **reference implementation** showing the structure needed to add PostgreSQL support. To use this in production, you'll need to complete the implementation.

## Setup Steps

### 1. Install Dependencies

```bash
npm install pg @types/pg
```

### 2. Set Environment Variables

Create a `.env.local` file:

```bash
# Database Type
NEXT_PUBLIC_DATABASE_TYPE=postgres

# PostgreSQL Connection
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=testmanship
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_secure_password
POSTGRES_SSL=false
```

### 3. Database Schema

Run the following SQL to create the database schema:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  profile_picture_url TEXT,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher')),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  target_language VARCHAR(50) NOT NULL,
  current_level VARCHAR(2) CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  words_learned INTEGER DEFAULT 0,
  words_mastered INTEGER DEFAULT 0,
  sentences_created INTEGER DEFAULT 0,
  sentences_perfect INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0,
  last_active_date BIGINT,
  daily_goal INTEGER DEFAULT 20,
  notifications_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_teacher_id ON students(teacher_id);
CREATE INDEX idx_students_last_active ON students(last_active_date DESC);
CREATE INDEX idx_students_level ON students(current_level);

-- Teachers table
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department VARCHAR(100),
  specialization VARCHAR(100) NOT NULL,
  total_students INTEGER DEFAULT 0,
  active_students INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_teachers_department ON teachers(department);

-- Vocabulary Words table
CREATE TABLE vocabulary_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  german_word VARCHAR(255) NOT NULL,
  english_translation VARCHAR(255) NOT NULL,
  part_of_speech VARCHAR(50),
  gender VARCHAR(10),
  level VARCHAR(2) NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  example_sentence TEXT,
  audio_url TEXT,
  created_at BIGINT NOT NULL
);

CREATE INDEX idx_vocab_level ON vocabulary_words(level);
CREATE INDEX idx_vocab_german ON vocabulary_words(german_word);
CREATE INDEX idx_vocab_pos ON vocabulary_words(part_of_speech);

-- Flashcards table
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('translation', 'fill-in-blank', 'multiple-choice')),
  level VARCHAR(2) NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  created_at BIGINT NOT NULL
);

CREATE INDEX idx_flashcards_word_id ON flashcards(word_id);
CREATE INDEX idx_flashcards_level ON flashcards(level);
CREATE INDEX idx_flashcards_type ON flashcards(type);

-- Flashcard Progress table (Spaced Repetition)
CREATE TABLE flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  repetitions INTEGER DEFAULT 0,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  next_review_date BIGINT NOT NULL,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  last_review_date BIGINT,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 100),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  UNIQUE(user_id, word_id)
);

CREATE INDEX idx_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX idx_progress_next_review ON flashcard_progress(next_review_date);

-- Study Progress table
CREATE TABLE study_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date BIGINT NOT NULL,
  words_studied INTEGER DEFAULT 0,
  words_correct INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  level VARCHAR(2) NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  created_at BIGINT NOT NULL
);

CREATE INDEX idx_study_user_id ON study_progress(user_id);
CREATE INDEX idx_study_date ON study_progress(date DESC);
```

### 4. Complete Repository Implementations

Each repository in `repositories/` needs to be completed:

1. **Inject Pool/Client**: Update constructors to accept database connection
2. **Implement CRUD methods**: Complete all BaseRepository methods
3. **Add error handling**: Wrap queries in try-catch blocks
4. **Handle type conversions**: Convert between database types and TypeScript models

Example for `user.repository.ts`:

```typescript
import { Pool } from 'pg';
import { PostgresBaseRepository } from '../base-repository';
import { UserRepository } from '../../types';
import { User } from '../../../models';

export class PostgresUserRepository extends PostgresBaseRepository<User> implements UserRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    super('users');
    this.pool = pool;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async findByRole(role: 'student' | 'teacher'): Promise<User[]> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE role = $1',
      [role]
    );

    return result.rows.map(row => this.mapRowToUser(row));
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      profilePictureUrl: row.profile_picture_url,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
```

### 5. Update Factory

The factory is already set up to use PostgreSQL when configured. Just complete the implementation.

### 6. Testing

Before switching production to PostgreSQL:

1. **Test all repositories** with unit tests
2. **Run integration tests** against a test database
3. **Test migrations** from Firestore to PostgreSQL
4. **Performance test** queries with realistic data volumes
5. **Test connection pooling** under load

## Migration from Firestore

To migrate data from Firestore to PostgreSQL:

1. **Export Firestore data**:
   ```bash
   gcloud firestore export gs://your-bucket/firestore-backup
   ```

2. **Write migration script**:
   ```typescript
   // scripts/migrate-firestore-to-postgres.ts
   import { db as firestoreDb } from '@/lib/firebase';
   import { createDatabaseProvider } from '@/lib/database';

   const postgresDb = createDatabaseProvider({
     type: 'postgres',
     // ... config
   });

   // Migrate users, students, etc.
   ```

3. **Run migration**:
   ```bash
   npm run migrate
   ```

## Performance Considerations

### Indexes

The schema includes indexes on frequently queried fields:
- `users.email` (unique lookups)
- `students.teacher_id` (teacher queries)
- `students.last_active_date` (sorting)
- `flashcard_progress.next_review_date` (finding due cards)

Add more indexes based on your query patterns.

### Connection Pooling

Configure the pool size based on your needs:

```typescript
const pool = new Pool({
  max: 20, // maximum connections
  min: 5,  // minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Query Optimization

- Use `EXPLAIN ANALYZE` to optimize slow queries
- Consider materialized views for complex aggregations
- Use prepared statements for frequently executed queries

## Production Checklist

- [ ] Complete all repository implementations
- [ ] Add comprehensive error handling
- [ ] Write unit tests for all repositories
- [ ] Write integration tests
- [ ] Set up database migrations (e.g., with Prisma or node-pg-migrate)
- [ ] Configure connection pooling
- [ ] Add query logging
- [ ] Set up monitoring (e.g., pg_stat_statements)
- [ ] Implement backup strategy
- [ ] Test disaster recovery
- [ ] Load test with realistic data
- [ ] Document all custom queries
