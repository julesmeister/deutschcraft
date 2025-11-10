# Quick Start: Adding German Vocabulary

## Current Structure

```
syllabus/
├── a1/  (16 files, 133 words)
└── a2/  (13 files, 63 words)
```

## Add Vocabulary in 3 Steps

### Example: Adding "Fruits" to A1

**Step 1: Create the file**
```bash
code lib/data/syllabus/a1/fruits.json
```

**Step 2: Add vocabulary**
```json
[
  {"german": "Banane", "english": "banana"},
  {"german": "Orange", "english": "orange"},
  {"german": "Erdbeere", "english": "strawberry"},
  {"german": "Traube", "english": "grape"},
  {"german": "Birne", "english": "pear"},
  {"german": "Kirsche", "english": "cherry"}
]
```

**Step 3: Run the parser**
```bash
npx tsx scripts/parse-remnote.ts
```

Done! Your new category will appear in the flashcard app automatically.

## Add to Existing Category

Want to add more animals? Just edit the existing file:

```bash
code lib/data/syllabus/a1/animals.json
```

Add your word to the array:
```json
[
  {"german": "Hund", "english": "dog"},
  {"german": "Katze", "english": "cat"},
  {"german": "Ziege", "english": "goat"},  ← NEW
  ...
]
```

Run parser:
```bash
npx tsx scripts/parse-remnote.ts
```

## File Naming Rules

✅ **Good Names** (kebab-case):
- `fruits.json`
- `body-parts.json`
- `daily-routines.json`
- `restaurant-vocabulary.json`

❌ **Bad Names**:
- `Fruits.json` (capital letter)
- `body_parts.json` (underscore)
- `body parts.json` (space)

The filename becomes the category name:
- `fruits.json` → "Fruits"
- `body-parts.json` → "Body Parts"
- `daily-routines.json` → "Daily Routines"

## All Current Categories

### A1 (16 categories)
- adjectives.json
- animals.json
- basic-verbs.json
- clothing.json
- colors.json
- countries.json
- family.json
- food-drinks.json
- greetings.json
- home.json
- numbers.json
- pronouns.json
- question-words.json
- time.json
- transportation.json
- weather.json

### A2 (13 categories)
- body-health.json
- common-verbs.json
- education.json
- feelings.json
- hobbies.json
- modal-verbs.json
- nature.json
- professions.json
- shopping.json
- technology.json
- time-expressions.json
- travel.json
- workplace.json

## Suggested Next Categories

### For A1:
- [ ] fruits.json (6-8 words)
- [ ] vegetables.json (6-8 words)
- [ ] body-parts.json (5-8 words)
- [ ] school-supplies.json (5-7 words)
- [ ] prepositions.json (8-10 words)

### For A2:
- [ ] restaurant.json (8-10 words)
- [ ] city-directions.json (8-10 words)
- [ ] household-items.json (8-10 words)
- [ ] past-tense-verbs.json (5-8 words)
- [ ] daily-routines.json (8-10 words)

## Testing Your Changes

After running the parser, test in the browser:

1. Navigate to: http://localhost:3001/dashboard/student/flashcards
2. Select A1 or A2 level
3. Your new category should appear in the grid
4. Click it to practice the flashcards

## Common Issues

**Q: My category isn't showing up**
- Make sure the file is in the correct folder (a1/ or a2/)
- Check that the file ends with `.json`
- Verify the JSON syntax is correct (use a JSON validator)
- Re-run the parser: `npx tsx scripts/parse-remnote.ts`

**Q: Category name looks weird**
- Filename: `food-drinks.json` → Category: "Food Drinks" ✅
- Filename: `Food-Drinks.json` → Category: "Food Drinks" ✅
- Filename: `food_drinks.json` → Category: "Food_drinks" ❌

**Q: How do I delete a category?**
- Delete the JSON file
- Re-run the parser
- The category will be removed from the app

**Q: Can I add example sentences?**
- Yes! Just add an `examples` field (optional):
```json
{
  "german": "sein",
  "english": "to be",
  "examples": [
    {
      "german": "Ich bin Student.",
      "english": "I am a student."
    }
  ]
}
```
