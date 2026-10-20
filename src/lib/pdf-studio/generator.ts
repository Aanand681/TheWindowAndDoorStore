import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont, PDFImage } from 'pdf-lib';
import { StudioQuoteData, StudioWindowItem } from './types';
import { pretty } from './extractor';

const cash = (n: string | number) => {
  const num = Number(n);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const result: string[] = [];
  let current = '';
  const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ');

  for (const word of words) {
    if (!word) continue;
    const next = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(next, size) > maxWidth) {
      result.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) result.push(current);
  return result;
}

async function embedImage(doc: PDFDocument, dataUrl: string): Promise<PDFImage | null> {
  try {
    const res = await fetch(dataUrl);
    const bytes = await res.arrayBuffer();
    if (dataUrl.startsWith('data:image/png')) {
      return await doc.embedPng(bytes);
    } else {
      return await doc.embedJpg(bytes);
    }
  } catch (err) {
    console.warn('Failed to embed image:', err);
    return null;
  }
}

export async function generateStudioPdf(data: StudioQuoteData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const gray = rgb(0.5, 0.5, 0.5);
  const white = rgb(1, 1, 1);
  const black = rgb(0, 0, 0);

  const pages: PDFPage[] = [];
  let currentPage!: PDFPage;
  let y = 760;

  const draw = (
    s: string | number,
    x: number,
    z: number,
    size = 8,
    font = reg,
    color = black
  ) => {
    currentPage.drawText(String(s), {
      x,
      y: z,
      size,
      font,
      color,
    });
  };

  function drawUnifiedTableHeaders() {
    // 1. Metadata Bar (Gray header + values row)
    currentPage.drawRectangle({
      x: 10,
      y: y - 16,
      width: 592,
      height: 16,
      color: gray,
    });

    const metaHeaders: [string, number][] = [
      ['ORDER', 25],
      ['ORDER DATE', 100],
      ['PO NUMBER', 177],
      ['CUSTOMER REF', 320],
      ['TERMS', 528],
    ];

    metaHeaders.forEach(([h, colX]) => {
      draw(h, colX, y - 12, 8, bold, white);
    });

    // Values right under metadata header
    draw(data.quoteNumber || '', 25, y - 26, 8.5);
    draw(data.customerName || '', 320, y - 26, 8.5);

    // 2. Items Table Bar (Gap reduced by ~20% from 42pt to 34pt)
    const itemHeaderY = y - 34;
    currentPage.drawRectangle({
      x: 10,
      y: itemHeaderY - 16,
      width: 592,
      height: 16,
      color: gray,
    });

    const itemColumns: [string, number][] = [
      ['ITEM', 15],
      ['DESCRIPTION', 100],
      ['QTY', 255],
      ['SIZE', 330],
      ['LIST', 475],
      ['TOTAL', 545],
    ];

    itemColumns.forEach(([colName, colX]) => {
      draw(colName, colX, itemHeaderY - 12, 8, bold, white);
    });

    // Position y for rows
    y = itemHeaderY - 26;
  }

  async function createPage(isFirst: boolean) {
    currentPage = doc.addPage([612, 792]);
    pages.push(currentPage);

    if (isFirst) {
      // Company Logo
      let logoImage: PDFImage | null = null;
      if (data.logoDataUrl) {
        logoImage = await embedImage(doc, data.logoDataUrl);
      } else {
        // Try multiple standard public paths
        const candidatePaths = [
          '/images/logo.png',
          '/images/logo.jpg',
          '/logo.png',
          '/logo.jpg',
          '/Logo/Logo 3.jpg',
          '/Logo 3.jpg',
        ];
        for (const p of candidatePaths) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              const bytes = await res.arrayBuffer();
              logoImage = p.endsWith('.png') ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
              if (logoImage) break;
            }
          } catch { }
        }
      }

      const top = 745;
      let logoH = 68;
      if (logoImage) {
        const fit = logoImage.scaleToFit(72, 80);
        logoH = fit.height;
        currentPage.drawImage(logoImage, {
          x: 20 + (72 - fit.width) / 2,
          y: top - fit.height,
          width: fit.width,
          height: fit.height,
        });
      }

      // Company info & address lines
      const head = [
        data.companyName || 'The Window & Door Store',
        ...(data.address || '').split('\n').map(s => s.trim()),
      ].filter(Boolean);

      const lineH = 11.5;
      const logoBottom = top - logoH;
      // Strictly anchor the bottom of the address text to the bottom of the logo
      const headTop = logoBottom + (head.length - 1) * lineH + 1.5;

      head.forEach((s, i) => {
        draw(s, 104, headTop - i * lineH, 8.5, i === 0 ? bold : reg);
      });

      // Top right quote number aligned at the same height as the company name
      draw(`QUOTE: ${data.quoteNumber || ''}`, 465, headTop, 10, bold);

      // Start the table block with a clean gap below the logo/address bottom
      y = logoBottom - 16;
    } else {
      // Subsequent pages start near top
      y = 765;
    }

    drawUnifiedTableHeaders();
  }

  await createPage(true);

  const isSupply = data.mode === 'supply';

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    const isChild = item.child;
    const nextItem = data.items[i + 1];
    const isNextChild =
      nextItem &&
      nextItem.child &&
      nextItem.id.split('.')[0] === item.id.split('.')[0];

    const optsLines = wrapText(item.options || '', reg, 8, 180);

    const sizeLines: string[] = [];
    if (isSupply && !isChild) {
      if (item.fr) {
        sizeLines.push(...wrapText(`FR: ${pretty(item.fr)}`, reg, 8, 160));
      }
      if (item.bm) {
        sizeLines.push(...wrapText(`BM: ${pretty(item.bm)}`, reg, 8, 160));
      }
      if (item.ro) {
        sizeLines.push(...wrapText(`R/O: ${pretty(item.ro)}`, reg, 8, 160));
      }
    }

    // Row height accounts for price line + CAD drawing (up to 75pt) + Outside view label
    const drawingHeight = item.image ? 85 : 0;
    const rowHeight = Math.max(
      drawingHeight > 0 ? drawingHeight + 36 : 85,
      optsLines.length * 11 + 34,
      sizeLines.length * 11 + 20
    );

    // If row doesn't fit on current page, create next page
    if (y - rowHeight < 45) {
      await createPage(false);
    }

    const top = y;

    // Draw Item ID and Name
    draw(item.id || String(i + 1), 20, top);
    draw(item.name || '', 42, top);

    // Qty (only on parents)
    if (!isChild && item.qty) {
      draw(item.qty, 257, top);
    }

    // Size lines (moved 20% right to x: 330)
    sizeLines.forEach((line, j) => {
      draw(line, 330, top - j * 11, 8);
    });

    // Options lines
    optsLines.forEach((line, j) => {
      draw(line, 42, top - 14 - j * 11, 8);
    });

    // Price / Total on top line (at x: 535)
    if (item.price) {
      const priceText = `$${cash(item.price)}`;
      draw(priceText, 535, top);
    }

    // Embed CAD image if present: strictly BELOW the price line to prevent overlap!
    if (item.image) {
      const img = await embedImage(doc, item.image);
      if (img) {
        const fit = img.scaleToFit(85, 75);
        const imgX = 490 + (85 - fit.width) / 2;
        // Top of image is anchored at top - 16, so it NEVER touches the price at top!
        const imgY = top - 16 - fit.height;

        currentPage.drawImage(img, {
          x: imgX,
          y: imgY,
          width: fit.width,
          height: fit.height,
        });

        if (!isChild) {
          const label = 'Outside view';
          const labelW = bold.widthOfTextAtSize(label, 8);
          // Position label tightly right below the drawing
          draw(label, 490 + (85 - labelW) / 2, imgY - 9, 8, bold);
        }
      }
    }

    y -= rowHeight;

    // Divider line between items
    if (!isNextChild) {
      currentPage.drawLine({
        start: { x: 10, y },
        end: { x: 602, y },
        thickness: 1,
        color: black,
      });
      y -= 14;
    }
  }

  // Draw running page numbers on all pages
  pages.forEach((p, idx) => {
    p.drawText(`${idx + 1} of ${pages.length}`, {
      x: 289,
      y: 18,
      font: reg,
      size: 8,
      color: black,
    });
  });

  return await doc.save();
}
