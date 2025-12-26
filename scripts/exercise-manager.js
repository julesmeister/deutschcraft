#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const EXERCISES_DIR = path.join(__dirname, '../lib/data/exercises');

// Helper to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// List all exercise files
function listExerciseFiles() {
  const files = fs.readdirSync(EXERCISES_DIR).filter(f => f.endsWith('.json'));
  console.log('\n📚 Available Exercise Files:');
  files.forEach((file, idx) => {
    console.log(`  ${idx + 1}. ${file}`);
  });
  return files;
}

// Load JSON file
function loadExerciseFile(filename) {
  const filePath = path.join(EXERCISES_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

// Save JSON file
function saveExerciseFile(filename, data) {
  const filePath = path.join(EXERCISES_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Saved ${filename}`);
}

// Display lesson summary
function displayLessons(data) {
  console.log(`\n📖 Level: ${data.level}.${data.subLevel} - Book: ${data.bookType}`);
  console.log(`\nLessons (${data.lessons.length} total):`);
  data.lessons.forEach((lesson, idx) => {
    console.log(`  ${idx + 1}. Lektion ${lesson.lessonNumber}: ${lesson.title} (${lesson.exercises.length} exercises)`);
  });
}

// Display exercises in a lesson
function displayExercises(lesson) {
  console.log(`\n📝 Exercises in "${lesson.title}":`);
  lesson.exercises.forEach((ex, idx) => {
    console.log(`  ${idx + 1}. ${ex.exerciseId} - ${ex.title} (${ex.answers.length} answers)`);
  });
}

// Add new exercise
async function addExercise(lesson, data) {
  console.log('\n➕ Adding New Exercise');

  const exerciseNumber = await ask('Exercise Number (e.g., "A1" or "1"): ');
  const section = await ask('Section (e.g., "Schritt A"): ');
  const title = await ask('Title: ');
  const difficulty = await ask('Difficulty (easy/medium/hard) [medium]: ') || 'medium';

  const exerciseId = `${data.level}.${data.subLevel}-L${lesson.lessonNumber}-${data.bookType}-${exerciseNumber}`;

  const newExercise = {
    exerciseId,
    level: data.level,
    bookType: data.bookType,
    lessonNumber: lesson.lessonNumber,
    exerciseNumber,
    section,
    title,
    answers: [],
    difficulty
  };

  // Add answers
  console.log('\n📋 Adding Answers (type "done" when finished)');
  while (true) {
    const itemNumber = await ask('Item Number (or "done"): ');
    if (itemNumber.toLowerCase() === 'done') break;

    const correctAnswer = await ask('Correct Answer: ');
    newExercise.answers.push({ itemNumber, correctAnswer });
  }

  lesson.exercises.push(newExercise);
  console.log(`✅ Added exercise: ${exerciseId}`);
  return true;
}

// Edit existing exercise
async function editExercise(exercise) {
  console.log(`\n✏️ Editing: ${exercise.exerciseId}`);
  console.log('\n1. Edit Title');
  console.log('2. Edit Section');
  console.log('3. Edit Difficulty');
  console.log('4. Edit Answers');
  console.log('5. Back');

  const choice = await ask('\nChoice: ');

  switch (choice) {
    case '1':
      exercise.title = await ask(`New Title [${exercise.title}]: `) || exercise.title;
      break;
    case '2':
      exercise.section = await ask(`New Section [${exercise.section}]: `) || exercise.section;
      break;
    case '3':
      exercise.difficulty = await ask(`New Difficulty [${exercise.difficulty}]: `) || exercise.difficulty;
      break;
    case '4':
      await editAnswers(exercise);
      break;
    case '5':
      return false;
  }
  return true;
}

// Edit answers
async function editAnswers(exercise) {
  while (true) {
    console.log(`\n📋 Current Answers (${exercise.answers.length} total):`);
    exercise.answers.forEach((ans, idx) => {
      console.log(`  ${idx + 1}. ${ans.itemNumber}: ${ans.correctAnswer.substring(0, 50)}...`);
    });

    console.log('\n1. Add Answer');
    console.log('2. Edit Answer');
    console.log('3. Delete Answer');
    console.log('4. Back');

    const choice = await ask('\nChoice: ');

    if (choice === '1') {
      const itemNumber = await ask('Item Number: ');
      const correctAnswer = await ask('Correct Answer: ');
      exercise.answers.push({ itemNumber, correctAnswer });
    } else if (choice === '2') {
      const idx = parseInt(await ask('Answer # to edit: ')) - 1;
      if (idx >= 0 && idx < exercise.answers.length) {
        exercise.answers[idx].itemNumber = await ask(`Item Number [${exercise.answers[idx].itemNumber}]: `) || exercise.answers[idx].itemNumber;
        exercise.answers[idx].correctAnswer = await ask(`Correct Answer [${exercise.answers[idx].correctAnswer}]: `) || exercise.answers[idx].correctAnswer;
      }
    } else if (choice === '3') {
      const idx = parseInt(await ask('Answer # to delete: ')) - 1;
      if (idx >= 0 && idx < exercise.answers.length) {
        exercise.answers.splice(idx, 1);
        console.log('✅ Deleted');
      }
    } else if (choice === '4') {
      break;
    }
  }
}

// Delete exercise
async function deleteExercise(lesson, exerciseIdx) {
  const confirm = await ask('⚠️ Are you sure? (yes/no): ');
  if (confirm.toLowerCase() === 'yes') {
    lesson.exercises.splice(exerciseIdx, 1);
    console.log('✅ Deleted');
    return true;
  }
  return false;
}

// Manage lesson
async function manageLesson(data, lessonIdx, filename) {
  const lesson = data.lessons[lessonIdx];

  while (true) {
    displayExercises(lesson);

    console.log('\n📌 Actions:');
    console.log('1. Add Exercise');
    console.log('2. Edit Exercise');
    console.log('3. Delete Exercise');
    console.log('4. Back to Lessons');
    console.log('5. Save & Exit');

    const choice = await ask('\nChoice: ');

    switch (choice) {
      case '1':
        await addExercise(lesson, data);
        break;
      case '2':
        const editIdx = parseInt(await ask('Exercise # to edit: ')) - 1;
        if (editIdx >= 0 && editIdx < lesson.exercises.length) {
          await editExercise(lesson.exercises[editIdx]);
        }
        break;
      case '3':
        const delIdx = parseInt(await ask('Exercise # to delete: ')) - 1;
        if (delIdx >= 0 && delIdx < lesson.exercises.length) {
          await deleteExercise(lesson, delIdx);
        }
        break;
      case '4':
        return false;
      case '5':
        saveExerciseFile(filename, data);
        return true;
    }
  }
}

// Main menu
async function mainMenu() {
  const files = listExerciseFiles();

  const fileChoice = await ask('\nSelect file # (or "exit"): ');
  if (fileChoice.toLowerCase() === 'exit') {
    rl.close();
    return;
  }

  const fileIdx = parseInt(fileChoice) - 1;
  if (fileIdx < 0 || fileIdx >= files.length) {
    console.log('❌ Invalid choice');
    return mainMenu();
  }

  const filename = files[fileIdx];
  const data = loadExerciseFile(filename);

  while (true) {
    displayLessons(data);

    console.log('\n📌 Actions:');
    console.log('1. Manage Lesson');
    console.log('2. Save Changes');
    console.log('3. Back to File List');
    console.log('4. Exit');

    const choice = await ask('\nChoice: ');

    switch (choice) {
      case '1':
        const lessonIdx = parseInt(await ask('Lesson #: ')) - 1;
        if (lessonIdx >= 0 && lessonIdx < data.lessons.length) {
          const shouldExit = await manageLesson(data, lessonIdx, filename);
          if (shouldExit) {
            rl.close();
            return;
          }
        }
        break;
      case '2':
        saveExerciseFile(filename, data);
        break;
      case '3':
        return mainMenu();
      case '4':
        const save = await ask('Save changes? (yes/no): ');
        if (save.toLowerCase() === 'yes') {
          saveExerciseFile(filename, data);
        }
        rl.close();
        return;
    }
  }
}

// Start
console.log('🎓 Exercise Manager for Testmanship');
console.log('====================================\n');
mainMenu().catch(err => {
  console.error('Error:', err);
  rl.close();
});
