const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extract() {
  const data = new Uint8Array(fs.readFileSync('/Users/cheeku/.gemini/antigravity-ide/brain/7310ab2a-f360-44ff-bce8-1b1f32404933/.user_uploaded/media_1791570804468.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const sorted = content.items.sort((a,b) => (a.transform[5] > b.transform[5] ? -1 : 1));
  sorted.forEach(t => {
     console.log(`y:${Math.round(t.transform[5])} x:${Math.round(t.transform[4])} text: "${t.str}"`);
  });
}
extract().catch(console.error);
