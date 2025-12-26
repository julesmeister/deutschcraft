const fs = require('fs');
const path = require('path');

const exercisesDir = 'C:\\Users\\User\\Documents\\testmanship-web-v2\\lib\\data\\exercises';

// Read both files
const arbeitsbuchPath = path.join(exercisesDir, 'a1-1-arbeitsbuch.json');
const unterrichtsplanPath = path.join(exercisesDir, 'a1-1-unterrichtsplan.json');

const arbeitsbuch = JSON.parse(fs.readFileSync(arbeitsbuchPath, 'utf8'));
const unterrichtsplan = JSON.parse(fs.readFileSync(unterrichtsplanPath, 'utf8'));

console.log('=== Before Merge ===');
arbeitsbuch.lessons.forEach(lesson => {
  console.log(`Lektion ${lesson.lessonNumber} (AB): ${lesson.exercises.length} exercises`);
});

// Merge exercises from unterrichtsplan into arbeitsbuch
// For each lesson in unterrichtsplan, add exercises to the corresponding arbeitsbuch lesson
unterrichtsplan.lessons.forEach(upLesson => {
  const abLesson = arbeitsbuch.lessons.find(l => l.lessonNumber === upLesson.lessonNumber);

  if (abLesson) {
    // Add all exercises from UP to AB
    upLesson.exercises.forEach(exercise => {
      abLesson.exercises.push(exercise);
    });

    console.log(`✓ Merged ${upLesson.exercises.length} exercises into Lektion ${upLesson.lessonNumber}`);
  }
});

console.log('\n=== After Merge ===');
arbeitsbuch.lessons.forEach(lesson => {
  console.log(`Lektion ${lesson.lessonNumber} (AB): ${lesson.exercises.length} exercises`);
});

// Save the merged arbeitsbuch
fs.writeFileSync(arbeitsbuchPath, JSON.stringify(arbeitsbuch, null, 2));

const totalExercises = arbeitsbuch.lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0);
console.log(`\n✓ Saved merged arbeitsbuch with ${totalExercises} total exercises`);

// Delete the unterrichtsplan file since it's now merged
fs.unlinkSync(unterrichtsplanPath);
console.log('✓ Deleted a1-1-unterrichtsplan.json');
