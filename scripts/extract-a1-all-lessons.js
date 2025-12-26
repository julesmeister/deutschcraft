const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const basePath = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu A1.1\\Schritte International neu 1_Unterichtsplan';
const outputDir = 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises';

async function extractFromPdf(pdfPath, lessonNumber) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    const lines = data.text.split('\n');
    const exercises = [];
    let currentMainExercise = null;

    console.log(`\n========== Processing Lektion ${lessonNumber} ==========`);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect main exercises: A1, A2, B1, C1, etc.
      const mainExerciseMatch = line.match(/^([A-E])([0-9]{1,2})\s+(.+)$/) || line.match(/^([A-E])([0-9]{1,2})([A-ZÄÖÜ].{10,})$/);

      if (mainExerciseMatch) {
        const section = mainExerciseMatch[1];
        const number = mainExerciseMatch[2];
        const title = mainExerciseMatch[3].trim();

        currentMainExercise = {
          exerciseId: `L${lessonNumber}-${section}${number}`,
          exerciseNumber: `${section}${number}`,
          section: section,
          number: parseInt(number),
          title: title,
          question: '',
          answers: [],
          difficulty: 'medium',
          topic: '',
          lessonNumber: lessonNumber,
        };

        exercises.push(currentMainExercise);
        console.log(`  Exercise ${currentMainExercise.exerciseNumber}: ${title}`);
        continue;
      }

      // Detect sub-exercises: single letter "a", "b", "c", etc.
      const subExerciseMatch = line.match(/^([a-z])$/);

      if (subExerciseMatch && currentMainExercise) {
        const subLetter = subExerciseMatch[1];

        // Get the title from the next few lines
        let subTitle = '';
        for (let j = i + 1; j < i + 5; j++) {
          const candidateLine = lines[j] ? lines[j].trim() : '';
          if (candidateLine.length > 10 && candidateLine.length < 150 &&
              !candidateLine.match(/^(PL|EA|PA|GA|WPA|CD|Folie|Ti|PP|Arbeitsbuch|Variante|Hinweis)/)) {
            subTitle = candidateLine;
            break;
          }
        }

        if (!subTitle) {
          subTitle = `Teil ${subLetter}`;
        }

        const subExercise = {
          exerciseId: `L${lessonNumber}-${currentMainExercise.exerciseNumber}${subLetter}`,
          exerciseNumber: `${currentMainExercise.exerciseNumber}${subLetter}`,
          section: currentMainExercise.section,
          number: currentMainExercise.number,
          subNumber: subLetter,
          title: subTitle,
          question: '',
          answers: [],
          difficulty: 'medium',
          topic: '',
          lessonNumber: lessonNumber,
          parent: currentMainExercise.exerciseNumber,
        };

        exercises.push(subExercise);
        console.log(`    Sub-exercise ${subExercise.exerciseNumber}: ${subTitle}`);
      }
    }

    console.log(`  ✓ Found ${exercises.length} exercises (${exercises.filter(e => !e.parent).length} main, ${exercises.filter(e => e.parent).length} sub)`);

    return exercises;

  } catch (error) {
    console.error(`Error processing Lektion ${lessonNumber}:`, error.message);
    return [];
  }
}

async function extractAllLessons() {
  const allLessons = [];

  console.log('===== Extracting exercises from all lessons =====');

  for (let lessonNum = 1; lessonNum <= 7; lessonNum++) {
    const pdfPath = path.join(basePath, `Schritte_international_Neu_1_UP_L${lessonNum}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      console.log(`Skipping Lektion ${lessonNum} - file not found`);
      continue;
    }

    const exercises = await extractFromPdf(pdfPath, lessonNum);

    const lessonData = {
      lessonNumber: lessonNum,
      title: `Lektion ${lessonNum}`,
      exercises: exercises,
    };

    allLessons.push(lessonData);
  }

  // Create the final output structure
  const output = {
    level: 'A1',
    book: 'Schritte International Neu 1',
    bookType: 'UP',
    lessons: allLessons,
  };

  // Save combined file
  const combinedPath = path.join(outputDir, 'a1-1-unterrichtsplan-all.json');
  fs.writeFileSync(combinedPath, JSON.stringify(output, null, 2));

  console.log(`\n\n===== SUMMARY =====`);
  console.log(`Total lessons processed: ${allLessons.length}`);
  console.log(`\nExercises per lesson:`);
  allLessons.forEach(lesson => {
    console.log(`  Lektion ${lesson.lessonNumber}: ${lesson.exercises.length} exercises`);
  });

  const totalExercises = allLessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0);
  console.log(`\nTotal exercises: ${totalExercises}`);

  console.log(`\n✓ Saved combined file: ${combinedPath}`);

  // Also save individual lesson files
  allLessons.forEach(lesson => {
    const individualPath = path.join(outputDir, `a1-1-unterrichtsplan-L${lesson.lessonNumber}.json`);
    const individualOutput = {
      level: 'A1',
      book: 'Schritte International Neu 1',
      bookType: 'UP',
      lesson: lesson,
    };
    fs.writeFileSync(individualPath, JSON.stringify(individualOutput, null, 2));
  });

  console.log(`✓ Saved individual lesson files (L1-L${allLessons.length})`);
}

extractAllLessons();
