const fs = require('fs');
const path = require('path');

// CEFR levels in order
const CEFR_LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

// Verb complexity indicators
const COMPLEXITY_INDICATORS = {
  // Simple indicators for basic verbs
  basic: ['sein', 'haben', 'werden', 'können', 'müssen', 'wollen', 'sollen', 'dürfen', 'mögen', 'gehen', 'kommen', 'machen', 'sagen', 'sehen'],

  // A1 level verbs (frequency words)
  a1Common: ['arbeiten', 'essen', 'trinken', 'schlafen', 'wohnen', 'lernen', 'spielen', 'kaufen', 'kosten', 'brauchen', 'finden', 'geben', 'nehmen', 'bleiben', 'heißen', 'sprechen'],

  // Prefix indicators (higher complexity)
  prefixes: {
    separable: ['ab', 'an', 'auf', 'aus', 'bei', 'ein', 'mit', 'nach', 'vor', 'zu', 'zurück'],
    inseparable: ['be', 'emp', 'ent', 'er', 'ge', 'miss', 'ver', 'zer']
  },

  // Reflexive verbs tend to be higher level
  reflexiveIndicator: 'sich',

  // Modal verbs are usually A1-A2
  modals: ['können', 'müssen', 'wollen', 'sollen', 'dürfen', 'mögen', 'möchten']
};

// Extract verbs from all files
function extractAllVerbs() {
  const verbsByLevel = {};
  const vocabDir = path.join(__dirname, '..', 'lib', 'data', 'vocabulary', 'split');

  CEFR_LEVELS.forEach(level => {
    const levelDir = path.join(vocabDir, level);
    if (!fs.existsSync(levelDir)) {
      console.log(`⚠️  Level ${level.toUpperCase()} directory not found, skipping...`);
      return;
    }

    const files = fs.readdirSync(levelDir).filter(f => f.endsWith('.json') && f.includes('verb'));

    verbsByLevel[level] = [];

    files.forEach(file => {
      const filePath = path.join(levelDir, file);
      const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Handle both array format and object with flashcards property
      const data = Array.isArray(rawData) ? rawData : (rawData.flashcards || []);

      data.forEach(item => {
        if (item.german) {
          verbsByLevel[level].push({
            german: item.german.toLowerCase().trim(),
            english: item.english || '',
            category: file.replace('.json', ''),
            level: level,
            isReflexive: (item.german || '').includes('sich'),
            isSeparable: hasSeparablePrefix(item.german),
            isModal: COMPLEXITY_INDICATORS.modals.includes(item.german.toLowerCase().trim())
          });
        }
      });
    });
  });

  return verbsByLevel;
}

// Check if verb has separable prefix
function hasSeparablePrefix(verb) {
  const cleanVerb = verb.toLowerCase().replace('sich ', '');
  return COMPLEXITY_INDICATORS.prefixes.separable.some(prefix =>
    cleanVerb.startsWith(prefix) && cleanVerb.length > prefix.length
  );
}

// Assess verb complexity (0-100 score)
function assessComplexity(verb) {
  const cleanVerb = verb.german.replace('sich ', '').trim();
  let score = 50; // Base score

  // Very basic verbs → lower score (A1)
  if (COMPLEXITY_INDICATORS.basic.includes(cleanVerb)) {
    score = 10;
  } else if (COMPLEXITY_INDICATORS.a1Common.includes(cleanVerb)) {
    score = 20;
  }

  // Modal verbs are usually A1-A2
  if (verb.isModal) {
    score = Math.min(score, 25);
  }

  // Separable verbs add complexity (A2+)
  if (verb.isSeparable) {
    score += 15;
  }

  // Reflexive verbs add complexity (A2+)
  if (verb.isReflexive) {
    score += 10;
  }

  // Inseparable prefixes (B1+)
  if (COMPLEXITY_INDICATORS.prefixes.inseparable.some(prefix => cleanVerb.startsWith(prefix))) {
    score += 20;
  }

  // Longer words tend to be more complex
  if (cleanVerb.length > 10) {
    score += 10;
  }

  // Compound verbs (contains multiple word parts)
  if (cleanVerb.split(/(?=[A-Z])/).length > 2) {
    score += 15;
  }

  return Math.min(Math.max(score, 0), 100);
}

// Map complexity score to CEFR level
function scoreToLevel(score) {
  if (score <= 25) return 'a1';
  if (score <= 40) return 'a2';
  if (score <= 60) return 'b1';
  if (score <= 75) return 'b2';
  if (score <= 85) return 'c1';
  return 'c2';
}

// Find duplicate verbs across levels
function findDuplicates(verbsByLevel) {
  const verbMap = new Map();
  const duplicates = [];

  CEFR_LEVELS.forEach(level => {
    verbsByLevel[level].forEach(verb => {
      if (verbMap.has(verb.german)) {
        duplicates.push({
          german: verb.german,
          english: verb.english,
          levels: [...verbMap.get(verb.german), level],
          categories: [verbMap.get(verb.german + '_cat'), verb.category]
        });
        verbMap.set(verb.german, [...verbMap.get(verb.german), level]);
      } else {
        verbMap.set(verb.german, [level]);
        verbMap.set(verb.german + '_cat', verb.category);
      }
    });
  });

  return duplicates;
}

// Analyze and suggest rearrangements
function analyzeVerbs(verbsByLevel) {
  const suggestions = [];

  CEFR_LEVELS.forEach(level => {
    verbsByLevel[level].forEach(verb => {
      const complexity = assessComplexity(verb);
      const suggestedLevel = scoreToLevel(complexity);

      if (suggestedLevel !== level) {
        suggestions.push({
          verb: verb.german,
          english: verb.english,
          currentLevel: level.toUpperCase(),
          suggestedLevel: suggestedLevel.toUpperCase(),
          category: verb.category,
          complexity: complexity,
          reason: getReason(verb, complexity, level, suggestedLevel)
        });
      }
    });
  });

  return suggestions.sort((a, b) => {
    const levelOrder = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
    return levelOrder[a.currentLevel] - levelOrder[b.currentLevel];
  });
}

// Generate reason for rearrangement
function getReason(verb, complexity, currentLevel, suggestedLevel) {
  const reasons = [];

  if (verb.isModal) reasons.push('Modal verb (typically A1-A2)');
  if (verb.isReflexive) reasons.push('Reflexive verb (A2+)');
  if (verb.isSeparable) reasons.push('Separable verb (A2+)');

  const cleanVerb = verb.german.replace('sich ', '').trim();
  if (COMPLEXITY_INDICATORS.basic.includes(cleanVerb)) {
    reasons.push('Very basic/high-frequency verb');
  }

  if (COMPLEXITY_INDICATORS.prefixes.inseparable.some(p => cleanVerb.startsWith(p))) {
    reasons.push('Inseparable prefix (B1+)');
  }

  if (reasons.length === 0) {
    reasons.push(`Complexity score: ${complexity}`);
  }

  return reasons.join(', ');
}

// Generate summary statistics
function generateStats(verbsByLevel) {
  console.log('\n📊 VERB STATISTICS BY LEVEL\n' + '═'.repeat(50));

  CEFR_LEVELS.forEach(level => {
    const verbs = verbsByLevel[level] || [];
    const reflexive = verbs.filter(v => v.isReflexive).length;
    const separable = verbs.filter(v => v.isSeparable).length;
    const modal = verbs.filter(v => v.isModal).length;

    console.log(`\n${level.toUpperCase()}: ${verbs.length} verbs`);
    console.log(`  - Reflexive: ${reflexive}`);
    console.log(`  - Separable: ${separable}`);
    console.log(`  - Modal: ${modal}`);
  });
}

// Main execution
function main() {
  console.log('🔍 Starting CEFR Verb Level Analysis...\n');

  // Extract all verbs
  const verbsByLevel = extractAllVerbs();

  // Generate stats
  generateStats(verbsByLevel);

  // Find duplicates
  console.log('\n\n🔄 DUPLICATE VERBS ACROSS LEVELS\n' + '═'.repeat(50));
  const duplicates = findDuplicates(verbsByLevel);

  if (duplicates.length > 0) {
    duplicates.slice(0, 20).forEach(dup => {
      console.log(`\n"${dup.german}" found in: ${dup.levels.join(', ').toUpperCase()}`);
      console.log(`  Categories: ${dup.categories.join(', ')}`);
    });
    if (duplicates.length > 20) {
      console.log(`\n... and ${duplicates.length - 20} more duplicates`);
    }
  } else {
    console.log('✅ No duplicates found!');
  }

  // Analyze and suggest rearrangements
  console.log('\n\n💡 SUGGESTED LEVEL REARRANGEMENTS\n' + '═'.repeat(50));
  const suggestions = analyzeVerbs(verbsByLevel);

  if (suggestions.length === 0) {
    console.log('✅ All verbs appear to be at appropriate levels!');
  } else {
    console.log(`Found ${suggestions.length} verbs that may need rearrangement:\n`);

    // Group by current level
    const byLevel = {};
    suggestions.forEach(s => {
      if (!byLevel[s.currentLevel]) byLevel[s.currentLevel] = [];
      byLevel[s.currentLevel].push(s);
    });

    Object.keys(byLevel).forEach(level => {
      console.log(`\n${level} → (${byLevel[level].length} verbs)`);
      byLevel[level].slice(0, 10).forEach(s => {
        console.log(`  "${s.verb}" → ${s.suggestedLevel}`);
        console.log(`    Reason: ${s.reason}`);
        console.log(`    Category: ${s.category}`);
      });
      if (byLevel[level].length > 10) {
        console.log(`  ... and ${byLevel[level].length - 10} more`);
      }
    });
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    stats: Object.fromEntries(
      CEFR_LEVELS.map(level => [
        level,
        {
          total: verbsByLevel[level]?.length || 0,
          reflexive: verbsByLevel[level]?.filter(v => v.isReflexive).length || 0,
          separable: verbsByLevel[level]?.filter(v => v.isSeparable).length || 0,
          modal: verbsByLevel[level]?.filter(v => v.isModal).length || 0
        }
      ])
    ),
    duplicates: duplicates,
    suggestions: suggestions
  };

  const reportPath = path.join(__dirname, 'verb-level-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n\n💾 Detailed report saved to: ${reportPath}`);
  console.log('\n✅ Analysis complete!');
}

main();
