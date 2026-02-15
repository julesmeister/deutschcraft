# Database Setup Guide

Complete guide for setting up and understanding the dual-database architecture (Turso + Firestore).

---

## Architecture Overview

**DeutschCraft Web V2 uses a dual-database system:**

1. **Turso (Primary)** - Edge-hosted SQLite for performance-critical data
   - Flashcard progress & SRS data
   - Study statistics & daily progress
   - Vocabulary metadata
   - **Why**: Low latency, edge distribution, SQL querying power

2. **Firestore (Auth & Relations)** - Firebase for user management
   - User accounts & authentication
   - Teacher-student relationships
   - Batch assignments
   - Writing submissions
   - **Why**: Built-in auth, real-time updates, easy Firebase integration

---

## Turso Setup (5 minutes)

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
turso db create deutschcraft

# Get the database URL (copy this!)
turso db show deutschcraft --url
# Output: libsql://deutschcraft-your-org.turso.io
```

### 4. Generate Auth Token

```bash
# Create an auth token (copy this!)
turso db tokens create deutschcraft
# Output: eyJhbGc...your-long-token-here
```

### 5. Set Environment Variables

Create `.env.local`:
```bash
TURSO_DATABASE_URL="libsql://deutschcraft-your-org.turso.io"
TURSO_AUTH_TOKEN="eyJhbGc...your-long-token-here"
```

### 6. Run Migrations

```bash
npm run turso:migrate
```

**Verify:**
```bash
turso db shell deutschcraft
> SELECT COUNT(*) FROM flashcard_progress;
```

---

## Firestore Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "DeutschCraft Web V2"
3. Enable Firestore Database (production mode)
4. Enable Authentication → Google Sign-In

### 2. Get Firebase Config

1. Project Settings → General
2. Scroll to "Your apps" → Web app
3. Copy config object

### 3. Set Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

### 4. Firestore Security Rules

Deploy these rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Students collection
    match /students/{studentId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.userId
                   || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }

    // Teachers collection
    match /teachers/{teacherId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## Database Abstraction Layer

All database operations go through service files:

### Turso Services (`lib/services/turso/`)

```
lib/services/turso/
├── flashcards/
│   ├── progressRead.ts         # Basic queries
│   ├── progressReadAdvanced.ts # Complex queries
│   ├── progressWrite.ts        # Mutations
│   ├── progressMappers.ts      # Row mapping
│   └── vocabulary.ts           # Vocabulary sync
└── client.ts                   # Turso client setup
```

**Example Usage:**
```typescript
import { getFlashcardProgress, saveFlashcardProgress } from '@/lib/services/turso/flashcards';

// Read
const progress = await getFlashcardProgress(userId);

// Write
await saveFlashcardProgress(userId, flashcardId, {
  masteryLevel: 3,
  nextReviewDate: Date.now() + 86400000,
});
```

### Firestore Services (`lib/services/firebase/`)

```
lib/services/firebase/
├── users.ts            # User CRUD
├── students.ts         # Student operations
├── teachers.ts         # Teacher operations
└── writings.ts         # Writing submissions
```

**Example Usage:**
```typescript
import { getStudent, updateStudent } from '@/lib/services/firebase/students';

const student = await getStudent(studentId);
await updateStudent(studentId, { currentLevel: 'B1' });
```

---

## Data Flow

### Flashcard Practice Session

```
User reviews flashcard
  ↓
useFlashcardSession.ts calls saveReview()
  ↓
lib/services/turso/flashcards/progressWrite.ts
  ↓
Turso DB: INSERT INTO flashcard_progress
  ↓
React Query cache invalidation
  ↓
UI updates with new due counts
```

### User Authentication

```
User logs in with Google
  ↓
Firebase Auth creates session
  ↓
useFirebaseAuth.ts provides session
  ↓
Check if user exists in Firestore
  ↓
Create/update user document
  ↓
Load user role (student/teacher)
```

---

## Firestore Caching Best Practices

### React Query Cache Times

| Data Type | Cache Duration | Reason |
|-----------|---------------|---------|
| User data | 5 minutes | Frequently accessed, rarely changes |
| Student/Teacher profiles | 10 minutes | Mostly static |
| Vocabulary words | 24 hours | Static data |
| Study progress | 30 seconds | Frequently updated |
| Dashboard stats | 1 minute | Real-time feel |

### Query Optimization

**✅ DO:**
- Paginate with `limit(20)` + `startAfter()`
- Use `where()` to filter server-side
- Cache static data for long periods
- Use batch reads for multiple documents

**❌ DON'T:**
- Fetch entire collections without limits
- Re-fetch on every component mount
- Use real-time listeners for static data

---

## Troubleshooting

### Turso Connection Issues

**Error: "Failed to connect to Turso"**
```bash
# Verify credentials
echo $TURSO_DATABASE_URL
echo $TURSO_AUTH_TOKEN

# Test connection
turso db shell deutschcraft
```

**Error: "Table does not exist"**
```bash
# Run migrations
npm run turso:migrate
```

### Firestore Permission Denied

**Check security rules:**
1. Go to Firestore console
2. Rules tab
3. Ensure rules match above template
4. Publish changes

### Missing Environment Variables

**Error: "Firebase config not found"**
```bash
# Check .env.local exists and has all variables
cat .env.local | grep NEXT_PUBLIC_FIREBASE
```

---

## Migration Scripts

### From Firebase to Turso (Flashcard Progress)

```bash
npm run migrate:firestore-to-turso
```

Migrates all flashcard progress from Firestore to Turso.

### Backup Data

```bash
# Turso backup
turso db dump deutschcraft > backup.sql

# Firestore backup (via Firebase Console)
# Project Settings → Backups → Create backup
```

---

## Performance Metrics

### Expected Query Times

| Operation | Turso | Firestore |
|-----------|-------|-----------|
| Get flashcard progress | < 50ms | 100-200ms |
| Save flashcard review | < 30ms | 80-150ms |
| Get user profile | N/A | 50-100ms |
| List students (paginated) | N/A | 100-200ms |

### Cost Estimates (10,000 monthly active users)

**Turso:**
- Free tier covers up to 1B row reads/month
- Estimated usage: ~50M reads/month
- **Cost: $0/month**

**Firestore:**
- Document reads: ~500K/month
- Document writes: ~100K/month
- **Cost: ~$2-5/month**

---

## Related Documentation

- [Flashcards System](./FLASHCARDS_SYSTEM.md) - SRS algorithm & flashcard management
- [Architecture](../technical/ARCHITECTURE.md) - Overall system architecture
- [Cache Invalidation](../technical/CACHE_INVALIDATION.md) - React Query cache strategy
