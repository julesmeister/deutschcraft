#!/usr/bin/env tsx

/**
 * Generate Grammar Sentence Templates
 *
 * This script reads grammar rules from levels/*.json and generates
 * empty sentence templates that need to be filled in manually.
 *
 * Usage:
 *   npx tsx scripts/generate-grammar-sentence-templates.ts a1
 *   npx tsx scripts/generate-grammar-sentence-templates.ts all
 */

import fs from 'fs';
import path from 'path';

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const LEVELS_DIR = path.join(process.cwd(), 'lib', 'data', 'grammar', 'levels');
const SENTENCES_DIR = path.join(process.cwd(), 'lib', 'data', 'grammar', 'sentences');
const SENTENCES_PER_RULE = 20;

interface GrammarRule {
  id: string;
  title: string;
  category: string;
  description: string;
  examples: string[];
  notes: string;
}

interface GrammarSentence {
  sentenceId: string;
  ruleId: string;
  english: string;
  german: string;
  hints?: string[];
  keywords?: string[];
  difficulty?: number;
}

/**
 * Generate sentence templates for a level
 */
function generateSentenceTemplates(level: string): void {
  console.log(`\n📝 Generating sentence templates for ${level.toUpperCase()}...`);

  // Read grammar rules for this level
  const rulesFile = path.join(LEVELS_DIR, `${level}.json`);
  if (!fs.existsSync(rulesFile)) {
    console.error(`   ❌ Rules file not found: ${rulesFile}`);
    return;
  }

  const rulesData = JSON.parse(fs.readFileSync(rulesFile, 'utf-8'));
  const rules = rulesData.rules as GrammarRule[];

  console.log(`   Found ${rules.length} grammar rules`);

  // Check if sentences file already exists
  const sentencesFile = path.join(SENTENCES_DIR, `${level}.json`);
  let existingSentences: GrammarSentence[] = [];

  if (fs.existsSync(sentencesFile)) {
    const existingData = JSON.parse(fs.readFileSync(sentencesFile, 'utf-8'));
    existingSentences = existingData.sentences || [];
    console.log(`   Found ${existingSentences.length} existing sentences`);
  }

  // Create map of existing sentences by ruleId
  const existingByRule = new Map<string, GrammarSentence[]>();
  existingSentences.forEach((sentence) => {
    const ruleSentences = existingByRule.get(sentence.ruleId) || [];
    ruleSentences.push(sentence);
    existingByRule.set(sentence.ruleId, ruleSentences);
  });

  // Generate templates for missing sentences
  const allSentences: GrammarSentence[] = [];
  let totalGenerated = 0;

  rules.forEach((rule) => {
    const existing = existingByRule.get(rule.id) || [];
    const needed = SENTENCES_PER_RULE - existing.length;

    // Keep existing sentences
    allSentences.push(...existing);

    // Generate templates for missing sentences
    if (needed > 0) {
      console.log(`   🔧 ${rule.id}: ${existing.length}/${SENTENCES_PER_RULE} (generating ${needed} templates)`);

      for (let i = 0; i < needed; i++) {
        const sentenceNumber = existing.length + i + 1;
        const sentenceId = `${rule.id}-${sentenceNumber.toString().padStart(3, '0')}`;

        allSentences.push({
          sentenceId,
          ruleId: rule.id,
          english: `[TODO: English sentence ${sentenceNumber} for: ${rule.title}]`,
          german: `[TODO: German translation]`,
          hints: [`[TODO: Hint about ${rule.title}]`],
          keywords: [],
          difficulty: 5,
        });

        totalGenerated++;
      }
    } else {
      console.log(`   ✅ ${rule.id}: ${existing.length}/${SENTENCES_PER_RULE} (complete)`);
    }
  });

  // Write the complete sentences file
  const outputData = {
    level: level.toUpperCase(),
    totalRules: rules.length,
    totalSentences: allSentences.length,
    targetSentences: rules.length * SENTENCES_PER_RULE,
    completionPercentage: Math.round((allSentences.length / (rules.length * SENTENCES_PER_RULE)) * 100),
    sentences: allSentences,
  };

  fs.writeFileSync(sentencesFile, JSON.stringify(outputData, null, 2), 'utf-8');

  console.log(`\n   📊 Summary:`);
  console.log(`      Total rules: ${rules.length}`);
  console.log(`      Existing sentences: ${existingSentences.length}`);
  console.log(`      Generated templates: ${totalGenerated}`);
  console.log(`      Total sentences: ${allSentences.length}/${rules.length * SENTENCES_PER_RULE}`);
  console.log(`      Completion: ${outputData.completionPercentage}%`);
  console.log(`   ✅ Saved to: ${sentencesFile}\n`);
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  const targetLevel = args[0]?.toLowerCase();

  console.log('🔧 Grammar Sentence Template Generator\n');
  console.log('='.repeat(50));

  if (!targetLevel) {
    console.log('\n❌ Please specify a level or "all"');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/generate-grammar-sentence-templates.ts [level]');
    console.log('  npx tsx scripts/generate-grammar-sentence-templates.ts all');
    console.log('\nExamples:');
    console.log('  npx tsx scripts/generate-grammar-sentence-templates.ts a1');
    console.log('  npx tsx scripts/generate-grammar-sentence-templates.ts all');
    process.exit(1);
  }

  const levelsToProcess = targetLevel === 'all' ? LEVELS : [targetLevel];

  // Validate levels
  for (const level of levelsToProcess) {
    if (!LEVELS.includes(level)) {
      console.log(`\n❌ Invalid level: ${level}`);
      console.log(`   Valid levels: ${LEVELS.join(', ')}, all`);
      process.exit(1);
    }
  }

  // Create sentences directory if needed
  if (!fs.existsSync(SENTENCES_DIR)) {
    fs.mkdirSync(SENTENCES_DIR, { recursive: true });
  }

  // Process each level
  for (const level of levelsToProcess) {
    generateSentenceTemplates(level);
  }

  console.log('='.repeat(50));
  console.log('\n✨ Complete! Now fill in the [TODO] placeholders with real sentences.\n');
}

// Run the script
main();
