const fs = require('fs');
const path = require('path');

const exercisesDir = 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises';

console.log('\n📚 Exercise Files Summary\n');
console.log('=' .repeat(80));

const files = fs.readdirSync(exercisesDir)
  .filter(f => f.endsWith('-arbeitsbuch.json'))
  .sort();

files.forEach(file => {
  const filePath = path.join(exercisesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const lessonNumbers = data.lessons.map(l => l.lessonNumber);
  const minLesson = Math.min(...lessonNumbers);
  const maxLesson = Math.max(...lessonNumbers);
  const totalExercises = data.lessons.reduce((sum, l) => sum + l.exercises.length, 0);

  console.log(`${file.padEnd(30)} ${data.level}.${data.subLevel}  Lessons ${minLesson}-${maxLesson}  (${data.lessons.length} lessons, ${totalExercises} exercises)`);
});

console.log('=' .repeat(80));
console.log('\n✅ All files ready for Answer Hub!\n');
