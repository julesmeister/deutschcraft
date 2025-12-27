const fs = require('fs');
const path = require('path');

const vocabDir = path.join(__dirname, '..', 'lib', 'data', 'vocabulary', 'split');

// Expanded list of separable prefixes (German separable verbs)
const SEPARABLE_PREFIXES = [
  'ab', 'an', 'auf', 'aus', 'ein', 'mit', 'nach', 'vor', 'zu', 'zurück',
  'weg', 'her', 'hin', 'entgegen', 'entlang', 'weiter', 'wieder', 'zusammen',
  'bei', 'empor', 'entlang', 'fort', 'gegenüber', 'heim', 'her', 'hin',
  'los', 'nieder', 'rum', 'um', 'voran', 'voraus', 'vorbei', 'vorüber',
  'durch', 'über', 'unter', 'wider' // These can be separable or inseparable
];

// Inseparable prefixes
const INSEPARABLE_PREFIXES = ['be', 'emp', 'ent', 'er', 'ge', 'miss', 'ver', 'zer'];

function isSeparable(german) {
  // Check for reflexive prefix first
  if (german.startsWith('sich ')) {
    const verb = german.substring(5);
    return SEPARABLE_PREFIXES.some(prefix => verb.startsWith(prefix));
  }

  return SEPARABLE_PREFIXES.some(prefix => german.startsWith(prefix));
}

function isInseparable(german) {
  const cleaned = german.startsWith('sich ') ? german.substring(5) : german;
  return INSEPARABLE_PREFIXES.some(prefix => cleaned.startsWith(prefix));
}

function isReflexive(german) {
  return german.includes('sich');
}

console.log('🔧 APPLYING INTERMEDIATE VERBS RECATEGORIZATION\n' + '═'.repeat(70));

// ============================================================================
// PART 1: B2 RECATEGORIZATION (35 verbs)
// ============================================================================

console.log('\n📦 B2 RECATEGORIZATION\n' + '─'.repeat(70));

const b2IntermediateFile = path.join(vocabDir, 'b2', 'intermediate-verbs.json');
const b2Data = JSON.parse(fs.readFileSync(b2IntermediateFile, 'utf-8'));

const b2Targets = {
  'verbs-with-prepositions.json': [],
  'academic.json': []
};

b2Data.flashcards.forEach(verb => {
  // Update category field
  const hasPrepositionTag = verb.tags && (
    verb.tags.includes('Akkusativ') || verb.tags.includes('Dativ')
  );

  if (hasPrepositionTag) {
    verb.category = 'Verbs with Prepositions';
    b2Targets['verbs-with-prepositions.json'].push(verb);
  } else {
    // All others (academic -ieren verbs + the 6 "other" verbs) go to academic
    verb.category = 'Academic';
    b2Targets['academic.json'].push(verb);
  }
});

console.log('B2 Distribution:');
Object.entries(b2Targets).forEach(([filename, verbs]) => {
  console.log(`  ${filename}: ${verbs.length} verbs`);
});

// ============================================================================
// PART 2: B1 RECATEGORIZATION (461 verbs)
// ============================================================================

console.log('\n\n📦 B1 RECATEGORIZATION\n' + '─'.repeat(70));

const b1IntermediateFile = path.join(vocabDir, 'b1', 'intermediate-verbs.json');
const b1Data = JSON.parse(fs.readFileSync(b1IntermediateFile, 'utf-8'));

const b1Targets = {
  'separable-verbs.json': [],
  'reflexive-verbs.json': [],
  'inseparable-prefix-verbs.json': [],
  'general-verbs.json': [] // For remaining uncategorized verbs
};

b1Data.flashcards.forEach(verb => {
  const german = verb.german;

  // Priority: Reflexive > Separable > Inseparable > General
  if (isReflexive(german)) {
    verb.category = 'Reflexive Verbs';
    b1Targets['reflexive-verbs.json'].push(verb);
  } else if (isSeparable(german)) {
    verb.category = 'Separable Verbs';
    b1Targets['separable-verbs.json'].push(verb);
  } else if (isInseparable(german)) {
    verb.category = 'Inseparable Prefix Verbs';
    b1Targets['inseparable-prefix-verbs.json'].push(verb);
  } else {
    verb.category = 'General Verbs';
    b1Targets['general-verbs.json'].push(verb);
  }
});

console.log('B1 Distribution:');
Object.entries(b1Targets).forEach(([filename, verbs]) => {
  console.log(`  ${filename}: ${verbs.length} verbs`);
});

// ============================================================================
// WRITE FILES
// ============================================================================

console.log('\n\n💾 WRITING FILES\n' + '─'.repeat(70));

const args = process.argv.slice(2);
const isLive = args.includes('--live');

if (!isLive) {
  console.log('🔍 DRY RUN MODE (use --live to apply changes)\n');
}

// Function to merge verbs into existing file
function mergeIntoFile(level, filename, newVerbs, categoryName) {
  const filePath = path.join(vocabDir, level, filename);

  if (fs.existsSync(filePath)) {
    // File exists - merge
    const existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const existingVerbs = existingData.flashcards || [];

    // Check for duplicates
    const existingIds = new Set(existingVerbs.map(v => v.id));
    const newUniqueVerbs = newVerbs.filter(v => !existingIds.has(v.id));

    if (newUniqueVerbs.length < newVerbs.length) {
      console.log(`  ⚠️  ${level}/${filename}: ${newVerbs.length - newUniqueVerbs.length} duplicates found (skipping)`);
    }

    const mergedFlashcards = [...existingVerbs, ...newUniqueVerbs];
    const updatedData = {
      ...existingData,
      totalCards: mergedFlashcards.length,
      flashcards: mergedFlashcards
    };

    if (isLive) {
      fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
      console.log(`  ✅ ${level}/${filename}: Added ${newUniqueVerbs.length} verbs (total: ${mergedFlashcards.length})`);
    } else {
      console.log(`  📋 ${level}/${filename}: Would add ${newUniqueVerbs.length} verbs (total: ${mergedFlashcards.length})`);
    }
  } else {
    // File doesn't exist - create new
    const newData = {
      level: level.toUpperCase(),
      category: categoryName,
      totalCards: newVerbs.length,
      flashcards: newVerbs
    };

    if (isLive) {
      fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
      console.log(`  ✅ ${level}/${filename}: Created new file with ${newVerbs.length} verbs`);
    } else {
      console.log(`  📋 ${level}/${filename}: Would create new file with ${newVerbs.length} verbs`);
    }
  }
}

// Apply B2 changes
console.log('\nB2 Changes:');
Object.entries(b2Targets).forEach(([filename, verbs]) => {
  if (verbs.length > 0) {
    const categoryName = verbs[0].category;
    mergeIntoFile('b2', filename, verbs, categoryName);
  }
});

// Apply B1 changes
console.log('\nB1 Changes:');
Object.entries(b1Targets).forEach(([filename, verbs]) => {
  if (verbs.length > 0) {
    const categoryName = verbs[0].category;
    mergeIntoFile('b1', filename, verbs, categoryName);
  }
});

// Delete intermediate-verbs.json files
console.log('\n\n🗑️  CLEANUP\n' + '─'.repeat(70));

if (isLive) {
  fs.unlinkSync(b2IntermediateFile);
  console.log('  ✅ Deleted: b2/intermediate-verbs.json');

  fs.unlinkSync(b1IntermediateFile);
  console.log('  ✅ Deleted: b1/intermediate-verbs.json');
} else {
  console.log('  📋 Would delete: b2/intermediate-verbs.json');
  console.log('  📋 Would delete: b1/intermediate-verbs.json');
}

console.log('\n\n' + '═'.repeat(70));
if (isLive) {
  console.log('✅ RECATEGORIZATION COMPLETE!\n');
  console.log('Next steps:');
  console.log('  1. Review the new files');
  console.log('  2. Run: npx tsx scripts/merge-flashcards.ts');
  console.log('  3. Commit changes\n');
} else {
  console.log('🔍 DRY RUN COMPLETE - Review above and run with --live to apply\n');
}
