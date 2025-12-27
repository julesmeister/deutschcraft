const fs = require('fs');
const path = require('path');

// CEFR levels
const CEFR_LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

// High-confidence frequency-based verb lists
const VERB_LEVELS = {
  // A1: Most common 50 verbs (absolute basics)
  a1: [
    'sein', 'haben', 'werden', 'können', 'müssen', 'sagen', 'machen', 'geben',
    'kommen', 'sollen', 'wollen', 'gehen', 'wissen', 'sehen', 'lassen', 'stehen',
    'finden', 'bleiben', 'liegen', 'fahren', 'nehmen', 'tun', 'halten', 'bringen',
    'heißen', 'schreiben', 'arbeiten', 'leben', 'kaufen', 'essen', 'trinken',
    'schlafen', 'lernen', 'spielen', 'wohnen', 'kennen', 'mögen', 'dürfen',
    'brauchen', 'zeigen', 'sprechen', 'stellen', 'legen', 'sitzen', 'verstehen'
  ],

  // A2: Common verbs (frequency rank 51-200)
  a2: [
    'tragen', 'fühlen', 'hören', 'laufen', 'öffnen', 'schließen', 'denken',
    'glauben', 'helfen', 'bekommen', 'beginnen', 'bedeuten', 'nutzen', 'lesen',
    'treffen', 'ziehen', 'drücken', 'suchen', 'erreichen', 'erklären', 'lachen',
    'weinen', 'hoffen', 'warten', 'kochen', 'putzen', 'waschen', 'probieren',
    'tanzen', 'singen', 'vergessen', 'erinnern', 'erzählen', 'fragen', 'antworten'
  ]
};

// Expand A1/A2 with separable and reflexive variants
function expandBasicVerbs() {
  const expanded = { a1: [...VERB_LEVELS.a1], a2: [...VERB_LEVELS.a2] };

  // Add common separable variants to A2
  const a2Separable = [
    'ankommen', 'abfahren', 'aufstehen', 'einschlafen', 'aufmachen', 'zumachen',
    'anrufen', 'mitnehmen', 'mitbringen', 'abholen', 'einkaufen', 'ausgehen',
    'anfangen', 'aufhören', 'einladen', 'zurückkommen'
  ];
  expanded.a2.push(...a2Separable);

  return expanded;
}

const EXPANDED_LEVELS = expandBasicVerbs();

// Extract verbs only (exclude adverbs)
function extractVerbs() {
  const verbsByLevel = {};
  const vocabDir = path.join(__dirname, '..', 'lib', 'data', 'vocabulary', 'split');

  CEFR_LEVELS.forEach(level => {
    const levelDir = path.join(vocabDir, level);
    if (!fs.existsSync(levelDir)) return;

    const files = fs.readdirSync(levelDir)
      .filter(f => f.endsWith('.json') && f.includes('verb'))
      .filter(f => !f.includes('adverb')); // EXCLUDE adverbs!

    verbsByLevel[level] = [];

    files.forEach(file => {
      const filePath = path.join(levelDir, file);
      const rawData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const data = Array.isArray(rawData) ? rawData : (rawData.flashcards || []);

      data.forEach(item => {
        if (item.german) {
          const cleanVerb = item.german.toLowerCase().replace('sich ', '').trim();

          verbsByLevel[level].push({
            german: item.german.toLowerCase().trim(),
            cleanVerb: cleanVerb,
            english: item.english || '',
            category: file.replace('.json', ''),
            file: file,
            level: level,
            isReflexive: item.german.includes('sich'),
            isSeparable: checkSeparable(cleanVerb)
          });
        }
      });
    });
  });

  return verbsByLevel;
}

// Check if verb is separable
function checkSeparable(verb) {
  const prefixes = ['ab', 'an', 'auf', 'aus', 'bei', 'ein', 'mit', 'nach', 'vor', 'zu', 'zurück', 'weg', 'hin', 'her'];
  return prefixes.some(p => verb.startsWith(p) && verb.length > p.length + 2);
}

// Get base verb (remove separable prefix)
function getBaseVerb(verb) {
  const prefixes = ['ab', 'an', 'auf', 'aus', 'bei', 'ein', 'mit', 'nach', 'vor', 'zu', 'zurück', 'weg', 'hin', 'her'];

  for (const prefix of prefixes) {
    if (verb.startsWith(prefix) && verb.length > prefix.length + 2) {
      return verb.substring(prefix.length);
    }
  }

  return verb;
}

// Suggest level based on frequency
function suggestLevel(verb) {
  const base = getBaseVerb(verb.cleanVerb);

  // Check exact match first
  if (EXPANDED_LEVELS.a1.includes(verb.cleanVerb)) return 'a1';
  if (EXPANDED_LEVELS.a2.includes(verb.cleanVerb)) return 'a2';

  // Check base verb
  if (EXPANDED_LEVELS.a1.includes(base)) {
    // Base is A1, but separable variant is A2
    return verb.isSeparable ? 'a2' : 'a1';
  }
  if (EXPANDED_LEVELS.a2.includes(base)) {
    return 'a2';
  }

  // Default: keep at current level if not in frequency lists
  return null;
}

// Find duplicates across and within levels
function findAllDuplicates(verbsByLevel) {
  const verbMap = new Map();
  const duplicates = [];

  CEFR_LEVELS.forEach(level => {
    verbsByLevel[level].forEach(verb => {
      const key = verb.german;

      if (verbMap.has(key)) {
        const existing = verbMap.get(key);
        duplicates.push({
          german: verb.german,
          english: verb.english,
          occurrences: [
            ...existing.occurrences,
            { level: level.toUpperCase(), file: verb.file, category: verb.category }
          ]
        });
        // Update map
        verbMap.get(key).occurrences.push({ level: level.toUpperCase(), file: verb.file, category: verb.category });
      } else {
        verbMap.set(key, {
          german: verb.german,
          english: verb.english,
          occurrences: [{ level: level.toUpperCase(), file: verb.file, category: verb.category }]
        });
      }
    });
  });

  return duplicates.filter(d => d.occurrences.length > 1);
}

// High-confidence rearrangements only
function findHighConfidenceRearrangements(verbsByLevel) {
  const suggestions = [];

  CEFR_LEVELS.forEach(level => {
    verbsByLevel[level].forEach(verb => {
      const suggested = suggestLevel(verb);

      if (suggested && suggested !== level) {
        suggestions.push({
          verb: verb.german,
          english: verb.english,
          currentLevel: level.toUpperCase(),
          suggestedLevel: suggested.toUpperCase(),
          currentFile: verb.file,
          category: verb.category,
          confidence: 'HIGH',
          reason: getConfidenceReason(verb, suggested)
        });
      }
    });
  });

  return suggestions.sort((a, b) => {
    const levelOrder = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 };
    return levelOrder[a.currentLevel] - levelOrder[b.currentLevel];
  });
}

function getConfidenceReason(verb, suggestedLevel) {
  const base = getBaseVerb(verb.cleanVerb);

  if (EXPANDED_LEVELS.a1.includes(verb.cleanVerb)) {
    return 'Top 50 most frequent verb in German';
  }
  if (EXPANDED_LEVELS.a2.includes(verb.cleanVerb)) {
    return 'Top 200 most frequent verb in German';
  }
  if (EXPANDED_LEVELS.a1.includes(base)) {
    return `Base verb "${base}" is A1-level, separable variant → A2`;
  }
  if (EXPANDED_LEVELS.a2.includes(base)) {
    return `Base verb "${base}" is A2-level`;
  }

  return 'Frequency-based assessment';
}

// Generate actionable report
function main() {
  console.log('🔍 SMART VERB LEVEL ANALYSIS\n' + '═'.repeat(60));

  const verbsByLevel = extractVerbs();

  // 1. Statistics
  console.log('\n📊 STATISTICS (Verbs only, excluding adverbs)\n' + '─'.repeat(60));
  CEFR_LEVELS.forEach(level => {
    const verbs = verbsByLevel[level] || [];
    console.log(`${level.toUpperCase()}: ${verbs.length} verbs`);
  });

  // 2. Duplicates
  console.log('\n\n🔄 DUPLICATE VERBS\n' + '═'.repeat(60));
  const duplicates = findAllDuplicates(verbsByLevel);

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!');
  } else {
    console.log(`Found ${duplicates.length} duplicate verbs:\n`);

    // Group by within-level vs cross-level
    const withinLevel = duplicates.filter(d => new Set(d.occurrences.map(o => o.level)).size === 1);
    const crossLevel = duplicates.filter(d => new Set(d.occurrences.map(o => o.level)).size > 1);

    if (withinLevel.length > 0) {
      console.log(`\n🔴 Within same level (${withinLevel.length}):`);
      withinLevel.forEach(dup => {
        console.log(`\n  "${dup.german}" (${dup.english})`);
        dup.occurrences.forEach(occ => {
          console.log(`    - ${occ.level}: ${occ.file}`);
        });
      });
    }

    if (crossLevel.length > 0) {
      console.log(`\n🟡 Across different levels (${crossLevel.length}):`);
      crossLevel.forEach(dup => {
        console.log(`\n  "${dup.german}" (${dup.english})`);
        dup.occurrences.forEach(occ => {
          console.log(`    - ${occ.level}: ${occ.file}`);
        });
      });
    }
  }

  // 3. High-confidence rearrangements
  console.log('\n\n💡 HIGH-CONFIDENCE REARRANGEMENTS\n' + '═'.repeat(60));
  const suggestions = findHighConfidenceRearrangements(verbsByLevel);

  if (suggestions.length === 0) {
    console.log('✅ All high-frequency verbs are at appropriate levels!');
  } else {
    console.log(`Found ${suggestions.length} verbs that should likely be moved:\n`);

    const byMove = {};
    suggestions.forEach(s => {
      const key = `${s.currentLevel} → ${s.suggestedLevel}`;
      if (!byMove[key]) byMove[key] = [];
      byMove[key].push(s);
    });

    Object.keys(byMove).forEach(move => {
      console.log(`\n${move} (${byMove[move].length} verbs):`);
      byMove[move].slice(0, 15).forEach(s => {
        console.log(`  "${s.verb}" (${s.english})`);
        console.log(`    File: ${s.currentFile}`);
        console.log(`    Reason: ${s.reason}`);
      });
      if (byMove[move].length > 15) {
        console.log(`  ... and ${byMove[move].length - 15} more`);
      }
    });
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalVerbs: Object.values(verbsByLevel).reduce((sum, arr) => sum + arr.length, 0),
      byLevel: Object.fromEntries(CEFR_LEVELS.map(l => [l.toUpperCase(), verbsByLevel[l]?.length || 0])),
      duplicates: duplicates.length,
      suggestedRearrangements: suggestions.length
    },
    duplicates: duplicates,
    suggestions: suggestions,
    verbsByLevel: Object.fromEntries(
      CEFR_LEVELS.map(level => [
        level.toUpperCase(),
        verbsByLevel[level].map(v => ({
          german: v.german,
          english: v.english,
          file: v.file,
          isReflexive: v.isReflexive,
          isSeparable: v.isSeparable
        }))
      ])
    )
  };

  const reportPath = path.join(__dirname, 'smart-verb-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n\n💾 Detailed report saved: ${reportPath}`);
  console.log('\n✅ Smart analysis complete!\n');
}

main();
