const fs = require('fs');
const path = require('path');

/**
 * Determines if a comma-separated answer should be split
 * @param {string} answer - The correctAnswer string
 * @returns {boolean}
 */
function shouldSplitAnswer(answer) {
  // Don't split if no comma
  if (!answer.includes(',')) return false;

  // Don't split if it contains colons (likely descriptive text like "Fernsehen: Krimis, ...")
  if (answer.includes(':')) return false;

  // Don't split if it's a very long text (likely a full sentence)
  if (answer.length > 100) return false;

  // Split by comma and check parts
  const parts = answer.split(',').map(p => p.trim());

  // If all parts are single characters or single digits -> split
  if (parts.every(p => p.length === 1)) return true;

  // If all parts are numbers -> split
  if (parts.every(p => /^\d+$/.test(p))) return true;

  // If all parts are short (< 25 chars) and there are 2-10 parts -> split
  if (parts.length >= 2 && parts.length <= 10 && parts.every(p => p.length < 25)) {
    // Additional check: if it contains verbs like "ist", "war", "wollen" etc, it's likely a sentence
    const sentenceIndicators = ['ist', 'war', 'waren', 'hat', 'haben', 'wird', 'werden', 'und'];
    if (sentenceIndicators.some(ind => answer.includes(` ${ind} `))) return false;

    return true;
  }

  return false;
}

/**
 * Splits a comma-separated answer into multiple answer objects
 * @param {Object} answerObj - The original answer object
 * @returns {Array} Array of split answer objects
 */
function splitAnswer(answerObj) {
  const { itemNumber, correctAnswer } = answerObj;

  if (!shouldSplitAnswer(correctAnswer)) {
    return [answerObj];
  }

  const parts = correctAnswer.split(',').map(p => p.trim());

  // Create new answer objects for each part
  return parts.map((part, index) => ({
    itemNumber: `${itemNumber}-${index + 1}`,
    correctAnswer: part
  }));
}

/**
 * Process a single lesson file
 * @param {string} filePath - Path to the lesson JSON file
 */
function processLessonFile(filePath) {
  console.log(`\nProcessing: ${path.basename(filePath)}`);

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changeCount = 0;

  // Process each exercise
  data.exercises.forEach(exercise => {
    const originalCount = exercise.answers.length;
    const newAnswers = [];

    exercise.answers.forEach(answer => {
      const splitAnswers = splitAnswer(answer);
      newAnswers.push(...splitAnswers);

      if (splitAnswers.length > 1) {
        console.log(`  ${exercise.exerciseId}: Split "${answer.correctAnswer}" into ${splitAnswers.length} parts`);
        changeCount++;
      }
    });

    exercise.answers = newAnswers;
  });

  // Write back to file
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`  Total exercises split: ${changeCount}`);

  return changeCount;
}

/**
 * Process all lesson files in a directory
 * @param {string} dirPath - Path to the directory containing lesson files
 */
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath)
    .filter(f => f.startsWith('lesson-') && f.endsWith('.json'))
    .sort();

  let totalChanges = 0;

  console.log(`Processing directory: ${dirPath}`);
  console.log(`Found ${files.length} lesson files`);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    totalChanges += processLessonFile(filePath);
  });

  console.log(`\n✅ Complete! Total exercises split: ${totalChanges}`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node split-comma-answers.js <directory>');
  console.error('Example: node split-comma-answers.js lib/data/exercises/b1-1-arbeitsbuch');
  process.exit(1);
}

const dirPath = args[0];

if (!fs.existsSync(dirPath)) {
  console.error(`Error: Directory not found: ${dirPath}`);
  process.exit(1);
}

processDirectory(dirPath);
