const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu A1.1\\Schritte International neu 1_Unterichtsplan\\Schritte_international_Neu_1_UP_L1.pdf';

async function debugPattern() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    const lines = data.text.split('\n');

    console.log('===== Lines containing A1, A2, B1, B2, C1, C2, etc. =====\n');

    let count = 0;
    for (let i = 0; i < lines.length && count < 30; i++) {
      const line = lines[i].trim();

      // Look for patterns like A1, A2, B1, B2, C1, C2
      if (/^[A-C][0-9]{1,2}\s/.test(line) || /^[A-C][0-9]{1,2}$/.test(line)) {
        console.log(`Line ${i}: "${line}"`);
        if (lines[i + 1]) console.log(`  Next: "${lines[i + 1].trim()}"`);
        if (lines[i + 2]) console.log(`  Next+1: "${lines[i + 2].trim()}"`);
        console.log('');
        count++;
      }
    }

    console.log('\n===== Lines with just a, b, c, d alone =====\n');

    count = 0;
    for (let i = 0; i < lines.length && count < 30; i++) {
      const line = lines[i].trim();

      // Look for standalone a, b, c, d
      if (/^[a-z]$/.test(line)) {
        console.log(`Line ${i}: "${line}"`);
        if (lines[i - 1]) console.log(`  Prev: "${lines[i - 1].trim()}"`);
        if (lines[i + 1]) console.log(`  Next: "${lines[i + 1].trim()}"`);
        if (lines[i + 2]) console.log(`  Next+1: "${lines[i + 2].trim()}"`);
        console.log('');
        count++;
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugPattern();
