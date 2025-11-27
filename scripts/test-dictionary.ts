/**
 * Test Dictionary Service
 * Quick test to verify dictionary lookups work correctly
 *
 * Usage: npx tsx scripts/test-dictionary.ts
 */

import {
  lookupGermanWord,
  lookupEnglishWord,
  searchDictionary,
  getRandomEntries,
  getDictionaryStats,
} from '../lib/services/dictionaryService';

console.log('🔍 Testing Dictionary Service\n');

// Test 1: Look up exact German word
console.log('1. Looking up German word "Haus":');
const hausResults = lookupGermanWord('Haus');
console.log(`   Found ${hausResults.length} result(s):`);
hausResults.forEach(r => console.log(`   - ${r.german} → ${r.english}`));
console.log('');

// Test 2: Look up German word (partial match)
console.log('2. Searching German words containing "Haus":');
const hausPartial = lookupGermanWord('Haus', false);
console.log(`   Found ${hausPartial.length} result(s) (showing first 5):`);
hausPartial.slice(0, 5).forEach(r => console.log(`   - ${r.german} → ${r.english}`));
console.log('');

// Test 3: Look up English word
console.log('3. Looking up English word "house":');
const houseResults = lookupEnglishWord('house');
console.log(`   Found ${houseResults.length} result(s):`);
houseResults.forEach(r => console.log(`   - ${r.english} → ${r.german}`));
console.log('');

// Test 4: Search dictionary
console.log('4. Searching for "good":');
const searchResults = searchDictionary('good', 10);
console.log(`   Found ${searchResults.length} result(s):`);
searchResults.forEach(r => console.log(`   - ${r.german} ⇄ ${r.english}`));
console.log('');

// Test 5: Random entries
console.log('5. Getting 5 random entries:');
const randomResults = getRandomEntries(5);
randomResults.forEach(r => console.log(`   - ${r.german} → ${r.english}`));
console.log('');

// Test 6: Statistics
console.log('6. Dictionary Statistics:');
const stats = getDictionaryStats();
console.log(`   • Total entries: ${stats.totalEntries.toLocaleString()}`);
console.log(`   • Unique German words: ${stats.uniqueGermanWords.toLocaleString()}`);
console.log(`   • Unique English words: ${stats.uniqueEnglishWords.toLocaleString()}`);
console.log('');

console.log('✅ Dictionary tests complete!\n');
