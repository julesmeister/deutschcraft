/**
 * Complete extraction of ALL B1 exercises from Schritte PDFs
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
 * Parse exercises from extracted text
 */
function parseAllExercises(text, level, subLevel, lessonOffset = 0) {
  const lessons = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let currentLesson = null;
  let currentExercise = null;
  let exerciseAnswers = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Lektion headers
    const lessonMatch = line.match(/Lektion\s+(\d+)/i);
    if (lessonMatch) {
      // Save previous exercise before switching lesson
      if (currentExercise && exerciseAnswers.length > 0) {
        if (currentLesson) {
          currentLesson.exercises.push({
            exerciseId: `${level}.${subLevel}-L${currentLesson.lessonNumber}-AB-${currentExercise}`,
            level,
            bookType: 'AB',
            lessonNumber: currentLesson.lessonNumber,
            exerciseNumber: currentExercise,
            title: `Übung ${currentExercise}`,
            answers: exerciseAnswers,
            difficulty: 'medium',
          });
        }
      }

      const lessonNum = parseInt(lessonMatch[1]) + lessonOffset;

      // Create new lesson if it doesn't exist
      if (!currentLesson || currentLesson.lessonNumber !== lessonNum) {
        if (currentLesson) {
          lessons.push(currentLesson);
        }
        currentLesson = {
          lessonNumber: lessonNum,
          title: `Lektion ${lessonNum}`,
          exercises: [],
        };
      }

      currentExercise = null;
      exerciseAnswers = [];
      continue;
    }

    // Skip non-exercise content
    if (!currentLesson) continue;
    if (line.includes('Schritte international')) continue;
    if (line.includes('©') || line.includes('Hueber')) continue;
    if (line.includes('ISBN')) continue;

    // Detect exercise numbers (1, 2a, 2b, 3, etc.)
    // Pattern: number followed optionally by letter
    const exerciseMatch = line.match(/^(\d+[a-z]?)\s+(.+)/);

    if (exerciseMatch) {
      // Save previous exercise
      if (currentExercise && exerciseAnswers.length > 0) {
        currentLesson.exercises.push({
          exerciseId: `${level}.${subLevel}-L${currentLesson.lessonNumber}-AB-${currentExercise}`,
          level,
          bookType: 'AB',
          lessonNumber: currentLesson.lessonNumber,
          exerciseNumber: currentExercise,
          title: `Übung ${currentExercise}`,
          answers: exerciseAnswers,
          difficulty: 'medium',
        });
      }

      // Start new exercise
      currentExercise = exerciseMatch[1];
      exerciseAnswers = [];

      // Parse the rest of the line for answers
      const restOfLine = exerciseMatch[2].trim();
      parseAnswerLine(restOfLine, exerciseAnswers);
    } else if (currentExercise) {
      // This line might be part of the current exercise
      parseAnswerLine(line, exerciseAnswers);
    }
  }

  // Save last exercise
  if (currentExercise && exerciseAnswers.length > 0 && currentLesson) {
    currentLesson.exercises.push({
      exerciseId: `${level}.${subLevel}-L${currentLesson.lessonNumber}-AB-${currentExercise}`,
      level,
      bookType: 'AB',
      lessonNumber: currentLesson.lessonNumber,
      exerciseNumber: currentExercise,
      title: `Übung ${currentExercise}`,
      answers: exerciseAnswers,
      difficulty: 'medium',
    });
  }

  // Save last lesson
  if (currentLesson) {
    lessons.push(currentLesson);
  }

  return lessons;
}

/**
 * Parse a line to extract answer items
 */
function parseAnswerLine(line, answers) {
  // Try to match pattern like "a word b word c word"
  // or "1 word 2 word 3 word"

  // Split by common patterns
  const itemPattern = /([a-z]|\d+)\s+([^\d][^a-z\s]+(?:\s+[^a-z\d]+)?)/gi;
  let match;

  while ((match = itemPattern.exec(line)) !== null) {
    const itemNum = match[1];
    const answer = match[2].trim();

    if (answer.length > 0 && answer.length < 200) {
      answers.push({
        itemNumber: itemNum,
        correctAnswer: answer,
      });
    }
  }

  // If no matches, try simpler pattern: just extract words
  if (answers.length === 0 && line.length > 0 && line.length < 200) {
    // Check if line looks like "word, word, word"
    if (line.includes(',')) {
      const parts = line.split(',').map(p => p.trim()).filter(p => p.length > 0);
      parts.forEach((part, idx) => {
        answers.push({
          itemNumber: String(idx + 1),
          correctAnswer: part,
        });
      });
    }
  }
}

/**
 * Main extraction
 */
async function extractB1() {
  console.log('🚀 Extracting ALL B1 exercises...\n');

  // Extract B1.1
  console.log('📖 Processing B1.1 (Schritte International Neu 5)...');
  const b11 = await parsePDF(B1_1_PDF);
  console.log(`   Pages: ${b11.pages}, Characters: ${b11.text.length}`);

  const b11Lessons = parseAllExercises(b11.text, 'B1', '1', 0);
  console.log(`   Extracted ${b11Lessons.length} lessons`);
  b11Lessons.forEach(l => {
    console.log(`     - Lektion ${l.lessonNumber}: ${l.exercises.length} exercises`);
  });

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
  console.log('✅ Saved b1-1-arbeitsbuch.json\n');

  // Extract B1.2
  console.log('📖 Processing B1.2 (Schritte International Neu 6)...');
  const b12 = await parsePDF(B1_2_PDF);
  console.log(`   Pages: ${b12.pages}, Characters: ${b12.text.length}`);

  // B1.2 starts at Lektion 8, but we want lessons 1-7 in the JSON
  // So we need to adjust: Lektion 8 → 1, Lektion 9 → 2, etc.
  const b12Lessons = parseAllExercises(b12.text, 'B1', '2', -7);
  console.log(`   Extracted ${b12Lessons.length} lessons`);
  b12Lessons.forEach(l => {
    console.log(`     - Lektion ${l.lessonNumber}: ${l.exercises.length} exercises`);
  });

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
  console.log('✅ Saved b1-2-arbeitsbuch.json\n');

  console.log('✨ Extraction complete!');
  console.log('\n⚠️  Manual review recommended - some exercises may need cleanup.');
}

extractB1().catch(console.error);
