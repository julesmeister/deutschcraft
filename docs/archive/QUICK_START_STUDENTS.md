# Quick Start: Adding Students

## The Issue

The "Add Students" dialog is empty because **your Firestore database has no students with `teacherId: null`**.

The logs show:
```
[useStudentsWithoutTeacher] Query complete. Documents found: 0
```

## Quick Fix (2 steps)

### 1. Install tsx
```bash
npm install
```

### 2. Run the seed script
```bash
npm run seed:students
```

This will create 5 sample students that you can assign to batches:
- Anna Müller (A2 level)
- Max Schmidt (A1 level)
- Lisa Weber (B1 level)
- Tom Wagner (A2 level)
- Sarah Becker (B2 level)

## What the Script Does

The seed script creates documents in the `users` collection with:

```typescript
{
  userId: "email@example.com",  // Email as document ID
  email: "email@example.com",
  firstName: "Anna",
  lastName: "Müller",
  role: "STUDENT",              // ⚠️ Must be exactly "STUDENT"
  teacherId: null,              // ⚠️ Must be null (not assigned)
  batchId: null,                // ⚠️ Must be null (no batch)
  cefrLevel: "A2",
  wordsLearned: 150,
  wordsMastered: 80,
  currentStreak: 5,
  dailyGoal: 25,
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

## After Running the Script

1. Refresh your teacher dashboard
2. Click "Add Students" button
3. You should now see the 5 students available for selection
4. Select students and assign them to your batch
5. Click "Done"

## Alternative: Manual Addition

See [HOW_TO_ADD_STUDENTS.md](./HOW_TO_ADD_STUDENTS.md) for manual Firebase Console instructions.

## Troubleshooting

### Still no students showing?

1. Check Firebase Console → Firestore Database → `users` collection
2. Verify students have:
   - `role: "STUDENT"` (exact match)
   - `teacherId: null` (must be null)
   - `batchId: null` (must be null)

### Error running seed script?

Make sure your `.env.local` has Firebase config:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```
