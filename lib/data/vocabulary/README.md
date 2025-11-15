# German Vocabulary Database

This directory contains the German vocabulary flashcards organized by CEFR level (A1-C2).

## Directory Structure

```
vocabulary/
├── levels/              # Main flashcard data files (production)
│   ├── a1.json         # A1 level flashcards (445 cards)
│   ├── a2.json         # A2 level flashcards (466 cards)
│   ├── b1.json         # B1 level flashcards (1,086 cards)
│   ├── b2.json         # B2 level flashcards (680 cards)
│   ├── c1.json         # C1 level flashcards (124 cards)
│   └── c2.json         # C2 level flashcards (65 cards)
├── split/              # Category-based files (development)
│   ├── a1/
│   │   ├── _index.json
│   │   ├── body-parts.json
│   │   ├── verbs.json
│   │   └── ... (25 categories)
│   ├── a2/ ... b1/ ... b2/ ... c1/ ... c2/
│   └── ...
├── stats.json          # Vocabulary statistics
└── README.md           # This file
```

## Usage

### Reading Flashcards

The application reads from `levels/*.json` files:

```typescript
import a1Data from '@/lib/data/vocabulary/levels/a1.json';
import a2Data from '@/lib/data/vocabulary/levels/a2.json';
// ...
```

### Editing Flashcards

For easier editing, use the split files:

1. **Split**: `npm run flashcards:split [level|all]`
2. **Edit**: Modify files in `split/[level]/` directory
3. **Merge**: `npm run flashcards:merge [level|all]`

See `FLASHCARD_MANAGEMENT.md` in project root for details.

## Statistics

- **Total Flashcards**: 2,866
- **Total Categories**: 92
- **CEFR Levels**: 6 (A1, A2, B1, B2, C1, C2)

## File Format

Each flashcard JSON file contains:

```json
{
  "level": "A1",
  "totalCards": 445,
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

## Maintenance

- Use `split-flashcards.ts` script to organize data
- Use `merge-flashcards.ts` script to consolidate changes
- See `scripts/README.md` for detailed documentation
