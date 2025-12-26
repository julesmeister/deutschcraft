# B1.1 AB - Exercise Data

This folder contains exercise data split by lesson for easier management.

## Structure

```
b1-1-arbeitsbuch/
├── README.md          # This file
├── metadata.json      # Book metadata (level, subLevel, bookType)
├── lesson-1.json      # Lektion 1 exercises
├── lesson-2.json      # Lektion 2 exercises
├── lesson-3.json      # Lektion 3 exercises
└── ...
```

## Metadata

- **Level**: B1
- **Sub-Level**: 1
- **Book Type**: AB+KB (AB = Arbeitsbuch, KB = Kursbuch - merged from both answer keys)
- **Total Lessons**: 7
- **Total Exercises**: 209

## Lesson Files

1. **lesson-1.json** - Lektion 1 - Glück im Alltag (31 exercises)
2. **lesson-2.json** - Lektion 2 - Unterhaltung (34 exercises)
3. **lesson-3.json** - Lektion 3 - Gesund bleiben (29 exercises)
4. **lesson-4.json** - Lektion 4 - Sprachen (29 exercises)
5. **lesson-5.json** - Lektion 5 - Unterwegs (28 exercises)
6. **lesson-6.json** - Lektion 6 - Dienstleistung (29 exercises)
7. **lesson-7.json** - Lektion 7 - Rund ums Wohnen (29 exercises)

## File Format

Each lesson file contains:

```json
{
  "lessonNumber": 1,
  "title": "Lektion 1 - Glück im Alltag",
  "exercises": [
    {
      "exerciseId": "B1.1-L1-AB-A1",
      "level": "B1",
      "bookType": "AB",
      "lessonNumber": 1,
      "exerciseNumber": "A1",
      "section": "Schritt A",
      "title": "Grammar Practice",
      "answers": [
        {
          "itemNumber": "1",
          "correctAnswer": "spielte"
        }
      ],
      "difficulty": "medium"
    }
  ]
}
```

## How to Edit Exercises

### Option 1: Manual Editing
1. Open the lesson file (e.g., `lesson-1.json`)
2. Edit exercises directly in your text editor
3. Ensure JSON is valid (use a JSON validator)
4. Run `npm run exercises:merge` to combine files back

### Option 2: Interactive CLI Tool
```bash
npm run exercises:manage
```

### Option 3: Direct JSON Editing
- Use VS Code with JSON schema validation
- Format with Prettier: `npx prettier --write lesson-*.json`

## Adding Exercises

Add to the `exercises` array in the appropriate lesson file:

```json
{
  "exerciseId": "B1.1-L1-AB-NewExercise",
  "level": "B1",
  "bookType": "AB",
  "lessonNumber": 1,
  "exerciseNumber": "A5",
  "section": "Schritt A",
  "title": "New Exercise",
  "answers": [
    {
      "itemNumber": "1",
      "correctAnswer": "answer here"
    }
  ],
  "difficulty": "medium"
}
```

## Removing Exercises

1. Open the lesson file
2. Find the exercise in the `exercises` array
3. Delete the entire exercise object
4. Ensure commas are correct (no trailing comma on last item)

## Merging Back

To combine lesson files back into a single JSON:

```bash
npm run exercises:merge
```

This will:
1. Read all `lesson-*.json` files
2. Combine with metadata
3. Generate `b1-1-arbeitsbuch.json` in parent folder
4. Validate structure

## Exercise ID Format

`{level}.{subLevel}-L{lesson}-{bookType}-{exerciseNumber}`

Examples:
- `B1.1-L1-AB-A1` - Level B1.1, Lesson 1, Arbeitsbuch, Exercise A1
- `B1.1-L2-AB-Folge1-1` - Level B1.1, Lesson 2, Arbeitsbuch, Folge 1, Exercise 1

## Common Sections

- **Folge 1, Folge 2** - Story episodes (Foto-Hörgeschichte)
- **Schritt A, B, C, D, E** - Step-by-step exercises
- **Grammatik und Kommunikation** - Grammar and communication
- **Fokus Beruf** - Job/career focused
- **Zwischendurch mal …** - Interludes:
  - Projekt (Projects)
  - Hören (Listening)
  - Lesen (Reading)
  - Lied (Songs)
  - Gedicht (Poems)

## Tips

✅ **DO:**
- Keep JSON properly formatted (2-space indentation)
- Validate JSON after editing
- Run merge script after making changes
- Back up files before bulk edits

❌ **DON'T:**
- Leave trailing commas
- Mix single/double quotes (use double quotes)
- Forget to update exerciseId when changing exerciseNumber
- Edit the merged file directly (edit lesson files instead)

## Troubleshooting

**Invalid JSON error:**
- Check for missing/extra commas
- Ensure all strings use double quotes
- Validate at https://jsonlint.com

**Merge fails:**
- Ensure all lesson files exist
- Check metadata.json is valid
- Verify lesson numbers are sequential

**Missing exercises after merge:**
- Check lesson file wasn't accidentally deleted
- Verify exercises array isn't empty
- Check file permissions

## Extraction Process

This exercise data was extracted from Schritte International Neu B1.1 answer key PDFs.

### Source PDFs

1. **Arbeitsbuch (AB)**: `301086_Loesungen_AB.pdf`
2. **Kursbuch (KB)**: `301086 Loesungen_KB.190066.pdf`

### Extraction Method

**Automated Extraction (via `scripts/extract-b1-with-sections.js`):**
- Parses PDF using `pdf2json` library
- Uses regex patterns to identify:
  - Lektion numbers (1-7)
  - Section headers (Schritt A-E, Fokus Beruf, Zwischendurch mal...)
  - Exercise numbers and answers
- Automatically merges AB and KB exercises by exerciseId

**Manual Extraction (for complex formats):**
Some exercises required manual extraction from PDF due to:
- Non-standard answer formats (e.g., "Musterlösung: ...")
- Complex spacing or formatting in PDF
- Exercises not matching automated regex patterns

**Manually added exercises:**
- `B1.1-L1-KB-Gedicht-1` - Gedicht section (page 5)
- `B1.1-L1-KB-D2` - Musterlösung answer format (page 4)
- `B1.1-L1-KB-D3` - Ordering exercise (page 4)
- `B1.1-L1-KB-D4` - Multiple choice (page 4)

### Section Types

**Arbeitsbuch (AB) sections:**
- Folge 1, Folge 2 (Story episodes)
- Schritt A, B, C, D, E (Step exercises)
- Grammatik und Kommunikation

**Kursbuch (KB) sections:**
- Schritt A, B, C, D, E
- Fokus Beruf / Fokus Familie
- **Zwischendurch mal...** (KB-only):
  - Projekt (Projects)
  - Hören (Listening)
  - Gedicht (Poems)
  - Lesen (Reading)
  - Lied (Songs)

### Exercise ID Convention

Format: `{level}.{subLevel}-L{lesson}-{bookType}-{exerciseNumber}`

Examples:
- `B1.1-L1-AB-A1` - Arbeitsbuch exercise
- `B1.1-L1-KB-D2` - Kursbuch exercise
- `B1.1-L1-KB-Gedicht-1` - Kursbuch "Zwischendurch mal" exercise

### Re-running Extraction

To update exercises from PDFs:

1. Ensure PDF paths are correct in `scripts/extract-b1-with-sections.js`
2. Run extraction:
   ```bash
   node scripts/extract-b1-with-sections.js
   ```
3. Review output for any warnings about missing exercises
4. Manually add any exercises that weren't auto-extracted
5. Run merge to update combined file:
   ```bash
   npm run exercises:merge b1-1-arbeitsbuch
   ```

---

**Last updated**: 2025-12-26
**Generated from**: B1.1 AB+KB answer key PDFs
**Total exercises**: 209 (across 7 lessons)
