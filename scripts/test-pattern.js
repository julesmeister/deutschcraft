const fs = require('fs');

const text = fs.readFileSync('pdf-text-sample.txt', 'utf8');

console.log('=== Testing Lektion Pattern ===\n');

// Try different patterns
const patterns = [
  /Lektion\s+(\d+)/g,
  /Lektion\s+(\d+)/gi,
  /Lektion.*?(\d+)/g,
  /Lektion[\s\u00A0]+(\d+)/g,  // Include non-breaking space
];

patterns.forEach((pattern, idx) => {
  console.log(`Pattern ${idx + 1}: ${pattern}`);
  const matches = [...text.matchAll(pattern)];
  console.log(`  Matches: ${matches.length}`);
  matches.slice(0, 3).forEach(m => {
    console.log(`    - "${m[0]}" → Lesson ${m[1]}`);
  });
  console.log('');
});

// Show first 500 chars around "Lektion"
const lektionIndex = text.indexOf('Lektion');
if (lektionIndex > -1) {
  console.log('=== Context around "Lektion" ===');
  const start = Math.max(0, lektionIndex - 100);
  const end = Math.min(text.length, lektionIndex + 200);
  const snippet = text.substring(start, end);
  console.log(snippet);
  console.log('\n=== Character codes around "Lektion" ===');
  const codes = snippet.split('').map((c, i) => `${c}(${c.charCodeAt(0)})`).join(' ');
  console.log(codes.substring(0, 300));
}
