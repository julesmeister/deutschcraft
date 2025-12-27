const fs = require('fs');
const path = require('path');

const vocabDir = path.join(__dirname, '..', 'lib', 'data', 'vocabulary', 'split');
const b1File = path.join(vocabDir, 'b1', 'redemittel.json');

const b1Data = JSON.parse(fs.readFileSync(b1File, 'utf-8'));

console.log('🧹 B1 REDEMITTEL CLEANUP\n' + '═'.repeat(60));
console.log(`Starting with: ${b1Data.flashcards.length} phrases\n`);

// Define what to keep and remove

// 1. "I don't care" - Keep only these 4
const keepDontCare = [
  'Das ist mir egal.',           // Most common, neutral
  'Mir egal.',                   // Short, colloquial
  'Das ist mir schnuppe.',       // Colloquial variant
  'Das kümmert mich nicht.'      // Different structure
];

// 2. Vulgar phrases to remove (all)
const vulgarPatterns = [/arsch/i, /scheiß/i, /leck mich/i];

// 3. Keep track of what we remove
const removed = {
  vulgar: [],
  redundantDontCare: [],
  tooBasic: [],
  other: []
};

const kept = [];

b1Data.flashcards.forEach(phrase => {
  const german = phrase.german;
  const english = phrase.english.toLowerCase();

  // Check if vulgar
  const isVulgar = vulgarPatterns.some(pattern => pattern.test(german));

  if (isVulgar) {
    removed.vulgar.push(phrase);
    return;
  }

  // Check if it's a "don't care" phrase
  const isDontCare =
    english.includes("don't care") ||
    english.includes("don't give") ||
    english.includes("doesn't concern") ||
    english.includes("not interested") ||
    german.match(/egal|schnuppe|bohne|dreck/i) && !german.match(/darum geht/i);

  if (isDontCare) {
    // Keep only the approved ones
    if (keepDontCare.includes(german)) {
      kept.push(phrase);
    } else {
      removed.redundantDontCare.push(phrase);
    }
    return;
  }

  // Check if too basic (should be A2)
  const tooBasicPhrases = [
    'für immer',
    'Ich stimme zu',
    'Ich gebe zu',
    'Ich finde, dass'
  ];

  if (tooBasicPhrases.some(basic => german.includes(basic))) {
    removed.tooBasic.push(phrase);
    return;
  }

  // Keep everything else
  kept.push(phrase);
});

// Display results
console.log('📊 CLEANUP RESULTS:\n' + '─'.repeat(60));

console.log(`\n✅ KEPT: ${kept.length} phrases`);

console.log(`\n❌ REMOVED: ${Object.values(removed).flat().length} phrases`);
console.log(`   - Vulgar: ${removed.vulgar.length}`);
console.log(`   - Redundant "don't care": ${removed.redundantDontCare.length}`);
console.log(`   - Too basic for B1: ${removed.tooBasic.length}`);

console.log('\n\nDETAILS:');
console.log('\n🗑️  VULGAR PHRASES REMOVED:');
removed.vulgar.forEach(p => {
  console.log(`   - "${p.german}" (${p.english})`);
});

console.log('\n🗑️  REDUNDANT "DON\'T CARE" REMOVED:');
removed.redundantDontCare.forEach(p => {
  console.log(`   - "${p.german}" (${p.english})`);
});

console.log('\n🗑️  TOO BASIC (should be A2):');
removed.tooBasic.forEach(p => {
  console.log(`   - "${p.german}" (${p.english})`);
});

console.log('\n\n✅ KEPT "DON\'T CARE" VARIANTS (4):');
kept.filter(p => {
  const english = p.english.toLowerCase();
  return english.includes("don't care") ||
         english.includes("doesn't concern") ||
         p.german.match(/egal|schnuppe/) && !p.german.match(/darum geht/i);
}).forEach(p => {
  console.log(`   - "${p.german}" (${p.english})`);
});

console.log('\n\n' + '═'.repeat(60));
console.log('SAVE CHANGES?\n');
console.log(`Before: ${b1Data.flashcards.length} phrases`);
console.log(`After:  ${kept.length} phrases`);
console.log(`Reduction: ${b1Data.flashcards.length - kept.length} phrases\n`);

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--save')) {
  // Update data
  b1Data.flashcards = kept;
  b1Data.totalCards = kept.length;

  // Write back
  fs.writeFileSync(b1File, JSON.stringify(b1Data, null, 2));
  console.log('✅ Changes saved to b1/redemittel.json\n');
} else {
  console.log('💡 To save changes, run:');
  console.log('   node scripts/cleanup-redemittel-b1.js --save\n');
}
