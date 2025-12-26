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
    let currentExercise = null;

    console.log(`\n========== Processing Lektion ${lessonNumber} ==========`);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect main exercises: A1, A2, B1, C1, etc.
      const mainExerciseMatch = line.match(/^([A-E])([0-9]{1,2})\s+(.+)$/) || line.match(/^([A-E])([0-9]{1,2})([A-ZÄÖÜ].{10,})$/);

      if (mainExerciseMatch) {
        const section = mainExerciseMatch[1];
        const number = mainExerciseMatch[2];
        const title = mainExerciseMatch[3].trim();

        currentExercise = {
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

        exercises.push(currentExercise);
        console.log(`  Exercise ${currentExercise.exerciseNumber}: ${title}`);
        continue;
      }

      // Detect sub-exercises: single letter "a", "b", "c", etc.
      const subExerciseMatch = line.match(/^([a-z])$/);

      if (subExerciseMatch && currentExercise) {
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
          exerciseId: `L${lessonNumber}-${currentExercise.exerciseNumber}${subLetter}`,
          exerciseNumber: `${currentExercise.exerciseNumber}${subLetter}`,
          section: currentExercise.section,
          number: currentExercise.number,
          subNumber: subLetter,
          title: subTitle,
          question: '',
          answers: [],
          difficulty: 'medium',
          topic: '',
          lessonNumber: lessonNumber,
          parent: currentExercise.exerciseNumber,
        };

        exercises.push(subExercise);
        console.log(`    Sub-exercise ${subExercise.exerciseNumber}: ${subTitle}`);
        continue;
      }

      // Detect numbered items within exercises (1, 2, 3, 4, etc.)
      // Look for lines that are just a number, or number followed by text
      const itemMatch = line.match(/^([0-9]{1,2})\.?\s*(.*)$/);

      if (itemMatch && currentExercise && !line.match(/^[0-9]{3,}/)) {
        const itemNumber = itemMatch[1];
        const itemText = itemMatch[2].trim();

        // Only add if it's a reasonable item number (1-50)
        const num = parseInt(itemNumber);
        if (num >= 1 && num <= 50) {
          currentExercise.answers.push({
            itemNumber: itemNumber,
            correctAnswer: itemText || '',
          });
          console.log(`      Item ${itemNumber}: ${itemText || '(empty)'}`);
        }
      }
    }

    console.log(`  ✓ Found ${exercises.length} exercises`);
    exercises.forEach(ex => {
      if (ex.answers.length > 0) {
        console.log(`    ${ex.exerciseNumber}: ${ex.answers.length} items`);
      }
    });

    return exercises;

  } catch (error) {
    console.error(`Error processing Lektion ${lessonNumber}:`, error.message);
    return [];
  }
}

async function extractAllLessons() {
  const allLessons = [];

  console.log('===== Extracting exercises with items from all lessons =====');

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
    subLevel: '1',
    bookType: 'AB',
    lessons: allLessons,
  };

  // Save file
  const outputPath = path.join(outputDir, 'a1-1-arbeitsbuch-extracted.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n\n===== SUMMARY =====`);
  console.log(`Total lessons processed: ${allLessons.length}`);
  console.log(`\nExercises per lesson:`);
  allLessons.forEach(lesson => {
    const withItems = lesson.exercises.filter(e => e.answers.length > 0).length;
    console.log(`  Lektion ${lesson.lessonNumber}: ${lesson.exercises.length} exercises (${withItems} with items)`);
  });

  const totalExercises = allLessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0);
  const totalItems = allLessons.reduce((sum, lesson) =>
    sum + lesson.exercises.reduce((s, ex) => s + ex.answers.length, 0), 0);
  console.log(`\nTotal exercises: ${totalExercises}`);
  console.log(`Total items: ${totalItems}`);

  console.log(`\n✓ Saved to: ${outputPath}`);
}

extractAllLessons();
