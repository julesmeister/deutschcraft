/**
 * Extract exercises from Schritte PDF answer keys
 * Using pdf2json library
 */

const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

// Mapping of Schritte folders to CEFR levels
const SCHRITTE_MAPPING = {
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
 * Parse PDF to extract text
 */
async function parsePDF(pdfPath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      // Extract text from PDF
      let text = '';
      pdfData.Pages.forEach(page => {
        page.Texts.forEach(textItem => {
          text += decodeURIComponent(textItem.R[0].T) + ' ';
        });
        text += '\n';
      });
      resolve({ text, pages: pdfData.Pages.length });
    });

    pdfParser.loadPDF(pdfPath);
  });
}

/**
 * Parse text to extract exercises
 */
function parseExercises(text, level, subLevel) {
  const lessons = [];

  // Create 7 empty lessons
  for (let i = 1; i <= 7; i++) {
    lessons.push({
      lessonNumber: i,
      title: `Lektion ${i}`,
      exercises: [],
    });
  }

  console.log(`\n📝 Parsing exercises from text (${text.length} chars)...`);
  console.log('   First 200 chars:', text.substring(0, 200));

  // Simple pattern: Look for exercise numbers like "1a", "2b", etc.
  // This will need manual cleanup, but gives a starting point
  const lines = text.split('\n');
  let currentLesson = 1;
  let exerciseCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect lesson headers
    const lessonMatch = line.match(/Lektion\s+(\d+)/i);
    if (lessonMatch) {
      currentLesson = parseInt(lessonMatch[1]);
      console.log(`   Found Lektion ${currentLesson}`);
      continue;
    }

    // Detect exercise numbers (e.g., "1a", "2", "3b")
    const exerciseMatch = line.match(/^(\d+[a-z]?)[.:)]\s*(.+)/);
    if (exerciseMatch && currentLesson >= 1 && currentLesson <= 7) {
      const exerciseNum = exerciseMatch[1];
      const content = exerciseMatch[2].trim();

      if (content.length > 0) {
        exerciseCount++;
        lessons[currentLesson - 1].exercises.push({
          exerciseId: `${level}.${subLevel}-L${currentLesson}-AB-${exerciseNum}`,
          level,
          bookType: 'AB',
          lessonNumber: currentLesson,
          exerciseNumber: exerciseNum,
          title: `Übung ${exerciseNum}`,
          answers: [
            {
              itemNumber: '1',
              correctAnswer: content,
            },
          ],
          difficulty: 'medium',
        });
      }
    }
  }

  console.log(`   Extracted ${exerciseCount} exercises across ${lessons.length} lessons`);
  return lessons;
}

/**
 * Main extraction function
 */
async function extractAllExercises() {
  console.log('🚀 Starting Schritte exercise extraction (pdf2json)...\n');

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
      console.log(`\n📖 Processing: ${folderName}`);
      console.log(`   PDF: ${path.basename(pdfPath)}`);

      const { text, pages } = await parsePDF(pdfPath);
      console.log(`   Pages: ${pages}`);

      const lessons = parseExercises(text, config.level, config.subLevel);

      const exerciseData = {
        level: config.level,
        subLevel: config.subLevel,
        bookType: 'AB',
        lessons,
      };

      const outputFile = path.join(
        OUTPUT_DIR,
        `${config.level.toLowerCase()}-${config.subLevel}-arbeitsbuch.json`
      );

      fs.writeFileSync(outputFile, JSON.stringify(exerciseData, null, 2));
      console.log(`✅ Saved to: ${outputFile}`);

    } catch (error) {
      console.error(`\n❌ Error processing ${folderName}:`, error.message);
      console.error(error.stack);
    }
  }

  console.log('\n✨ Extraction complete!');
  console.log('\n⚠️  NOTE: The extracted data is a starting point.');
  console.log('   You will need to manually review and clean up the JSON files.');
}

// Run the extraction
extractAllExercises().catch(console.error);
