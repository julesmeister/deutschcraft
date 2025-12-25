/**
 * Debug: Output first 3000 chars of PDF text to understand structure
 */

const PDFParser = require('pdf2json');

const pdfPath = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu 5 B1.1\\extras from website\\301086_Loesungen_AB.pdf';

const pdfParser = new PDFParser();

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
  let text = '';
  pdfData.Pages.forEach((page, pageNum) => {
    if (pageNum < 3) {  // Only first 3 pages
      page.Texts.forEach(textItem => {
        text += decodeURIComponent(textItem.R[0].T) + ' ';
      });
      text += '\n\n=== END PAGE ' + (pageNum + 1) + ' ===\n\n';
    }
  });
  console.log(text);

  // Save to file for inspection
  require('fs').writeFileSync('pdf-text-sample.txt', text);
  console.log('\nSaved to pdf-text-sample.txt');
});

pdfParser.loadPDF(pdfPath);
