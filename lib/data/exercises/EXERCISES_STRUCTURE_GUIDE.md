# Exercise Data Management Guide

Complete guide for managing exercise JSON files in split or merged format.

## 📁 Folder Structure

```
lib/data/exercises/
├── EXERCISES_STRUCTURE_GUIDE.md  # This file
├── b1-1-arbeitsbuch.json          # Original merged file (can be regenerated)
└── b1-1-arbeitsbuch/              # Split folder
    ├── README.md                  # Folder-specific instructions
    ├── metadata.json              # Book metadata
    ├── lesson-1.json              # Lektion 1 exercises
    ├── lesson-2.json              # Lektion 2 exercises
    ├── lesson-3.json              # Lektion 3 exercises
    ├── lesson-4.json              # Lektion 4 exercises
    ├── lesson-5.json              # Lektion 5 exercises
    ├── lesson-6.json              # Lektion 6 exercises
    └── lesson-7.json              # Lektion 7 exercises
```

## 🎯 Why Split Files?

**Benefits:**
- ✅ **Smaller files** - Easier to edit (300-500 lines vs 3000+ lines)
- ✅ **Faster loading** - Only load the lesson you need
- ✅ **Version control** - Git diffs are cleaner, conflicts less likely
- ✅ **Parallel editing** - Multiple people can edit different lessons
- ✅ **Easier navigation** - Find exercises quickly
- ✅ **Less risky** - Editing one lesson won't break others

**When to use split format:**
- Daily editing and adding exercises
- Working on specific lessons
- Team collaboration
- Development and testing

**When to use merged format:**
- Production deployment (single file to load)
- Backup/archiving
- Data migration
- API consumption

## 🚀 Quick Start

### 1. Split an Existing File

```bash
npm run exercises:split b1-1-arbeitsbuch.json
```

**What it does:**
- Creates `b1-1-arbeitsbuch/` folder
- Splits into `lesson-1.json`, `lesson-2.json`, etc.
- Creates `metadata.json` with book info
- Generates a `README.md` in the folder

### 2. Edit Lesson Files

**Option A: Direct editing**
```bash
# Open in VS Code
code lib/data/exercises/b1-1-arbeitsbuch/lesson-1.json
```

**Option B: Interactive CLI (coming soon)**
```bash
npm run exercises:manage
```

### 3. Merge Back to Single File

```bash
npm run exercises:merge b1-1-arbeitsbuch
```

**Or merge all split folders:**
```bash
npm run exercises:merge:all
```

## 📝 Editing Workflows

### Workflow 1: Add a New Exercise

1. **Navigate to lesson file:**
   ```bash
   code lib/data/exercises/b1-1-arbeitsbuch/lesson-1.json
   ```

2. **Add to exercises array:**
   ```json
   {
     "exerciseId": "B1.1-L1-AB-Gedicht-1",
     "level": "B1",
     "bookType": "AB",
     "lessonNumber": 1,
     "exerciseNumber": "Gedicht-1",
     "section": "Zwischendurch mal … - Gedicht",
     "title": "Glücklich sein",
     "answers": [
       {
         "itemNumber": "1",
         "correctAnswer": "a"
       },
       {
         "itemNumber": "2",
         "correctAnswer": "c"
       }
     ],
     "difficulty": "medium"
   }
   ```

3. **Save file** (Ctrl+S or Cmd+S)

4. **Merge to production:**
   ```bash
   npm run exercises:merge b1-1-arbeitsbuch
   ```

### Workflow 2: Edit Existing Exercise

1. **Open lesson file**
2. **Find exercise by ID** (Ctrl+F / Cmd+F)
3. **Edit fields:**
   - `title` - Exercise title
   - `section` - Section name
   - `difficulty` - easy/medium/hard
   - `answers` - Add/edit/remove items
4. **Save and merge**

### Workflow 3: Delete an Exercise

1. **Open lesson file**
2. **Find exercise object**
3. **Delete entire object** (including curly braces)
4. **Fix commas** (ensure no trailing comma on last item)
5. **Save and merge**

### Workflow 4: Reorder Exercises

1. **Open lesson file**
2. **Cut and paste** exercise objects in desired order
3. **Save and merge**

## 📋 File Format Reference

### metadata.json
```json
{
  "level": "B1",
  "subLevel": "1",
  "bookType": "AB",
  "totalLessons": 7,
  "generatedAt": "2025-12-25T19:44:10.523Z",
  "originalFile": "b1-1-arbeitsbuch.json"
}
```

### lesson-X.json
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

## 🔧 Advanced Operations

### Split Multiple Files

```bash
npm run exercises:split b1-1-arbeitsbuch.json
npm run exercises:split b1-2-arbeitsbuch.json
npm run exercises:split b2-1-arbeitsbuch.json
```

### Merge All Split Folders

```bash
npm run exercises:merge:all
```

**Output:**
```
📚 Merging all split exercise folders...

Found 3 folder(s):

📚 Merging b1-1-arbeitsbuch...
✨ Successfully merged into b1-1-arbeitsbuch.json!

📚 Merging b1-2-arbeitsbuch...
✨ Successfully merged into b1-2-arbeitsbuch.json!

📚 Merging b2-1-arbeitsbuch...
✨ Successfully merged into b2-1-arbeitsbuch.json!
```

### Validate JSON After Editing

```bash
# Use Node.js to validate
node -e "JSON.parse(require('fs').readFileSync('lib/data/exercises/b1-1-arbeitsbuch/lesson-1.json'))" && echo "✅ Valid JSON"
```

### Format with Prettier

```bash
npx prettier --write "lib/data/exercises/b1-1-arbeitsbuch/*.json"
```

## 🛠️ Common Tasks

### Add Missing "Gedicht" Exercise to Lektion 1

1. Open `lesson-1.json`:
   ```bash
   code lib/data/exercises/b1-1-arbeitsbuch/lesson-1.json
   ```

2. Find the last exercise in the `exercises` array

3. Add after it (before closing `]`):
   ```json
   ,
   {
     "exerciseId": "B1.1-L1-AB-Gedicht-1",
     "level": "B1",
     "bookType": "AB",
     "lessonNumber": 1,
     "exerciseNumber": "Gedicht-1",
     "section": "Zwischendurch mal … - Gedicht",
     "title": "Glücklich sein",
     "answers": [
       {
         "itemNumber": "richtig",
         "correctAnswer": "a, c, d"
       },
       {
         "itemNumber": "falsch",
         "correctAnswer": "b, e"
       }
     ],
     "difficulty": "medium"
   }
   ```

4. Save and merge:
   ```bash
   npm run exercises:merge b1-1-arbeitsbuch
   ```

### Bulk Edit All Lessons

Use a script or find-replace across files:

```bash
# Example: Change all "medium" to "mittel"
cd lib/data/exercises/b1-1-arbeitsbuch
sed -i 's/"difficulty": "medium"/"difficulty": "mittel"/g' lesson-*.json
```

### Copy Exercise to Another Lesson

1. Open source lesson file
2. Copy entire exercise object
3. Open target lesson file
4. Paste and update:
   - `lessonNumber`
   - `exerciseId` (change lesson number in ID)
5. Save both files and merge

## ⚠️ Important Notes

### DO:
- ✅ Always validate JSON after editing
- ✅ Run merge after making changes
- ✅ Keep backup of original files
- ✅ Use 2-space indentation
- ✅ Use double quotes for strings
- ✅ Test merged file before deployment

### DON'T:
- ❌ Edit merged file directly (edit lesson files instead)
- ❌ Mix tabs and spaces
- ❌ Leave trailing commas
- ❌ Use single quotes
- ❌ Forget to save before merging
- ❌ Delete metadata.json

## 🔍 Troubleshooting

### "Invalid JSON" Error

**Cause:** Syntax error in JSON file

**Fix:**
1. Use JSON validator: https://jsonlint.com
2. Common issues:
   - Missing comma between objects
   - Trailing comma after last object
   - Single quotes instead of double quotes
   - Unclosed brackets/braces

**Example error:**
```json
// ❌ WRONG - trailing comma
{
  "exerciseId": "B1.1-L1-AB-A1",
  "title": "Exercise",
}

// ✅ CORRECT
{
  "exerciseId": "B1.1-L1-AB-A1",
  "title": "Exercise"
}
```

### "Merge fails" Error

**Cause:** Missing or corrupted files

**Fix:**
1. Check all `lesson-*.json` files exist
2. Verify `metadata.json` exists and is valid
3. Ensure lesson numbers are sequential

### "Wrong lesson count" After Merge

**Cause:** Missing lesson file

**Fix:**
1. Check if all lesson files are present
2. Look for gaps in numbering (lesson-1, lesson-3 but missing lesson-2)
3. Restore from backup or re-split original

### Changes Not Appearing After Merge

**Cause:** Edited wrong file or didn't save

**Fix:**
1. Ensure you edited the lesson file (not merged file)
2. Save file before running merge
3. Check if merge command completed successfully

## 📊 Statistics

**B1.1 Arbeitsbuch:**
- Total Lessons: 7
- Total Exercises: 144
- Lessons:
  1. Lektion 1 - Glück im Alltag (22 exercises)
  2. Lektion 2 - Unterhaltung (21 exercises)
  3. Lektion 3 - Gesund bleiben (18 exercises)
  4. Lektion 4 - Sprachen (23 exercises)
  5. Lektion 5 - Unterwegs (20 exercises)
  6. Lektion 6 - Dienstleistung (20 exercises)
  7. Lektion 7 - Rund ums Wohnen (20 exercises)

## 🎓 Best Practices

1. **Work on split files during development**
   - Edit individual lesson files
   - Easier to manage and review

2. **Merge before deploying**
   - Single file is faster to load
   - Simpler for production use

3. **Version control**
   - Commit both split and merged files
   - Split files show clearer diffs

4. **Backup strategy**
   - Keep original merged files
   - Tag versions before major changes

5. **Testing**
   - Validate JSON after editing
   - Test merge before committing
   - Check application loads exercises correctly

## 📚 Related Scripts

- **split-exercises.js** - Splits merged JSON into lesson files
- **merge-exercises.js** - Combines lesson files into merged JSON
- **exercise-manager.js** - Interactive CLI (future: will support split structure)

## 🔮 Future Enhancements

- [ ] Update exercise-manager.js to work with split files
- [ ] Add validation script (check for duplicate IDs, missing fields)
- [ ] Generate statistics report (exercises per section, difficulty distribution)
- [ ] Export to CSV for bulk editing
- [ ] Import from CSV
- [ ] Auto-fix common JSON errors

---

**Last updated:** 2025-12-26
**Version:** 1.0
