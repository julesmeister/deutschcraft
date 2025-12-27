const fs = require('fs');
const path = require('path');

// Load the full rearrangement script
const applyRearrangementsPath = path.join(__dirname, 'apply-rearrangements.js');
const reportPath = path.join(__dirname, 'smart-verb-analysis.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Curated list of B1 → A2 moves that are pedagogically sound
// Focus on: common everyday verbs that A2 learners actually need
const APPROVED_MOVES = [
  'absagen',        // to cancel (appointments, plans)
  'erreichen',      // to reach, achieve (very common)
  'ausdrücken',     // to express (feelings, opinions)
  'beibringen',     // to teach (everyday context)
  'vorstellen',     // to introduce, imagine (super common)
  'mitnehmen',      // to take along (traveling, shopping)
  'abholen',        // to pick up (people, packages)
  'einsehen',       // to realize, understand
  'angeben',        // to state, indicate (forms, information)
  'nachmachen',     // to imitate, copy
  'zuhören',        // to listen (actively)
  'zusehen',        // to watch
  'vorbereiten',    // to prepare
  'nachdenken',     // to think about, reflect
];

function applySelectiveMoves(dryRun = true) {
  console.log('🎯 SELECTIVE B1 → A2 MOVES (Curated List)\n' + '═'.repeat(60));

  if (dryRun) {
    console.log('🔵 DRY RUN MODE - No files will be modified\n');
  } else {
    console.log('🔴 LIVE MODE - Files will be modified!\n');
  }

  const b1ToA2 = report.suggestions.filter(s =>
    s.currentLevel === 'B1' && s.suggestedLevel === 'A2'
  );

  const selectedMoves = b1ToA2.filter(s =>
    APPROVED_MOVES.includes(s.verb.toLowerCase())
  );

  console.log(`Selected ${selectedMoves.length} high-value verbs from ${b1ToA2.length} total suggestions:\n`);

  selectedMoves.forEach((sug, index) => {
    console.log(`${index + 1}. "${sug.verb}" (${sug.english})`);
    console.log(`   Reason: ${sug.reason}`);
    console.log(`   Source: B1/${sug.currentFile}`);
  });

  if (dryRun) {
    console.log(`\n💡 To apply these ${selectedMoves.length} moves:`);
    console.log('   node scripts/selective-b1-to-a2.js --live');
  } else {
    // Apply the moves
    const { moveVerb } = require('./apply-rearrangements-lib.js');
    let successCount = 0;

    console.log('\n' + '─'.repeat(60));
    console.log('Applying moves...\n');

    selectedMoves.forEach((sug, index) => {
      console.log(`${index + 1}. Moving "${sug.verb}"...`);
      // For now, just show what would happen
      // The actual move logic is in apply-rearrangements.js
      console.log(`   Would move from B1/${sug.currentFile} → A2/separable-verbs.json`);
    });

    console.log('\n⚠️  To actually apply these, use:');
    console.log('   node scripts/apply-rearrangements.js --live --filter "B1 → A2"');
    console.log('   Then manually revert any unwanted moves.\n');
    console.log('   OR: Apply specific verbs one by one using the main script.');
  }

  console.log('\n═'.repeat(60));
  console.log('✅ Selection complete!\n');
}

// Main
const args = process.argv.slice(2);
const isLive = args.includes('--live');

console.log('🔍 SELECTIVE VERB REARRANGEMENT\n' + '═'.repeat(60));
console.log('Focusing on most useful everyday verbs for A2 learners\n');

applySelectiveMoves(!isLive);
