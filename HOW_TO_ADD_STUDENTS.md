# How to Add Students to Firestore

The "Add Students" dialog is showing no students because there are **no students in your Firestore database with `teacherId: null`**.

## Option 1: Run the Seed Script (Fastest)

1. Install tsx if you don't have it:
   ```bash
   npm install -D tsx
   ```

2. Run the seed script:
   ```bash
   npx tsx scripts/seed-students.ts
   ```

This will create 5 sample students:
- Anna Müller (A2)
- Max Schmidt (A1)
- Lisa Weber (B1)
- Tom Wagner (A2)
- Sarah Becker (B2)

All students will have `teacherId: null` and `batchId: null`, making them available for assignment.

## Option 2: Add Manually via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Click **Start Collection**
5. Collection ID: `users`
6. Add documents with these fields:

### Example Student Document

**Document ID:** `student1@example.com` (use email as document ID)

**Fields:**
```
userId: "student1@example.com" (string)
email: "student1@example.com" (string)
firstName: "John" (string)
lastName: "Doe" (string)
role: "STUDENT" (string) ⚠️ IMPORTANT: Must be exactly "STUDENT"
teacherId: null ⚠️ IMPORTANT: Must be null (not empty string)
batchId: null
cefrLevel: "A1" (string)
wordsLearned: 0 (number)
wordsMastered: 0 (number)
currentStreak: 0 (number)
dailyGoal: 25 (number)
createdAt: 1234567890000 (number - timestamp)
updatedAt: 1234567890000 (number - timestamp)
```

### Critical Fields for "Add Students" Dialog

For a student to appear in the "Add Students" dialog, they MUST have:

1. ✅ `role: "STUDENT"` (exact match, case-sensitive)
2. ✅ `teacherId: null` (not undefined, not empty string - must be null)
3. ✅ `batchId: null` (not assigned to any batch yet)

## Option 3: Create via Sign Up Flow

If you have a sign-up page, make sure when users register as students, the system creates a user document with:
```typescript
{
  userId: email,
  email: email,
  role: 'STUDENT',
  teacherId: null, // Not assigned to any teacher
  batchId: null,   // Not in any batch
  // ... other fields
}
```

## Verifying Students in Firestore

After adding students, verify in Firebase Console:

1. Go to Firestore Database
2. Open the `users` collection
3. Find students with:
   - `role = "STUDENT"`
   - `teacherId = null`

These students should now appear in the "Add Students" dialog!

## Troubleshooting

### Students still not showing up?

Check the browser console for these logs:
- `[useStudentsWithoutTeacher] Query complete. Documents found: X`
- If X = 0, students don't match the query criteria

### Common Issues:

1. **role is not exactly "STUDENT"** - Check for typos, wrong case
2. **teacherId is empty string instead of null** - Must be null
3. **Students are already assigned** - teacherId is not null

### Manual Firestore Query Test

In Firebase Console > Firestore, try this query:
1. Collection: `users`
2. Where: `role` `==` `STUDENT`
3. Where: `teacherId` `==` `null`

This should return your unassigned students.
