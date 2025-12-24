/**
 * Inspect JSONL file structure
 * Shows first 10 entries to understand the format
 */

import * as fs from 'fs';
import * as readline from 'readline';

const JSONL_PATH = 'C:\\Users\\User\\Documents\\Testmanship\\app\\src\\main\\assets\\german_dictionary.jsonl';

async function inspectJsonl() {
  console.log('🔍 Inspecting JSONL file structure\n');
  console.log('='.repeat(60));

  const fileStream = fs.createReadStream(JSONL_PATH, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let count = 0;
  const MAX_SAMPLES = 10;

  for await (const line of rl) {
    if (!line.trim()) continue;

    count++;
    if (count > MAX_SAMPLES) break;

    try {
      const entry = JSON.parse(line);
      console.log(`\n📝 Entry ${count}:`);

      // Show key fields
      console.log('  word:', entry.word || '(none)');
      console.log('  pos:', entry.pos || '(none)');

      if (entry.senses && entry.senses.length > 0) {
        console.log('  senses:');
        entry.senses.slice(0, 2).forEach((sense: any, i: number) => {
          console.log(`    ${i + 1}. glosses:`, sense.glosses || '(none)');
          console.log(`       tags:`, sense.tags || '(none)');
        });
      }

      console.log('  Keys available:', Object.keys(entry).join(', '));
    } catch (error) {
      console.error(`❌ Error parsing line ${count}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\nShowed ${count} sample entries\n`);
}

inspectJsonl();
