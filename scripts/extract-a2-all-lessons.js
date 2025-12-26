const fs = require('fs');
const pdf = require('pdf-parse');

const basePath = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu A2.1\\Schritte International neu 3_Unterrichtsplan';

const lessons = [
  { number: 1, file: '311084_SIN 3_UP_Lektion 1.pdf', title: 'Lektion 1' },
  { number: 2, file: '311084_SIN 3_UP_Lektion 2.pdf', title: 'Lektion 2' },
  { number: 3, file: '311084_SIN 3_UP_Lektion 3.pdf', title: 'Lektion 3' },
  { number: 4, file: '311084_SIN 3_UP_Lektion 4.pdf', title: 'Lektion 4' },
  { number: 5, file: '311084_SIN 3_UP_Lektion 5.pdf', title: 'Lektion 5' },
  { number: 6, file: '311084_SIN 3_UP_Lektion 6.pdf', title: 'Lektion 6' },
  { number: 7, file: '311084_SIN 3_UP_Lektion 7.pdf', title: 'Lektion 7' },
];

async function extractLesson(lessonNumber, pdfPath, lessonTitle) {
  try {
    console.log(`\n\n========== EXTRACTING ${lessonTitle} ==========`);
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    const lines = data.text.split('\n');

    const exercises = [];
    let currentMainExercise = null;

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
        console.log(`Exercise ${currentMainExercise.exerciseNumber}: ${title}`);
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
        console.log(`  Sub-exercise ${subExercise.exerciseNumber}: ${subTitle}`);
      }
    }

    console.log(`\n${lessonTitle} - Total exercises: ${exercises.length} (${exercises.filter(e => !e.parent).length} main, ${exercises.filter(e => e.parent).length} sub)`);

    return exercises;

  } catch (error) {
    console.error(`Error extracting ${lessonTitle}:`, error.message);
    return [];
  }
}

async function extractAll() {
  const allLessons = [];

  for (const lesson of lessons) {
    const pdfPath = `${basePath}\\${lesson.file}`;
    const exercises = await extractLesson(lesson.number, pdfPath, lesson.title);

    allLessons.push({
      lessonNumber: lesson.number,
      title: lesson.title,
      exercises: exercises,
    });
  }

  // Save combined output
  const output = {
    level: 'A2',
    subLevel: '1',
    bookType: 'UP', // Unterrichtsplan
    lessons: allLessons,
  };

  const outputPath = 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises\\a2-1-unterrichtsplan.json';
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  // Print final summary
  console.log(`\n\n========== FINAL SUMMARY ==========`);
  let totalExercises = 0;
  let totalMain = 0;
  let totalSub = 0;

  allLessons.forEach(lesson => {
    const main = lesson.exercises.filter(e => !e.parent).length;
    const sub = lesson.exercises.filter(e => e.parent).length;
    console.log(`${lesson.title}: ${lesson.exercises.length} exercises (${main} main, ${sub} sub)`);
    totalExercises += lesson.exercises.length;
    totalMain += main;
    totalSub += sub;
  });

  console.log(`\nTOTAL: ${totalExercises} exercises (${totalMain} main, ${totalSub} sub)`);
  console.log(`\nSaved to: ${outputPath}`);
}

extractAll();
