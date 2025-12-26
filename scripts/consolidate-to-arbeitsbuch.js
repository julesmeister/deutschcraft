const fs = require('fs');

/**
 * Consolidate Unterrichtsplan files to Arbeitsbuch format
 * Changes bookType from "UP" to "AB" and saves to new files
 */

const files = [
  {
    input: 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises\\a1-2-unterrichtsplan.json',
    output: 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises\\a1-2-arbeitsbuch.json',
    level: 'A1',
    subLevel: '2',
  },
  {
    input: 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises\\a2-1-unterrichtsplan.json',
    output: 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises\\a2-1-arbeitsbuch.json',
    level: 'A2',
    subLevel: '1',
  },
  {
    input: 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises\\a2-2-unterrichtsplan.json',
    output: 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises\\a2-2-arbeitsbuch.json',
    level: 'A2',
    subLevel: '2',
  },
];

files.forEach(({ input, output, level, subLevel }) => {
  try {
    console.log(`\nProcessing ${input}...`);

    // Read the UP file
    const data = JSON.parse(fs.readFileSync(input, 'utf8'));

    // Change bookType from UP to AB
    data.bookType = 'AB';

    // Ensure level and subLevel are correct
    data.level = level;
    data.subLevel = subLevel;

    // Write to AB file
    fs.writeFileSync(output, JSON.stringify(data, null, 2));

    console.log(`✅ Created ${output}`);
    console.log(`   Level: ${data.level}.${data.subLevel}`);
    console.log(`   Lessons: ${data.lessons.length}`);
    console.log(`   Total exercises: ${data.lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0)}`);

  } catch (error) {
    console.error(`❌ Error processing ${input}:`, error.message);
  }
});

console.log('\n✅ Consolidation complete!');
