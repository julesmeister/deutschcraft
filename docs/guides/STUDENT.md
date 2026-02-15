# Student Learning System - Documentation Index

Welcome to the DeutschCraft Web V2 student learning system documentation. This system includes two main learning modules:

---

## 📚 Documentation Files

### [FLASHCARDS.md](./FLASHCARDS.md)
Complete documentation for the flashcard/vocabulary learning system:
- Spaced Repetition System (SRS) using SuperMemo 2 algorithm
- Real-time progress tracking
- Daily stats and streaks
- Debugging and troubleshooting guide

**Quick Links:**
- [Debugging Stats Issues](./FLASHCARDS.md#debugging-stats-issues)
- [Data Flow](./FLASHCARDS.md#critical-data-flow)
- [SuperMemo 2 Algorithm](./FLASHCARDS.md#supermemo-2-algorithm-quick-reference)
- [Testing Checklist](./FLASHCARDS.md#testing-checklist)

---

### [WRITING.md](./WRITING.md)
Complete documentation for the writing exercises system:
- 4 exercise types (Creative, Translation, Email, Letters)
- **Teacher & Peer Review System** (manual feedback, not AI)
- Revision history tracking with ActivityTimeline
- Progress tracking and streaks
- Text change tracking (word/phrase edits)

**Quick Links:**
- [Exercise Types](./WRITING.md#exercise-types)
- [Review & Feedback System](./WRITING.md#review--feedback-system)
- [Review Workflow](./WRITING.md#review-workflow)
- [Teacher Features](./WRITING.md#teacher-features)
- [Testing Checklist](./WRITING.md#testing-checklist)

### [WRITING-UPDATES.md](./WRITING-UPDATES.md)
📢 **Recent changes** to the writing system:
- Teacher review system with grading
- Peer review system (student-to-student)
- Revision history with ActivityTimeline
- Text change tracking
- Complete implementation guide

---

## 🚀 Quick Start

### For Flashcards
```bash
# Start the dev server
npm run dev

# Navigate to flashcards
http://localhost:3000/dashboard/student/flashcards

# Check console for debugging (look for 🎴, 🔵, 🟢, 📊 emojis)
```

### For Writing Exercises
```bash
# Start the dev server
npm run dev

# Navigate to writing exercises
http://localhost:3000/dashboard/student/writing

# Choose an exercise type: Creative, Translation, Email, or Letters
```

---

## 📊 Firestore Collections Overview

### Flashcards
- `flashcard-progress/{userId}_{flashcardId}` - SRS data for each card
- `progress/PROG_YYYYMMDD_{email}` - Daily study stats

### Writing
- `writing-submissions/{submissionId}` - Student writing submissions
- `writing-progress/WPROG_YYYYMMDD_{email}` - Daily writing stats
- `writing-stats/{email}` - Aggregate writing statistics
- `peer-reviews/{reviewId}` - **NEW** Student peer reviews
- `teacher-reviews/{reviewId}` - **NEW** Teacher feedback and grading

### Shared
- `users/{email}` - User profile and settings
- `tasks/{taskId}` - Writing tasks assigned by teachers
- `batches/{batchId}` - Class/batch information

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm run start            # Start production server

# Flashcards
npx tsx scripts/parse-remnote.ts  # Regenerate flashcard JSON

# Database
# Open Firebase Console → Firestore Database → Browse collections
```

---

## 🐛 Debugging Quick Reference

### Flashcards Issues
See [FLASHCARDS.md - Common Issues](./FLASHCARDS.md#common-issues)

Key debug emojis in console:
- 🎴 Session flow
- 🔵 Individual saves
- 🟢 Daily progress saves
- 📊 Stats calculation

### Writing Issues
See [WRITING.md - Common Issues](./WRITING.md#common-issues--fixes)

Common problems:
- Stats show 0 → No submissions yet (normal for new users)
- Cannot submit → Check word count requirements
- No feedback → AI system not implemented yet

---

## 📖 Additional Resources

- [CLAUDE.md](./CLAUDE.md) - General project instructions and design system
- [Firebase Console](https://console.firebase.google.com) - View Firestore data
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation

---

## 🎯 System Status

### Flashcards System
✅ **Production Ready**
- SRS algorithm working
- Real-time stats updates
- Progress tracking
- Streak calculation

### Writing Exercises System
✅ **Teacher & Peer Review Ready**
- ✅ All UI components complete
- ✅ Firebase hooks implemented
- ✅ Progress tracking ready
- ✅ Teacher review system designed
- ✅ Peer review system designed
- ✅ Revision history with ActivityTimeline
- ⏳ Teacher grading UI pending
- ⏳ Peer review assignment pending

---

## 💡 Need Help?

1. **Flashcards not working?** → Check [FLASHCARDS.md](./FLASHCARDS.md)
2. **Writing exercises questions?** → Check [WRITING.md](./WRITING.md)
3. **Design system questions?** → Check [CLAUDE.md](./CLAUDE.md)
4. **General Next.js issues?** → Restart dev server: `npm run dev`

---

**Last Updated**: 2025-01-11
**Version**: 2.0 (Split documentation structure)
