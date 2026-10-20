import * as pdfjsLib from 'pdfjs-dist';
import { StudioQuoteData, StudioWindowItem } from './types';

export function plusOne(part: string): string | null {
  const m = part.trim().match(/^(\d+)(?:\s+(\d+)\/(\d+))?$/);
  if (!m) return null;
  const whole = Number(m[1]) + 1;
  return m[2] ? `${whole} ${m[2]}/${m[3]}` : String(whole);
}

export function rough(size: string): string {
  const m = size.match(/^(\d+(?:\s+\d+\/\d+)?)\s*X\s*(\d+(?:\s+\d+\/\d+)?)$/i);
  if (!m) return '';
  const w = plusOne(m[1]);
  const h = plusOne(m[2]);
  return w && h ? `${w} X ${h}` : '';
}

export function pretty(size: string): string {
  const m = size.match(/^(\d+(?:\s+\d+\/\d+)?)\s*X\s*(\d+(?:\s+\d+\/\d+)?)$/i);
  return m ? `${m[1]}" wide X ${m[2]}" high` : size;
}

interface TextLine {
  y: number;
  text: string;
}

function lines(items: any[]): TextLine[] {
  const out: { y: number; parts: { x: number; text: string }[] }[] = [];
  for (const item of items) {
    if (!item.str || !item.str.trim()) continue;
    const x = item.transform[4];
    const y = item.transform[5];
    let r = out.find(a => Math.abs(a.y - y) < 2.5);
    if (!r) {
      r = { y, parts: [] };
      out.push(r);
    }
    r.parts.push({ x, text: item.str.trim() });
  }

  return out
    .sort((a, b) => b.y - a.y)
    .map(r => ({
      y: r.y,
      text: r.parts
        .sort((a, b) => a.x - b.x)
        .map(t => t.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim(),
    }));
}

const rowPattern = (s: string) =>
  s.match(
    /^\s*(\d+(?:\.\d+)?)\s+(.+?)\s+(\d+)\s+FR:\s*([^$]+?)(?:\s+\$([\d,]+\.\d{2})\s+\$([\d,]+\.\d{2}))?\s*$/i
  );

const boundary = (s: string) =>
  /^(?:LINE ITEM TOTAL\s*:|TOTALS\s*:|SUBTOTAL\s*:|TOTAL\s*:|COMMENT\s*:|ITEM\s+DESCRIPTION\s+QTY|ORDER\s+ORDER DATE|QUOTE LIST\b|QUOTE\s*:|QUOTE DATE\s*:|QUOTE CONTACT\s*:|\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}:\d{2}|\d+\s+of\s+\d+\b|v\d+\s*$)/i.test(
    s.trim()
  );

function optionsIn(data: TextLine[], start: number, end: number): { bm: string; options: string } {
  let bm = '';
  const text: string[] = [];
  for (let i = start; i < end; i++) {
    const s = data[i].text.trim();
    if (boundary(s) || /^\$[\d,]+\.\d{2}|^Area:|^Perimeter:/i.test(s)) break;
    if (/^BM\s*:/i.test(s)) {
      bm = s.replace(/^BM\s*:/i, '').trim();
      continue;
    }
    text.push(s);
  }
  return {
    bm,
    options: text.join(' ').replace(/\s+/g, ' ').trim(),
  };
}

function mult(a: number[], b: number[]): number[] {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

interface BBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

function bbox(t: number[]): BBox {
  const p = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ].map(([x, y]) => ({
    x: t[0] * x + t[2] * y + t[4],
    y: t[1] * x + t[3] * y + t[5],
  }));
  return {
    x0: Math.min(...p.map(z => z.x)),
    x1: Math.max(...p.map(z => z.x)),
    y0: Math.min(...p.map(z => z.y)),
    y1: Math.max(...p.map(z => z.y)),
  };
}

function getImagePlacements(ops: any): BBox[] {
  const F = (pdfjsLib as any).OPS;
  let t = [1, 0, 0, 1, 0, 0];
  const stack: number[][] = [];
  const result: BBox[] = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    const op = ops.fnArray[i];
    const arg = ops.argsArray[i];
    if (op === F.save) {
      stack.push([...t]);
    } else if (op === F.restore) {
      t = stack.pop() || [1, 0, 0, 1, 0, 0];
    } else if (op === F.transform) {
      t = mult(t, arg);
    } else if (
      [
        F.paintImageXObject,
        F.paintInlineImageXObject,
        F.paintJpegXObject,
        F.paintImageMaskXObject,
      ].includes(op)
    ) {
      const b = bbox(t);
      if (b.x1 - b.x0 > 8 && b.y1 - b.y0 > 8) {
        result.push(b);
      }
    }
  }
  return result;
}

/**
 * Crops a bounding box from a rendered page canvas
 */
function cropFromCanvas(pageCanvas: HTMLCanvasElement, pageViewHeight: number, b: BBox): string {
  const pad = 1;
  const scale = 4;
  const x = Math.max(0, Math.floor((b.x0 - pad) * scale));
  const y = Math.max(0, Math.floor((pageViewHeight - b.y1 - pad) * scale));
  const w = Math.min(pageCanvas.width - x, Math.ceil((b.x1 - b.x0 + pad * 2) * scale));
  const h = Math.min(pageCanvas.height - y, Math.ceil((b.y1 - b.y0 + pad * 2) * scale));

  if (w <= 0 || h <= 0) return '';

  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(pageCanvas, x, y, w, h, 0, 0, w, h);
  return out.toDataURL('image/png');
}

export async function extractSupplierQuote(
  file: File,
  onProgress?: (status: string) => void
): Promise<StudioQuoteData> {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  onProgress?.('Loading supplier PDF…');
  const arrayBuffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const resultItems: StudioWindowItem[] = [];
  const allLines: string[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    onProgress?.(`Processing page ${p} of ${doc.numPages}…`);
    const page = await doc.getPage(p);
    const textContent = await page.getTextContent();
    const data = lines(textContent.items as any[]);
    allLines.push(...data.map(x => x.text));

    const ops = await page.getOperatorList();
    const placements = getImagePlacements(ops);

    // Render page canvas ONCE per page (huge speedup!)
    let pageCanvas: HTMLCanvasElement | null = null;
    const vp = page.getViewport({ scale: 4 });
    const viewHeight = page.view[3];

    for (let i = 0; i < data.length; i++) {
      const m = rowPattern(data[i].text);
      if (!m) continue;

      let end = data.findIndex((l, j) => j > i && (rowPattern(l.text) || boundary(l.text)));
      if (end < 0) end = data.length;

      const detail = optionsIn(data, i + 1, end);
      const id = m[1];
      const pageViewWidth = page.view[2];

      // Match CAD drawing on the right side of the page near the line item Y
      const found = placements
        .filter(
          b => b.x0 > pageViewWidth * 0.65 && Math.abs((b.y0 + b.y1) / 2 - data[i].y) < 125
        )
        .sort(
          (a, b) =>
            Math.abs((a.y0 + a.y1) / 2 - data[i].y) - Math.abs((b.y0 + b.y1) / 2 - data[i].y)
        );

      let image: string | null = null;
      if (found.length) {
        if (!pageCanvas) {
          pageCanvas = document.createElement('canvas');
          pageCanvas.width = Math.ceil(vp.width);
          pageCanvas.height = Math.ceil(vp.height);
          await page.render({
            canvasContext: pageCanvas.getContext('2d')!,
            viewport: vp,
          }).promise;
        }
        image = cropFromCanvas(pageCanvas, viewHeight, found[0]);
      }

      resultItems.push({
        id,
        name: m[2].trim(),
        qty: m[3],
        fr: m[4].trim(),
        bm: detail.bm,
        ro: rough(m[4]),
        price: m[6]?.replaceAll(',', '') || '',
        options: detail.options,
        child: id.includes('.'),
        image,
      });
    }
  }

  if (!resultItems.length) {
    throw new Error('No window line items could be detected in this PDF. Please check the PDF format.');
  }

  const fullText = allLines.join('\n');
  const quoteNumber = fullText.match(/QUOTE:\s*(\d+)/i)?.[1] || '';
  const customerName =
    fullText.match(/\b\d{5,}\s+\d{1,2}\/\d{1,2}\/\d{4}\s+([^\n]+)/)?.[1]?.trim() || '';

  return {
    quoteNumber,
    customerName,
    companyName: 'The Window & Door Store',
    address: '305 Kirsti Pl\nHWY 11/71 W\nFort Frances, ON P9A 3V9\nPH: 1 807 274-0302',
    mode: 'supply',
    items: resultItems,
  };
}
