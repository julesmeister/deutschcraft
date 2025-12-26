/**
 * Test script to verify combined lesson loading
 */

// Simulate the hook logic
const a11AB = require('../lib/data/exercises/a1-1-arbeitsbuch.json');
const a12AB = require('../lib/data/exercises/a1-2-arbeitsbuch.json');
const a21AB = require('../lib/data/exercises/a2-1-arbeitsbuch.json');
const a22AB = require('../lib/data/exercises/a2-2-arbeitsbuch.json');

const exerciseDataMap = {
  'A1-1-AB': a11AB,
  'A1-2-AB': a12AB,
  'A2-1-AB': a21AB,
  'A2-2-AB': a22AB,
};

function getExerciseBookKey(level, subLevel, bookType) {
  return `${level}-${subLevel}-${bookType}`;
}

function testCombinedLoad(level, bookType) {
  const book1Key = getExerciseBookKey(level, '1', bookType);
  const book2Key = getExerciseBookKey(level, '2', bookType);

  const book1 = exerciseDataMap[book1Key];
  const book2 = exerciseDataMap[book2Key];

  const allLessons = [
    ...(book1?.lessons || []),
    ...(book2?.lessons || []),
  ];

  const lessonNumbers = allLessons.map(l => l.lessonNumber);
  const totalExercises = allLessons.reduce((sum, l) => sum + l.exercises.length, 0);

  console.log(`\n${level} ${bookType}:`);
  console.log(`  Found ${allLessons.length} lessons: ${lessonNumbers.join(', ')}`);
  console.log(`  Total exercises: ${totalExercises}`);
}

console.log('\n📚 Testing Combined Lesson Loading\n');
console.log('='.repeat(60));

testCombinedLoad('A1', 'AB');
testCombinedLoad('A2', 'AB');

console.log('\n' + '='.repeat(60));
console.log('\n✅ If A1 shows lessons 1-14 and A2 shows 1-14, the fix works!\n');
