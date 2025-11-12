# Documentation Structure

This project uses a modular documentation system for easy navigation and maintenance.

## 📂 Documentation Files

### Core Documentation

| File | Purpose | For |
|------|---------|-----|
| **[STUDENT.md](./STUDENT.md)** | 📍 Main index and quick reference | Everyone - Start here! |
| **[FLASHCARDS.md](./FLASHCARDS.md)** | Flashcard system documentation | Developers working on vocabulary/SRS |
| **[WRITING.md](./WRITING.md)** | Writing exercises documentation | Developers working on writing features |
| **[WRITING-UPDATES.md](./WRITING-UPDATES.md)** | 📢 Recent writing system changes | See latest peer review & revision tracking features |
| **[CLAUDE.md](./CLAUDE.md)** | Project overview & design system | General development reference |

### Database & Architecture

| File | Purpose | For |
|------|---------|-----|
| **[DATABASE-ABSTRACTION-STATUS.md](./DATABASE-ABSTRACTION-STATUS.md)** | 🔍 Current abstraction audit | Developers migrating database code |
| **[DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)** | 🔄 How to switch databases | Switching from Firestore to PostgreSQL/MongoDB |
| **[PAGINATION-PATTERN.md](./PAGINATION-PATTERN.md)** | 📄 Server-side pagination guide | Implementing efficient data fetching |
| **[lib/database/README.md](./lib/database/README.md)** | 🗄️ Database abstraction layer API | Using the abstraction layer |

---

## 🎯 Quick Navigation

### I want to...

**Debug flashcard stats not updating**
→ [FLASHCARDS.md - Debugging](./FLASHCARDS.md#debugging-stats-issues)

**Understand how SRS works**
→ [FLASHCARDS.md - SuperMemo 2](./FLASHCARDS.md#supermemo-2-algorithm-quick-reference)

**Implement AI feedback for writing**
→ [WRITING.md - AI Feedback](./WRITING.md#ai-feedback-system-todo)

**See all exercise templates**
→ [WRITING.md - Exercise Types](./WRITING.md#exercise-types)

**Understand Firestore collections**
→ [STUDENT.md - Collections Overview](./STUDENT.md#firestore-collections-overview)

**Learn about the design system**
→ [CLAUDE.md - Design System](./CLAUDE.md#design-system)

**Check database abstraction status**
→ [DATABASE-ABSTRACTION-STATUS.md](./DATABASE-ABSTRACTION-STATUS.md)

**Implement server-side pagination**
→ [PAGINATION-PATTERN.md - Example Implementation](./PAGINATION-PATTERN.md#example-session-pagination)

**Switch from Firestore to PostgreSQL**
→ [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md)

---

## 📊 Documentation Map

```
STUDENT.md (Index)
├── FLASHCARDS.md
│   ├── Debugging Stats Issues
│   ├── Core Data Models
│   ├── Critical Data Flow
│   ├── Key Files
│   ├── Firestore Collections
│   ├── SuperMemo 2 Algorithm
│   └── Testing Checklist
│
├── WRITING.md
│   ├── Overview
│   ├── Core Data Models
│   ├── Critical Data Flow
│   ├── Key Files
│   ├── Firestore Collections
│   ├── Exercise Types (4 types, 19 templates)
│   ├── AI Feedback System (TODO)
│   ├── Teacher Features
│   └── Testing Checklist
│
├── CLAUDE.md
│   ├── Project Overview
│   ├── Design System (Colors, Typography, Animations)
│   ├── Data Models
│   ├── File Structure
│   ├── Tech Stack
│   └── Performance Optimizations
│
└── DATABASE & ARCHITECTURE
    ├── DATABASE-ABSTRACTION-STATUS.md
    │   ├── Architecture Layers
    │   ├── Abstraction Status by Layer
    │   ├── Missing Services (userService, studentService, etc.)
    │   ├── Migration Priority List
    │   └── Refactor Examples
    │
    ├── PAGINATION-PATTERN.md
    │   ├── Service Layer Pattern
    │   ├── Hook Layer Pattern
    │   ├── Component Integration
    │   ├── Database Migration Examples
    │   └── Best Practices
    │
    └── DATABASE_MIGRATION_GUIDE.md
        └── Switching Database Providers
```

---

## 🔄 Documentation Updates

When adding new features:

1. **Flashcard-related** → Update [FLASHCARDS.md](./FLASHCARDS.md)
2. **Writing-related** → Update [WRITING.md](./WRITING.md)
3. **Database/Architecture changes** → Update [DATABASE-ABSTRACTION-STATUS.md](./DATABASE-ABSTRACTION-STATUS.md)
4. **New major system** → Create new `{SYSTEM}.md` file, link from [STUDENT.md](./STUDENT.md)
5. **Design changes** → Update [CLAUDE.md](./CLAUDE.md)

---

## ✅ Documentation Checklist

Each system documentation should include:

- [ ] Overview section
- [ ] Core data models
- [ ] Critical data flow diagrams (text-based)
- [ ] Key files reference
- [ ] Firestore collections table
- [ ] Testing checklist
- [ ] Common issues & fixes
- [ ] Quick fix commands

---

## 🚀 Getting Started

**New developer?** Start here:

1. Read [STUDENT.md](./STUDENT.md) - Get the big picture
2. Read [CLAUDE.md](./CLAUDE.md) - Understand the project structure
3. Read [DATABASE-ABSTRACTION-STATUS.md](./DATABASE-ABSTRACTION-STATUS.md) - Understand database architecture
4. Pick your focus:
   - Flashcards → [FLASHCARDS.md](./FLASHCARDS.md)
   - Writing → [WRITING.md](./WRITING.md)
   - Database migration → [PAGINATION-PATTERN.md](./PAGINATION-PATTERN.md)

**Working on a bug?**

1. Check [STUDENT.md - Debugging](./STUDENT.md#debugging-quick-reference)
2. Check system-specific docs for common issues
3. Look for console emoji indicators (🎴, 🔵, 🟢, 📊)

---

## 📝 Version History

- **v2.1** (2025-01-12) - Added database architecture documentation section
- **v2.0** (2025-01-11) - Split documentation into modular files
- **v1.0** (2025-01-11) - Single STUDENT.md file with all docs

---

**Maintained by**: Development Team
**Last Updated**: 2025-01-12
