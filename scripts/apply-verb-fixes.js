const fs = require('fs');
const path = require('path');

// Load the analysis report
const reportPath = path.join(__dirname, 'smart-verb-analysis.json');

if (!fs.existsSync(reportPath)) {
  console.error('❌ Error: smart-verb-analysis.json not found!');
  console.log('Please run: node scripts/smart-verb-rearrange.js first');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Fix duplicates within the same level
function fixDuplicates() {
  console.log('🔧 FIXING DUPLICATE VERBS\n' + '═'.repeat(60));

  const withinLevel = report.duplicates.filter(d =>
    new Set(d.occurrences.map(o => o.level)).size === 1
  );

  if (withinLevel.length === 0) {
    console.log('✅ No within-level duplicates to fix!');
    return;
  }

  console.log(`Found ${withinLevel.length} duplicates within the same level.\n`);

  let fixedCount = 0;

  withinLevel.forEach(dup => {
    console.log(`\n📝 "${dup.german}" (${dup.english})`);

    // Strategy: Keep in the MORE SPECIFIC file, remove from the generic one
    // Priority: irregular-verbs > reflexive-verbs > positional-verbs > separable-verbs > intermediate-verbs

    const priority = {
      'irregular-verbs.json': 5,
      'reflexive-verbs.json': 4,
      'positional-verbs.json': 3,
      'separable-verbs.json': 2,
      'intermediate-verbs.json': 1
    };

    // Sort occurrences by priority (highest first)
    const sorted = dup.occurrences.sort((a, b) => {
      const prioA = priority[a.file] || 0;
      const prioB = priority[b.file] || 0;
      return prioB - prioA;
    });

    const keepIn = sorted[0];
    const removeFrom = sorted.slice(1);

    console.log(`  ✓ KEEP in: ${keepIn.level}/${keepIn.file}`);

    removeFrom.forEach(occ => {
      console.log(`  ✗ REMOVE from: ${occ.level}/${occ.file}`);

      const filePath = path.join(__dirname, '..', 'lib', 'data', 'vocabulary', 'split', occ.level.toLowerCase(), occ.file);

      if (fs.existsSync(filePath)) {
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const isArray = Array.isArray(rawData);
        const data = isArray ? rawData : rawData.flashcards;

        // Find and remove the duplicate
        const index = data.findIndex(item =>
          item.german && item.german.toLowerCase().trim() === dup.german
        );

        if (index !== -1) {
          data.splice(index, 1);

          // Save back
          if (isArray) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          } else {
            rawData.flashcards = data;
            rawData.totalCards = data.length;
            fs.writeFileSync(filePath, JSON.stringify(rawData, null, 2));
          }

          fixedCount++;
          console.log(`    → Removed successfully`);
        } else {
          console.log(`    ⚠️  Not found (may have been removed already)`);
        }
      }
    });
  });

  console.log(`\n✅ Fixed ${fixedCount} duplicate entries!`);
}

// Apply rearrangements (moves verbs between levels)
function applyRearrangements(options = {}) {
  const { dryRun = true, maxMoves = 10 } = options;

  console.log('\n\n🚀 APPLYING LEVEL REARRANGEMENTS\n' + '═'.repeat(60));

  if (dryRun) {
    console.log('🔵 DRY RUN MODE - No files will be modified\n');
  } else {
    console.log('🔴 LIVE MODE - Files will be modified!\n');
  }

  const suggestions = report.suggestions.slice(0, maxMoves);

  if (suggestions.length === 0) {
    console.log('✅ No rearrangements needed!');
    return;
  }

  console.log(`Processing ${suggestions.length} rearrangements (max: ${maxMoves}):\n`);

  let movedCount = 0;

  suggestions.forEach((sug, index) => {
    console.log(`\n${index + 1}. "${sug.verb}" (${sug.english})`);
    console.log(`   Move: ${sug.currentLevel} → ${sug.suggestedLevel}`);
    console.log(`   File: ${sug.currentFile}`);
    console.log(`   Reason: ${sug.reason}`);

    if (!dryRun) {
      // TODO: Implement actual move logic
      // This would:
      // 1. Read from source file (currentLevel/currentFile)
      // 2. Find the verb entry
      // 3. Remove from source
      // 4. Add to destination (suggestedLevel/appropriate-file)
      console.log('   ⚠️  Move logic not implemented yet - use manual review');
    } else {
      console.log('   ✓ Would move (dry run)');
    }
  });

  if (dryRun) {
    console.log(`\n\n💡 To apply these changes, run with --live flag`);
    console.log('   Example: node scripts/apply-verb-fixes.js --rearrange --live');
  } else {
    console.log(`\n✅ Moved ${movedCount} verbs!`);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const shouldFixDuplicates = !args.includes('--no-duplicates');
  const shouldRearrange = args.includes('--rearrange');
  const isLive = args.includes('--live');

  console.log('🔍 VERB FIXES AUTOMATION\n' + '═'.repeat(60));
  console.log(`Loaded analysis from: ${reportPath}\n`);

  if (shouldFixDuplicates) {
    fixDuplicates();
  }

  if (shouldRearrange) {
    applyRearrangements({ dryRun: !isLive, maxMoves: 20 });
  }

  if (!shouldFixDuplicates && !shouldRearrange) {
    console.log('\n💡 Usage:');
    console.log('  node scripts/apply-verb-fixes.js                  # Fix duplicates only');
    console.log('  node scripts/apply-verb-fixes.js --rearrange      # Show rearrangements (dry run)');
    console.log('  node scripts/apply-verb-fixes.js --rearrange --live  # Apply rearrangements');
    console.log('  node scripts/apply-verb-fixes.js --no-duplicates  # Skip duplicate fixes');
  }

  console.log('\n✅ Done!\n');
}

main();
