# Turso Database Setup Guide

Quick start guide for setting up Turso DB for Testmanship Web V2.

## What is Turso?

Turso is an edge-hosted, distributed SQLite database built on libSQL. Perfect for Next.js apps deployed on Vercel:
- SQLite compatibility (no new SQL to learn)
- Global edge deployment (low latency worldwide)
- Free tier: 9 GB storage, 1B row reads/month
- No connection limits or pooling needed

## Quick Setup (5 minutes)

### 1. Install Turso CLI

**Windows (PowerShell):**
```powershell
iwr -useb https://get.tur.so/install.ps1 | iex
```

**macOS/Linux:**
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### 2. Create Account & Login

```bash
turso auth signup
# Follow the browser prompt to sign up
```

### 3. Create Database

```bash
# Create a new database
turso db create testmanship-web-v2

# Get the database URL (copy this!)
turso db show testmanship-web-v2 --url
# Output: libsql://testmanship-web-v2-your-org.turso.io
```

### 4. Generate Auth Token

```bash
# Create an auth token (copy this!)
turso db tokens create testmanship-web-v2
# Output: eyJhbGc...your-long-token-here
```

### 5. Update .env.local

Add these lines to your `.env.local` file:

```env
TURSO_DATABASE_URL=libsql://testmanship-web-v2-your-org.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...your-token-here
```

Replace with your actual values from steps 3 and 4.

### 6. Run Migrations

```bash
npm run db:migrate
```

You should see:
```
🚀 Starting Turso DB migrations...
✓ Migrations table ready
📊 Found 0 executed migrations
📂 Found 12 migration files
⏳ Running 12 pending migrations...

▶ Running migration: 001_create_users_table.sql
✓ Completed: 001_create_users_table.sql

▶ Running migration: 002_create_batches_table.sql
✓ Completed: 002_create_batches_table.sql

...

✅ All migrations completed successfully!
```

## Verify Setup

### Check Tables in Shell

```bash
npm run db:shell
```

In the Turso shell:
```sql
-- List all tables
.tables

-- Expected output:
batches            progress           vocabulary
flashcard_progress sessions           writing_exercises
flashcards         submissions        writing_progress
migrations         tasks              writing_submissions
users

-- Describe a table
.schema users

-- Count records (should be 0 initially)
SELECT COUNT(*) FROM users;

-- Exit shell
.exit
```

## Database Structure

### 12 Tables Created

1. **users** - Students and teachers (email as primary key)
2. **batches** - Student groups/classes
3. **vocabulary** - German word bank with FTS search
4. **flashcards** - Practice flashcards
5. **flashcard_progress** - Spaced repetition (SRS) tracking
6. **progress** - Daily study statistics
7. **tasks** - Teacher-assigned writing tasks
8. **submissions** - Student task submissions
9. **writing_exercises** - Self-paced writing practice
10. **writing_submissions** - Exercise attempts
11. **writing_progress** - Daily writing stats
12. **sessions** - Practice session tracking

## Next Steps

### Option A: Import Existing Firebase Data

If you have data in Firebase that you want to migrate:

```bash
# Create a migration script
touch scripts/migrate-firebase-to-turso.ts
```

### Option B: Start Fresh

Your database is ready! The next time you create users through your app, they'll be stored in Turso.

### Option C: Seed Sample Data

Create a seeding script:

```bash
# Create seeding script
touch scripts/seed-turso.ts
```

Example seed script:
```typescript
import { db } from '@/turso/client';

async function seedData() {
  // Insert sample teacher
  await db.execute({
    sql: `INSERT INTO users (user_id, email, first_name, last_name, role, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'teacher@example.com',
      'teacher@example.com',
      'John',
      'Doe',
      'TEACHER',
      Date.now(),
      Date.now()
    ]
  });

  console.log('✓ Sample data seeded');
}

seedData();
```

## Useful Commands

```bash
# Run migrations
npm run db:migrate

# Open database shell
npm run db:shell

# Check database status
npm run db:status

# View database metrics
turso db inspect testmanship-web-v2

# List all databases
turso db list

# Create a new migration
touch turso/migrations/013_add_new_feature.sql
```

## Troubleshooting

### Error: "TURSO_DATABASE_URL environment variable is required"

Make sure you've added both environment variables to `.env.local`:
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN

Then restart your Next.js dev server.

### Error: "failed to perform request"

Your auth token might be expired. Generate a new one:
```bash
turso db tokens create testmanship-web-v2
```

Update the token in `.env.local`.

### Migration Already Exists Error

If you need to re-run a migration:
```bash
# Open shell
npm run db:shell

# Delete the migration record
DELETE FROM migrations WHERE id = '001_create_users_table';
.exit

# Re-run migrations
npm run db:migrate
```

### Reset Database (DANGER!)

To completely reset and start over:
```bash
# Destroy database
turso db destroy testmanship-web-v2 --yes

# Recreate it
turso db create testmanship-web-v2

# Get new URL and token
turso db show testmanship-web-v2 --url
turso db tokens create testmanship-web-v2

# Update .env.local with new values

# Run migrations
npm run db:migrate
```

## Production Deployment

### Create Production Database

```bash
# Create production database
turso db create testmanship-web-v2-prod

# Get production URL and token
turso db show testmanship-web-v2-prod --url
turso db tokens create testmanship-web-v2-prod
```

### Deploy to Vercel

```bash
# Add environment variables to Vercel
vercel env add TURSO_DATABASE_URL production
# Paste your production database URL

vercel env add TURSO_AUTH_TOKEN production
# Paste your production auth token

# Deploy
vercel deploy --prod
```

### Run Production Migrations

You can run migrations manually after deployment:

```bash
# Set production env vars temporarily
export TURSO_DATABASE_URL=libsql://testmanship-web-v2-prod-...
export TURSO_AUTH_TOKEN=eyJhbGc...

# Run migrations
npm run db:migrate
```

Or create a GitHub Action to run migrations automatically on deploy.

## Resources

- [Turso Documentation](https://docs.turso.tech/)
- [LibSQL Client Docs](https://github.com/tursodatabase/libsql-client-ts)
- [Turso CLI Reference](https://docs.turso.tech/reference/turso-cli)
- [Pricing & Limits](https://turso.tech/pricing)

## Support

If you run into issues:
1. Check the [Turso Discord](https://discord.gg/turso)
2. Review `turso/README.md` for detailed documentation
3. Check migration logs in your terminal

---

## Summary

You should now have:
- ✅ Turso CLI installed
- ✅ Database created
- ✅ Environment variables configured
- ✅ All 12 tables migrated
- ✅ Ready to start using Turso in your app

Next: Update your service layer (`lib/services/*`) to use Turso instead of Firestore!
