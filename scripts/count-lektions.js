/**
 * Count and list all Lektions in the PDFs
 */

const PDFParser = require('pdf2json');

const B1_1_PDF = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu 5 B1.1\\extras from website\\301086_Loesungen_AB.pdf';

async function parsePDF(pdfPath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      let text = '';
      pdfData.Pages.forEach(page => {
        page.Texts.forEach(textItem => {
          text += decodeURIComponent(textItem.R[0].T) + ' ';
        });
        text += '\n';
      });
      resolve(text);
    });

    pdfParser.loadPDF(pdfPath);
  });
}

async function countLektions() {
  console.log('Analyzing B1.1 PDF...\n');
  const text = await parsePDF(B1_1_PDF);

  const pattern = /Lektion\s+(\d+)/gi;
  const matches = [...text.matchAll(pattern)];

  console.log(`Found ${matches.length} Lektion headers:`);
  matches.forEach(m => {
    const index = m.index;
    const snippet = text.substring(index, index + 100).replace(/\s+/g, ' ');
    console.log(`  - Lektion ${m[1]}: "${snippet}..."`);
  });

  console.log('\n=== Searching for exercise patterns ===');

  // Look for exercise number patterns
  const exercisePattern = /\b(\d+[a-z]?)\s+([a-z]\s+[a-zäöüß]+\s+){2,}/gi;
  const exerciseMatches = [...text.matchAll(exercisePattern)];

  console.log(`Found ${exerciseMatches.length} exercise-like patterns`);
  exerciseMatches.slice(0, 10).forEach(m => {
    const snippet = m[0].substring(0, 80).replace(/\s+/g, ' ');
    console.log(`  - Exercise ${m[1]}: "${snippet}..."`);
  });
}

countLektions().catch(console.error);
