# Vocabulary Management Guide

This document explains how to manage and expand the German vocabulary database for Testmanship Web v2.

## Overview

The vocabulary database is organized by CEFR levels (A1-C2) and split into topic-based categories:

```
lib/data/vocabulary/split/
├── a1/
│   ├── basic-verbs.json
│   ├── family.json
│   ├── food-drinks.json
│   └── ...
├── a2/
│   ├── common-verbs.json
│   ├── technology.json
│   └── ...
└── ...
```

## Current Statistics (After Cleanup)

| Level | Word Count | Status |
|-------|-----------|---------|
| **A1** | 730 words | ✅ Good coverage |
| **A2** | 969 words | ✅ Good coverage |
| **B1** | 1,052 words | ✅ Excellent coverage |
| **B2** | 454 words | ⚠️ Could use expansion |
| **C1** | 103 words | ⚠️ Needs expansion |
| **C2** | 63 words | ⚠️ Needs expansion |

**Total:** 3,371 unique words (970 duplicates removed)

## Available Scripts

### 1. Analyze Vocabulary Database

```bash
npm run vocab:analyze
```

**What it does:**
- Shows total word counts by level
- Identifies duplicate words across levels
- Detects potential missing articles (der/die/das)
- Provides overall statistics

**Example output:**
```
📊 ANALYSIS REPORT
   Total flashcards: 3371
   Unique words: 3371
   Duplicate occurrences: 0 ✅
```

### 2. Remove Duplicates

```bash
npm run vocab:fix-duplicates
```

**What it does:**
- Finds words that appear in multiple levels
- Keeps the word in the LOWEST level only
- Removes duplicates from higher levels
- Updates JSON files automatically

**Example:**
- "nehmen" was in A1 (basic-verbs), A2 (common-verbs), and B1
- Script keeps it in A1 only
- Removes from A2 and B1

**Result:** ✅ Removed 970 duplicate entries

### 3. Check Missing Articles

```bash
npm run vocab:missing-articles
```

**What it does:**
- Scans noun categories for words without articles
- Reports words that should have der/die/das
- Provides suggestions for fixes

**Note:** Currently reports 79 potential issues, but most are adjectives that don't need articles (false positives).

### 4. Expansion Suggestions

```bash
npm run vocab:expand
```

**What it does:**
- Shows coverage report by level and category
- Suggests common words to add
- Checks which suggestions already exist
- Provides actionable next steps

**Example output:**
```
📘 A1 Level - Recommended Additions:
   ✓ das Buch (book)          [Already exists]
   ➕ das Geld (money)         [Should add]
```

**Total suggestions:** 115 words (43 new additions recommended)

## How to Add New Vocabulary

### Step 1: Choose the Right Level

Follow CEFR guidelines:
- **A1:** Basic everyday words (greetings, numbers, family)
- **A2:** Common topics (work, hobbies, shopping)
- **B1:** More abstract concepts (opinions, experiences)
- **B2:** Academic and professional language
- **C1:** Formal and specialized vocabulary
- **C2:** Literary and sophisticated expressions

### Step 2: Choose the Right Category

Navigate to the appropriate level folder and pick a category file:
- Use existing categories when possible
- Create new category files if needed

### Step 3: Add Words with Proper Format

**For Nouns (MUST include articles):**
```json
{
  "id": "unique-id-001",
  "german": "das Geld",
  "english": "money",
  "category": "Basic Nouns",
  "level": "A1",
  "tags": ["noun", "A1"],
  "_meta": {
    "source": "Manual Addition",
    "lineNumber": 0,
    "hierarchy": ["A1", "Basic Nouns", "Geld"]
  }
}
```

**For Verbs (NO articles):**
```json
{
  "id": "unique-id-002",
  "german": "putzen",
  "english": "to clean",
  "category": "Daily Verbs",
  "level": "A1",
  "tags": ["verb", "A1"],
  "_meta": {
    "source": "Manual Addition",
    "lineNumber": 0,
    "hierarchy": ["A1", "Daily Verbs", "putzen"]
  }
}
```

**For Adjectives (NO articles):**
```json
{
  "id": "unique-id-003",
  "german": "freundlich",
  "english": "friendly",
  "category": "Adjectives",
  "level": "A2",
  "tags": ["adjective", "A2"],
  "_meta": {
    "source": "Manual Addition",
    "lineNumber": 0,
    "hierarchy": ["A2", "Adjectives", "freundlich"]
  }
}
```

### Step 4: Update totalCards Count

After adding flashcards, update the `totalCards` field at the top of the file:

```json
{
  "level": "A1",
  "category": "Basic Nouns",
  "totalCards": 25,  // ← Update this
  "flashcards": [...]
}
```

### Step 5: Verify Changes

```bash
npm run vocab:analyze
```

Check that:
- ✅ No duplicates created
- ✅ Articles included for nouns
- ✅ Word count increased

## Priority Additions Needed

### B2 Level (Currently 454 words → Target 500+)

**Add to B2:**
- die Perspektive (perspective)
- der Aspekt (aspect)
- der Kontext (context)
- die Bevölkerung (population)
- die Globalisierung (globalization)

### C1 Level (Currently 103 words → Target 200+)

**Add to C1:**
- bezüglich (regarding)
- angesichts (in view of)
- mittels (by means of)
- infolge (as a result of)
- die Vereinbarung (agreement)
- die Zuständigkeit (responsibility)
- die Vorgehensweise (procedure)

### C2 Level (Currently 63 words → Target 100+)

**Add to C2:**
- die Ambiguität (ambiguity)
- die Metapher (metaphor)
- die Nuance (nuance)
- die Subtilität (subtlety)
- die Eloquenz (eloquence)
- das Paradoxon (paradox)
- auf der Hand liegen (to be obvious)
- ins Gewicht fallen (to carry weight)

## Best Practices

### ✅ DO:
- **Always include articles** (der/die/das) for nouns
- Keep words at the **lowest appropriate level**
- Use **existing categories** when possible
- Run `vocab:analyze` after changes
- Add words that are **commonly used** at that level
- Include **useful tags** for filtering

### ❌ DON'T:
- Don't duplicate words across levels
- Don't omit articles for nouns
- Don't add overly specialized vocabulary to basic levels
- Don't forget to update `totalCards`
- Don't add English-only or slang terms without German equivalents

## Troubleshooting

### Problem: "Duplicate words found"

**Solution:**
```bash
npm run vocab:fix-duplicates
```

This automatically removes duplicates from higher levels.

### Problem: "Words missing articles"

**Solution:**
1. Run `npm run vocab:missing-articles` to see full list
2. Manually add der/die/das to nouns
3. Ignore false positives (adjectives, verbs)

### Problem: "Not sure which level to add a word to"

**Solution:**
Check these resources:
- [Goethe Institut CEFR Guidelines](https://www.goethe.de/en/spr/kup/prf.html)
- [Common German Words by Level](https://www.germanveryeasy.com/)
- Or run `npm run vocab:expand` for suggestions

## Quick Reference

```bash
# Full workflow for adding vocabulary
npm run vocab:analyze              # Check current state
# (manually add words to JSON files)
npm run vocab:analyze              # Verify no duplicates
npm run vocab:fix-duplicates       # Clean up if needed
npm run vocab:expand               # See what else to add
```

## Files Modified by Scripts

### Safe (Read-only)
- `vocab:analyze` - No changes
- `vocab:missing-articles` - No changes
- `vocab:expand` - No changes

### Modifies Files
- `vocab:fix-duplicates` - ⚠️ **Writes to JSON files** (removes duplicates)

**Always commit your changes before running `vocab:fix-duplicates`!**

## Contributing

When adding significant vocabulary:
1. Run analysis before changes
2. Add words following the format above
3. Run analysis after changes
4. Commit with descriptive message:
   ```bash
   git add lib/data/vocabulary/split/
   git commit -m "Add 25 B2 academic vocabulary words"
   ```

## Summary

✅ **Completed:**
- Removed 970 duplicate words across levels
- Created automated analysis tools
- Identified 43 high-priority additions
- Organized 3,371 unique words across 97 files

🔄 **Next Steps:**
1. Add suggested B2, C1, C2 vocabulary
2. Review "missing articles" for genuine cases
3. Expand specialized categories (idioms, formal language)
4. Consider adding example sentences in future

---

For questions or issues, check the scripts in `/scripts/vocab-*.ts`
