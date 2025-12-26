const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu A1.1\\Schritte International neu 1_Unterichtsplan\\Schritte_international_Neu_1_UP_L1.pdf';

async function extractExercises() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    const text = data.text;
    const lines = text.split('\n');

    const exercises = [];
    let currentSection = null;
    let currentLesson = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';

      // Detect lesson
      if (line.startsWith('Lektion') && line.includes(',')) {
        currentLesson = line;
        console.log(`\n======== ${line} ========`);
        continue;
      }

      // Detect main sections (A, B, C, etc. with full caps heading)
      const sectionMatch = line.match(/^([A-C])\s+([A-ZÄÖÜ][A-ZÄÖÜ\s]{3,40}\.?)$/);
      if (sectionMatch) {
        currentSection = {
          section: sectionMatch[1],
          title: sectionMatch[2],
        };
        console.log(`\nSection ${currentSection.section}: ${currentSection.title}`);
        continue;
      }

      // Detect exercise numbers (A1, A2, B1, etc.)
      const exerciseMatch = line.match(/^([A-C])([0-9]+)[\s\t]+(.+)$/);
      if (exerciseMatch) {
        const exercise = {
          exerciseNumber: exerciseMatch[1] + exerciseMatch[2],
          section: exerciseMatch[1],
          number: exerciseMatch[2],
          title: exerciseMatch[3].trim(),
          lesson: currentLesson,
        };

        exercises.push(exercise);
        console.log(`  Exercise ${exercise.exerciseNumber}: ${exercise.title}`);
        continue;
      }

      // Detect sub-exercises (a, b, c, etc.) - these appear after main exercises
      const subExerciseMatch = line.match(/^([a-z])[\s\t]*$/);
      if (subExerciseMatch && exercises.length > 0) {
        const lastExercise = exercises[exercises.length - 1];
        const subLetter = subExerciseMatch[1];

        // Create sub-exercise
        const subExercise = {
          exerciseNumber: lastExercise.exerciseNumber + subLetter,
          section: lastExercise.section,
          number: lastExercise.number,
          subNumber: subLetter,
          title: nextLine && nextLine.length > 5 && nextLine.length < 100 ? nextLine : 'Übung ' + subLetter,
          lesson: currentLesson,
          parent: lastExercise.exerciseNumber,
        };

        exercises.push(subExercise);
        console.log(`    Sub-exercise ${subExercise.exerciseNumber}: ${subExercise.title}`);
      }
    }

    console.log(`\n\n===== SUMMARY =====`);
    console.log(`Total exercises found: ${exercises.length}`);
    console.log(`\nExercises by section:`);
    const bySection = exercises.reduce((acc, ex) => {
      acc[ex.section] = (acc[ex.section] || 0) + 1;
      return acc;
    }, {});
    console.log(bySection);

    // Save to JSON
    const outputPath = 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises\\a1-1-unterrichtsplan-L1.json';
    const output = {
      level: 'A1',
      book: 'Schritte International Neu 1',
      bookType: 'Unterrichtsplan',
      lesson: 'Lektion 1',
      lessonNumber: 1,
      exercises: exercises,
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`\nSaved to: ${outputPath}`);

    return exercises;

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
}

extractExercises();
