#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const EXERCISES_DIR = path.join(__dirname, '../lib/data/exercises');

/**
 * Split a large exercise JSON file into individual lesson files
 * Example: b1-1-arbeitsbuch.json → b1-1-arbeitsbuch/lesson-1.json, lesson-2.json, etc.
 */
function splitExerciseFile(filename) {
  console.log(`\n📚 Splitting ${filename}...`);

  const filePath = path.join(EXERCISES_DIR, filename);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Create folder name (remove .json extension)
  const folderName = filename.replace('.json', '');
  const folderPath = path.join(EXERCISES_DIR, folderName);

  // Create folder
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✅ Created folder: ${folderName}/`);
  }

  // Save metadata
  const metadata = {
    level: data.level,
    subLevel: data.subLevel,
    bookType: data.bookType,
    totalLessons: data.lessons.length,
    generatedAt: new Date().toISOString(),
    originalFile: filename
  };

  fs.writeFileSync(
    path.join(folderPath, 'metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf8'
  );
  console.log(`✅ Created metadata.json`);

  // Split each lesson into its own file
  data.lessons.forEach((lesson) => {
    const lessonFile = `lesson-${lesson.lessonNumber}.json`;
    const lessonPath = path.join(folderPath, lessonFile);

    fs.writeFileSync(
      lessonPath,
      JSON.stringify(lesson, null, 2),
      'utf8'
    );

    console.log(`✅ Created ${lessonFile} (${lesson.exercises.length} exercises)`);
  });

  // Create README
  createReadme(folderPath, data);

  console.log(`\n✨ Successfully split into ${data.lessons.length} lesson files!`);
  console.log(`📁 Location: lib/data/exercises/${folderName}/\n`);
}

/**
 * Create README.md in the split folder
 */
function createReadme(folderPath, data) {
  const readme = `# ${data.level}.${data.subLevel} ${data.bookType} - Exercise Data

This folder contains exercise data split by lesson for easier management.

## Structure

\`\`\`
${path.basename(folderPath)}/
├── README.md          # This file
├── metadata.json      # Book metadata (level, subLevel, bookType)
├── lesson-1.json      # Lektion 1 exercises
├── lesson-2.json      # Lektion 2 exercises
├── lesson-3.json      # Lektion 3 exercises
└── ...
\`\`\`

## Metadata

- **Level**: ${data.level}
- **Sub-Level**: ${data.subLevel}
- **Book Type**: ${data.bookType} (AB = Arbeitsbuch, KB = Kursbuch)
- **Total Lessons**: ${data.lessons.length}

## Lesson Files

${data.lessons.map((lesson, idx) =>
  `${idx + 1}. **lesson-${lesson.lessonNumber}.json** - ${lesson.title} (${lesson.exercises.length} exercises)`
).join('\n')}

## File Format

Each lesson file contains:

\`\`\`json
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
\`\`\`

## How to Edit Exercises

### Option 1: Manual Editing
1. Open the lesson file (e.g., \`lesson-1.json\`)
2. Edit exercises directly in your text editor
3. Ensure JSON is valid (use a JSON validator)
4. Run \`npm run exercises:merge\` to combine files back

### Option 2: Interactive CLI Tool
\`\`\`bash
npm run exercises:manage
\`\`\`

### Option 3: Direct JSON Editing
- Use VS Code with JSON schema validation
- Format with Prettier: \`npx prettier --write lesson-*.json\`

## Adding Exercises

Add to the \`exercises\` array in the appropriate lesson file:

\`\`\`json
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
\`\`\`

## Removing Exercises

1. Open the lesson file
2. Find the exercise in the \`exercises\` array
3. Delete the entire exercise object
4. Ensure commas are correct (no trailing comma on last item)

## Merging Back

To combine lesson files back into a single JSON:

\`\`\`bash
npm run exercises:merge
\`\`\`

This will:
1. Read all \`lesson-*.json\` files
2. Combine with metadata
3. Generate \`${path.basename(folderPath)}.json\` in parent folder
4. Validate structure

## Exercise ID Format

\`{level}.{subLevel}-L{lesson}-{bookType}-{exerciseNumber}\`

Examples:
- \`B1.1-L1-AB-A1\` - Level B1.1, Lesson 1, Arbeitsbuch, Exercise A1
- \`B1.1-L2-AB-Folge1-1\` - Level B1.1, Lesson 2, Arbeitsbuch, Folge 1, Exercise 1

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

---

Generated on: ${new Date().toISOString()}
Original file: ${data.level}.${data.subLevel}-${data.bookType.toLowerCase()}.json
`;

  fs.writeFileSync(
    path.join(folderPath, 'README.md'),
    readme,
    'utf8'
  );
  console.log(`✅ Created README.md`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('📚 Exercise File Splitter\n');
  console.log('Usage: node split-exercises.js <filename>');
  console.log('\nExample:');
  console.log('  node split-exercises.js b1-1-arbeitsbuch.json\n');

  // List available files
  const files = fs.readdirSync(EXERCISES_DIR).filter(f => f.endsWith('.json'));
  console.log('Available files:');
  files.forEach((file, idx) => {
    console.log(`  ${idx + 1}. ${file}`);
  });

  process.exit(1);
}

const filename = args[0];
const filePath = path.join(EXERCISES_DIR, filename);

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filename}`);
  process.exit(1);
}

splitExerciseFile(filename);
