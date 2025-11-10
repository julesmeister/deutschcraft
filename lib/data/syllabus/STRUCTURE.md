# Syllabus Vocabulary File Structure

## ✅ New Modular Structure (Current)

```
lib/data/syllabus/
├── README.md                    # Documentation on how to add vocabulary
├── STRUCTURE.md                 # This file
├── QUICKSTART.md                # Quick guide for adding vocabulary
│
├── a1/                          # A1 Level (16 categories, 133 words)
│   ├── adjectives.json          # 15 words: groß, klein, neu, alt...
│   ├── animals.json             # 10 words: Hund, Katze, Vogel...
│   ├── basic-verbs.json         # 10 words: sein, haben, machen...
│   ├── clothing.json            # 5 words: Hose, Hemd, Kleid...
│   ├── colors.json              # 6 words: rot, blau, grün...
│   ├── countries.json           # 12 words: Deutschland, Österreich...
│   ├── family.json              # 7 words: Mutter, Vater, Bruder...
│   ├── food-drinks.json         # 8 words: Brot, Wasser, Kaffee...
│   ├── greetings.json           # 8 words: Hallo, Guten Tag...
│   ├── home.json                # 7 words: Haus, Zimmer, Küche...
│   ├── numbers.json             # 12 words: eins, zwei, drei...
│   ├── pronouns.json            # 7 words: ich, du, er, sie...
│   ├── question-words.json      # 10 words: wer, was, wo, wann...
│   ├── time.json                # 9 words: Montag, heute, morgen...
│   ├── transportation.json      # 3 words: Auto, Bus, Zug
│   └── weather.json             # 4 words: Sonne, Regen, kalt...
│
├── a2/                          # A2 Level (13 categories, 63 words)
│   ├── body-health.json         # 5 words: Kopf, Arm, Bein...
│   ├── common-verbs.json        # 7 words: nehmen, geben, bringen...
│   ├── education.json           # 5 words: Schule, lernen, Buch...
│   ├── feelings.json            # 4 words: glücklich, traurig, müde...
│   ├── hobbies.json             # 6 words: Sport, Musik, lesen...
│   ├── modal-verbs.json         # 4 words: können, müssen, wollen...
│   ├── nature.json              # 4 words: Baum, Blume, Park...
│   ├── professions.json         # 5 words: Arzt, Lehrer, Student...
│   ├── shopping.json            # 6 words: kaufen, bezahlen, Euro...
│   ├── technology.json          # 4 words: Computer, Handy, Internet...
│   ├── time-expressions.json    # 4 words: gestern, oft, manchmal...
│   ├── travel.json              # 5 words: Urlaub, Flughafen, Hotel...
│   └── workplace.json           # 4 words: Büro, Firma, Arbeit...
│
├── b1/                          # B1 Level (0 categories, 0 words)
│   └── (empty - add your own!)
│
├── b2/                          # B2 Level (0 categories, 0 words)
│   └── (empty - add your own!)
│
├── c1/                          # C1 Level (2 categories, 20 words)
│   ├── abstract-concepts.json   # 10 words: Nachhaltigkeit, Bewusstsein...
│   └── formal-language.json     # 10 words: diesbezüglich, infolgedessen...
│
└── c2/                          # C2 Level (1 category, 8 words)
    └── literary-language.json   # 8 words: Sehnsucht, Weltschmerz...
```

## ❌ Old Monolithic Structure (Deprecated)

```
lib/data/
└── syllabus-vocabulary.json     # Single file with ALL vocabulary
    ├── A1: [86 words]           # Hard to maintain
    └── A2: [63 words]           # Hard to expand
```

## Benefits of New Structure

### 1. Easy to Add New Vocabulary
```bash
# Just create a new file!
echo '[
  {"german": "Banane", "english": "banana"},
  {"german": "Orange", "english": "orange"}
]' > lib/data/syllabus/a1/fruits.json

npx tsx scripts/parse-remnote.ts
```

### 2. Easy to Collaborate
- Multiple people can work on different categories simultaneously
- No merge conflicts when adding to different categories
- Clear ownership: one category per file

### 3. Easy to Review
```bash
# See what changed in a specific category
git diff lib/data/syllabus/a1/animals.json
```

### 4. Easy to Maintain
- Find vocabulary: Just open the relevant file
- Fix typos: Edit a single small file
- Remove category: Delete one file

### 5. Automatic Category Detection
The parser automatically:
- Reads all `.json` files in `a1/` and `a2/` folders
- Converts filename to category name:
  - `food-drinks.json` → "Food Drinks"
  - `question-words.json` → "Question Words"
  - `body-health.json` → "Body Health"

## Quick Reference: Adding Vocabulary

### Add to Existing Category
```bash
# Edit the file directly
code lib/data/syllabus/a1/animals.json

# Add your word
{"german": "Ziege", "english": "goat"}

# Re-run parser
npx tsx scripts/parse-remnote.ts
```

### Create New Category
```bash
# Create new file (use kebab-case)
code lib/data/syllabus/a1/fruits.json

# Add vocabulary
[
  {"german": "Banane", "english": "banana"},
  {"german": "Orange", "english": "orange"}
]

# Parser will auto-detect it!
npx tsx scripts/parse-remnote.ts
```

### View Current Statistics
```bash
# Check what was loaded
npx tsx scripts/parse-remnote.ts

# Output shows:
# 📁 Loaded 15 words from Adjectives
# 📁 Loaded 10 words from Animals
# 📁 Loaded 10 words from Basic Verbs
# ...
```

## Migration Notes

The old `syllabus-vocabulary.json` file still exists but is **no longer used** by the parser.

To verify the migration:
1. ✅ Run parser: `npx tsx scripts/parse-remnote.ts`
2. ✅ Check output: Should show "📁 Loaded X words from Y"
3. ✅ Verify totals: A1 = 133, A2 = 63
4. ✅ Test in browser: Categories should display correctly

You can safely delete `syllabus-vocabulary.json` after confirming everything works.

## Parser Output Files

After running the parser, vocabulary is compiled into:

```
lib/data/remnote/
├── all-flashcards.json          # All 1168 flashcards
├── stats.json                   # Statistics summary
├── levels/
│   ├── a1.json                  # 137 cards (syllabus + some RemNote)
│   ├── a2.json                  # 65 cards
│   ├── b1.json                  # 709 cards (RemNote vocabulary)
│   ├── b2.json                  # 253 cards
│   ├── c1.json                  # 4 cards
│   └── c2.json                  # 0 cards
└── [36 category files]          # One per category
```

These files are **auto-generated** - don't edit them directly!

Always edit the source files in `syllabus/a1/` or `syllabus/a2/`.
