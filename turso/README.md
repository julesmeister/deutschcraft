# Turso Database Setup

This folder contains all Turso database configuration, migrations, and utilities for Testmanship Web V2.

## Overview

**Turso** is an edge-hosted, distributed SQLite database built on libSQL. It provides:
- ✅ Global distribution with low latency
- ✅ SQLite compatibility (familiar SQL syntax)
- ✅ Edge deployment (Vercel, Cloudflare Workers, etc.)
- ✅ Free tier with generous limits
- ✅ Built-in replication and sync

## Structure

```
turso/
├── client.ts              # Database client configuration
├── migrate.ts             # Migration runner script
├── migrations/            # SQL migration files
│   ├── 001_create_users_table.sql
│   ├── 002_create_batches_table.sql
│   ├── 003_create_vocabulary_table.sql
│   └── ...
└── README.md             # This file
```

## Setup Instructions

### 1. Install Turso CLI

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell)
iwr -useb https://get.tur.so/install.ps1 | iex
```

### 2. Create a Turso Account

```bash
turso auth signup
```

### 3. Create a Database

```bash
# Create a new database
turso db create testmanship-web-v2

# Get the database URL
turso db show testmanship-web-v2 --url
```

### 4. Create an Auth Token

```bash
turso db tokens create testmanship-web-v2
```

### 5. Configure Environment Variables

Add to your `.env.local` file:

```env
TURSO_DATABASE_URL=libsql://testmanship-web-v2-your-org.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your-token-here
```

### 6. Run Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Or use tsx directly
npx tsx turso/migrate.ts
```

## Migration Files

Each migration file follows this naming convention:
- `001_create_users_table.sql`
- `002_create_batches_table.sql`
- `003_create_vocabulary_table.sql`
- etc.

Migrations are executed in alphabetical order. Once a migration is executed, it's recorded in the `migrations` table and won't run again.

## Tables

### Core Tables
1. **users** - Students and teachers (email as primary key)
2. **batches** - Student groups/classes
3. **vocabulary** - German word bank with full-text search
4. **flashcards** - Practice flashcards
5. **flashcard_progress** - Spaced repetition tracking (SRS)
6. **progress** - Daily study statistics
7. **tasks** - Teacher-assigned writing tasks
8. **submissions** - Student task submissions
9. **writing_exercises** - Self-paced writing practice
10. **writing_submissions** - Exercise attempts
11. **writing_progress** - Daily writing stats
12. **sessions** - Practice session tracking

## Usage Examples

### Query the Database

```typescript
import { db } from '@/turso/client';

// Simple query
const result = await db.execute('SELECT * FROM users WHERE user_id = ?', [email]);

// With helper function
import { execute } from '@/turso/client';
const users = await execute('SELECT * FROM users WHERE role = ?', ['STUDENT']);
```

### Transactions

```typescript
import { transaction } from '@/turso/client';

await transaction([
  {
    sql: 'INSERT INTO users (user_id, email, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
    params: ['user@example.com', 'user@example.com', 'John', 'Doe', 'STUDENT'],
  },
  {
    sql: 'INSERT INTO progress (progress_id, user_id, date) VALUES (?, ?, ?)',
    params: ['PROG_20251112_user@example.com', 'user@example.com', '2025-11-12'],
  },
]);
```

### Using the Turso CLI

```bash
# Connect to your database shell
turso db shell testmanship-web-v2

# List all tables
.tables

# Describe a table
.schema users

# Run a query
SELECT COUNT(*) FROM users WHERE role = 'STUDENT';

# Exit shell
.exit
```

## NPM Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "db:migrate": "tsx turso/migrate.ts",
    "db:shell": "turso db shell testmanship-web-v2",
    "db:status": "turso db show testmanship-web-v2"
  }
}
```

## Migration Best Practices

1. **Never modify existing migrations** - Create a new migration instead
2. **Use transactions** - Wrap multiple operations in BEGIN/COMMIT
3. **Add indexes** - Include indexes for foreign keys and frequently queried columns
4. **Include rollback instructions** - Document how to undo the migration (in comments)
5. **Test locally first** - Use Turso CLI to test migrations before deploying

## Creating a New Migration

```bash
# Create a new migration file
touch turso/migrations/013_add_new_feature.sql
```

Example migration:

```sql
-- Migration: 013_add_new_feature
-- Description: Add new feature X
-- Created: 2025-11-12

-- Rollback: DROP TABLE new_table;

CREATE TABLE IF NOT EXISTS new_table (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_new_table_name ON new_table(name);
```

## Troubleshooting

### Migration Fails

```bash
# Check which migrations have been executed
turso db shell testmanship-web-v2
> SELECT * FROM migrations ORDER BY id;
```

### Reset Database (DANGER!)

```bash
# Drop and recreate database
turso db destroy testmanship-web-v2 --yes
turso db create testmanship-web-v2

# Run all migrations
npm run db:migrate
```

### View Database Metrics

```bash
turso db inspect testmanship-web-v2
```

## Local Development

For local development, you can use a local Turso database:

```bash
# Create a local database file
turso dev --db-file ./local.db

# Update .env.local
TURSO_DATABASE_URL=http://127.0.0.1:8080
TURSO_AUTH_TOKEN=your-local-token
```

## Production Deployment

1. Create a production database:
   ```bash
   turso db create testmanship-web-v2-prod
   ```

2. Add environment variables to Vercel:
   ```bash
   vercel env add TURSO_DATABASE_URL
   vercel env add TURSO_AUTH_TOKEN
   ```

3. Deploy:
   ```bash
   vercel deploy --prod
   ```

## Resources

- [Turso Documentation](https://docs.turso.tech/)
- [LibSQL Documentation](https://github.com/tursodatabase/libsql)
- [Turso CLI Reference](https://docs.turso.tech/reference/turso-cli)
- [Pricing](https://turso.tech/pricing) - Free tier: 9 GB storage, 1B row reads/month

## Data Models

For TypeScript type definitions, see:
- `lib/models/user.ts` - User and Batch models
- `lib/models/progress.ts` - Progress and Flashcard models
- `lib/models/task.ts` - Writing Task models
- `lib/models/writing.ts` - Writing Exercise models
