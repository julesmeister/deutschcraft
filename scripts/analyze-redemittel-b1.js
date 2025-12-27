const fs = require('fs');
const path = require('path');

const vocabDir = path.join(__dirname, '..', 'lib', 'data', 'vocabulary', 'split');

// Read files
const a2File = path.join(vocabDir, 'a2', 'redemittel.json');
const b1File = path.join(vocabDir, 'b1', 'redemittel.json');

const a2Data = JSON.parse(fs.readFileSync(a2File, 'utf-8'));
const b1Data = JSON.parse(fs.readFileSync(b1File, 'utf-8'));

console.log('🔍 B1 REDEMITTEL ANALYSIS\n' + '═'.repeat(60));

console.log(`\nA2 Redemittel: ${a2Data.flashcards.length} phrases`);
console.log(`B1 Redemittel: ${b1Data.flashcards.length} phrases`);

// 1. Find exact duplicates between A2 and B1
console.log('\n\n🔴 DUPLICATES (B1 phrases already in A2):\n' + '─'.repeat(60));

const a2Phrases = new Set(a2Data.flashcards.map(f => f.german.toLowerCase().trim()));
const duplicates = b1Data.flashcards.filter(f =>
  a2Phrases.has(f.german.toLowerCase().trim())
);

if (duplicates.length > 0) {
  duplicates.forEach(d => {
    console.log(`❌ "${d.german}" (${d.english})`);
    console.log(`   ID: ${d.id}`);
  });
  console.log(`\nTotal: ${duplicates.length} duplicates found`);
} else {
  console.log('✅ No exact duplicates found');
}

// 2. Group phrases by meaning/theme
console.log('\n\n📊 REDUNDANCY ANALYSIS:\n' + '─'.repeat(60));

// Group "I don't care" phrases
const dontCareKeywords = ['egal', 'schnuppe', 'kümmert', 'interessiert', 'bohne', 'dreck', 'scheiß', 'arsch'];
const dontCarePhrases = b1Data.flashcards.filter(f =>
  dontCareKeywords.some(keyword => f.german.toLowerCase().includes(keyword)) ||
  f.english.toLowerCase().includes("don't care") ||
  f.english.toLowerCase().includes("don't give")
);

console.log(`\n"I DON'T CARE" variations: ${dontCarePhrases.length} phrases`);
console.log('──────────────────────────────────────');

// Group by formality
const neutral = [];
const colloquial = [];
const vulgar = [];

dontCarePhrases.forEach(p => {
  if (p.english.includes('vulgar') || p.german.match(/scheiß|arsch/i)) {
    vulgar.push(p);
  } else if (p.english.includes('colloquial') || p.german.match(/schnuppe/i)) {
    colloquial.push(p);
  } else {
    neutral.push(p);
  }
});

console.log(`\nNeutral (${neutral.length}):`);
neutral.forEach(p => console.log(`  - ${p.german} (${p.english})`));

console.log(`\nColloquial (${colloquial.length}):`);
colloquial.forEach(p => console.log(`  - ${p.german} (${p.english})`));

console.log(`\nVulgar (${vulgar.length}):`);
vulgar.forEach(p => console.log(`  - ${p.german} (${p.english})`));

// 3. Opinion phrases
console.log('\n\nOPINION PHRASES:\n' + '──────────────────────────────────────');
const opinionPhrases = b1Data.flashcards.filter(f =>
  f.german.match(/meinung|finde|denke|glaube|vermute|bezweifle|behaupte/i)
);

opinionPhrases.forEach(p => {
  console.log(`  - ${p.german} (${p.english})`);
});
console.log(`Total: ${opinionPhrases.length}`);

// 4. Recommendations
console.log('\n\n💡 RECOMMENDATIONS:\n' + '═'.repeat(60));

console.log('\n1. REMOVE DUPLICATES (already in A2):');
duplicates.forEach(d => {
  console.log(`   ❌ Remove: "${d.german}" (ID: ${d.id})`);
});

console.log('\n2. CONSOLIDATE "I DON\'T CARE" phrases:');
console.log('   Keep only 3-4 variants:');
console.log('   ✅ KEEP: "Das ist mir egal." (neutral, most common)');
console.log('   ✅ KEEP: "Mir egal." (shorter, colloquial)');
console.log('   ✅ KEEP: "Das ist mir schnuppe." (colloquial variant)');
console.log('   ✅ KEEP: "Das kümmert mich nicht." (different structure)');
console.log(`   ❌ REMOVE: ${dontCarePhrases.length - 4} redundant variations`);

console.log('\n3. VULGAR LANGUAGE:');
console.log(`   ⚠️  ${vulgar.length} vulgar phrases found`);
console.log('   Options:');
console.log('     a) Remove all vulgar phrases (recommended for learners)');
console.log('     b) Mark with special tag and keep for advanced learners');
console.log('     c) Move to separate "Slang/Vulgar" category');

console.log('\n4. BASIC OPINION PHRASES → Move to A2:');
const basicOpinions = ['Ich finde, dass', 'für immer', 'Ich stimme zu', 'Ich gebe zu'];
basicOpinions.forEach(phrase => {
  const found = b1Data.flashcards.find(f => f.german.includes(phrase));
  if (found) {
    console.log(`   📤 "${found.german}" → A2 (too basic for B1)`);
  }
});

// Summary
console.log('\n\n📈 SUMMARY:\n' + '═'.repeat(60));
console.log(`Total B1 Redemittel: ${b1Data.flashcards.length}`);
console.log(`Duplicates with A2: ${duplicates.length}`);
console.log(`"Don't care" variations: ${dontCarePhrases.length} (reduce to 4)`);
console.log(`Vulgar phrases: ${vulgar.length}`);
console.log(`\nRecommended reductions: ~${duplicates.length + (dontCarePhrases.length - 4) + vulgar.length} phrases`);
console.log(`Optimized B1 count: ~${b1Data.flashcards.length - duplicates.length - (dontCarePhrases.length - 4) - vulgar.length}`);

console.log('\n✅ Analysis complete!\n');
