const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extract() {
  const data = new Uint8Array(fs.readFileSync('/Users/cheeku/.gemini/antigravity-ide/brain/7310ab2a-f360-44ff-bce8-1b1f32404933/.user_uploaded/media_1791570804468.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const items = content.items;
  
  let quoteNumber = '';
  let customerName = '';

  for (let i = 0; i < items.length; i++) {
    if (items[i].str.trim() === 'ORDER') {
      const orderY = items[i].transform[5];
      const orderX = items[i].transform[4];
      const val = items.find(it => Math.abs(it.transform[4] - orderX) < 20 && it.transform[5] < orderY && it.transform[5] > orderY - 30);
      if (val) quoteNumber = val.str.trim();
    }
    if (items[i].str.trim() === 'CUSTOMER REF') {
      const refY = items[i].transform[5];
      const refX = items[i].transform[4];
      const val = items.find(it => Math.abs(it.transform[4] - refX) < 20 && it.transform[5] < refY && it.transform[5] > refY - 30);
      if (val) customerName = val.str.trim();
    }
  }
  console.log("Q:", quoteNumber, "C:", customerName);
}
extract().catch(console.error);
