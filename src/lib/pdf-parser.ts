import * as pdfjsLib from 'pdfjs-dist';
import { WindowItem } from './promo-logic';
import { extractPdfMetadata } from './pdf/metadata-extractor';

export { extractPdfMetadata };

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
  
  return rowsOut.map((r) => {
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
  }).filter((r) => r.y < 740);
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

    const resolveSectionSolar = (from: number, to: number): number => {
      let solarGainPrice: number | null = null;
      let solarShieldPrice: number | null = null;

      for (let r = from + 1; r < to; r++) {
        const lbl = (R[r].label || '').toUpperCase().trim();
        if (lbl.startsWith('SOLAR GAIN')) {
          const price = R[r].list ?? R[r].total;
          if (price === null) throw new Error('Missing SOLAR GAIN list price in PDF (page ' + (R[r].page + 1) + ', group ' + id + '). Nothing imported.');
          if (solarGainPrice === null) {
            solarGainPrice = Math.round(price * 100);
          }
        } else if (lbl.startsWith('SOLAR SHIELD')) {
          const price = R[r].list ?? R[r].total;
          if (price === null) throw new Error('Missing SOLAR SHIELD list price in PDF (page ' + (R[r].page + 1) + ', group ' + id + '). Nothing imported.');
          if (solarShieldPrice === null) {
            solarShieldPrice = Math.round(price * 100);
          }
        }
      }

      if (solarGainPrice !== null) return solarGainPrice;
      if (solarShieldPrice !== null) return solarShieldPrice;
      return 0;
    };

    const totalSolar = sections.reduce((s, sec) => s + resolveSectionSolar(sec[0], sec[1]), 0);
    
    let txt = R[start].size || '';
    for (let r = start + 1; r < end; r++) {
      if (childRe.test(R[r].no)) break; 
      const lbl = (R[r].label || '').toUpperCase();
      if (/LINE\s*ITEM\s*TOTAL|AREA\s*:|PERIMETER\s*:|^LOT\/LOCATION/i.test(lbl)) break;
      if (R[r].size) {
        if (/AREA\s*:|PERIMETER\s*:/i.test(R[r].size)) break;
        txt += ' ' + R[r].size;
      }
    }

    const dimPattern = '(\\d+(?:\\.\\d+)?(?:\\s*(?:-|\\s)\\s*\\d+\\/\\d+)?|\\d+\\/\\d+)';
    const frRegex = new RegExp(`FR\\s*:\\s*${dimPattern}\\s*X\\s*${dimPattern}`, 'i');
    const m = txt.match(frRegex);

    const fallbackRegex = new RegExp(`(?:^|\\s)${dimPattern}\\s*X\\s*${dimPattern}(?:\\s|$)`, 'i');
    const fallbackM = !m ? txt.match(fallbackRegex) : null;

    const rawW = m ? m[1] : (fallbackM ? fallbackM[1] : '');
    const rawH = m ? m[2] : (fallbackM ? fallbackM[2] : '');

    const cleanDimension = (v: string) => {
      if (!v) return '';
      const cleaned = v.replace(/[^0-9\s./-]/g, '').replace(/\s+/g, ' ').trim();
      return /\d/.test(cleaned) ? cleaned : '';
    };

    const width = cleanDimension(rawW);
    const height = cleanDimension(rawH);

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
      solar: totalSolar, 
      triple: totalOption('TRIPLE GLAZED') + totalOption('TRIPLE PANE'),
      w: width,
      h: height,
      color,
    });
  }
  
  if (!imported.length) throw new Error('No numbered window items found in PDF. Nothing imported.');
  return imported;
}
