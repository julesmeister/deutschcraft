const fs = require('fs');
const path = require('path');

const vocabDir = path.join(__dirname, '..', 'lib', 'data', 'vocabulary', 'split');

console.log('🔍 INTERMEDIATE VERBS RECATEGORIZATION ANALYSIS\n' + '═'.repeat(70));

// ============================================================================
// PART 1: B2 ANALYSIS (35 verbs - simpler to categorize)
// ============================================================================

console.log('\n📊 B2 INTERMEDIATE VERBS (35 total)\n' + '─'.repeat(70));

const b2IntermediateFile = path.join(vocabDir, 'b2', 'intermediate-verbs.json');
const b2Data = JSON.parse(fs.readFileSync(b2IntermediateFile, 'utf-8'));

// Categorize B2 verbs
const b2Categories = {
  verbsWithPrepositions: [],
  academic: [],
  other: []
};

b2Data.flashcards.forEach(verb => {
  const hasPrepositionTag = verb.tags && (
    verb.tags.includes('Akkusativ') ||
    verb.tags.includes('Dativ')
  );
  const isAcademic = verb.german.endsWith('ieren');

  if (hasPrepositionTag) {
    b2Categories.verbsWithPrepositions.push(verb);
  } else if (isAcademic) {
    b2Categories.academic.push(verb);
  } else {
    b2Categories.other.push(verb);
  }
});

console.log('B2 CATEGORIZATION:');
console.log(`  ✅ Verbs with Prepositions: ${b2Categories.verbsWithPrepositions.length} verbs`);
console.log(`     → Move to: verbs-with-prepositions.json`);

console.log(`\n  ✅ Academic Verbs: ${b2Categories.academic.length} verbs`);
console.log(`     → Move to: academic.json`);

console.log(`\n  ⚠️  Other: ${b2Categories.other.length} verbs`);
b2Categories.other.forEach(v => {
  console.log(`     - ${v.german} (${v.english})`);
});

// ============================================================================
// PART 2: B1 ANALYSIS (461 verbs - more complex)
// ============================================================================

console.log('\n\n📊 B1 INTERMEDIATE VERBS (461 total)\n' + '─'.repeat(70));

const b1IntermediateFile = path.join(vocabDir, 'b1', 'intermediate-verbs.json');
const b1Data = JSON.parse(fs.readFileSync(b1IntermediateFile, 'utf-8'));

// Categorize B1 verbs
const b1Categories = {
  separable: [],
  inseparable: [],
  reflexive: [],
  verbsWithPrepositions: [],
  irregular: [],
  simple: []
};

b1Data.flashcards.forEach(verb => {
  const german = verb.german;

  // Check if reflexive
  if (german.includes('sich')) {
    b1Categories.reflexive.push(verb);
  }
  // Check if separable (common prefixes)
  else if (/^(ab|an|auf|aus|ein|mit|nach|vor|zu|zurück|weg|her|hin|entgegen|entlang|weiter|wieder|zusammen)/.test(german)) {
    b1Categories.separable.push(verb);
  }
  // Check if inseparable (common prefixes)
  else if (/^(be|emp|ent|er|ge|miss|ver|zer)/.test(german)) {
    b1Categories.inseparable.push(verb);
  }
  // Check if verbs with prepositions (has Akk/Dat tags)
  else if (verb.tags && (verb.tags.includes('Akkusativ') || verb.tags.includes('Dativ'))) {
    b1Categories.verbsWithPrepositions.push(verb);
  }
  // Everything else
  else {
    b1Categories.simple.push(verb);
  }
});

console.log('B1 CATEGORIZATION:');
console.log(`  ✅ Separable Verbs: ${b1Categories.separable.length} verbs`);
console.log(`     → Move to: separable-verbs.json`);

console.log(`\n  ✅ Reflexive Verbs: ${b1Categories.reflexive.length} verbs`);
console.log(`     → Move to: reflexive-verbs.json`);

console.log(`\n  ✅ Inseparable Prefix Verbs: ${b1Categories.inseparable.length} verbs`);
console.log(`     → Options: Create new "inseparable-prefix-verbs.json" OR distribute semantically`);

console.log(`\n  ✅ Verbs with Prepositions: ${b1Categories.verbsWithPrepositions.length} verbs`);
console.log(`     → Move to: verbs-with-prepositions.json`);

console.log(`\n  ⚠️  Simple Verbs (need semantic categorization): ${b1Categories.simple.length} verbs`);
console.log(`     → Sample (first 20):`);
b1Categories.simple.slice(0, 20).forEach(v => {
  console.log(`        - ${v.german} (${v.english})`);
});

// ============================================================================
// SUMMARY & RECOMMENDATIONS
// ============================================================================

console.log('\n\n💡 RECATEGORIZATION PLAN\n' + '═'.repeat(70));

console.log('\n🎯 B2 PLAN (Can auto-apply safely):');
console.log(`   1. Move ${b2Categories.verbsWithPrepositions.length} verbs → b2/verbs-with-prepositions.json`);
console.log(`   2. Move ${b2Categories.academic.length} verbs → b2/academic.json`);
console.log(`   3. Review ${b2Categories.other.length} "other" verbs manually`);
console.log(`   4. Delete b2/intermediate-verbs.json (empty)`);

console.log('\n🎯 B1 PLAN (Requires more thought):');
console.log(`   1. Move ${b1Categories.separable.length} separable verbs → b1/separable-verbs.json`);
console.log(`   2. Move ${b1Categories.reflexive.length} reflexive verbs → b1/reflexive-verbs.json`);
console.log(`   3. Move ${b1Categories.verbsWithPrepositions.length} verbs with prep → b1/verbs-with-prepositions.json`);
console.log(`   4. DECISION NEEDED: ${b1Categories.inseparable.length} inseparable prefix verbs`);
console.log(`      - Option A: Create b1/inseparable-prefix-verbs.json`);
console.log(`      - Option B: Distribute to semantic categories (business, daily, etc.)`);
console.log(`   5. MANUAL REVIEW: ${b1Categories.simple.length} simple verbs`);
console.log(`      - Distribute to semantic categories based on meaning`);
console.log(`   6. Delete b1/intermediate-verbs.json (empty)`);

console.log('\n\n🔢 IMPACT:');
console.log(`   B2: ${b2Data.flashcards.length} verbs → recategorized to 2-3 proper files`);
console.log(`   B1: ${b1Data.flashcards.length} verbs → recategorized to 4+ proper files`);
console.log(`   Total files to delete: 2 (b1/intermediate-verbs.json, b2/intermediate-verbs.json)`);

console.log('\n\n📝 SAMPLE INSEPARABLE VERBS (B1) - for decision:');
b1Categories.inseparable.slice(0, 15).forEach(v => {
  console.log(`   - ${v.german} (${v.english})`);
});

console.log('\n\n✅ Analysis complete!\n');
console.log('Next step: Review this analysis and decide on inseparable verb handling.\n');
