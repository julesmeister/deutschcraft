# Managing Exercise Items (Answers)

Complete guide for inserting, editing, and removing answer items within exercises.

## Understanding "Items"

In the exercise JSON structure, each exercise has **answers** (also called "items"):

```json
{
  "exerciseId": "B1.1-L1-AB-A1",
  "answers": [
    {
      "itemNumber": "1",           ← Item identifier
      "correctAnswer": "spielte"   ← Item value
    },
    {
      "itemNumber": "2",
      "correctAnswer": "gewann"
    }
  ]
}
```

## How to Access Item Management

1. Run: `npm run exercises:manage`
2. Select file → Select lesson → Choose "Edit Exercise"
3. Select exercise number → Choose "4. Edit Answers"

You'll see the **Item Management Menu**:

```
📋 Current Answers (3 total):
  1. 1: spielte
  2. 2: gewann
  3. 3: kam

1. Add Answer      ← INSERT new item
2. Edit Answer     ← EDIT existing item
3. Delete Answer   ← REMOVE item
4. Back
```

## 1️⃣ INSERT New Items

**When to use:** Adding more answer options to an exercise

### Steps:
```
Choice: 1

Item Number: 4
Correct Answer: hatte

✅ Item added
```

### Examples:

**Adding numbered items:**
```
Item Number: 5
Correct Answer: war
```

**Adding lettered items:**
```
Item Number: d
Correct Answer: Ich habe gestern...
```

**Adding special items:**
```
Item Number: Musterlösung
Correct Answer: Als ich fünf Jahre alt war, wollte ich...
```

**Multi-line answers (just paste):**
```
Item Number: explanation
Correct Answer: Das ist passiert. Ich habe wirklich gewonnen.
Das war vorher. Ich hatte so lange gewartet.
```

## 2️⃣ EDIT Existing Items

**When to use:** Fixing typos, updating answers, changing item numbers

### Steps:
```
Choice: 2

Answer # to edit: 2

Item Number [2]: 2        ← Press Enter to keep
Correct Answer [gewann]: gewonnen   ← Change value

✅ Updated
```

### Edit Modes:

**Keep item number, change answer:**
```
Item Number [a]: [ENTER]
Correct Answer [old text]: new text
```

**Change item number, keep answer:**
```
Item Number [1]: 1a
Correct Answer [hatte]: [ENTER]
```

**Change both:**
```
Item Number [2]: A
Correct Answer [spielte]: spielte ... spielen
```

## 3️⃣ REMOVE Items

**When to use:** Deleting incorrect answers, removing duplicates

### Steps:
```
Choice: 3

Answer # to delete: 2

✅ Deleted
```

### Warning:
- Items are deleted immediately (within the editing session)
- **Must save changes** to persist deletion to JSON file
- No undo within the tool (but you can exit without saving)

## Full Example Session

```bash
npm run exercises:manage
```

```
📚 Available Exercise Files:
  1. b1-1-arbeitsbuch.json

Select file #: 1

📖 Level: B1.1 - Book: AB
Lessons:
  1. Lektion 1: Glück im Alltag (20 exercises)

Choice: 1 (Manage Lesson)
Lesson #: 1

📝 Exercises:
  1. B1.1-L1-AB-A1 - Grammar (3 answers)
  2. B1.1-L1-AB-A2a - Matching (4 answers)

Choice: 2 (Edit Exercise)
Exercise # to edit: 1

✏️ Editing: B1.1-L1-AB-A1

1. Edit Title
2. Edit Section
3. Edit Difficulty
4. Edit Answers    ← SELECT THIS
5. Back

Choice: 4

📋 Current Answers (3 total):
  1. 1: spielte
  2. 2: gewann
  3. 3: kam

1. Add Answer
2. Edit Answer
3. Delete Answer
4. Back
```

### INSERT Example:
```
Choice: 1
Item Number: 4
Correct Answer: hatte

→ Now 4 answers total
```

### EDIT Example:
```
Choice: 2
Answer # to edit: 2
Item Number [2]: [ENTER]
Correct Answer [gewann]: hat gewonnen

→ Answer 2 updated
```

### REMOVE Example:
```
Choice: 3
Answer # to delete: 4

✅ Deleted
→ Back to 3 answers
```

### Save Changes:
```
Choice: 4 (Back to exercise list)
Choice: 5 (Save & Exit)

✅ Saved b1-1-arbeitsbuch.json
```

## Common Operations

### Add Multiple Items Quickly
1. Choose "Add Answer"
2. Enter item number + answer
3. Repeat (stays in item menu)
4. Choose "Back" when done

### Renumber Items
If you have items `1, 2, 4` and want `1, 2, 3`:
1. Edit item #3 (which is "4")
2. Change item number from "4" to "3"

### Replace All Answers
1. Delete all existing items (one by one)
2. Add new items
3. Or: easier to edit each item's answer

### Bulk Edit Pattern
For systematic changes across many items:
1. Edit each item sequentially
2. Use [ENTER] to keep unchanged fields
3. Only type new values for changes

## Item Number Conventions

**Numeric (most common):**
- `"1"`, `"2"`, `"3"` - Simple numbered items

**Alphabetic:**
- `"a"`, `"b"`, `"c"` - Multiple choice options
- `"A"`, `"B"`, `"C"` - Uppercase matching

**Alphanumeric:**
- `"1a"`, `"1b"` - Sub-items
- `"2a"`, `"2b"`

**Special:**
- `"Musterlösung"` - Example solution
- `"explanation"` - Explanatory text
- `"keywords"` - Keyword list
- `"order"` - Sequence answer (e.g., "3, 1, 2, 5, 4")

## Answer Format Tips

**Short answers:**
```
correctAnswer: "spielte"
```

**Long text (paste directly):**
```
correctAnswer: "Sie freut sich, weil sie einen prima Tipp von einer netten Frau bekommen hat..."
```

**Lists:**
```
correctAnswer: "Fernsehen, Rundfunk, Internet, CD/MP3, Bücher"
```

**Arrow notation (corrections):**
```
correctAnswer: "100.000 → eine Million"
```

**Multi-part:**
```
correctAnswer: "Wer? 71-jähriger Wiener Wann? am vergangenen Wochenende"
```

## Keyboard Shortcuts

- **[ENTER]** - Keep current value when editing
- Type text, then **[ENTER]** - Set new value
- **"done"** - Finish adding answers (when adding new exercise)

## Safety Tips

✅ **DO:**
- Review all items after bulk changes
- Save frequently (use "Save Changes" option)
- Test with one item first before bulk operations

❌ **DON'T:**
- Exit without saving (changes lost)
- Assume numbering auto-updates (manually renumber if needed)
- Delete items without verifying exercise first

## Troubleshooting

**Can't see item management option:**
- Make sure you selected "Edit Exercise" (not "Add Exercise")
- Choose option "4. Edit Answers"

**Changes not saving:**
- Must explicitly choose "Save Changes" from main menu
- Or choose "Save & Exit" when in exercise list

**Item numbers out of order:**
- Manually edit each item's itemNumber field
- Tool doesn't auto-sort or renumber

**Long answer cut off:**
- Full answer is stored, display is truncated to 50 chars
- Edit the item to see/change full answer

## Quick Reference

| Operation | Steps | Shortcut |
|-----------|-------|----------|
| **Insert** | Edit Exercise → Edit Answers → Add Answer | Choice: 1 |
| **Edit** | Edit Exercise → Edit Answers → Edit Answer → Select # | Choice: 2 |
| **Remove** | Edit Exercise → Edit Answers → Delete Answer → Select # | Choice: 3 |
| **Save** | Back to main menu → Save Changes | Choice: 2 |

---

**Pro Tip:** Keep a backup of your JSON files before making bulk changes! 💾
