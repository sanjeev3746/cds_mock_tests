const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Read the PDF file
const pdfPath = 'C:\\Users\\HP\\Documents\\CDS\\CDS-II-2024.pdf';

async function testParse() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    
    console.log('=== PDF INFO ===');
    console.log('Pages:', data.numpages);
    console.log('Text length:', data.text.length);
    console.log('\n=== FIRST 3000 CHARACTERS ===');
    console.log(data.text.substring(0, 3000));
    console.log('\n=== LINE BY LINE (first 50 lines) ===');
    const lines = data.text.split('\n').map(l => l.trim()).filter(l => l);
    lines.slice(0, 50).forEach((line, idx) => {
      console.log(`${idx + 1}: ${line}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testParse();
