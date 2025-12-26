/**
 * B1 extraction with Schritt section detection
 * Organizes exercises under Schritt A, B, C, D, E, Fokus Beruf, etc.
 */

const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const B1_1_AB_PDF = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu 5 B1.1\\extras from website\\301086_Loesungen_AB.pdf';
const B1_1_KB_PDF = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu 5 B1.1\\extras from website\\301086 Loesungen_KB.190066.pdf';
const B1_2_AB_PDF = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu 6 B1.2\\extras von website\\601086_SiN_6_Loesungen_AB.pdf';
const OUTPUT_DIR = path.join(__dirname, '..', 'lib', 'data', 'exercises');

async function parsePDF(pdfPath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      let text = '';
      pdfData.Pages.forEach(page => {
        page.Texts.forEach(textItem => {
          try {
            text += decodeURIComponent(textItem.R[0].T) + ' ';
          } catch (e) {
            // Handle malformed URI, skip this text item
            text += textItem.R[0].T + ' ';
          }
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
    // Also: "Zwischendurch mal … - Projekt", "Zwischendurch mal … - Hören", etc.
    const sectionPattern = /(Schritt\s+[A-E]|Fokus\s+[A-Za-zäöüß]+|Zwischendurch\s+mal\s+[.…–-]\s*-?\s*(Projekt|Hören|Gedicht|Lesen|Lied))/gi;
    const sectionMatches = [...lessonText.matchAll(sectionPattern)];

    console.log(`    Found ${sectionMatches.length} sections`);
    if (lessonNum === 1) {
      console.log(`    DEBUG Lektion 1 sections:`, sectionMatches.map(m => m[0]));
    }

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
        } else if (lessonNum === 1 && sectionName.includes('Gedicht')) {
          console.log(`      ⚠️ DEBUG: Gedicht section found but NO exercises extracted`);
          console.log(`      First 200 chars of section text:`, sectionText.substring(0, 200));
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

  // Pattern 3: Exercise number followed by comma-separated words (for Gedicht, etc.)
  const exercisePattern3 = /\b(\d+)\s+([a-zäöüß]+(?:,?\s+(?:und\s+)?[a-zäöüß]+)+)/gi;

  const exerciseMatches1 = [...text.matchAll(exercisePattern1)];
  const exerciseMatches2 = [...text.matchAll(exercisePattern2)];
  const exerciseMatches3 = [...text.matchAll(exercisePattern3)];

  if (lessonNum === 1 && section && section.includes('Gedicht')) {
    console.log(`      DEBUG: Pattern 1 matches: ${exerciseMatches1.length}`);
    console.log(`      DEBUG: Pattern 2 matches: ${exerciseMatches2.length}`);
    console.log(`      DEBUG: Pattern 3 matches: ${exerciseMatches3.length}`);
    if (exerciseMatches3.length > 0) {
      console.log(`      DEBUG: Pattern 3 first match:`, exerciseMatches3[0]);
    }
  }

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

function mergeLessons(existingLessons, newLessons) {
  const merged = [...existingLessons];

  for (const newLesson of newLessons) {
    const existingLesson = merged.find(l => l.lessonNumber === newLesson.lessonNumber);

    if (existingLesson) {
      // Merge exercises, avoiding duplicates by exerciseId
      const existingIds = new Set(existingLesson.exercises.map(e => e.exerciseId));
      const newExercises = newLesson.exercises.filter(e => !existingIds.has(e.exerciseId));
      existingLesson.exercises.push(...newExercises);
      console.log(`    ➕ Added ${newExercises.length} new exercises to Lektion ${newLesson.lessonNumber}`);
    } else {
      // New lesson, add it
      merged.push(newLesson);
      console.log(`    ➕ Added new Lektion ${newLesson.lessonNumber} with ${newLesson.exercises.length} exercises`);
    }
  }

  return merged.sort((a, b) => a.lessonNumber - b.lessonNumber);
}

function loadExistingLessons(folderPath) {
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const lessonFiles = fs.readdirSync(folderPath)
    .filter(f => f.startsWith('lesson-') && f.endsWith('.json'))
    .sort();

  const lessons = [];
  for (const file of lessonFiles) {
    const filePath = path.join(folderPath, file);
    const lesson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    lessons.push(lesson);
  }

  return lessons;
}

function saveToSplitFormat(folderName, level, subLevel, bookType, lessons) {
  const folderPath = path.join(OUTPUT_DIR, folderName);

  // Create folder if doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Save metadata
  const metadata = {
    level,
    subLevel,
    bookType,
    totalLessons: lessons.length,
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(folderPath, 'metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf8'
  );

  // Save each lesson
  for (const lesson of lessons) {
    const lessonFile = `lesson-${lesson.lessonNumber}.json`;
    fs.writeFileSync(
      path.join(folderPath, lessonFile),
      JSON.stringify(lesson, null, 2),
      'utf8'
    );
  }

  console.log(`💾 Saved to ${folderName}/ (${lessons.length} lesson files)`);
}

async function extractB1() {
  console.log('🚀 Extracting B1 exercises with sections...\n');

  // ========== B1.1 Arbeitsbuch (AB) ==========
  console.log('📖 Processing B1.1 Arbeitsbuch...');
  const b11AB = await parsePDF(B1_1_AB_PDF);
  console.log(`  PDF: ${b11AB.pages} pages, ${b11AB.text.length} characters`);

  const b11ABLessons = parseAllExercises(b11AB.text, 'B1', '1', 0);
  const b11ABCount = b11ABLessons.reduce((sum, l) => sum + l.exercises.length, 0);
  console.log(`  ✅ Extracted ${b11ABCount} exercises from AB`);

  // ========== B1.1 Kursbuch (KB) ==========
  console.log('\n📖 Processing B1.1 Kursbuch...');
  const b11KB = await parsePDF(B1_1_KB_PDF);
  console.log(`  PDF: ${b11KB.pages} pages, ${b11KB.text.length} characters`);

  const b11KBLessons = parseAllExercises(b11KB.text, 'B1', '1', 0);
  // Update bookType to KB
  b11KBLessons.forEach(lesson => {
    lesson.exercises.forEach(ex => {
      ex.bookType = 'KB';
      ex.exerciseId = ex.exerciseId.replace('-AB-', '-KB-');
    });
  });
  const b11KBCount = b11KBLessons.reduce((sum, l) => sum + l.exercises.length, 0);
  console.log(`  ✅ Extracted ${b11KBCount} exercises from KB`);

  // ========== Load existing lessons and merge ==========
  console.log('\n🔄 Merging with existing lessons...');
  const existingLessons = loadExistingLessons(path.join(OUTPUT_DIR, 'b1-1-arbeitsbuch'));

  let mergedLessons = existingLessons.length > 0 ? existingLessons : b11ABLessons;

  if (existingLessons.length > 0) {
    console.log(`  📂 Loaded ${existingLessons.length} existing lessons`);
  }

  // Merge KB exercises
  mergedLessons = mergeLessons(mergedLessons, b11KBLessons);

  const totalExercises = mergedLessons.reduce((sum, l) => sum + l.exercises.length, 0);
  console.log(`\n✅ B1.1: ${mergedLessons.length} lessons, ${totalExercises} total exercises`);

  // Save to split format
  saveToSplitFormat('b1-1-arbeitsbuch', 'B1', '1', 'AB+KB', mergedLessons);

  // ========== B1.2 Arbeitsbuch ==========
  console.log('\n📖 Processing B1.2 Arbeitsbuch...');
  const b12AB = await parsePDF(B1_2_AB_PDF);
  console.log(`  PDF: ${b12AB.pages} pages, ${b12AB.text.length} characters`);

  const b12ABLessons = parseAllExercises(b12AB.text, 'B1', '2', -7);
  const b12ABCount = b12ABLessons.reduce((sum, l) => sum + l.exercises.length, 0);
  console.log(`  ✅ Extracted ${b12ABCount} exercises from AB`);

  // Load existing B1.2 lessons and merge
  const existingB12Lessons = loadExistingLessons(path.join(OUTPUT_DIR, 'b1-2-arbeitsbuch'));
  const mergedB12Lessons = existingB12Lessons.length > 0
    ? mergeLessons(existingB12Lessons, b12ABLessons)
    : b12ABLessons;

  const totalB12Exercises = mergedB12Lessons.reduce((sum, l) => sum + l.exercises.length, 0);
  console.log(`\n✅ B1.2: ${mergedB12Lessons.length} lessons, ${totalB12Exercises} total exercises`);

  saveToSplitFormat('b1-2-arbeitsbuch', 'B1', '2', 'AB', mergedB12Lessons);

  console.log('\n✨ Extraction complete!');
  console.log(`📊 Total: ${totalExercises + totalB12Exercises} exercises across ${mergedLessons.length + mergedB12Lessons.length} lessons`);
}

extractB1().catch(console.error);
