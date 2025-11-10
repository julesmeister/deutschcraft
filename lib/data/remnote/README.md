# RemNote German Vocabulary Flashcards

Converted flashcard data from RemNote German vocabulary export.

## 📊 Overview

- **Total Flashcards:** 972
- **Categories:** 7
- **Source:** `remnote-german/German.md`
- **Generated:** 2025-11-10

## 📂 Files

```
lib/data/remnote/
├── all-flashcards.json       # All 972 flashcards in one file
├── verbs.json                 # 608 verb flashcards
├── adverbs.json               # 218 adverb flashcards
├── redemittel.json            # 59 common phrases
├── da-wo-wörter.json          # 39 da/wo compound words
├── liste-der-verben-mit-präpositionen.json  # 25 verbs with prepositions
├── richtung.json              # 12 directional words
├── gempowerment.json          # 11 empowerment phrases
├── stats.json                 # Statistics and metadata
└── README.md                  # This file
```

## 📋 Category Breakdown

| Category | Count | Description |
|----------|-------|-------------|
| **Verbs** | 608 | German verbs with conjugations and examples |
| **Adverbs** | 218 | Adverbs (degree, time, manner, location) |
| **Redemittel** | 59 | Common phrases and expressions |
| **Da / Wo-Wörter** | 39 | Compound words with da- and wo- |
| **Liste der Verben mit Präpositionen** | 25 | Verbs that require specific prepositions |
| **Richtung** | 12 | Directional and positional words |
| **Gempowerment** | 11 | Empowerment and motivational phrases |

## 📖 Flashcard Structure

Each flashcard has the following structure:

```json
{
  "id": "remnote-1",
  "german": "gleich/direkt hinter",
  "english": "right behind",
  "category": "Richtung",
  "tags": ["optional", "tags"],
  "examples": ["Optional example sentences"],
  "_meta": {
    "source": "RemNote German.md",
    "lineNumber": 2,
    "hierarchy": ["Richtung", "gleich/direkt hinter"]
  }
}
```

## 🔧 Usage

### Import All Flashcards

```typescript
import flashcards from '@/lib/data/remnote/all-flashcards.json';

console.log(`Total flashcards: ${flashcards.length}`);
// Output: Total flashcards: 972
```

### Import by Category

```typescript
import verbs from '@/lib/data/remnote/verbs.json';
import adverbs from '@/lib/data/remnote/adverbs.json';

console.log(`Verbs: ${verbs.length}`);      // 608
console.log(`Adverbs: ${adverbs.length}`);  // 218
```

### Filter by Category

```typescript
import flashcards from '@/lib/data/remnote/all-flashcards.json';

const verbs = flashcards.filter(card => card.category === 'Verbs');
const adverbs = flashcards.filter(card => card.category === 'Adverbs');
```

## 🎯 Integration with Flashcard App

### Convert to Firestore Format

To import into your flashcard system, you'll need to:

1. **Assign CEFR Levels** - Determine difficulty level (A1-C2)
2. **Map to Categories** - Map to your vocabulary category system
3. **Extract Metadata** - Parse example sentences, tags, etc.

### Example Conversion Script

```typescript
import remnoteData from '@/lib/data/remnote/all-flashcards.json';
import { VocabularyWord } from '@/lib/models';

function convertToVocabularyWord(remnoteCard: any): VocabularyWord {
  return {
    wordId: remnoteCard.id.replace('remnote-', 'vocab-'),
    word: remnoteCard.german,
    translation: remnoteCard.english,
    level: determineLevel(remnoteCard),  // Custom logic
    tags: mapToCategories(remnoteCard),  // Map to your categories
    partOfSpeech: determinePartOfSpeech(remnoteCard.category),
    exampleSentence: remnoteCard.examples?.[0],
    // ... other fields
  };
}

function determineLevel(card: any): CEFRLevel {
  // Logic to determine CEFR level based on word complexity
  // Could use word frequency lists, difficulty scores, etc.
  return CEFRLevel.B1;  // Example
}

function mapToCategories(card: any): string[] {
  const categoryMap: Record<string, string[]> = {
    'Verbs': ['common-verbs', 'daily-activities'],
    'Adverbs': ['adjectives-basic'],
    'Richtung': ['directions-locations'],
    // ... more mappings
  };
  return categoryMap[card.category] || [];
}
```

## 📈 Statistics

### Most Common Categories

1. **Verbs** - 608 cards (62.6%)
2. **Adverbs** - 218 cards (22.4%)
3. **Redemittel** - 59 cards (6.1%)
4. **Da / Wo-Wörter** - 39 cards (4.0%)
5. **Other** - 48 cards (4.9%)

### Content Breakdown

- **Verb Flashcards:** Includes conjugations, examples, and usage
- **Adverbs:** Categorized by type (degree, time, manner, etc.)
- **Phrases:** Common German expressions and idioms
- **Compound Words:** Da- and wo- combinations

## 🔄 Regenerating Data

To re-parse the RemNote export:

```bash
npm run parse-remnote
# or
npx tsx scripts/parse-remnote.ts
```

This will regenerate all JSON files from the source markdown.

## 📝 Data Quality Notes

### What Was Filtered Out

The parser automatically excludes:
- Portal markers (`--------------------- Portal ---------------------`)
- Infinite recursion warnings
- Template syntax (`{{variable}}`)
- Internal aliases and metadata

### What's Included

- ✅ German-English flashcard pairs
- ✅ Example sentences (when available)
- ✅ Category hierarchy
- ✅ Source metadata (line numbers, hierarchy path)

### Known Limitations

1. **No CEFR Levels** - Original data doesn't include difficulty levels
2. **No Grammar Info** - Gender, plurals not consistently marked
3. **Category Granularity** - Only 7 broad categories from source

## 🚀 Next Steps

To fully integrate with the flashcard system:

1. **Manual CEFR Tagging** - Assign difficulty levels to each word
2. **Category Mapping** - Map RemNote categories to your 110 categories
3. **Enrich Metadata** - Add part of speech, gender, plurals
4. **Quality Check** - Review and correct translations
5. **Import to Firestore** - Bulk upload to `vocabulary` collection

## 📚 Related Documentation

- [Vocabulary Categories](../categories/README.md)
- [Flashcard System Models](../../../lib/models/progress.ts)
- [Syllabusdata](../syllabusData.ts)

---

**Generated:** 2025-11-10
**Source:** RemNote German.md (4655 lines)
**Parser:** `scripts/parse-remnote.ts`
