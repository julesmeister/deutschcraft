/**
 * B1 extraction with Schritt section detection
 * Organizes exercises under Schritt A, B, C, D, E, Fokus Beruf, etc.
 */

const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const B1_1_PDF = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu 5 B1.1\\extras from website\\301086_Loesungen_AB.pdf';
const B1_2_PDF = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu 6 B1.2\\extras von website\\601086_SiN_6_Loesungen_AB.pdf';
const OUTPUT_DIR = path.join(__dirname, '..', 'lib', 'data', 'exercises');

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

function parseAllExercises(text, level, subLevel, lessonOffset = 0) {
  const lessons = [];

  // Find all Lektion positions
  const lektionPattern = /Lektion\s+(\d+)/gi;
  const lektionMatches = [...text.matchAll(lektionPattern)];

  console.log(`  Found ${lektionMatches.length} Lektions`);

  // Extract text for each Lektion
  for (let i = 0; i < lektionMatches.length; i++) {
    const match = lektionMatches[i];
    const lessonNum = parseInt(match[1]) + lessonOffset;
    const startIndex = match.index;
    const endIndex = i < lektionMatches.length - 1 ? lektionMatches[i + 1].index : text.length;

    const lessonText = text.substring(startIndex, endIndex);

    console.log(`\n  Lektion ${lessonNum}:`);

    const lesson = {
      lessonNumber: lessonNum,
      title: `Lektion ${lessonNum}`,
      exercises: [],
    };

    // Find all Schritt sections within this Lektion
    // Pattern: "Schritt A", "Schritt B", "Schritt C", "Schritt D", "Schritt E"
    // Also: "Fokus Beruf", "Fokus Familie", etc.
    const sectionPattern = /(Schritt\s+[A-E]|Fokus\s+[A-Za-zäöüß]+)/gi;
    const sectionMatches = [...lessonText.matchAll(sectionPattern)];

    console.log(`    Found ${sectionMatches.length} sections`);

    if (sectionMatches.length === 0) {
      // No sections found, treat entire lesson as one section
      const exercises = extractExercisesFromText(lessonText, level, subLevel, lessonNum, null);
      lesson.exercises.push(...exercises);
    } else {
      // Process each section
      for (let j = 0; j < sectionMatches.length; j++) {
        const sectionMatch = sectionMatches[j];
        const sectionName = sectionMatch[0];
        const sectionStart = sectionMatch.index;
        const sectionEnd = j < sectionMatches.length - 1 ? sectionMatches[j + 1].index : lessonText.length;

        const sectionText = lessonText.substring(sectionStart, sectionEnd);

        const exercises = extractExercisesFromText(sectionText, level, subLevel, lessonNum, sectionName);

        if (exercises.length > 0) {
          console.log(`      ${sectionName}: ${exercises.length} exercises`);
          lesson.exercises.push(...exercises);
        }
      }
    }

    if (lesson.exercises.length > 0) {
      lessons.push(lesson);
    } else {
      console.log(`    ⚠️ No exercises extracted`);
    }
  }

  return lessons;
}

function extractExercisesFromText(text, level, subLevel, lessonNum, section) {
  const exercises = [];

  // Pattern 1: Exercise number followed by letter-answer pairs
  const exercisePattern1 = /\b([A-Z]?\d+[a-z]?)\s+([a-z]\s+[a-zäöüß]+(?:\s+[a-z]\s+[a-zäöüß]+)+)/gi;

  // Pattern 2: Exercise number followed by numbered/lettered answers (more flexible)
  const exercisePattern2 = /\b([A-Z]?\d+[a-z]?)\s+((?:[a-z0-9]+\s+[a-zäöüß]+[,\s]*)+)/gi;

  const exerciseMatches1 = [...text.matchAll(exercisePattern1)];
  const exerciseMatches2 = [...text.matchAll(exercisePattern2)];

  // Combine both patterns and deduplicate
  const allMatches = [...exerciseMatches1, ...exerciseMatches2];
  const seenExercises = new Set();
  const exerciseMatches = allMatches.filter(match => {
    const exNum = match[1];
    if (seenExercises.has(exNum)) return false;
    seenExercises.add(exNum);
    return true;
  });

  for (const exMatch of exerciseMatches) {
    const exerciseNum = exMatch[1];
    const answersText = exMatch[2];

    const answers = parseAnswers(answersText);

    if (answers.length > 0) {
      exercises.push({
        exerciseId: `${level}.${subLevel}-L${lessonNum}-AB-${exerciseNum}`,
        level,
        bookType: 'AB',
        lessonNumber: lessonNum,
        exerciseNumber: exerciseNum,
        section: section,  // Add section name
        title: `${exerciseNum}`,
        answers,
        difficulty: 'medium',
      });
    }
  }

  return exercises;
}

function parseAnswers(text) {
  const answers = [];
  const seen = new Set();

  // Pattern 1: Letter followed by German word(s)
  const letterPattern = /\b([a-z])\s+([a-zäöüß]+(?:\s+[a-zäöüß]+)?)/gi;
  let match;

  while ((match = letterPattern.exec(text)) !== null) {
    const letter = match[1];
    const answer = match[2].trim();

    if (!seen.has(letter) && answer.length > 0 && answer.length < 100) {
      answers.push({
        itemNumber: letter,
        correctAnswer: answer,
      });
      seen.add(letter);
    }
  }

  // Pattern 2: Number followed by answer (if no letter matches found)
  if (answers.length === 0) {
    const numberPattern = /\b(\d+)\s+([a-zäöüß]+(?:\s+[a-zäöüß]+)?)/gi;
    while ((match = numberPattern.exec(text)) !== null) {
      const num = match[1];
      const answer = match[2].trim();

      if (!seen.has(num) && answer.length > 0 && answer.length < 100) {
        answers.push({
          itemNumber: num,
          correctAnswer: answer,
        });
        seen.add(num);
      }
    }
  }

  return answers;
}

async function extractB1() {
  console.log('🚀 Extracting B1 exercises with sections...\n');

  // Extract B1.1
  console.log('📖 Processing B1.1 (Schritte International Neu 5)...');
  const b11 = await parsePDF(B1_1_PDF);
  console.log(`  PDF: ${b11.pages} pages, ${b11.text.length} characters`);

  const b11Lessons = parseAllExercises(b11.text, 'B1', '1', 0);
  const b11ExerciseCount = b11Lessons.reduce((sum, l) => sum + l.exercises.length, 0);

  console.log(`\n✅ B1.1: ${b11Lessons.length} lessons, ${b11ExerciseCount} exercises`);

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
  console.log(`  PDF: ${b12.pages} pages, ${b12.text.length} characters`);

  const b12Lessons = parseAllExercises(b12.text, 'B1', '2', -7);
  const b12ExerciseCount = b12Lessons.reduce((sum, l) => sum + l.exercises.length, 0);

  console.log(`\n✅ B1.2: ${b12Lessons.length} lessons, ${b12ExerciseCount} exercises`);

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
  console.log(`📊 Total: ${b11ExerciseCount + b12ExerciseCount} exercises across ${b11Lessons.length + b12Lessons.length} lessons`);
}

extractB1().catch(console.error);
