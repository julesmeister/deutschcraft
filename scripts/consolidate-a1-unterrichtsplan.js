const fs = require('fs');
const path = require('path');

const exercisesDir = 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises';

// Read the consolidated file
const allFilePath = path.join(exercisesDir, 'a1-1-unterrichtsplan-all.json');
const data = JSON.parse(fs.readFileSync(allFilePath, 'utf8'));

// Restructure to match arbeitsbuch format
const output = {
  level: "A1",
  subLevel: "1",
  bookType: "UP", // UP = Unterrichtsplan (Teacher's Guide)
  lessons: data.lessons
};

// Write the consolidated file with the new name
const newFilePath = path.join(exercisesDir, 'a1-1-unterrichtsplan.json');
fs.writeFileSync(newFilePath, JSON.stringify(output, null, 2));
console.log('✓ Created consolidated file: a1-1-unterrichtsplan.json');

// Delete the old files
const filesToDelete = [
  'a1-1-unterrichtsplan-all.json',
  'a1-1-unterrichtsplan-L1.json',
  'a1-1-unterrichtsplan-L2.json',
  'a1-1-unterrichtsplan-L3.json',
  'a1-1-unterrichtsplan-L4.json',
  'a1-1-unterrichtsplan-L5.json',
  'a1-1-unterrichtsplan-L6.json',
  'a1-1-unterrichtsplan-L7.json'
];

filesToDelete.forEach(filename => {
  const filePath = path.join(exercisesDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✓ Deleted: ${filename}`);
  }
});

console.log('\n✓ Consolidation complete!');
console.log(`Total exercises: ${output.lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0)}`);
console.log(`Total lessons: ${output.lessons.length}`);
