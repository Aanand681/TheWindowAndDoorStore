import * as pdfjsLib from 'pdfjs-dist';
import { WindowItem } from './promo-logic';

export function extractPdfMetadata(items: any[]): { quoteNumber: string; customerName: string } {
  let quoteNumber = '';
  let customerName = '';

  // 1. MUST strictly only examine Page 1 (page === 0)
  const page1Items = (items || [])
    .filter(it => it.page === 0 && it.str && it.str.trim())
    .map(it => ({ ...it, str: it.str.trim() }));

  if (!page1Items.length) return { quoteNumber: '', customerName: '' };

  // Sort page 1 items top-to-bottom, left-to-right
  page1Items.sort((a, b) => a.y - b.y || a.x - b.x);

  // --- STRATEGY 1: TABLE HEADING (ORDER / CUSTOMER REF) ON PAGE 1 ---
  const custRefHeader = page1Items.find(it => /CUSTOMER\s*REF/i.test(it.str));
  if (custRefHeader) {
    const headerY = custRefHeader.y;

    // Get all column headers on the same row as CUSTOMER REF (within 6 units vertical tolerance)
    const rowHeaders = page1Items.filter(it => Math.abs(it.y - headerY) <= 6);

    // Find the ORDER or QUOTE column header on this table row
    const orderHeader = rowHeaders.find(it => /^(ORDER|QUOTE|ORDER\s*#|QUOTE\s*#)$/i.test(it.str));

    // Find adjacent header to the right of CUSTOMER REF (e.g. TERMS) to establish column boundary
    const rightHeader = rowHeaders.find(it => it.x > custRefHeader.x + 10);
    const custMaxX = rightHeader ? rightHeader.x - 5 : custRefHeader.x + 220;
    const custMinX = custRefHeader.x - 30;

    // Next table section row below (e.g. ITEM / NO / DESCRIPTION / QTY)
    const nextRow = page1Items.find(it => it.y > headerY + 18 && /^(ITEM|NO|DESCRIPTION|QTY)$/i.test(it.str));
    const maxY = nextRow ? nextRow.y : headerY + 30;

    // Collect all customer name text items under CUSTOMER REF
    // Handles big names split across chunks or multiple lines
    const nameItems = page1Items.filter(it =>
      it.y > headerY + 3 &&
      it.y < maxY &&
      it.x >= custMinX &&
      it.x <= custMaxX &&
      /[a-zA-Z]/.test(it.str) // Customer name must contain letters
    );

    if (nameItems.length > 0) {
      nameItems.sort((a, b) => a.y - b.y || a.x - b.x);
      customerName = nameItems.map(it => it.str).join(' ').replace(/\s+/g, ' ').trim();
    }

    // Look for quote/order number directly under the ORDER column
    if (orderHeader) {
      const dateHeader = rowHeaders.find(it => it.x > orderHeader.x && /DATE/i.test(it.str));
      const orderMaxX = dateHeader ? dateHeader.x - 5 : orderHeader.x + 60;
      const orderMinX = orderHeader.x - 20;

      const orderItems = page1Items.filter(it =>
        it.y > headerY + 3 &&
        it.y < maxY &&
        it.x >= orderMinX &&
        it.x <= orderMaxX &&
        /^\d+$/.test(it.str) // Quote/Order number MUST be numeric
      );

      if (orderItems.length > 0) {
        orderItems.sort((a, b) => a.y - b.y);
        quoteNumber = orderItems[0].str;
      }
    }
  }

  // --- STRATEGY 2: TOP HEADER LABELS ON PAGE 1 (QUOTE: <num>, # <num>) ---
  if (!quoteNumber) {
    for (let i = 0; i < page1Items.length; i++) {
      const it = page1Items[i];
      if (/^QUOTE\s*:?$/i.test(it.str) || /^ORDER\s*:?$/i.test(it.str)) {
        // Look to the right on the same line or right below
        const numMatch = page1Items.find(next =>
          Math.abs(next.y - it.y) <= 8 &&
          next.x > it.x &&
          next.x < it.x + 80 &&
          /^\d{4,8}$/.test(next.str)
        );
        if (numMatch) {
          quoteNumber = numMatch.str;
          break;
        }
      } else if (it.str === '#' && page1Items[i + 1] && /^\d{4,8}$/.test(page1Items[i + 1].str)) {
        quoteNumber = page1Items[i + 1].str;
        break;
      }
    }
  }

  // --- STRATEGY 3: TOP HEADER CUSTOMER LABELS (QUOTE NAME:, QUOTE CONTACT:) ---
  if (!customerName) {
    for (let i = 0; i < page1Items.length; i++) {
      const it = page1Items[i];
      if (/QUOTE\s*NAME\s*:/i.test(it.str)) {
        const val = page1Items.find(next =>
          Math.abs(next.y - it.y) <= 6 &&
          next.x > it.x &&
          /[a-zA-Z]/.test(next.str)
        );
        if (val) customerName = val.str;
        break;
      } else if (/QUOTE\s*CONTACT\s*:/i.test(it.str)) {
        const val = page1Items.find(next =>
          (Math.abs(next.y - it.y) <= 6 && next.x > it.x) ||
          (next.y > it.y && next.y < it.y + 20 && Math.abs(next.x - it.x) < 40)
        );
        if (val && /[a-zA-Z]/.test(val.str)) customerName = val.str;
        break;
      }
    }
  }

  // Final validation and cleaning
  // Quote number MUST be purely digits
  if (quoteNumber) {
    const digitMatch = quoteNumber.match(/\b\d{4,8}\b/);
    quoteNumber = digitMatch ? digitMatch[0] : '';
  }

  // Customer name MUST contain characters and not be purely digits or a date
  if (customerName) {
    if (/^\d+$/.test(customerName) || /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(customerName)) {
      customerName = '';
    } else {
      customerName = customerName.replace(/\s+/g, ' ').trim();
    }
  }

  return { quoteNumber, customerName };
}

export async function readPdfItems(file: File) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const items: any[] = [];
  
  for (let p = 1; p <= pdfDoc.numPages; p++) {
    const page = await pdfDoc.getPage(p);
    const h = page.getViewport({ scale: 1 }).height;
    const content = await page.getTextContent();
    for (const t of content.items as any[]) {
      if (!t.str || !t.str.trim()) continue;
      items.push({ page: p - 1, x: t.transform[4], y: h - t.transform[5], str: t.str });
    }
  }
  return items;
}

export function pdfItemsToRows(items: any[]) {
  const sorted = [...items].sort((a, b) => a.page - b.page || a.y - b.y || a.x - b.x);
  const rowsOut: any[] = [];
  let cur: any = null;
  for (const it of sorted) {
    if (!String(it.str).trim()) continue;
    if (!cur || cur.page !== it.page || Math.abs(it.y - cur.y) > 3) {
      cur = { page: it.page, y: it.y, items: [] };
      rowsOut.push(cur);
    }
    cur.items.push(it);
  }
  
  return rowsOut.map(r => {
    const its = r.items.sort((a: any, b: any) => a.x - b.x);
    const money = (s: string) => Number(s.replace(/[$,]/g, ''));
    const out: any = { page: r.page, y: r.y, no: '', qty: null as number | null, label: '', list: null as number | null, total: null as number | null, size: '' };
    const labelParts: string[] = [];
    const sizeParts: string[] = [];
    
    for (const it of its) {
      const s = String(it.str).trim();
      if (it.x < 50 && !out.no && !labelParts.length && /^\d+(?:\.\d+)?$/.test(s)) { out.no = s; continue; }
      if (it.x >= 250 && it.x < 285 && /^\d+$/.test(s)) { out.qty = Number(s); continue; }
      if (it.x >= 370 && /^\$[\d,]+\.\d{2}$/.test(s)) {
        if (it.x < 445) out.list = money(s); else out.total = money(s);
        continue;
      }
      if (it.x >= 250 && it.x <= 390 && !/^\$/.test(s)) { sizeParts.push(s); continue; }
      if (it.x < 250 || /LINE|ITEM|TOTAL/i.test(s)) labelParts.push(s);
    }
    out.label = labelParts.join(' ').replace(/\s+/g, ' ').trim();
    out.size = sizeParts.join(' ').replace(/\s+/g, ' ').trim();
    return out;
  }).filter(r => r.y < 740);
}

export function parseManufacturerPdfItems(items: any[]): WindowItem[] {
  const R = pdfItemsToRows(items);
  const starts: number[] = [];
  R.forEach((r, i) => {
    if (/^[1-9]\d*$/.test(r.no) && r.label && r.qty !== null) starts.push(i);
  });
  
  const imported: WindowItem[] = [];
  for (let pi = 0; pi < starts.length; pi++) {
    const start = starts[pi];
    const end = starts[pi + 1] ?? R.length;
    const id = R[start].no;
    const childRe = new RegExp('^' + id + '\\.\\d+$');
    const children: number[] = [];
    
    for (let r = start + 1; r < end; r++) {
      if (childRe.test(R[r].no) && R[r].label) children.push(r);
    }
      
    let total: number | null = null;
    for (let r = start + 1; r < end; r++) {
      if (R[r].label.toUpperCase().startsWith('LINE ITEM TOTAL')) { total = R[r].list ?? R[r].total; break; }
    }
    
    if (total === null || total <= 0) throw new Error(
      'Missing parent list LINE ITEM TOTAL for group ' + id + '. Nothing imported.');
      
    const option = (from: number, to: number, name: string) => {
      let amount = 0;
      for (let r = from + 1; r < to; r++) {
        if (!R[r].label.toUpperCase().startsWith(name)) continue;
        const price = R[r].list ?? R[r].total;
        if (price === null) throw new Error('Missing ' + name +
          ' list price in PDF (page ' + (R[r].page + 1) + ', group ' + id + '). Nothing imported.');
        amount += Math.round(price * 100);
      }
      return amount;
    };
    
    const sections = children.length
      ? children.map((r, j) => [r, children[j + 1] ?? end]) : [[start, end]];
      
    const totalOption = (name: string) => sections.reduce((s, sec) => s + option(sec[0], sec[1], name), 0);
    
    // Extract Width and Height exactly like original logic
    let txt = R[start].size || '';
    for (let r = start + 1; r < end; r++) {
      if (childRe.test(R[r].no)) break; 
      if (R[r].size) txt += ' ' + R[r].size;
      if (/^LOT\/LOCATION/i.test(R[r].label)) break;
    }
    const m = txt.match(/FR\s*:\s*(.+?)\s+X\s+(.+?)\s*(?:BM\s*:|$)/i);
    const width = m ? m[1].trim() : '';
    const height = m ? m[2].trim() : '';
    // User instruction: "if its white show white other wise replace it as painted"
    // Filter out insect screen mesh, locks/hardware, and glazing specs so "BLACK MESH" is never mistaken for frame paint
    const frameLines: string[] = [];
    for (let r = start; r < end; r++) {
      const lbl = (R[r].label || '').toUpperCase();
      if (/\b(MESH|SCREEN|SCR\b|LATCH|LOCK|CRANK|OPERATOR|GLAZED|ARGON|SOLAR)\b/i.test(lbl)) {
        continue;
      }
      if (R[r].label) frameLines.push(R[r].label);
      if (R[r].size) frameLines.push(R[r].size);
    }
    const frameText = frameLines.join(' ');
    
    // Check if painted or non-white color is present on the window frame
    let color: 'White' | 'Painted' = 'White';
    const hasPaint = /\b(PAINT|PAINTED|PAINTING|EXTERIOR PAINT|CUSTOM COLOR)\b/i.test(frameText);
    const nonWhiteColors = /\b(BLACK|BRONZE|COMMERCIAL BROWN|BROWN|CHARCOAL|PEBBLE|IRON ORE|SLATE|GREY|GRAY|SANDALWOOD|WICKER|ALMOND|BURGUNDY|FOREST GREEN|GREEN|RED|BLUE)\b/i.test(frameText);
    const isExplicitWhite = /(?:STANDARD WHITE|WHITE \(137\)|WHITE\s*\(137\)\s*IN\s*&\s*OUT|WHITE EXTRACRON|ALL WHITE|\bWHITE\b)/i.test(frameText);
    
    if (hasPaint || (nonWhiteColors && !isExplicitWhite)) {
      color = 'Painted';
    } else {
      color = 'White';
    }

    imported.push({
      id: Math.random().toString(36).substring(2, 9), 
      qty: R[start].qty as number, 
      base: Math.round(total * 100),
      argon: totalOption('ARGON'),   
      solar: totalOption('SOLAR GAIN'), 
      triple: totalOption('TRIPLE GLAZED') + totalOption('TRIPLE PANE'),
      w: width,
      h: height,
      color,
    });
  }
  
  if (!imported.length) throw new Error('No numbered window items found in PDF. Nothing imported.');
  return imported;
}
