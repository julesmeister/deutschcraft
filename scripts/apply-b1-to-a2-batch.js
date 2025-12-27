const fs = require('fs');
const path = require('path');

// This script applies the first 15 B1 → A2 moves
// These are separable verbs based on A1/A2 base verbs

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
  if (!sourceFile) return false;

  const sourceIndex = sourceFile.data.findIndex(item =>
    item.german && item.german.toLowerCase().trim() === verb.toLowerCase().trim()
  );

  if (sourceIndex === -1) return false;

  const verbEntry = sourceFile.data[sourceIndex];
  const targetFilename = 'separable-verbs.json';
  let targetFile = readVocabFile(suggestedLevel, targetFilename);

  if (!targetFile) {
    const targetPath = path.join(vocabDir, suggestedLevel.toLowerCase(), targetFilename);
    targetFile = {
      filePath: targetPath,
      isArray: false,
      data: [],
      metadata: { level: suggestedLevel, category: 'Separable Verbs', totalCards: 0 }
    };
  }

  const targetIndex = targetFile.data.findIndex(item =>
    item.german && item.german.toLowerCase().trim() === verb.toLowerCase().trim()
  );

  if (targetIndex !== -1) {
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
  const maxMoves = 15;

  console.log('🚀 B1 → A2 BATCH MOVE\n' + '═'.repeat(60));

  if (isLive) {
    console.log('🔴 LIVE MODE - Files will be modified!\n');
  } else {
    console.log('🔵 DRY RUN MODE - Preview only\n');
  }

  const b1ToA2 = report.suggestions.filter(s =>
    s.currentLevel === 'B1' && s.suggestedLevel === 'A2'
  ).slice(0, maxMoves);

  console.log(`Processing ${b1ToA2.length} moves:\n`);

  let successCount = 0;

  b1ToA2.forEach((sug, index) => {
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
    console.log(`\nTo apply: node scripts/apply-b1-to-a2-batch.js --live`);
  }
  console.log('═'.repeat(60));
}

main();
