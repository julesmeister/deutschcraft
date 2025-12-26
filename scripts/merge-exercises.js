#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const EXERCISES_DIR = path.join(__dirname, '../lib/data/exercises');

/**
 * Merge split lesson files back into a single JSON file
 * Example: b1-1-arbeitsbuch/lesson-*.json → b1-1-arbeitsbuch.json
 */
function mergeExerciseFolder(folderName) {
  console.log(`\n📚 Merging ${folderName}...`);

  const folderPath = path.join(EXERCISES_DIR, folderName);

  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder not found: ${folderName}`);
    process.exit(1);
  }

  // Read metadata
  const metadataPath = path.join(folderPath, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    console.error(`❌ metadata.json not found in ${folderName}/`);
    process.exit(1);
  }

  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  console.log(`📖 Level: ${metadata.level}.${metadata.subLevel} - ${metadata.bookType}`);

  // Find all lesson files
  const lessonFiles = fs.readdirSync(folderPath)
    .filter(f => f.startsWith('lesson-') && f.endsWith('.json'))
    .sort((a, b) => {
      // Extract lesson number and sort numerically
      const numA = parseInt(a.match(/lesson-(\d+)\.json/)[1]);
      const numB = parseInt(b.match(/lesson-(\d+)\.json/)[1]);
      return numA - numB;
    });

  if (lessonFiles.length === 0) {
    console.error(`❌ No lesson files found in ${folderName}/`);
    process.exit(1);
  }

  console.log(`📝 Found ${lessonFiles.length} lesson files`);

  // Read and combine all lessons
  const lessons = [];
  lessonFiles.forEach((file) => {
    const lessonPath = path.join(folderPath, file);
    const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));

    console.log(`  ✅ ${file}: ${lesson.title} (${lesson.exercises.length} exercises)`);
    lessons.push(lesson);
  });

  // Create merged data
  const mergedData = {
    level: metadata.level,
    subLevel: metadata.subLevel,
    bookType: metadata.bookType,
    lessons: lessons
  };

  // Validate
  const totalExercises = lessons.reduce((sum, l) => sum + l.exercises.length, 0);
  console.log(`\n📊 Total: ${lessons.length} lessons, ${totalExercises} exercises`);

  // Save merged file
  const outputFilename = `${folderName}.json`;
  const outputPath = path.join(EXERCISES_DIR, outputFilename);

  fs.writeFileSync(
    outputPath,
    JSON.stringify(mergedData, null, 2),
    'utf8'
  );

  console.log(`\n✨ Successfully merged into ${outputFilename}!`);
  console.log(`📁 Location: lib/data/exercises/${outputFilename}\n`);

  return outputPath;
}

/**
 * Merge all split folders in exercises directory
 */
function mergeAll() {
  console.log('\n📚 Merging all split exercise folders...\n');

  const items = fs.readdirSync(EXERCISES_DIR);
  const folders = items.filter(item => {
    const itemPath = path.join(EXERCISES_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });

  if (folders.length === 0) {
    console.log('ℹ️  No split folders found.');
    return;
  }

  console.log(`Found ${folders.length} folder(s):\n`);
  folders.forEach(folder => {
    try {
      mergeExerciseFolder(folder);
    } catch (error) {
      console.error(`❌ Error merging ${folder}:`, error.message);
    }
  });
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--all') {
  mergeAll();
} else {
  const folderName = args[0].replace('.json', '').replace(/\/$/, '');
  mergeExerciseFolder(folderName);
}
