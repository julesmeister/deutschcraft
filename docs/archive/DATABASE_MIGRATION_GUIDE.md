# Database Migration Guide

## Overview

This guide explains how to use the database migration feature to transfer data between Firestore and Turso databases.

## Features

The Database Migration tool in Settings provides three options:

1. **Export from Firestore** - Download all data as a JSON file
2. **Import to Turso** - Upload a JSON file to populate Turso
3. **Direct Migration** - One-click migration from Firestore to Turso

## Accessing the Migration Tool

1. Log in as a **Teacher** (only teachers can access this feature)
2. Navigate to **Settings** → **Database** tab
3. Choose your migration option

## Migration Options

### Option 1: Export from Firestore

**What it does:**
- Exports all data from Firestore collections to a JSON file
- Collections included: users, batches, tasks, submissions, progress, vocabulary, flashcards, flashcard-progress

**How to use:**
1. Click "Export Data" button
2. Wait for the export to complete
3. A JSON file will be automatically downloaded to your computer
4. The file is named: `firestore-export-{timestamp}.json`

### Option 2: Import to Turso

**What it does:**
- Reads a JSON file (exported from Firestore)
- Imports all data into Turso database
- Uses `INSERT OR REPLACE` to avoid duplicates

**How to use:**
1. Click "Select File to Import"
2. Choose a previously exported JSON file
3. Wait for the import to complete
4. Check the migration statistics to verify

### Option 3: Direct Migration

**What it does:**
- Directly copies data from Firestore to Turso
- No intermediate file needed
- Fastest option for live migration

**How to use:**
1. Click "Migrate Now" button
2. Confirm the action in the popup dialog
3. Wait for migration to complete (may take several minutes)
4. Check migration statistics

## Collections Migrated

The following Firestore collections are included in migration:

| Collection | Turso Table | Description |
|------------|-------------|-------------|
| `users` | `users` | Student and teacher accounts |
| `batches` | `batches` | Student batch information |
| `tasks` | `tasks` | Writing assignments |
| `submissions` | `submissions` | Student task submissions |
| `progress` | `progress` | Daily study progress |
| `vocabulary` | `vocabulary` | German vocabulary words |
| `flashcards` | `flashcards` | Flashcard questions |
| `flashcard-progress` | `flashcard_progress` | SRS progress tracking |

## Environment Variables

Make sure these are set in your `.env.local` file:

```bash
# Turso Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# Firebase Admin (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
```

## API Endpoints

### POST /api/database/export
Exports all Firestore data to JSON

**Authentication:** Required (Teacher only)

**Response:**
```json
{
  "exportedAt": 1234567890,
  "exportedBy": "teacher@example.com",
  "version": "1.0",
  "collections": {
    "users": [...],
    "batches": [...]
  },
  "stats": {
    "users": 50,
    "batches": 5,
    "total": 500
  }
}
```

### POST /api/database/import
Imports JSON data to Turso

**Authentication:** Required (Teacher only)

**Request Body:**
```json
{
  "collections": {
    "users": [...],
    "batches": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "users": 50,
    "batches": 5,
    "total": 500
  }
}
```

### POST /api/database/migrate
Direct migration from Firestore to Turso

**Authentication:** Required (Teacher only)

**Response:**
```json
{
  "success": true,
  "stats": {
    "users": 50,
    "batches": 5,
    "total": 500
  }
}
```

## Security

- Only users with `role: 'TEACHER'` can perform migrations
- All endpoints require authentication via NextAuth
- Firestore and Turso credentials are server-side only
- No data is exposed to client-side code

## Troubleshooting

### Error: "Only teachers can export data"
**Solution:** Make sure your user account has `role: 'TEACHER'` in Firestore

### Error: "URL_INVALID: The URL is not in a valid format"
**Solution:** Check your `TURSO_DATABASE_URL` in `.env.local`

### Error: "Failed to export data"
**Solution:**
- Check Firebase Admin credentials
- Verify Firestore permissions
- Check server logs for details

### Migration takes too long
**Solution:**
- Large datasets (>10,000 records) may take 5-10 minutes
- Don't close the browser during migration
- Check server logs for progress

## Testing the Migration

1. **Export a small dataset:**
   ```bash
   # In Firestore, create a test batch with a few users
   # Export via Settings → Database → Export
   ```

2. **Inspect the JSON:**
   ```bash
   # Open the downloaded JSON file
   # Verify collections and data structure
   ```

3. **Import to Turso:**
   ```bash
   # First, reset Turso (optional):
   npm run db:migrate

   # Then import via Settings → Database → Import
   ```

4. **Verify data:**
   ```bash
   npm run db:shell
   SELECT COUNT(*) FROM users;
   SELECT * FROM users LIMIT 5;
   ```

## Files Created

- `components/ui/settings/DatabaseMigrationTab.tsx` - UI component
- `app/api/database/export/route.ts` - Export endpoint
- `app/api/database/import/route.ts` - Import endpoint
- `app/api/database/migrate/route.ts` - Direct migration endpoint
- `DATABASE_MIGRATION_GUIDE.md` - This documentation

## Next Steps

After successful migration:

1. Update application code to use Turso services instead of Firestore
2. Test all features with migrated data
3. Keep Firestore as backup during transition period
4. Monitor performance and adjust as needed
