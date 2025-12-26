const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu A1.1\\Schritte International neu 1_Unterichtsplan\\Schritte_international_Neu_1_UP_L1.pdf';

async function extractExercises() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    const lines = data.text.split('\n');

    const exercises = [];
    let currentMainExercise = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const prevLine = lines[i - 1] ? lines[i - 1].trim() : '';
      const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';

      // Detect main exercises: A1, A2, B1, C1, etc. (letter + number + title)
      // Two patterns: "A1    Title" (with spaces) or "A1Title" (no spaces)
      const mainExerciseMatch = line.match(/^([A-E])([0-9]{1,2})\s+(.+)$/) || line.match(/^([A-E])([0-9]{1,2})([A-ZÄÖÜ].{10,})$/);

      if (mainExerciseMatch) {
        const section = mainExerciseMatch[1];
        const number = mainExerciseMatch[2];
        const title = mainExerciseMatch[3].trim();

        currentMainExercise = {
          exerciseId: `L1-${section}${number}`,
          exerciseNumber: `${section}${number}`,
          section: section,
          number: parseInt(number),
          title: title,
          question: '',
          answers: [],
          difficulty: 'medium',
          topic: '',
          lessonNumber: 1,
        };

        exercises.push(currentMainExercise);
        console.log(`Exercise ${currentMainExercise.exerciseNumber}: ${title}`);
        continue;
      }

      // Detect sub-exercises: single letter "a", "b", "c", etc. on its own line
      const subExerciseMatch = line.match(/^([a-z])$/);

      if (subExerciseMatch && currentMainExercise) {
        const subLetter = subExerciseMatch[1];

        // Get the title from the next few lines (look for a substantial line)
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
          exerciseId: `L1-${currentMainExercise.exerciseNumber}${subLetter}`,
          exerciseNumber: `${currentMainExercise.exerciseNumber}${subLetter}`,
          section: currentMainExercise.section,
          number: currentMainExercise.number,
          subNumber: subLetter,
          title: subTitle,
          question: '',
          answers: [],
          difficulty: 'medium',
          topic: '',
          lessonNumber: 1,
          parent: currentMainExercise.exerciseNumber,
        };

        exercises.push(subExercise);
        console.log(`  Sub-exercise ${subExercise.exerciseNumber}: ${subTitle}`);
      }
    }

    console.log(`\n\n===== SUMMARY =====`);
    console.log(`Total exercises found: ${exercises.length}`);
    console.log(`\nExercises by section:`);
    const bySection = exercises.reduce((acc, ex) => {
      const section = ex.section || 'Unknown';
      acc[section] = (acc[section] || 0) + 1;
      return acc;
    }, {});
    console.log(bySection);

    console.log(`\nMain exercises: ${exercises.filter(e => !e.parent).length}`);
    console.log(`Sub-exercises: ${exercises.filter(e => e.parent).length}`);

    // Save to JSON
    const outputPath = 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises\\a1-1-unterrichtsplan-L1.json';
    const output = {
      level: 'A1',
      book: 'Schritte International Neu 1',
      bookType: 'UP', // Unterrichtsplan
      lesson: {
        lessonNumber: 1,
        title: 'Lektion 1: Guten Tag. Mein Name ist...',
        exercises: exercises,
      },
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
