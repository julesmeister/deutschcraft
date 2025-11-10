# Syllabus Vocabulary Structure

This directory contains beginner-level German vocabulary organized by CEFR level and category.

## Directory Structure

```
syllabus/
├── a1/                    # A1 Level (Beginner)
│   ├── greetings.json
│   ├── pronouns.json
│   ├── basic-verbs.json
│   ├── family.json
│   ├── numbers.json
│   ├── colors.json
│   ├── food-drinks.json
│   ├── home.json
│   ├── clothing.json
│   ├── time.json
│   ├── weather.json
│   ├── transportation.json
│   ├── animals.json
│   ├── adjectives.json
│   ├── question-words.json
│   └── countries.json
│
├── a2/                    # A2 Level (Elementary)
│   ├── professions.json
│   ├── workplace.json
│   ├── travel.json
│   ├── body-health.json
│   ├── hobbies.json
│   ├── technology.json
│   ├── shopping.json
│   ├── time-expressions.json
│   ├── education.json
│   ├── nature.json
│   ├── feelings.json
│   ├── modal-verbs.json
│   └── common-verbs.json
│
└── README.md              # This file
```

## File Format

Each category file follows this JSON structure:

```json
[
  {"german": "Hund", "english": "dog"},
  {"german": "Katze", "english": "cat"},
  {"german": "Vogel", "english": "bird"}
]
```

### Optional Fields (Future)

You can add these optional fields for enhanced features:

```json
[
  {
    "german": "sein",
    "english": "to be",
    "examples": [
      {
        "german": "Ich bin Student.",
        "english": "I am a student."
      }
    ],
    "audioUrl": "/audio/a1/sein.mp3",
    "phonetic": "zaɪn"
  }
]
```

## How to Add New Vocabulary

### Option 1: Add to Existing Category

1. Navigate to the appropriate level folder (`a1/` or `a2/`)
2. Open the relevant category file (e.g., `animals.json`)
3. Add your new word to the array:
   ```json
   {"german": "Ziege", "english": "goat"}
   ```
4. Save the file
5. Run the parser: `npx tsx scripts/parse-remnote.ts`

### Option 2: Create New Category

1. Create a new file in the appropriate level folder
2. Use kebab-case naming (e.g., `body-parts.json`, `daily-routines.json`)
3. Add your vocabulary in the standard format
4. The parser will automatically detect and process the new category

### Example: Adding "Fruits" Category to A1

**File**: `lib/data/syllabus/a1/fruits.json`

```json
[
  {"german": "Apfel", "english": "apple"},
  {"german": "Banane", "english": "banana"},
  {"german": "Orange", "english": "orange"},
  {"german": "Erdbeere", "english": "strawberry"},
  {"german": "Traube", "english": "grape"},
  {"german": "Birne", "english": "pear"}
]
```

Then run:
```bash
npx tsx scripts/parse-remnote.ts
```

The parser will:
1. Read all JSON files in `syllabus/a1/` and `syllabus/a2/`
2. Convert filenames to category names ("fruits.json" → "Fruits")
3. Merge with RemNote vocabulary
4. Generate level-specific files in `lib/data/remnote/levels/`

## Category Naming Conventions

- **Filename**: kebab-case (lowercase with hyphens)
  - `question-words.json`
  - `body-health.json`
  - `time-expressions.json`

- **Category Display Name**: Auto-generated from filename
  - `question-words.json` → "Question Words"
  - `body-health.json` → "Body Health"
  - `time-expressions.json` → "Time Expressions"

## Current Statistics

### A1 (133 words across 16 categories)
- Greetings: 8
- Pronouns: 7
- Basic Verbs: 10
- Family: 7
- Numbers: 12
- Colors: 6
- Food & Drinks: 8
- Home: 7
- Clothing: 5
- Time: 9
- Weather: 4
- Transportation: 3
- Animals: 10
- Adjectives: 15
- Question Words: 10
- Countries: 12

### A2 (63 words across 13 categories)
- Professions: 5
- Workplace: 4
- Travel: 5
- Body & Health: 5
- Hobbies: 6
- Technology: 4
- Shopping: 6
- Time Expressions: 4
- Education: 5
- Nature: 4
- Feelings: 4
- Modal Verbs: 4
- Common Verbs: 7

## Suggested New Categories

### A1 Expansions
- [ ] **Body Parts** (5-8 words): Auge, Ohr, Nase, Mund, Haar
- [ ] **Fruits** (6-8 words): Banane, Orange, Erdbeere, Traube, Birne
- [ ] **Vegetables** (6-8 words): Kartoffel, Tomate, Gurke, Salat, Karotte
- [ ] **School Supplies** (5-7 words): Stift, Heft, Buch, Tasche, Papier
- [ ] **Prepositions** (8-10 words): in, auf, unter, über, vor, hinter, neben, zwischen

### A2 Expansions
- [ ] **Restaurant** (8-10 words): Speisekarte, Rechnung, Kellner, bestellen, schmecken
- [ ] **City & Directions** (8-10 words): Straße, Platz, Kirche, Bank, links, rechts
- [ ] **Household Items** (8-10 words): Teller, Tasse, Glas, Messer, Gabel, Löffel
- [ ] **Past Tense Verbs** (5-8 words): war, hatte, ging, kam, machte
- [ ] **Daily Routines** (8-10 words): aufstehen, duschen, frühstücken, arbeiten

## Testing Your Changes

After adding vocabulary:

1. **Run the parser**:
   ```bash
   npx tsx scripts/parse-remnote.ts
   ```

2. **Check the output**:
   - Look for "✅ Added X A1 syllabus cards"
   - Verify your new category appears in the category list

3. **View in app**:
   - Navigate to http://localhost:3001/dashboard/student/flashcards
   - Select the appropriate CEFR level (A1/A2)
   - Your new category should appear with the correct card count

4. **Test flashcard practice**:
   - Click on your new category
   - Verify all words display correctly
   - Check German → English translations

## Best Practices

1. **Keep categories focused**: 5-15 words per category is ideal
2. **Use consistent formatting**: Always include both "german" and "english" keys
3. **Verify spelling**: Double-check German spelling and articles (der/die/das)
4. **Consider difficulty**: Make sure vocabulary matches the CEFR level
5. **Add examples gradually**: Start with core vocabulary, add examples later

## Future Enhancements

- [ ] Add audio pronunciation files
- [ ] Include IPA phonetic notation
- [ ] Add example sentences for top 100 words
- [ ] Include noun gender and plural forms
- [ ] Add verb conjugation hints
- [ ] Include synonyms and antonyms
