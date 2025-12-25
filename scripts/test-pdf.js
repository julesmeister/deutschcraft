const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const pdfPath = 'C:\\Users\\User\\Documents\\Schritte\\Schritte International Neu 5 B1.1\\extras from website\\301086_Loesungen_AB.pdf';

const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(data => {
  console.log('Pages:', data.numpages);
  console.log('Text length:', data.text.length);
  console.log('\nFirst 500 characters:');
  console.log(data.text.substring(0, 500));
}).catch(err => {
  console.error('Error:', err);
});
