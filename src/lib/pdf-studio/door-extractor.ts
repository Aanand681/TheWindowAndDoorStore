import * as pdfjsLib from 'pdfjs-dist';
import { ensurePdfWorker } from './pdf-init';
import { StudioDoorItem, StudioDoorQuoteData, StudioDoorSpecItem } from './door-types';
import {
  DEFAULT_TRIM_LEFT,
  DEFAULT_TRIM_BOTTOM,
  renderDoorRaw,
  renderRegion,
  imageRects,
  trimCanvas,
  recropDoorLine,
} from './door-canvas-crop';

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

function toSixteenths(t: string): number | null {
  const m = String(t).trim().match(/^(\d+)(?:\s+(\d+)\/(\d+))?$/);
  if (!m) return null;
  let f = 0;
  if (m[2]) {
    f = (+m[2] / +m[3]) * 16;
    if (!Number.isInteger(f)) return null;
  }
  return +m[1] * 16 + f;
}

function fromSixteenths(n: number): string {
  const w = Math.floor(n / 16);
  const r = n % 16;
  if (!r) return String(w);
  const g = gcd(r, 16);
  return `${w} ${r / g}/${16 / g}`;
}

function itemsToLines(items: any[]): string[] {
  const lines: { y: number; text: string; end: number }[] = [];
  let cur: { y: number; text: string; end: number } | null = null;

  for (const it of items) {
    if (typeof it.str !== 'string' || !it.str.trim()) continue;
    const x = it.transform[4];
    const y = it.transform[5];
    const w = it.width || 0;
    const s = it.str.replace(/\u00a0/g, ' ').trim();

    if (cur && Math.abs(cur.y - y) < 1.6 && x >= cur.end - 1) {
      cur.text += (x - cur.end > 1.2 ? ' ' : '') + s;
      cur.end = x + w;
    } else {
      cur = { y, text: s, end: x + w };
      lines.push(cur);
    }
  }
  return lines.map((l) => l.text);
}

function normalizeHeadings(text: string): string {
  const parts = text.split(/\*{3}/);
  if (parts.length < 3) return text;
  const pairs = Math.floor((parts.length - 1) / 2);
  for (let k = 0; k < pairs; k++) {
    const h = parts[1 + 2 * k].replace(/\s+/g, ' ').trim();
    if (!h || h.length > 70 || /[=,]/.test(h)) return text;
  }
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) {
    if (i % 2 === 1 && i < parts.length - 1) {
      out += `\n*** ${parts[i].replace(/\s+/g, ' ').trim()} ***\n`;
    } else {
      out += parts[i];
    }
  }
  return out;
}

function lastValue(text: string, label: string): string | null {
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${esc}\\s*=\\s*([^,\\n]+)`, 'gi');
  const m = [...text.matchAll(re)];
  return m.length ? m[m.length - 1][1].trim() : null;
}

const BOLD_SECTIONS = /^(panel|unit type|jambs?|brickmould details|wrapping - overall dimensions)$/i;

function parseDoorPage(lines: string[]): {
  number: string;
  glass: string;
  spec: StudioDoorSpecItem[];
  roWarn: boolean;
} {
  const text = normalizeHeadings(lines.join('\n'));
  const lm = text.match(/Line\s*(?:\|[^\n]*)?\s*(\d\s?\d\s?\d)/i) ||
    text.match(/Product Description\s+(\d\s?\d\s?\d)\b/i);
  const number = lm ? lm[1].replace(/\s/g, '') : 'unknown';

  let glass = '';
  const gi = text.lastIndexOf('*** Panel ***');
  if (gi >= 0) {
    const g: string[] = [];
    for (const l of text.slice(gi + 13).split('\n')) {
      const t = l.trim();
      if (!t) continue;
      if (/^\d+$/.test(t) || /^Line\b/i.test(t) || t.startsWith('***')) break;
      g.push(t);
    }
    glass = g.join('\n');
  }

  let si = text.search(/(?:Steel|Fiberglass|Exterior|Patio|Garden)\s+Doors?/i);
  if (si < 0) {
    si = text.search(/(?:Product\s+Description|\*{3}\s*Panel\s*\*{3})/i);
  }
  const spec: StudioDoorSpecItem[] = [];
  let roWarn = false;

  if (si >= 0) {
    let body = text.slice(si);
    const fw = lastValue(body, 'Overall Frame Width');
    const fh = lastValue(body, 'Overall Frame Height');
    const cd = lastValue(body, 'Cut Down');
    const fw16 = fw === null ? null : toSixteenths(fw);
    const fh16 = fh === null ? null : toSixteenths(fh);
    const rw = fw16 === null ? null : fromSixteenths(fw16 + 12);
    const rh = fh16 === null ? null : fromSixteenths(fh16 + 12);
    roWarn = fw16 === null || fh16 === null;

    const wi = body.search(/\*{3}\s*Wrapping\s*-\s*Overall Dimensions\s*\*{3}/i);
    if (wi >= 0) {
      body =
        body.slice(0, wi) +
        '*** Wrapping - Overall Dimensions ***\n' +
        [
          fw && `Overall Frame Width = ${fw},`,
          fh && `Overall Frame Height = ${fh},`,
          rw && `Overall Rough Opening Width = ${rw},`,
          rh && `Overall Rough Opening Height = ${rh},`,
          cd && `Cut Down = ${cd}`,
        ]
          .filter(Boolean)
          .join('\n');
    }

    let section = '';
    let first = true;
    for (const raw of body.split('\n')) {
      const t = raw.trim();
      if (!t) continue;
      if (/^\*{3} .+ \*{3}$/.test(t)) {
        section = t.replace(/\*/g, '').trim();
        spec.push({ text: t, bold: false });
        first = false;
        continue;
      }
      spec.push({
        text: t,
        bold: first || BOLD_SECTIONS.test(section) || /^Call Width\b/i.test(t),
      });
      first = false;
    }
  }

  return { number, glass, spec, roWarn };
}

const PRICE_RE = /\$\s*([\d,]+\.\d{2})/;

function findPrice(items: any[], lines: string[]): string {
  let best: { v: string; x: number } | null = null;
  for (const it of items) {
    if (typeof it.str !== 'string') continue;
    const m = it.str.match(PRICE_RE);
    if (m && (!best || it.transform[4] > best.x)) {
      best = { v: m[1].replace(/,/g, ''), x: it.transform[4] };
    }
  }
  if (best) return best.v;
  const m = lines.join(' ').match(PRICE_RE);
  return m ? m[1].replace(/,/g, '') : '';
}

export async function extractDoorQuoteFromPdf(
  file: File,
  onProgress?: (msg: string) => void
): Promise<StudioDoorQuoteData> {
  ensurePdfWorker();
  onProgress?.('Reading supplier door quote PDF…');
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const pages: { page: any; items: any[]; lines: string[]; text: string }[] = [];

  for (let n = 1; n <= pdf.numPages; n++) {
    onProgress?.(`Parsing page ${n} of ${pdf.numPages}…`);
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    const items = (content.items || []) as any[];
    const lines = itemsToLines(items);
    pages.push({ page, items, lines, text: lines.join('\n') });
  }

  const all = pages.map((p) => p.text).join('\n');
  const quoteNumber = (all.match(/Order Details\s*(\d{4,})/i) || all.match(/\b(\d{4,})\s*#/) || [])[1] || '';
  const customerMatch =
    all.match(/Quote\s*Name\s*:\s*([^\n]+)/i) ||
    all.match(/(?:Homeowner|Customer)(?:\s*Name)?\s*:\s*([^\n]+)/i) ||
    all.match(/Sold\s*To\s*:\s*([^\n]+)/i) ||
    all.match(/\b\d{4,}\s+\d{1,2}\/\d{1,2}\/\d{4}\s+([^\n]+)/);
  const customerName = customerMatch ? customerMatch[1].replace(/\s*Quote\s*Date.*$/i, '').trim() : '';

  const records: { number: string; qty: string; page: number; end: number }[] = [];
  for (let pi = 0; pi < pages.length; pi++) {
    const ls = pages[pi].lines;
    for (let i = 0; i < ls.length; i++) {
      if (!/line\s*\|?\s*qty\s*\|?\s*product\s*description/i.test(ls[i])) continue;
      for (let j = i + 1; j < Math.min(i + 5, ls.length); j++) {
        const m = ls[j].match(/^\s*(\d{3})(?:\s+(\d+))?/);
        if (m && !records.some((r) => r.number === m[1])) {
          records.push({ number: m[1], qty: m[2] || '1', page: pi + 1, end: 0 });
          break;
        }
      }
    }
  }
  records.sort((a, b) => a.page - b.page);
  records.forEach((r, i) => {
    r.end = i + 1 < records.length ? records[i + 1].page - 1 : pages.length;
  });

  const linesOut: StudioDoorItem[] = [];
  for (const r of records) {
    const group = pages.slice(r.page - 1, r.end);
    const first = group[0];
    const parsed = parseDoorPage(group.map((p) => p.text).join('\n').split('\n'));
    const price = findPrice(first.items, first.lines);

    let rawCanvas: HTMLCanvasElement | null = null;
    try {
      rawCanvas = await renderDoorRaw(first.page, first.items);
    } catch {
      rawCanvas = null;
    }

    const item: StudioDoorItem = {
      number: r.number,
      name: '',
      price,
      glass: parsed.glass,
      spec: parsed.spec,
      roWarn: parsed.roWarn,
      rawCanvas,
      raw: rawCanvas,
      image: null,
      trimLeft: DEFAULT_TRIM_LEFT,
      trimBottom: DEFAULT_TRIM_BOTTOM,
      sourcePages: `${r.page}-${r.end}`,
      qty: r.qty || '1',
    };
    recropDoorLine(item);
    linesOut.push(item);
  }

  let makerLogo: string | null = null;
  try {
    const first = pages[0];
    const rects = imageRects(await first.page.getOperatorList());
    const logo = rects
      .filter((r) => r.x1 - r.x0 > 60 && r.y1 - r.y0 < 220 && r.y1 - r.y0 > 15)
      .sort((a, b) => b.y1 - a.y1)[0];
    if (logo) {
      const c = await renderRegion(first.page, logo, logo.y1);
      makerLogo = c ? trimCanvas(c) : null;
    }
  } catch {
    makerLogo = null;
  }

  return {
    quoteNumber,
    customerName,
    makerLogo,
    mode: 'supply',
    allName: '',
    allPrice: '',
    lines: linesOut,
  };
}

