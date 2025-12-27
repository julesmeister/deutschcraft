const fs = require('fs');
const path = require('path');

// Load the analysis report
const reportPath = path.join(__dirname, 'smart-verb-analysis.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

const vocabDir = path.join(__dirname, '..', 'lib', 'data', 'vocabulary', 'split');

// Helper: Read a vocab file
function readVocabFile(level, filename) {
  const filePath = path.join(vocabDir, level.toLowerCase(), filename);
  if (!fs.existsSync(filePath)) return null;

  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const isArray = Array.isArray(rawData);

  return {
    filePath,
    isArray,
    data: isArray ? rawData : rawData.flashcards,
    metadata: isArray ? {} : {
      level: rawData.level,
      category: rawData.category,
      totalCards: rawData.totalCards
    }
  };
}

// Helper: Write a vocab file
function writeVocabFile(fileInfo) {
  if (fileInfo.isArray) {
    fs.writeFileSync(fileInfo.filePath, JSON.stringify(fileInfo.data, null, 2));
  } else {
    const output = {
      level: fileInfo.metadata.level,
      category: fileInfo.metadata.category,
      totalCards: fileInfo.data.length,
      flashcards: fileInfo.data
    };
    fs.writeFileSync(fileInfo.filePath, JSON.stringify(output, null, 2));
  }
}

// Helper: Find verb in data
function findVerbIndex(data, german) {
  return data.findIndex(item =>
    item.german && item.german.toLowerCase().trim() === german.toLowerCase().trim()
  );
}

// Helper: Determine target file based on verb characteristics
function determineTargetFile(verb, targetLevel, suggestion) {
  // Use the same category file if it exists at target level
  const sameFile = readVocabFile(targetLevel, suggestion.currentFile);
  if (sameFile) return suggestion.currentFile;

  // Map to appropriate file based on verb type
  const verbObj = report.verbsByLevel[suggestion.currentLevel.toUpperCase()]?.find(
    v => v.german === suggestion.verb
  );

  if (!verbObj) return 'common-verbs.json'; // Fallback

  // Decision tree for target file
  if (verbObj.isReflexive) return 'reflexive-verbs.json';
  if (verbObj.isSeparable) return 'separable-verbs.json';

  // Check if irregular (common pattern: stem-changing verbs)
  const irregularPatterns = ['irregular', 'modal'];
  if (irregularPatterns.some(p => suggestion.currentFile.includes(p))) {
    return 'irregular-verbs.json';
  }

  // Default mappings
  const targetFiles = {
    a1: 'basic-verbs.json',
    a2: 'common-verbs.json',
    b1: 'intermediate-verbs.json',
    b2: 'intermediate-verbs.json'
  };

  return targetFiles[targetLevel.toLowerCase()] || 'common-verbs.json';
}

// Move a single verb
function moveVerb(suggestion, dryRun = true) {
  const { verb, currentLevel, suggestedLevel, currentFile } = suggestion;

  // Read source file
  const sourceFile = readVocabFile(currentLevel, currentFile);
  if (!sourceFile) {
    console.log(`    ❌ Source file not found: ${currentLevel}/${currentFile}`);
    return false;
  }

  // Find verb in source
  const sourceIndex = findVerbIndex(sourceFile.data, verb);
  if (sourceIndex === -1) {
    console.log(`    ⚠️  Verb not found in source file (may have been moved already)`);
    return false;
  }

  const verbEntry = sourceFile.data[sourceIndex];

  // Determine target file
  const targetFilename = determineTargetFile(verb, suggestedLevel, suggestion);
  let targetFile = readVocabFile(suggestedLevel, targetFilename);

  // Create target file if it doesn't exist
  if (!targetFile) {
    const targetPath = path.join(vocabDir, suggestedLevel.toLowerCase(), targetFilename);
    targetFile = {
      filePath: targetPath,
      isArray: false,
      data: [],
      metadata: {
        level: suggestedLevel,
        category: targetFilename.replace('.json', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        totalCards: 0
      }
    };
    console.log(`    📁 Will create new file: ${suggestedLevel}/${targetFilename}`);
  }

  // Check if verb already exists in target
  const targetIndex = findVerbIndex(targetFile.data, verb);
  if (targetIndex !== -1) {
    console.log(`    ⚠️  Verb already exists in target, removing from source only`);
    if (!dryRun) {
      sourceFile.data.splice(sourceIndex, 1);
      writeVocabFile(sourceFile);
    }
    return true;
  }

  if (dryRun) {
    console.log(`    ✓ Would move from ${currentLevel}/${currentFile} → ${suggestedLevel}/${targetFilename}`);
    return true;
  }

  // Execute the move
  // 1. Update verb's level metadata
  if (verbEntry.level) verbEntry.level = suggestedLevel;

  // 2. Remove from source
  sourceFile.data.splice(sourceIndex, 1);

  // 3. Add to target
  targetFile.data.push(verbEntry);

  // 4. Write both files
  writeVocabFile(sourceFile);
  writeVocabFile(targetFile);

  console.log(`    ✅ Moved to ${suggestedLevel}/${targetFilename}`);
  return true;
}

// Apply rearrangements with filters
function applyRearrangements(options = {}) {
  const {
    dryRun = true,
    filter = null, // e.g., 'A2 → A1', 'A1 → A2'
    maxMoves = 50,
    autoApprove = false
  } = options;

  console.log('\n🚀 APPLYING VERB REARRANGEMENTS\n' + '═'.repeat(60));

  if (dryRun) {
    console.log('🔵 DRY RUN MODE - No files will be modified\n');
  } else {
    console.log('🔴 LIVE MODE - Files will be modified!\n');
  }

  let suggestions = report.suggestions;

  // Apply filter
  if (filter) {
    suggestions = suggestions.filter(s =>
      `${s.currentLevel} → ${s.suggestedLevel}` === filter
    );
    console.log(`Filter: "${filter}" - ${suggestions.length} suggestions\n`);
  }

  suggestions = suggestions.slice(0, maxMoves);

  if (suggestions.length === 0) {
    console.log('✅ No rearrangements to apply with current filters!');
    return;
  }

  console.log(`Processing ${suggestions.length} rearrangements:\n`);

  let successCount = 0;
  const groups = {};

  // Group by move type
  suggestions.forEach(s => {
    const key = `${s.currentLevel} → ${s.suggestedLevel}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  // Process each group
  Object.keys(groups).forEach(moveType => {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`${moveType} (${groups[moveType].length} verbs)`);
    console.log('─'.repeat(60));

    groups[moveType].forEach((sug, index) => {
      console.log(`\n${index + 1}. "${sug.verb}" (${sug.english})`);
      console.log(`   Reason: ${sug.reason}`);

      if (moveVerb(sug, dryRun)) {
        successCount++;
      }
    });
  });

  console.log(`\n\n${'═'.repeat(60)}`);
  if (dryRun) {
    console.log(`💡 DRY RUN SUMMARY: ${successCount} verbs ready to move`);
    console.log(`\nTo apply these changes:`);
    console.log(`  node scripts/apply-rearrangements.js --live`);
    if (filter) {
      console.log(`  node scripts/apply-rearrangements.js --live --filter "${filter}"`);
    }
  } else {
    console.log(`✅ Successfully moved ${successCount} verbs!`);
  }
  console.log('═'.repeat(60));
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const isLive = args.includes('--live');
  const filterIndex = args.indexOf('--filter');
  const filter = filterIndex !== -1 ? args[filterIndex + 1] : null;

  console.log('🔍 VERB REARRANGEMENT TOOL\n' + '═'.repeat(60));
  console.log(`Loaded analysis from: ${reportPath}\n`);

  // Show available move types
  const moveTypes = {};
  report.suggestions.forEach(s => {
    const key = `${s.currentLevel} → ${s.suggestedLevel}`;
    moveTypes[key] = (moveTypes[key] || 0) + 1;
  });

  console.log('📊 Available move types:');
  Object.entries(moveTypes).forEach(([move, count]) => {
    console.log(`   ${move}: ${count} verbs`);
  });

  applyRearrangements({ dryRun: !isLive, filter, maxMoves: 100 });

  console.log('\n✅ Done!\n');
}

main();
