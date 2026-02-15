# Turso Database Migration Checklist

## Prerequisites

### 1. Turso Account Setup
- [ ] Created Turso account at https://turso.tech
- [ ] Installed Turso CLI: `brew install tursodatabase/tap/turso` (Mac) or `curl -sSfL https://get.tur.so/install.sh | bash` (Linux)
- [ ] Logged in: `turso auth login`

### 2. Create Database

```bash
# Create new database
turso db create deutschcraft

# Get database URL
turso db show deutschcraft --url
# Example output: libsql://deutschcraft-yourorg.turso.io

# Create authentication token
turso db tokens create deutschcraft
# Example output: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

### 3. Update Environment Variables

Edit `.env.local`:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://deutschcraft-yourorg.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

# Switch to Turso
DATABASE_PROVIDER=turso
```

**Note:** Keep your auth token secret! Never commit `.env.local` to git.

## Migration Files

These files will be executed in order:

### Existing Migrations (1-13)
- [x] `001_create_users_table.sql` - User accounts
- [x] `002_create_batches_table.sql` - Course batches
- [x] `003_create_vocabulary_table.sql` - Vocabulary database
- [x] `004_create_flashcards_table.sql` - Flashcard data
- [x] `005_create_flashcard_progress_table.sql` - Study progress
- [x] `006_create_progress_table.sql` - Daily progress
- [x] `007_create_tasks_table.sql` - Writing tasks
- [x] `008_create_submissions_table.sql` - Task submissions
- [x] `009_create_writing_exercises_table.sql` - Writing exercises
- [x] `010_create_writing_submissions_table.sql` - Writing submissions
- [x] `011_create_writing_progress_table.sql` - Writing progress tracking
- [x] `012_create_sessions_table.sql` - User sessions
- [x] `013_create_config_table.sql` - App configuration

### New Social Media Migrations (14-20)
- [x] `014_create_social_posts_table.sql` - Social media posts
- [x] `015_create_social_media_table.sql` - Media files (base64)
- [x] `016_create_social_comments_table.sql` - Comments with threading
- [x] `017_create_social_suggestions_table.sql` - Grammar corrections
- [x] `018_create_social_likes_table.sql` - Like tracking
- [x] `019_create_social_shares_table.sql` - Share tracking
- [x] `020_create_social_polls_table.sql` - Polls and voting

### Additional Migrations (21-40)
- [x] `021_create_writing_review_quizzes_table.sql` - Writing review quizzes
- [x] `022_create_student_answers_table.sql` - Student answers
- [x] `023_create_exercise_overrides_table.sql` - Exercise overrides
- [x] `024_create_saved_vocabulary_table.sql` - Saved vocabulary
- [x] `025_create_mini_exercise_tables.sql` - Mini exercises
- [x] `026_create_activities_table.sql` - User activities
- [x] `027_create_exercise_progress_table.sql` - Exercise progress
- [x] `028_create_grammar_rules_table.sql` - Grammar rules
- [x] `029_create_grammar_sentences_table.sql` - Grammar sentences
- [x] `030_create_grammar_reviews_table.sql` - Grammar reviews
- [x] `031_create_writing_stats_table.sql` - Writing statistics
- [x] `032_add_exercise_title_to_writing_submissions.sql` - Add exercise title
- [x] `033_add_ai_corrected_version_to_writing_submissions.sql` - Add AI corrections
- [x] `034_add_teacher_corrected_version_to_writing_submissions.sql` - Add teacher corrections
- [x] `035_create_teacher_reviews_table.sql` - Teacher reviews
- [x] `036_remove_fk_from_social_comments.sql` - Remove FK from comments
- [x] `037_add_gantt_permissions_to_users.sql` - Gantt permissions
- [x] `038_migrate_pricing_data.sql` - Migrate pricing data
- [x] `039_update_pricing_data.sql` - Update pricing data
- [x] `040_add_dashboard_settings_to_users.sql` - Add dashboard settings

## Run Migrations

### Method 1: Automated (Recommended)

```bash
# Run all pending migrations
npx tsx turso/migrate.ts
```

**Expected Output:**
```
🚀 Starting Turso DB migrations...

✓ Migrations table ready
📊 Found 13 executed migrations
📂 Found 20 migration files

⏳ Running 7 pending migrations...

▶ Running migration: 014_create_social_posts_table.sql
✓ Completed: 014_create_social_posts_table.sql

▶ Running migration: 015_create_social_media_table.sql
✓ Completed: 015_create_social_media_table.sql

▶ Running migration: 016_create_social_comments_table.sql
✓ Completed: 016_create_social_comments_table.sql

▶ Running migration: 017_create_social_suggestions_table.sql
✓ Completed: 017_create_social_suggestions_table.sql

▶ Running migration: 018_create_social_likes_table.sql
✓ Completed: 018_create_social_likes_table.sql

▶ Running migration: 019_create_social_shares_table.sql
✓ Completed: 019_create_social_shares_table.sql

▶ Running migration: 020_create_social_polls_table.sql
✓ Completed: 020_create_social_polls_table.sql

✅ All migrations completed successfully!
```

### Method 2: Manual (For Debugging)

```bash
# Run individual migration
turso db shell deutschcraft < turso/migrations/014_create_social_posts_table.sql

# Check tables
turso db shell deutschcraft
> .tables
> .schema social_posts
> .quit
```

## Verification

### 1. Check Tables Created

```bash
turso db shell deutschcraft
```

```sql
-- List all tables
.tables

-- Expected output should include:
-- social_posts
-- social_media
-- social_comments
-- social_suggestions
-- social_likes
-- social_shares
-- social_polls
-- social_poll_votes
```

### 2. Check Table Schema

```sql
-- Check posts table
.schema social_posts

-- Check media table
.schema social_media

-- Check indexes
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='social_posts';
```

### 3. Test Insert

```sql
-- Insert test post
INSERT INTO social_posts (
  post_id, user_id, user_email, content, cefr_level,
  visibility, likes_count, comments_count, suggestions_count,
  shares_count, is_edited, has_accepted_suggestion,
  created_at, updated_at
) VALUES (
  'test_post_1',
  'test@example.com',
  'test@example.com',
  'Dies ist ein Testbeitrag',
  'A2',
  'public',
  0, 0, 0, 0, 0, 0,
  1234567890000,
  1234567890000
);

-- Verify insert
SELECT * FROM social_posts WHERE post_id = 'test_post_1';

-- Clean up
DELETE FROM social_posts WHERE post_id = 'test_post_1';
```

## Troubleshooting

### Error: "TURSO_DATABASE_URL environment variable is required"

**Solution:** Check `.env.local` file exists and contains correct values.

```bash
# Verify environment variables are loaded
node -e "require('dotenv').config({ path: '.env.local' }); console.log(process.env.TURSO_DATABASE_URL)"
```

### Error: "Authentication token is invalid"

**Solution:** Regenerate token:

```bash
turso db tokens create deutschcraft
# Copy new token to .env.local
```

### Error: "table already exists"

**Solution:** This is normal if migrations were already run. The migration script tracks completed migrations in the `migrations` table.

```sql
-- Check migration history
SELECT * FROM migrations ORDER BY executed_at DESC;
```

### Error: "Cannot find module '@libsql/client'"

**Solution:** Install dependencies:

```bash
npm install @libsql/client
```

### Migration Fails Midway

**Solution:** Check which migrations succeeded:

```sql
-- View completed migrations
SELECT * FROM migrations;

-- Manually run remaining migrations
-- The script will skip already-executed ones
npx tsx turso/migrate.ts
```

## Rollback (If Needed)

To rollback social media migrations:

```sql
-- WARNING: This deletes all social media data!

DROP TABLE IF EXISTS social_poll_votes;
DROP TABLE IF EXISTS social_polls;
DROP TABLE IF EXISTS social_shares;
DROP TABLE IF EXISTS social_likes;
DROP TABLE IF EXISTS social_suggestions;
DROP TABLE IF EXISTS social_comments;
DROP TABLE IF EXISTS social_media;
DROP TABLE IF EXISTS social_posts;

-- Remove from migration tracking
DELETE FROM migrations WHERE id LIKE '014_%';
DELETE FROM migrations WHERE id LIKE '015_%';
DELETE FROM migrations WHERE id LIKE '016_%';
DELETE FROM migrations WHERE id LIKE '017_%';
DELETE FROM migrations WHERE id LIKE '018_%';
DELETE FROM migrations WHERE id LIKE '019_%';
DELETE FROM migrations WHERE id LIKE '020_%';
```

Then run migrations again:

```bash
npx tsx turso/migrate.ts
```

## Post-Migration Checklist

- [ ] All 7 new tables created
- [ ] Indexes created (check with `.schema social_posts`)
- [ ] Foreign key constraints working
- [ ] Test insert/select/delete works
- [ ] Migration tracking table updated
- [ ] No error messages in migration output

## Testing the Implementation

After migrations:

1. **Test Post Creation:**
   ```typescript
   import { createPost } from '@/lib/services/turso';
   const postId = await createPost({ /* ... */ });
   ```

2. **Test Media Upload:**
   ```typescript
   import { uploadMedia } from '@/lib/services/turso';
   const mediaId = await uploadMedia(postId, userId, file);
   ```

3. **Test Retrieval:**
   ```typescript
   import { getPosts, getPostMediaUrls } from '@/lib/services/turso';
   const posts = await getPosts({}, 10, 0);
   const urls = await getPostMediaUrls(posts[0].postId);
   ```

## Database Monitoring

### Check Database Size

```bash
turso db show deutschcraft
```

Output shows:
- Database size
- Number of rows
- Regions
- Last accessed

### View Recent Queries (Pro Plan)

```bash
turso db shell deutschcraft
```

```sql
-- Get table sizes
SELECT
  name,
  (SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND tbl_name=name) as indexes,
  (SELECT COUNT(*) FROM name) as rows
FROM sqlite_master
WHERE type='table'
ORDER BY name;
```

## Backup

### Manual Backup

```bash
# Export database to file
turso db shell deutschcraft .dump > backup.sql

# Restore from backup
turso db shell deutschcraft < backup.sql
```

### Automated Backups

Turso Pro provides:
- Point-in-time recovery
- Automatic daily backups
- 30-day retention

## Support Resources

- **Turso Docs:** https://docs.turso.tech
- **Discord:** https://discord.gg/turso
- **GitHub:** https://github.com/tursodatabase/libsql

## Success Criteria

Migration is successful when:

✅ All 7 social media tables created
✅ All indexes created
✅ Foreign keys working
✅ Test insert/select works
✅ Migration script completes without errors
✅ Services can connect to database
✅ Frontend can create/fetch posts

**Congratulations! Your database is ready for social media features! 🎉**
