const fs = require('fs');
const path = require('path');

// Load the analysis report
const reportPath = path.join(__dirname, 'smart-verb-analysis.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Fix cross-level duplicates
function fixCrossLevelDuplicates() {
  console.log('🔧 FIXING CROSS-LEVEL DUPLICATE VERBS\n' + '═'.repeat(60));

  const crossLevel = report.duplicates.filter(d =>
    new Set(d.occurrences.map(o => o.level)).size > 1
  );

  if (crossLevel.length === 0) {
    console.log('✅ No cross-level duplicates to fix!');
    return;
  }

  console.log(`Found ${crossLevel.length} duplicates across different levels.\n`);

  let fixedCount = 0;

  crossLevel.forEach(dup => {
    console.log(`\n📝 "${dup.german}" (${dup.english})`);
    console.log(`   Found in: ${dup.occurrences.map(o => o.level).join(', ')}`);

    // Strategy for cross-level duplicates:
    // - Keep in the LOWER level (verbs progress upward)
    // - Exception: If higher level has more specific categorization, keep both but note it
    // - For A2/B1 positional verbs: these are typically body movements, keep in A2

    const levelOrder = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
    const sorted = dup.occurrences.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

    const keepIn = sorted[0]; // Keep in lowest level
    const removeFrom = sorted.slice(1);

    // Special case: positional verbs in B1 are probably redundant if they exist in A2
    const shouldRemove = removeFrom.filter(occ => {
      // Remove from B1 if it's in positional-verbs and exists in A2
      if (occ.level === 'B1' && occ.file === 'positional-verbs.json' && keepIn.level === 'A2') {
        return true;
      }
      return false;
    });

    if (shouldRemove.length === 0) {
      console.log(`   ⚠️  Manual review needed - keeping in all levels for now`);
      return;
    }

    console.log(`   ✓ KEEP in: ${keepIn.level}/${keepIn.file}`);

    shouldRemove.forEach(occ => {
      console.log(`   ✗ REMOVE from: ${occ.level}/${occ.file}`);

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
          console.log(`      → Removed successfully`);
        } else {
          console.log(`      ⚠️  Not found (may have been removed already)`);
        }
      }
    });
  });

  console.log(`\n✅ Fixed ${fixedCount} cross-level duplicate entries!`);
}

// Main execution
function main() {
  console.log('🔍 CROSS-LEVEL DUPLICATE FIXER\n' + '═'.repeat(60));
  console.log(`Loaded analysis from: ${reportPath}\n`);

  fixCrossLevelDuplicates();

  console.log('\n✅ Done!\n');
}

main();
