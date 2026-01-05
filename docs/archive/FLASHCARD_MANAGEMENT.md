# Flashcard Management Guide

Quick reference for managing the German flashcard database.

## 📊 Current Stats

| Level | Total Cards | Categories | Largest File Size |
|-------|-------------|------------|-------------------|
| A1    | 445         | 25         | ~7,500 lines      |
| A2    | 466         | 23         | ~8,000 lines      |
| B1    | 1,086       | 19         | ~19,000 lines     |
| B2    | 680         | 13         | ~12,000 lines     |
| C1    | 124         | 8          | ~2,100 lines      |
| C2    | 65          | 4          | ~1,000 lines      |
| **Total** | **2,866** | **92** | **~50,000 lines** |

## 🚀 Quick Start

### Split files for easier editing
```bash
# Split a specific level
npm run flashcards:split a1
npm run flashcards:split b1

# Split all levels
npm run flashcards:split all
```

### Merge files back after editing
```bash
# Merge a specific level (creates backup automatically)
npm run flashcards:merge a1

# Merge without backup
npm run flashcards:merge b1 -- --no-backup

# Merge all levels
npm run flashcards:merge all
```

## 📁 File Organization

### Main Database Files
Location: `lib/data/remnote/levels/`
- `a1.json` - Beginner level (445 cards)
- `a2.json` - Elementary level (466 cards)
- `b1.json` - Intermediate level (1,086 cards) ⚠️ Large file
- `b2.json` - Upper intermediate level (680 cards)
- `c1.json` - Advanced level (124 cards)
- `c2.json` - Mastery level (65 cards)

### Split Files
Location: `lib/data/remnote/split/[level]/`

Each level directory contains:
- `_index.json` - Quick reference index
- `[category].json` - Individual category files

Example for A1:
```
split/a1/
├── _index.json
├── body-parts.json (20 cards)
├── verbs.json (85 cards)
├── adjectives.json (50 cards)
└── ... (25 categories total)
```

## ✏️ Editing Workflow

### Option 1: Direct Edit (Small Changes)
For quick edits to a few cards:

1. Edit the main file: `lib/data/remnote/levels/a1.json`
2. Commit changes
3. Done!

### Option 2: Split & Edit (Recommended for Large Changes)
For adding many cards or reorganizing categories:

1. **Split the level**
   ```bash
   npm run flashcards:split b1
   ```

2. **Edit category files**
   Navigate to `lib/data/remnote/split/b1/`
   Edit specific category files (e.g., `body-parts.json`)

3. **Merge back**
   ```bash
   npm run flashcards:merge b1
   ```

4. **Commit changes**
   ```bash
   git add lib/data/remnote/levels/b1.json
   git commit -m "Update B1 body parts vocabulary"
   ```

## 📋 Category List

### A1 Categories (25)
Adjectives, Animals, Body Parts, Clothing, Colors, Countries, Family, Food Drinks, Fruits, Greetings, Home, Irregular Verbs, Modal Verbs, Numbers, Positional Verbs, Pronouns, Question Words, Reflexive Verbs, Regular Verbs, State Change Verbs, Time, Transportation, Understanding Verbs, Vegetables, Weather

### A2 Categories (23)
Action Verbs, Adjectives, Body Health, Body Parts, Communication Verbs, Education, Feelings, Hobbies, Irregular Verbs, Modal Verbs, Nature, Past Tense Verbs, Perception Verbs, Professions, Redemittel, Reflexive Verbs, Restaurant, Separable Verbs, Shopping, Technology, Time Expressions, Travel, Workplace

### B1 Categories (19)
Adjective Pairs, Adjectives, Adverbs, Body Parts, Business Work, Conjunctions, Da/Wo-Wörter, Daily Routines, Housing, Intermediate Verbs (358 cards!), Irregular Verbs, Medical Health, Positional Verbs, Redemittel, Reflexive Verbs, Richtung, Separable Verbs (165 cards!), State Change Verbs, Verbs With Prepositions

### B2 Categories (13)
Academic, Adjectives, Adverbs, Body Parts, Emotions Character, Environment Climate, Idioms, Intermediate Verbs, Politics Society, Redemittel, Reflexive Verbs, Separable Verbs, Verbs With Prepositions

### C1 Categories (8)
Abstract Concepts, Body Parts, Economics Finance, Formal Language, Legal Administrative, Professional Communication, Redemittel, Reflexive Verbs

### C2 Categories (4)
Body Parts, Literary Language, Philosophical Concepts, Reflexive Verbs

## 🔍 Finding Specific Content

### View index for a level
```bash
# Check what categories exist in B1
cat lib/data/remnote/split/b1/_index.json
```

### Search for a word
```bash
# Find all occurrences of "Körper"
grep -r "Körper" lib/data/remnote/split/
```

### Count cards in a category
```bash
# Count body parts in A1
cat lib/data/remnote/split/a1/body-parts.json | grep '"id":' | wc -l
```

## ⚠️ Common Issues

### Merge produces different card count
- Check for duplicate cards across category files
- Ensure all JSON files are valid
- Review backup files: `lib/data/remnote/levels/*.backup-*.json`

### Lost backup files
- Backups are timestamped: `a1.backup-[timestamp].json`
- Manually delete old backups to clean up
- Keep the most recent backup before committing

### Changes not showing up
- Make sure you ran the merge command after editing split files
- Check that you edited files in `split/` directory, not `levels/` directory
- Verify the merged file timestamp is recent

## 📈 Recent Additions

### Body Parts (115 cards added across all levels)
- **A1**: 20 basic body parts (der Körper, der Kopf, die Hand...)
- **A2**: 15 extended body parts (die Brust, der Ellbogen...)
- **B1**: 30 detailed anatomy (das Herz, die Lunge, der Muskel...)
- **B2**: 20 medical terms (die Schilddrüse, die Arterie...)
- **C1**: 15 specialized anatomy (der Hypothalamus, das Kleinhirn...)
- **C2**: 15 highly specialized (der Hippocampus, die Amygdala...)

### Reflexive Verbs (250+ cards across all levels)
- Systematic coverage from A1 (sich freuen) to C2 (sich vermessen)
- Organized by complexity and usage frequency

## 🛠️ Advanced Scripts

For more details on the split/merge scripts, see `scripts/README.md`

### Script features:
- ✅ Automatic backups before merging
- ✅ JSON validation
- ✅ Alphabetical sorting by category
- ✅ Card count verification
- ✅ Index file generation

## 📝 Best Practices

1. **Always split before major edits**
   - Easier to manage individual categories
   - Better version control (smaller diffs)
   - Reduces risk of JSON syntax errors

2. **Always merge before committing**
   - Main level files are the source of truth
   - Keep split files in sync with main files

3. **Keep backups enabled**
   - Only use `--no-backup` for testing
   - Manually clean up old backups periodically

4. **Test after merging**
   - Verify card count matches expectations
   - Check for duplicate IDs
   - Ensure proper JSON formatting

5. **Use descriptive commit messages**
   ```bash
   git commit -m "Add 30 body parts to B1 level (internal organs)"
   ```

## 🎯 Next Steps

Ideas for improving the flashcard system:

- [ ] Add duplicate ID detection script
- [ ] Create statistics/analytics script
- [ ] Build category migration tool
- [ ] Add automated testing for JSON validity
- [ ] Create web UI for flashcard editing
- [ ] Add import/export for Anki format
- [ ] Generate printable flashcard PDFs
