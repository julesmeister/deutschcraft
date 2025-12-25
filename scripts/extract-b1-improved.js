/**
 * Improved B1 extraction with better pattern matching
 * Based on actual PDF text analysis
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
 * Parse exercises with improved pattern matching
 */
function parseAllExercises(text, level, subLevel, lessonOffset = 0) {
  const lessons = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let currentLesson = null;
  let currentExercise = null;
  let exerciseAnswers = [];
  let accumulatedText = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip headers and footers
    if (line.includes('Schritte international')) continue;
    if (line.includes('©') || line.includes('Hueber')) continue;
    if (line.includes('ISBN')) continue;
    if (line.includes('Schritt A') || line.includes('Schritt B') || line.includes('Schritt C')) continue;

    // Detect Lektion headers
    const lessonMatch = line.match(/Lektion\s+(\d+)/i);
    if (lessonMatch) {
      saveCurrentExercise();

      const lessonNum = parseInt(lessonMatch[1]) + lessonOffset;

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
      accumulatedText = '';
      continue;
    }

    if (!currentLesson) continue;

    // Detect exercise numbers: "1 ", "2a ", "3b ", etc.
    const exerciseMatch = line.match(/^(\d+[a-z]?)\s+(.+)/);

    if (exerciseMatch) {
      // Save previous exercise
      saveCurrentExercise();

      // Start new exercise
      currentExercise = exerciseMatch[1];
      exerciseAnswers = [];
      accumulatedText = exerciseMatch[2].trim();

      // Try to parse immediately
      parseAnswers(accumulatedText, exerciseAnswers);
    } else if (currentExercise) {
      // Continuation of current exercise
      accumulatedText += ' ' + line;
      parseAnswers(line, exerciseAnswers);
    }
  }

  // Save last exercise and lesson
  saveCurrentExercise();
  if (currentLesson) {
    lessons.push(currentLesson);
  }

  return lessons;

  function saveCurrentExercise() {
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
  }
}

/**
 * Parse answers from text
 * Handles two formats:
 * 1. Letter-answer pairs: "b war c konnten d wollte"
 * 2. Word pairs: "gewann gewinnen, kam kommen, war sein"
 */
function parseAnswers(text, answers) {
  // Format 1: Letter-answer pattern "b war c konnten d wollte"
  const letterPattern = /\b([a-z])\s+([a-zäöüß]+(?:\s+[a-zäöüß]+)?)\s+/gi;
  let match;
  let foundLetterPattern = false;

  while ((match = letterPattern.exec(text)) !== null) {
    const letter = match[1];
    const answer = match[2].trim();

    // Avoid duplicates
    if (!answers.find(a => a.itemNumber === letter) && answer.length > 1 && answer.length < 100) {
      answers.push({
        itemNumber: letter,
        correctAnswer: answer,
      });
      foundLetterPattern = true;
    }
  }

  // Format 2: Comma-separated word pairs "gewann gewinnen, kam kommen"
  if (!foundLetterPattern && text.includes(',')) {
    const pairs = text.split(',').map(p => p.trim()).filter(p => p.length > 0);

    pairs.forEach((pair, idx) => {
      // Extract first meaningful word from each pair
      const words = pair.trim().split(/\s+/);
      const answer = words[0];

      if (answer && answer.length > 1 && answer.length < 100) {
        const itemNum = String(idx + 1);
        if (!answers.find(a => a.itemNumber === itemNum)) {
          answers.push({
            itemNumber: itemNum,
            correctAnswer: pair.trim(), // Keep full pair for word conjugations
          });
        }
      }
    });
  }
}

/**
 * Main extraction
 */
async function extractB1() {
  console.log('🚀 Extracting ALL B1 exercises (improved parser)...\n');

  // Extract B1.1
  console.log('📖 Processing B1.1 (Schritte International Neu 5)...');
  const b11 = await parsePDF(B1_1_PDF);
  console.log(`   Pages: ${b11.pages}, Characters: ${b11.text.length}`);

  const b11Lessons = parseAllExercises(b11.text, 'B1', '1', 0);
  console.log(`   Extracted ${b11Lessons.length} lessons`);
  b11Lessons.forEach(l => {
    console.log(`     - Lektion ${l.lessonNumber}: ${l.exercises.length} exercises`);
    l.exercises.forEach(ex => {
      console.log(`       * ${ex.exerciseNumber}: ${ex.answers.length} answers`);
    });
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

  const b12Lessons = parseAllExercises(b12.text, 'B1', '2', -7);
  console.log(`   Extracted ${b12Lessons.length} lessons`);
  b12Lessons.forEach(l => {
    console.log(`     - Lektion ${l.lessonNumber}: ${l.exercises.length} exercises`);
    l.exercises.forEach(ex => {
      console.log(`       * ${ex.exerciseNumber}: ${ex.answers.length} answers`);
    });
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
}

extractB1().catch(console.error);
