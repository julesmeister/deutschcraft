# Flashcard Management Scripts

This directory contains utility scripts for managing the German flashcard database.

## Available Scripts

### 1. Split Flashcards (`split-flashcards.ts`)

Splits large flashcard JSON files into smaller, category-based files for better organization and maintainability.

**Why split?**
- Large files (1000+ lines) are hard to maintain
- Category-based organization makes it easier to add/edit specific content
- Better version control (smaller diffs, easier to review)
- Multiple people can work on different categories simultaneously

**Usage:**
```bash
# Split a specific level
npx tsx scripts/split-flashcards.ts a1
npx tsx scripts/split-flashcards.ts b1

# Split all levels
npx tsx scripts/split-flashcards.ts all
```

**Output Structure:**
```
lib/data/remnote/split/
├── a1/
│   ├── _index.json           # Index of all categories
│   ├── body-parts.json        # Body Parts category
│   ├── verbs.json             # Verbs category
│   ├── adjectives.json        # Adjectives category
│   └── ...
├── a2/
│   └── ...
└── ...
```

**Example Output:**
```
📂 Processing A1...
   Total cards: 445
   Categories: 15
   ✅ Body Parts: 20 cards → body-parts.json
   ✅ Verbs: 85 cards → verbs.json
   ✅ Adjectives: 50 cards → adjectives.json
   ...
   📋 Index created: _index.json
   ✨ Split A1 into 15 files
```

---

### 2. Merge Flashcards (`merge-flashcards.ts`)

Merges category-based files back into a single level file. Useful for rebuilding the main data files.

**When to merge?**
- After editing split files, merge them back to update the main database
- Before deploying changes to production
- To consolidate changes from multiple contributors

**Usage:**
```bash
# Merge a specific level (with automatic backup)
npx tsx scripts/merge-flashcards.ts a1

# Merge without creating backup
npx tsx scripts/merge-flashcards.ts b1 --no-backup

# Merge all levels
npx tsx scripts/merge-flashcards.ts all
```

**Features:**
- Automatically backs up existing files (unless `--no-backup` flag is used)
- Sorts flashcards by category and ID for consistency
- Validates JSON structure
- Reports total card counts

**Example Output:**
```
📂 Processing A1...
   Found 15 category files
   ✅ Body Parts: 20 cards
   ✅ Verbs: 85 cards
   ...
   📊 Total cards collected: 445
   💾 Backup created: a1.backup-1699123456789.json
   ✅ Merged file written: a1.json
   ✨ Successfully merged A1
```

---

## Workflow Recommendations

### Initial Setup (One-time)
```bash
# Split all existing files into category-based structure
npx tsx scripts/split-flashcards.ts all
```

### Daily Editing Workflow

1. **Work on split files** in `lib/data/remnote/split/[level]/`
   - Edit individual category files (easier to manage)
   - Add new cards to appropriate category files
   - Create new category files as needed

2. **Merge changes** back to main files
   ```bash
   # After editing A1 categories
   npx tsx scripts/merge-flashcards.ts a1

   # Or merge all levels at once
   npx tsx scripts/merge-flashcards.ts all
   ```

3. **Commit changes** to git
   ```bash
   git add lib/data/remnote/levels/a1.json
   git commit -m "Update A1 flashcards: Add new body parts"
   ```

### Team Collaboration

**Scenario:** Multiple people editing flashcards

1. **Person A** works on A1 Body Parts
   - Edits `lib/data/remnote/split/a1/body-parts.json`
   - Merges: `npx tsx scripts/merge-flashcards.ts a1`
   - Commits changes

2. **Person B** works on A1 Verbs (simultaneously)
   - Edits `lib/data/remnote/split/a1/verbs.json`
   - Merges: `npx tsx scripts/merge-flashcards.ts a1`
   - Commits changes

3. **Merge conflicts** are minimal because different category files were edited

---

## File Structure

### Split Files Format
Each category file contains:
```json
{
  "level": "A1",
  "category": "Body Parts",
  "totalCards": 20,
  "flashcards": [
    {
      "id": "body-a1-001",
      "german": "der Körper",
      "english": "body",
      "category": "Body Parts",
      "level": "A1",
      "tags": ["body", "basic", "A1"],
      "_meta": {
        "source": "Body Parts Expansion",
        "lineNumber": 0,
        "hierarchy": ["A1", "Body Parts", "der Körper"]
      }
    }
  ]
}
```

### Index File Format
Each level has an `_index.json` for quick reference:
```json
{
  "level": "A1",
  "totalCards": 445,
  "totalCategories": 15,
  "categories": [
    {
      "name": "Body Parts",
      "count": 20,
      "file": "body-parts.json"
    },
    {
      "name": "Verbs",
      "count": 85,
      "file": "verbs.json"
    }
  ]
}
```

---

## Best Practices

1. **Always merge before committing**
   - Split files are for development convenience
   - Main level files (`a1.json`, `b1.json`, etc.) are the source of truth
   - Always merge changes back before committing

2. **Keep backups enabled**
   - The `--no-backup` flag should only be used for testing
   - Backups are automatically timestamped and stored in the same directory

3. **Validate after merging**
   - Check that `totalCards` count matches expectations
   - Verify no duplicate IDs exist
   - Ensure JSON is properly formatted

4. **Organize by category**
   - When adding new cards, place them in the appropriate category file
   - Create new category files for new types of content
   - Keep category names consistent with existing structure

---

## Troubleshooting

### "File not found" errors
- Run `split-flashcards.ts` first to create the split structure
- Ensure you're in the project root directory

### Merge produces wrong card count
- Check for duplicate cards across category files
- Verify that category files have correct JSON structure
- Look for empty or malformed category files

### Backup files accumulating
- Backups are timestamped: `a1.backup-[timestamp].json`
- Manually delete old backups from `lib/data/remnote/levels/` when no longer needed
- Or use `--no-backup` flag (not recommended for production)

---

## Future Enhancements

Potential improvements for these scripts:

- [ ] Add validation script to check for duplicate IDs
- [ ] Create script to analyze category distribution
- [ ] Add script to migrate cards between categories
- [ ] Generate statistics report (cards per level, category breakdown)
- [ ] Auto-format German articles (der/die/das)
- [ ] Detect and fix common typos or formatting issues
- [ ] Create web UI for editing flashcards
