# Documentation Index

Welcome to the DeutschCraft Web V2 documentation. All documentation has been organized into logical categories for easy navigation.

---

## 📚 Essential Reading

### For All Users
- **[Getting Started Guide](./guides/GETTING_STARTED.md)** - Setup instructions for developers, teachers, and students
- **[Database Setup](./guides/DATABASE_SETUP.md)** - Turso and Firestore configuration

### For Developers
- **[Flashcards System](./guides/FLASHCARDS_SYSTEM.md)** - Complete flashcard system documentation
- **[Cache Invalidation](./technical/CACHE_INVALIDATION.md)** - Multi-layered cache strategy
- **[Architecture](./technical/COMPONENTS.md)** - Component structure and patterns

---

## 📁 Documentation Structure

```
docs/
├── README.md (this file)
├── guides/                           # User-facing guides
│   ├── DATABASE_SETUP.md             # Dual-database setup (Turso + Firestore)
│   ├── FLASHCARDS_SYSTEM.md          # Flashcard system & SRS algorithm
│   ├── GETTING_STARTED.md            # Quick start for all users
│   ├── ROLE_BASED_FEATURES.md        # Student vs Teacher features
│   ├── STUDENT.md                    # Student-specific features
│   ├── MULTIPLE-ATTEMPTS.md          # Exercise attempt tracking
│   ├── SOUND.md                      # Audio/pronunciation features
│   ├── WRITING-STATUS.md             # Writing exercise status
│   ├── WRITING-UPDATES.md            # Writing system updates
│   ├── writing.md                    # Writing system overview
│   └── WRITINGS_REFACTORING_SUMMARY.md  # Writing code refactoring
├── technical/                        # Technical documentation
│   ├── CACHE_INVALIDATION.md         # 6-layer cache invalidation system
│   ├── COMPONENTS.md                 # Component architecture
│   ├── MODEL_GUIDE.md                # Data models & TypeScript types
│   ├── PAGINATION-PATTERN.md         # Pagination implementation
│   └── PIKU_COLORS.md                # Design system & color palette
└── archive/                          # Historical documentation
    ├── (14 migration & completion docs)
    └── (6 optimization history docs)
```

---

## 🎯 Quick Navigation

### I want to...

**Set up the project locally**
→ Read [Getting Started Guide](./guides/GETTING_STARTED.md)

**Understand the database architecture**
→ Read [Database Setup](./guides/DATABASE_SETUP.md)

**Learn about flashcards & SRS**
→ Read [Flashcards System](./guides/FLASHCARDS_SYSTEM.md)

**Fix cache invalidation issues**
→ Read [Cache Invalidation](./technical/CACHE_INVALIDATION.md)

**Understand component structure**
→ Read [Components](./technical/COMPONENTS.md)

**Add new flashcards**
→ Read [Flashcards System - Vocabulary Management](./guides/FLASHCARDS_SYSTEM.md#vocabulary-management)

**Deploy to production**
→ Read [Getting Started - Production Deployment](./guides/GETTING_STARTED.md#production-deployment)

**Understand data models**
→ Read [Model Guide](./technical/MODEL_GUIDE.md)

**Learn about the design system**
→ Read [PIKU Colors](./technical/PIKU_COLORS.md)

---

## 🔍 What's in the Archive?

The `archive/` folder contains historical documentation from completed migrations and refactorings:

**Database Migration History:**
- DATABASE_MIGRATION_GUIDE.md
- DATABASE_REFACTOR_PLAN.md
- TURSO_MIGRATION_STATUS.md
- SUMMARY_DATABASE_ABSTRACTION.md
- etc.

**Flashcard Migration History:**
- FLASHCARDS_MIGRATION.txt
- VOCABULARY_CLEANUP_COMPLETE.md
- VOCABULARY_MIGRATION_GUIDE.md

**Optimization History:**
- OPTIMIZATION_PLAN.md
- OPTIMIZATION_SUMMARY.md
- OPTIMIZATION-SESSION-SUMMARY.md
- REACT-OPTIMIZATIONS.md
- SETTINGS_REFACTORING_SUMMARY.md

**Completion Status:**
- IMPLEMENTATION_SUMMARY.md
- INTEGRATION-COMPLETE.md
- REFACTOR_COMPLETE.md
- TEACHER-DASHBOARD-COMPLETE.md

These are preserved for historical reference but are not needed for day-to-day development.

---

## 📝 Documentation Standards

### File Naming
- **Guides**: `UPPERCASE_WITH_UNDERSCORES.md`
- **Location**: `docs/guides/` for user-facing, `docs/technical/` for dev-focused
- **Archive**: Old/completed docs go to `docs/archive/`

### Document Structure
All guides should include:
1. **Title & Overview** - What this doc covers
2. **Table of contents** - For long docs (optional)
3. **Step-by-step instructions** - Clear, numbered steps
4. **Code examples** - With syntax highlighting
5. **Troubleshooting section** - Common issues & fixes
6. **Related documentation links** - Cross-references

### Markdown Conventions
- Use `**bold**` for emphasis
- Use `code blocks` for file paths, commands, and code
- Use ✅ ❌ for do/don't lists
- Use tables for structured data
- Use collapsible sections for long content (optional)

---

## 🆕 Recently Added

- **[Cache Invalidation Guide](./technical/CACHE_INVALIDATION.md)** - Complete 6-layer cache system (2024-01-05)
- **[Flashcards System](./guides/FLASHCARDS_SYSTEM.md)** - Consolidated flashcard documentation (2024-01-05)
- **[Database Setup](./guides/DATABASE_SETUP.md)** - Consolidated database guides (2024-01-05)
- **[Getting Started](./guides/GETTING_STARTED.md)** - Unified onboarding guide (2024-01-05)

---

## 🤝 Contributing to Documentation

### Adding New Documentation

1. **Determine category**: Is it a guide or technical doc?
2. **Create in appropriate folder**:
   - User-facing → `docs/guides/`
   - Developer-focused → `docs/technical/`
3. **Follow naming conventions** (see above)
4. **Update this README** with link to new doc

### Updating Existing Documentation

1. **Edit the relevant file**
2. **Add "Last Updated" date** at the bottom
3. **Update "Recently Added" section** in this README (if major change)

### Archiving Documentation

When a guide becomes outdated due to refactoring:
1. **Move to** `docs/archive/`
2. **Remove from** this README index
3. **Update references** in other docs

---

## 📞 Need Help?

- **Can't find what you need?** Check the archive folder
- **Documentation unclear?** Open an issue with the `documentation` label
- **Want to contribute?** PRs welcome!
- **Technical questions?** Check [CLAUDE.md](../CLAUDE.md) for project instructions

---

**Last Updated**: 2024-01-05
**Total Docs**: 15 active docs, 20+ archived docs
