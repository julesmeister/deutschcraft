const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu A1.1\\Schritte International neu 1_Unterichtsplan\\Schritte_international_Neu_1_UP_L1.pdf';

async function testPdfRead() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    console.log('===== PDF INFO =====');
    console.log('Pages:', data.numpages);
    console.log('');
    console.log('===== FIRST 3000 CHARACTERS =====');
    console.log(data.text.substring(0, 3000));
    console.log('');
    console.log('===== SHOWING LINES 50-100 =====');
    const lines = data.text.split('\n');
    console.log(lines.slice(50, 100).join('\n'));

  } catch (error) {
    console.error('Error reading PDF:', error.message);
  }
}

testPdfRead();
