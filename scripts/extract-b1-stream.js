/**
 * Stream-based B1 extraction (doesn't rely on line breaks)
 */

const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const B1_1_PDF = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu 5 B1.1\\extras from website\\301086_Loesungen_AB.pdf';
const B1_2_PDF = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu 6 B1.2\\extras von website\\601086_SiN_6_Loesungen_AB.pdf';
const OUTPUT_DIR = path.join(__dirname, '..', 'lib', 'data', 'exercises');

/**
 * Parse PDF to extract text
 */
async function parsePDF(pdfPath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', pdfData => {
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
 * Extract lessons using regex on full text
 */
function parseAllExercises(text, level, subLevel, lessonOffset = 0) {
  const lessons = [];

  // Find all Lektion sections
  const lektionPattern = /Lektion\s+(\d+)\s+([^L]+?)(?=Lektion\s+\d+|$)/gs;
  let lektionMatch;

  while ((lektionMatch = lektionPattern.exec(text)) !== null) {
    const lessonNum = parseInt(lektionMatch[1]) + lessonOffset;
    const lessonText = lektionMatch[2];

    console.log(`\nProcessing Lektion ${lessonNum}...`);

    const lesson = {
      lessonNumber: lessonNum,
      title: `Lektion ${lessonNum}`,
      exercises: [],
    };

    // Find all exercises within this lesson
    // Pattern: number (optionally with letter), followed by answers
    const exercisePattern = /\b(\d+[a-z]?)\s+((?:[a-z]\s+[a-zäöüß]+\s+)+|(?:[a-zäöüß]+\s+[a-zäöüß]+,?\s*)+)/gi;
    let exerciseMatch;

    while ((exerciseMatch = exercisePattern.exec(lessonText)) !== null) {
      const exerciseNum = exerciseMatch[1];
      const answerText = exerciseMatch[2].trim();

      const answers = parseAnswers(answerText);

      if (answers.length > 0) {
        lesson.exercises.push({
          exerciseId: `${level}.${subLevel}-L${lessonNum}-AB-${exerciseNum}`,
          level,
          bookType: 'AB',
          lessonNumber: lessonNum,
          exerciseNumber: exerciseNum,
          title: `Übung ${exerciseNum}`,
          answers,
          difficulty: 'medium',
        });

        console.log(`  * Exercise ${exerciseNum}: ${answers.length} answers`);
      }
    }

    if (lesson.exercises.length > 0) {
      lessons.push(lesson);
    }
  }

  return lessons;
}

/**
 * Parse answers from text
 */
function parseAnswers(text) {
  const answers = [];

  // Try letter-answer pattern first: "b war c konnten d wollte"
  const letterPattern = /\b([a-z])\s+([a-zäöüß]+(?:\s+[a-zäöüß]+)?)/gi;
  let match;
  const seen = new Set();

  while ((match = letterPattern.exec(text)) !== null) {
    const letter = match[1];
    const answer = match[2].trim();

    if (!seen.has(letter) && answer.length > 1 && answer.length < 100) {
      answers.push({
        itemNumber: letter,
        correctAnswer: answer,
      });
      seen.add(letter);
    }
  }

  // If no letter pattern, try comma-separated pairs
  if (answers.length === 0 && text.includes(',')) {
    const pairs = text.split(',').map(p => p.trim()).filter(p => p.length > 0 && p.length < 100);

    pairs.forEach((pair, idx) => {
      answers.push({
        itemNumber: String(idx + 1),
        correctAnswer: pair,
      });
    });
  }

  return answers;
}

/**
 * Main extraction
 */
async function extractB1() {
  console.log('🚀 Extracting B1 exercises (stream parser)...\n');

  // Extract B1.1
  console.log('📖 Processing B1.1 (Schritte International Neu 5)...');
  const b11 = await parsePDF(B1_1_PDF);
  console.log(`   Pages: ${b11.pages}, Characters: ${b11.text.length}`);

  const b11Lessons = parseAllExercises(b11.text, 'B1', '1', 0);
  console.log(`\n✅ Extracted ${b11Lessons.length} lessons with ${b11Lessons.reduce((sum, l) => sum + l.exercises.length, 0)} total exercises`);

  const b11Data = {
    level: 'B1',
    subLevel: '1',
    bookType: 'AB',
    lessons: b11Lessons,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'b1-1-arbeitsbuch.json'),
    JSON.stringify(b11Data, null, 2)
  );
  console.log('💾 Saved b1-1-arbeitsbuch.json\n');

  // Extract B1.2
  console.log('📖 Processing B1.2 (Schritte International Neu 6)...');
  const b12 = await parsePDF(B1_2_PDF);
  console.log(`   Pages: ${b12.pages}, Characters: ${b12.text.length}`);

  const b12Lessons = parseAllExercises(b12.text, 'B1', '2', -7);
  console.log(`\n✅ Extracted ${b12Lessons.length} lessons with ${b12Lessons.reduce((sum, l) => sum + l.exercises.length, 0)} total exercises`);

  const b12Data = {
    level: 'B1',
    subLevel: '2',
    bookType: 'AB',
    lessons: b12Lessons,
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'b1-2-arbeitsbuch.json'),
    JSON.stringify(b12Data, null, 2)
  );
  console.log('💾 Saved b1-2-arbeitsbuch.json\n');

  console.log('✨ Extraction complete!');
}

extractB1().catch(console.error);
