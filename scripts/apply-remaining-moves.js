const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'smart-verb-analysis.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
const vocabDir = path.join(__dirname, '..', 'lib', 'data', 'vocabulary', 'split');

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

function moveVerb(suggestion, dryRun) {
  const { verb, currentLevel, suggestedLevel, currentFile } = suggestion;

  const sourceFile = readVocabFile(currentLevel, currentFile);
  if (!sourceFile) {
    console.log(`    ⚠️  Source file not found`);
    return false;
  }

  const sourceIndex = sourceFile.data.findIndex(item =>
    item.german && item.german.toLowerCase().trim() === verb.toLowerCase().trim()
  );

  if (sourceIndex === -1) {
    console.log(`    ⚠️  Not found (already moved)`);
    return false;
  }

  const verbEntry = sourceFile.data[sourceIndex];

  // Determine target file based on verb type
  let targetFilename = 'separable-verbs.json';
  if (verbEntry.german.includes('sich')) {
    targetFilename = 'reflexive-verbs.json';
  }

  let targetFile = readVocabFile(suggestedLevel, targetFilename);

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
  }

  // Check if already in target
  const targetIndex = targetFile.data.findIndex(item =>
    item.german && item.german.toLowerCase().trim() === verb.toLowerCase().trim()
  );

  if (targetIndex !== -1) {
    console.log(`    ⚠️  Already in target, removing from source`);
    if (!dryRun) {
      sourceFile.data.splice(sourceIndex, 1);
      writeVocabFile(sourceFile);
    }
    return true;
  }

  if (dryRun) {
    console.log(`    ✓ Would move to ${suggestedLevel}/${targetFilename}`);
    return true;
  }

  if (verbEntry.level) verbEntry.level = suggestedLevel;
  sourceFile.data.splice(sourceIndex, 1);
  targetFile.data.push(verbEntry);
  writeVocabFile(sourceFile);
  writeVocabFile(targetFile);

  console.log(`    ✅ Moved to ${suggestedLevel}/${targetFilename}`);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const isLive = args.includes('--live');
  const moveType = args.includes('--c-levels') ? 'c-levels' : 'b1-a2';

  console.log('🚀 APPLYING REMAINING REARRANGEMENTS\n' + '═'.repeat(60));

  if (isLive) {
    console.log('🔴 LIVE MODE - Files will be modified!\n');
  } else {
    console.log('🔵 DRY RUN MODE - Preview only\n');
  }

  let suggestions = [];

  if (moveType === 'c-levels') {
    // Apply C1/C2 → A2 moves
    suggestions = report.suggestions.filter(s =>
      (s.currentLevel === 'C1' || s.currentLevel === 'C2') && s.suggestedLevel === 'A2'
    );
    console.log(`📋 C-levels to A2 moves: ${suggestions.length}\n`);
  } else {
    // Apply remaining B1 → A2 moves
    suggestions = report.suggestions.filter(s =>
      s.currentLevel === 'B1' && s.suggestedLevel === 'A2'
    );
    console.log(`📋 Remaining B1 → A2 moves: ${suggestions.length}\n`);
  }

  if (suggestions.length === 0) {
    console.log('✅ No suggestions to apply!');
    return;
  }

  let successCount = 0;

  suggestions.forEach((sug, index) => {
    console.log(`${index + 1}. "${sug.verb}" (${sug.english})`);
    console.log(`   Reason: ${sug.reason}`);

    if (moveVerb(sug, !isLive)) {
      successCount++;
    }
  });

  console.log(`\n${'═'.repeat(60)}`);
  if (isLive) {
    console.log(`✅ Successfully moved ${successCount} verbs!`);
  } else {
    console.log(`💡 DRY RUN: ${successCount} verbs ready to move`);
    console.log(`\nTo apply:`);
    if (moveType === 'c-levels') {
      console.log('  node scripts/apply-remaining-moves.js --c-levels --live');
    } else {
      console.log('  node scripts/apply-remaining-moves.js --live');
    }
  }
  console.log('═'.repeat(60));
}

main();
