# Vocabulary Directory Migration Guide

## 📋 Summary

The `lib/data/remnote/` directory is messy and needs cleanup:
- **96 JSON files** in root directory (should be organized)
- **20 infinite recursion artifacts** (build errors that need deletion)
- **66 duplicate categories** (same data in multiple locations)
- **Confusing name** ("remnote" is not descriptive)

## 🎯 Migration Goals

1. ✅ Delete 20 infinite recursion artifacts
2. ✅ Delete 74 loose category files (duplicates of split/ files)
3. ✅ Rename `remnote/` → `vocabulary/` (more descriptive)
4. ✅ Update all import statements automatically
5. ✅ Keep backup for safety

## 📊 Current State (Before Migration)

```
lib/data/remnote/
├── --avoided-infinite-recursion------*.json  (20 files) ❌ Delete
├── abstract-concepts.json                    (74 files) ❌ Delete (duplicates)
├── academic.json
├── adjectives.json
├── ... (many loose files)
├── levels/                                    ✅ Keep
│   ├── a1.json
│   ├── a2.json
│   └── ...
├── split/                                     ✅ Keep
│   ├── a1/
│   ├── a2/
│   └── ...
├── stats.json                                 ✅ Keep
└── README.md                                  ✅ Keep
```

## ✨ After Migration

```
lib/data/vocabulary/          ← Renamed!
├── levels/                   ← Main data (unchanged)
│   ├── a1.json
│   ├── a2.json
│   └── ...
├── split/                    ← Category files (unchanged)
│   ├── a1/
│   ├── a2/
│   └── ...
├── stats.json                ← Kept
└── README.md                 ← Updated
```

**Clean and organized!** ✨

## 🛠️ Migration Scripts

### 1. Audit Script
**Purpose**: Analyze current state and identify issues

```bash
npm run vocab:audit
```

**Output**:
- Lists all files to be deleted
- Identifies duplicates
- Generates `vocabulary-audit-report.json`
- Shows recommendations

### 2. Migration Script (Dry Run)
**Purpose**: Preview changes without modifying anything

```bash
npm run vocab:migrate:dry-run
```

**What it does**:
- ✅ Shows what would be deleted
- ✅ Shows what would be renamed
- ✅ Shows what imports would be updated
- ❌ Makes NO actual changes

### 3. Migration Script (Real)
**Purpose**: Execute the full migration

```bash
npm run vocab:migrate
```

**What it does**:
1. Creates backup of entire `remnote/` directory
2. Deletes 20 infinite recursion artifacts
3. Deletes 74 loose category files
4. Renames `remnote/` → `vocabulary/`
5. Updates all import statements in code
6. Creates new README in vocabulary/

**Flags**:
- `--dry-run`: Preview only, no changes
- `--no-backup`: Skip backup creation (not recommended!)

## 📝 Step-by-Step Migration

### Step 1: Audit Current State
```bash
npm run vocab:audit
```

Review the output and the generated `vocabulary-audit-report.json`.

### Step 2: Preview Migration
```bash
npm run vocab:migrate:dry-run
```

Review what will be changed. Make sure you're comfortable with it.

### Step 3: Execute Migration
```bash
npm run vocab:migrate
```

**This creates a backup automatically!**

### Step 4: Test Everything
```bash
# Start dev server
npm run dev

# Visit flashcards page
# http://localhost:3000/dashboard/student/flashcards

# Test split/merge scripts
npm run flashcards:split a1
npm run flashcards:merge a1
```

### Step 5: Verify and Cleanup
If everything works:
```bash
# Delete backup (manually)
rm -rf backup-remnote-*

# Commit changes
git add .
git commit -m "Migrate remnote to vocabulary directory"
```

## 🔍 What Gets Updated Automatically

The migration script will update imports in these files:

### Files Updated
- `app/dashboard/student/flashcards/page.tsx`
- `app/dashboard/student/vocabulary/page.tsx`
- `app/dashboard/student/flashcard-review/page.tsx`
- `lib/hooks/useRemNoteCategories.ts`
- Any other file importing from `remnote/`

### Import Changes
**Before**:
```typescript
import a1Data from '@/lib/data/remnote/levels/a1.json';
import stats from '@/lib/data/remnote/stats.json';
```

**After**:
```typescript
import a1Data from '@/lib/data/vocabulary/levels/a1.json';
import stats from '@/lib/data/vocabulary/stats.json';
```

## ⚠️ Important Notes

### Safety
1. **Backup is automatic** - Script creates backup before any changes
2. **Dry-run first** - Always test with `--dry-run` before real migration
3. **Git commit** - Commit before migration so you can revert if needed

### What Gets Deleted
- **Infinite recursion files** (20 files) - These are build errors, safe to delete
- **Loose category files** (74 files) - These are duplicates of `split/` files, safe to delete
- **What's kept**: `levels/`, `split/`, `stats.json`, `README.md`

### What Doesn't Change
- ✅ All flashcard data remains identical
- ✅ split/merge scripts work exactly the same
- ✅ Application functionality unchanged
- ✅ Only directory name and imports change

## 🚨 Troubleshooting

### "Target directory already exists"
Migration was probably already run. Check if `lib/data/vocabulary/` exists.

### "Import not found" errors after migration
1. Make sure migration completed successfully
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Check that imports were updated (search for `remnote` in codebase)

### Want to undo migration
1. Stop dev server
2. Delete `lib/data/vocabulary/`
3. Restore from backup: `cp -r backup-remnote-*/ lib/data/remnote/`
4. Manually revert import changes (or restore from git)

## 📊 Before & After Comparison

| Metric | Before | After |
|--------|--------|-------|
| Total files in root | 96 | 2 (stats.json, README.md) |
| Infinite recursion artifacts | 20 | 0 |
| Loose duplicate files | 74 | 0 |
| Directory name | `remnote` | `vocabulary` |
| Import clarity | ❌ Confusing | ✅ Clear |
| Organization | ❌ Messy | ✅ Clean |

## ✅ Success Checklist

After migration, verify:

- [ ] Dev server starts without errors
- [ ] Flashcards page loads correctly
- [ ] Can view different CEFR levels
- [ ] Can practice flashcards
- [ ] Split script works: `npm run flashcards:split a1`
- [ ] Merge script works: `npm run flashcards:merge a1`
- [ ] No TypeScript errors in VS Code
- [ ] No console errors in browser

## 🎯 Expected Results

### Console Output (Dry Run)
```
======================================================================
🚀 VOCABULARY CLEANUP AND MIGRATION
======================================================================

⚠️  DRY RUN MODE - No changes will be made

🗑️  Deleting infinite recursion artifacts...
   - --avoided-infinite-recursion------anmutig.json
   - --avoided-infinite-recursion------ausfhren.json
   ... (18 more)
   ✅ Deleted 20 files

🗑️  Deleting loose category files (duplicates of split/ files)...
   - abstract-concepts.json
   - academic.json
   ... (72 more)
   ✅ Deleted 74 files

📁 Renaming directory...
   remnote/ → vocabulary/
   ⏭️  Skipped (dry run)

📝 Updating import statements...
   - app/dashboard/student/flashcards/page.tsx
   - lib/hooks/useRemNoteCategories.ts
   ✅ Updated 4 files

======================================================================
✨ MIGRATION SUMMARY
======================================================================

Deleted Files:
   Infinite recursion artifacts: 20
   Loose category files:         74
   Total deleted:                94

Directory Changes:
   Renamed: remnote/ → vocabulary/

Code Updates:
   Import statements updated:    4 files

======================================================================

⚠️  DRY RUN - No changes were made
Run without --dry-run to execute migration
```

## 📚 Related Documentation

- `FLASHCARD_MANAGEMENT.md` - How to use split/merge scripts
- `scripts/README.md` - Detailed script documentation
- `OPTIMIZATION_PLAN.md` - Overall code quality improvements

## 🤝 Need Help?

If you encounter issues:
1. Check the backup directory still exists
2. Review `vocabulary-audit-report.json`
3. Test with dry-run first
4. Restore from backup if needed
5. Commit before migration for easy reversion
