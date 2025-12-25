/**
 * Extract exercises from Schritte PDF answer keys
 *
 * This script extracts exercise answers from Schritte Loesungen_AB.pdf files
 * and generates JSON files for the Answer Hub feature.
 */

const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

// Mapping of Schritte folders to CEFR levels
const SCHRITTE_MAPPING = {
  'Schritte International Neu A1.1': { level: 'A1', subLevel: '1' },
  'Schritte International Neu A1.2': { level: 'A1', subLevel: '2' },
  'Schritte International Neu A2.1': { level: 'A2', subLevel: '1' },
  'Schritte International Neu A2.2': { level: 'A2', subLevel: '2' },
  'Schritte International Neu 5 B1.1': { level: 'B1', subLevel: '1' },
  'Schritte International Neu 6 B1.2': { level: 'B1', subLevel: '2' },
};

// Base directory for Schritte books
const SCHRITTE_BASE = 'C:\\Users\\User\\Documents\\Schritte';
const OUTPUT_DIR = path.join(__dirname, '..', 'lib', 'data', 'exercises');

/**
 * Find PDF answer key in a Schritte folder
 */
function findAnswerKeyPDF(schrittePath) {
  const possiblePaths = [
    path.join(schrittePath, 'extras from website'),
    path.join(schrittePath, 'extras von website'),
  ];

  for (const dir of possiblePaths) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      const pdfFile = files.find(f =>
        f.includes('Loesungen_AB') || f.includes('Lösungen_AB')
      );
      if (pdfFile) {
        return path.join(dir, pdfFile);
      }
    }
  }
  return null;
}

/**
 * Parse PDF text to extract exercises
 */
async function parsePDFExercises(pdfPath, level, subLevel) {
  console.log(`\n📖 Parsing ${pdfPath}...`);

  const dataBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse();
  const pdfData = await parser.parse(dataBuffer);
  const text = pdfData.text;

  console.log(`   Total pages: ${pdfData.numpages}`);
  console.log(`   Text length: ${text.length} characters`);

  // Extract lessons (Lektion 1-7)
  const lessons = [];

  // Regex patterns to identify lessons and exercises
  const lessonPattern = /Lektion\s+(\d+)/gi;
  const exercisePattern = /(\d+[a-z]?)\s+(.+?)(?=\n\d+[a-z]?|\nLektion|\Z)/gis;

  // Split text by Lektion
  const lessonMatches = [...text.matchAll(lessonPattern)];

  for (let i = 0; i < lessonMatches.length; i++) {
    const lessonNum = parseInt(lessonMatches[i][1]);
    const lessonStart = lessonMatches[i].index;
    const lessonEnd = lessonMatches[i + 1]?.index || text.length;
    const lessonText = text.substring(lessonStart, lessonEnd);

    console.log(`\n   📝 Lektion ${lessonNum}`);

    // Extract exercises from this lesson
    const exercises = [];
    const lines = lessonText.split('\n').filter(l => l.trim());

    let currentExercise = null;
    let currentAnswers = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip if it's the Lektion header
      if (trimmed.startsWith('Lektion')) continue;

      // Check if this line starts a new exercise (e.g., "1a", "2", "3b")
      const exerciseMatch = trimmed.match(/^(\d+[a-z]?)\s+(.+)/);

      if (exerciseMatch) {
        // Save previous exercise if exists
        if (currentExercise && currentAnswers.length > 0) {
          exercises.push({
            exerciseId: `${level}.${subLevel}-L${lessonNum}-AB-${currentExercise}`,
            level,
            bookType: 'AB',
            lessonNumber: lessonNum,
            exerciseNumber: currentExercise,
            title: `Übung ${currentExercise}`,
            answers: currentAnswers,
            difficulty: 'medium',
          });
        }

        // Start new exercise
        currentExercise = exerciseMatch[1];
        currentAnswers = [];

        // The rest of the line might be the first answer
        const firstAnswer = exerciseMatch[2].trim();
        if (firstAnswer) {
          currentAnswers.push({
            itemNumber: '1',
            correctAnswer: firstAnswer,
          });
        }
      } else if (currentExercise) {
        // This line is part of the current exercise
        // Try to detect if it's a numbered/lettered answer item
        const itemMatch = trimmed.match(/^([a-z]|\d+)[.)]\s*(.+)/i);

        if (itemMatch) {
          currentAnswers.push({
            itemNumber: itemMatch[1],
            correctAnswer: itemMatch[2].trim(),
          });
        } else if (trimmed.length > 0 && currentAnswers.length > 0) {
          // Continuation of previous answer
          const lastAnswer = currentAnswers[currentAnswers.length - 1];
          lastAnswer.correctAnswer += ' ' + trimmed;
        }
      }
    }

    // Save last exercise
    if (currentExercise && currentAnswers.length > 0) {
      exercises.push({
        exerciseId: `${level}.${subLevel}-L${lessonNum}-AB-${currentExercise}`,
        level,
        bookType: 'AB',
        lessonNumber: lessonNum,
        exerciseNumber: currentExercise,
        title: `Übung ${currentExercise}`,
        answers: currentAnswers,
        difficulty: 'medium',
      });
    }

    console.log(`      Found ${exercises.length} exercises`);

    lessons.push({
      lessonNumber: lessonNum,
      title: `Lektion ${lessonNum}`,
      exercises,
    });
  }

  return {
    level,
    subLevel,
    bookType: 'AB',
    lessons,
  };
}

/**
 * Main extraction function
 */
async function extractAllExercises() {
  console.log('🚀 Starting Schritte exercise extraction...\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const [folderName, config] of Object.entries(SCHRITTE_MAPPING)) {
    const schrittePath = path.join(SCHRITTE_BASE, folderName);

    if (!fs.existsSync(schrittePath)) {
      console.log(`⚠️  Folder not found: ${folderName}`);
      continue;
    }

    const pdfPath = findAnswerKeyPDF(schrittePath);

    if (!pdfPath) {
      console.log(`⚠️  No answer key PDF found in: ${folderName}`);
      continue;
    }

    try {
      const exerciseData = await parsePDFExercises(pdfPath, config.level, config.subLevel);

      const outputFile = path.join(
        OUTPUT_DIR,
        `${config.level.toLowerCase()}-${config.subLevel}-arbeitsbuch.json`
      );

      fs.writeFileSync(outputFile, JSON.stringify(exerciseData, null, 2));
      console.log(`\n✅ Saved to: ${outputFile}`);

    } catch (error) {
      console.error(`\n❌ Error processing ${folderName}:`, error.message);
    }
  }

  console.log('\n✨ Extraction complete!');
}

// Run the extraction
extractAllExercises().catch(console.error);
