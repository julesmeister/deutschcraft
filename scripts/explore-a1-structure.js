const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu A1.1\\Schritte International neu 1_Unterichtsplan\\Schritte_international_Neu_1_UP_L1.pdf';

async function explorePdfStructure() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    console.log('Total pages:', data.numpages);
    console.log('');

    const lines = data.text.split('\n');

    // Look for patterns that might be exercise markers
    console.log('===== Looking for exercise patterns =====\n');

    const exercisePatterns = [];
    const headings = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Look for numbered exercises (1, 2, 3, etc. at start of line)
      if (/^[0-9]+[a-z]?\s+[A-Z]/.test(line) || /^[0-9]+[a-z]?$/.test(line)) {
        exercisePatterns.push({ line: i, text: line });
      }

      // Look for headings (typically uppercase or bold)
      if (line.length > 3 && line.length < 80 && /^[A-ZÄÖÜ]/.test(line) && !line.includes('©') && !line.includes('Schritte international')) {
        headings.push({ line: i, text: line });
      }
    }

    console.log('Found potential headings:', headings.length);
    console.log('First 20 headings:');
    headings.slice(0, 20).forEach(h => console.log(`  Line ${h.line}: ${h.text}`));

    console.log('\n===== Found potential exercise markers:', exercisePatterns.length);
    console.log('First 30 exercise patterns:');
    exercisePatterns.slice(0, 30).forEach(p => console.log(`  Line ${p.line}: ${p.text}`));

    // Show a sample of the full text structure
    console.log('\n===== Sample text (lines 100-200) =====');
    console.log(lines.slice(100, 200).join('\n'));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

explorePdfStructure();
