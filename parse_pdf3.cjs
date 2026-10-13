const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extract() {
  const data = new Uint8Array(fs.readFileSync('/Users/cheeku/.gemini/antigravity-ide/brain/7310ab2a-f360-44ff-bce8-1b1f32404933/.user_uploaded/media_1791570804468.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const h = page.getViewport({ scale: 1 }).height;
  const content = await page.getTextContent();
  const items = content.items.map(t => ({ x: t.transform[4], y: h - t.transform[5], str: t.str }));
  
  let quoteNumber = '';
  let customerName = '';

  for (let i = 0; i < items.length; i++) {
    if (items[i].str.trim() === 'ORDER') {
      const orderY = items[i].y;
      const orderX = items[i].x;
      const matches = items.filter(it => Math.abs(it.x - orderX) < 20 && it.y > orderY && it.y < orderY + 30);
      matches.sort((a,b) => a.y - b.y);
      if (matches.length > 0) quoteNumber = matches[0].str.trim();
    }
    if (items[i].str.trim() === 'CUSTOMER REF') {
      const refY = items[i].y;
      const refX = items[i].x;
      const matches = items.filter(it => Math.abs(it.x - refX) < 20 && it.y > refY && it.y < refY + 30);
      matches.sort((a,b) => a.y - b.y);
      if (matches.length > 0) customerName = matches[0].str.trim();
    }
  }
  console.log("Q:", quoteNumber, "C:", customerName);
}
extract().catch(console.error);
