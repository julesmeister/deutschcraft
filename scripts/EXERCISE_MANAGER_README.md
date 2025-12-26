# Exercise Manager CLI Tool

Interactive command-line tool for managing exercise JSON files in `lib/data/exercises/`.

## Quick Start

Run the exercise manager:

```bash
npm run exercises:manage
```

## Features

### 1. **File Selection**
- Lists all exercise JSON files (e.g., `b1-1-arbeitsbuch.json`)
- Select which file to edit

### 2. **Lesson Management**
- View all lessons in a file
- See exercise count per lesson
- Navigate through lessons

### 3. **Exercise Operations**

#### Add New Exercise
1. Select "Add Exercise"
2. Enter:
   - Exercise Number (e.g., "A1", "B2a", "1")
   - Section (e.g., "Schritt A", "Folge 1")
   - Title
   - Difficulty (easy/medium/hard)
3. Add answers:
   - Item Number (e.g., "1", "a", "Musterlösung")
   - Correct Answer (can be multi-line text)
   - Type "done" when finished adding answers

#### Edit Existing Exercise
1. Select "Edit Exercise"
2. Choose exercise number
3. Modify:
   - Title
   - Section
   - Difficulty
   - Individual answers (add, edit, delete)

#### Delete Exercise
1. Select "Delete Exercise"
2. Choose exercise number
3. Confirm deletion

### 4. **Save Changes**
- Changes are made in memory
- Explicitly save with "Save Changes" option
- Auto-formats JSON with 2-space indentation
- Prompts to save before exiting

## Example Workflow

```
🎓 Exercise Manager for Testmanship
====================================

📚 Available Exercise Files:
  1. b1-1-arbeitsbuch.json
  2. b1-2-arbeitsbuch.json

Select file # (or "exit"): 1

📖 Level: B1.1 - Book: AB

Lessons (7 total):
  1. Lektion 1: Lektion 1 - Glück im Alltag (20 exercises)
  2. Lektion 2: Lektion 2 - Unterhaltung (18 exercises)
  ...

📌 Actions:
1. Manage Lesson
2. Save Changes
3. Back to File List
4. Exit

Choice: 1

Lesson #: 1

📝 Exercises in "Lektion 1 - Glück im Alltag":
  1. B1.1-L1-AB-Folge1-1 - Foto-Hörgeschichte (3 answers)
  2. B1.1-L1-AB-Folge1-2 - Foto-Hörgeschichte (1 answers)
  ...

📌 Actions:
1. Add Exercise
2. Edit Exercise
3. Delete Exercise
4. Back to Lessons
5. Save & Exit

Choice: 1

➕ Adding New Exercise
Exercise Number (e.g., "A1" or "1"): A4
Section (e.g., "Schritt A"): Schritt A
Title: Practice Exercise
Difficulty (easy/medium/hard) [medium]: medium

📋 Adding Answers (type "done" when finished)
Item Number (or "done"): 1
Correct Answer: hatte
Item Number (or "done"): 2
Correct Answer: war
Item Number (or "done"): done

✅ Added exercise: B1.1-L1-AB-A4
```

## File Structure

The tool works with this JSON structure:

```json
{
  "level": "B1",
  "subLevel": "1",
  "bookType": "AB",
  "lessons": [
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
  ]
}
```

## Tips

- **Exercise IDs**: Automatically generated in format `{level}.{subLevel}-L{lesson}-{bookType}-{exerciseNumber}`
  - Example: `B1.1-L1-AB-A1`

- **Sections**: Common sections include:
  - `Folge 1`, `Folge 2` (Story episodes)
  - `Schritt A`, `Schritt B`, etc. (Steps)
  - `Grammatik und Kommunikation`
  - `Fokus Beruf`
  - `Zwischendurch mal … - Projekt/Hören/Lesen/Lied`

- **Answer Item Numbers**: Can be:
  - Numeric: `"1"`, `"2"`, `"3"`
  - Alphabetic: `"a"`, `"b"`, `"c"`
  - Alphanumeric: `"2a"`, `"3b"`
  - Special: `"Musterlösung"`, `"explanation"`

- **Long Answers**: Just paste multi-line text - the tool will capture it all

- **Safety**: Changes are only saved when you explicitly choose "Save Changes" or "Save & Exit"

## Troubleshooting

**Tool crashes or shows errors:**
- Ensure you're in the project root directory
- Check that `lib/data/exercises/` exists
- Verify JSON files are valid (not corrupted)

**Changes not saved:**
- Always use "Save Changes" option before exiting
- Check file permissions

**Can't find exercise files:**
- Files must be in `lib/data/exercises/` directory
- Files must have `.json` extension

## Future Enhancements

Potential improvements:
- [ ] Bulk import from CSV/Excel
- [ ] Export to CSV for editing in spreadsheets
- [ ] Search exercises by keyword
- [ ] Duplicate exercise (copy with new ID)
- [ ] Validate exercise structure
- [ ] Preview formatted output
