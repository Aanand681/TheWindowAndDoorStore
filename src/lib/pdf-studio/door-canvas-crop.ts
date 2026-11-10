import * as pdfjsLib from 'pdfjs-dist';
import { StudioDoorItem } from './door-types';

export const SCALE = 3;
export const DEFAULT_TRIM_LEFT = 25.5;
export const DEFAULT_TRIM_BOTTOM = 95.5;

function mmul(a: number[], b: number[]): number[] {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

export function imageRects(ops: { fnArray: number[]; argsArray: any[] }): {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}[] {
  const F = (pdfjsLib as any).OPS;
  let t = [1, 0, 0, 1, 0, 0];
  const st: number[][] = [];
  const out: { x0: number; x1: number; y0: number; y1: number }[] = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    const op = ops.fnArray[i];
    const a = ops.argsArray[i];
    if (op === F.save) {
      st.push(t.slice());
    } else if (op === F.restore) {
      t = st.pop() || [1, 0, 0, 1, 0, 0];
    } else if (op === F.transform) {
      t = mmul(t, a);
    } else if (
      op === F.paintImageXObject ||
      op === F.paintInlineImageXObject ||
      op === F.paintJpegXObject ||
      op === F.paintImageMaskXObject
    ) {
      const pts = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ].map(([x, y]) => ({
        x: t[0] * x + t[2] * y + t[4],
        y: t[1] * x + t[3] * y + t[5],
      }));
      out.push({
        x0: Math.min(...pts.map((p) => p.x)),
        x1: Math.max(...pts.map((p) => p.x)),
        y0: Math.min(...pts.map((p) => p.y)),
        y1: Math.max(...pts.map((p) => p.y)),
      });
    }
  }
  return out;
}

export async function renderRegion(
  page: any,
  r: { x0: number; x1: number; y0: number; y1: number },
  yTop: number
): Promise<HTMLCanvasElement | null> {
  if (typeof document === 'undefined') return null;

  const view = page.view;
  const pageH = view[3] - view[1];
  const vp = page.getViewport({ scale: SCALE });

  const full = document.createElement('canvas');
  full.width = Math.ceil(vp.width);
  full.height = Math.ceil(vp.height);
  const fx = full.getContext('2d');
  if (!fx) return null;

  fx.fillStyle = '#fff';
  fx.fillRect(0, 0, full.width, full.height);

  await page.render({
    canvasContext: fx,
    viewport: vp,
  }).promise;

  const w = Math.round((r.x1 - r.x0) * SCALE);
  const h = Math.round((yTop - r.y0) * SCALE);
  if (w < 10 || h < 10) return null;

  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const outCtx = out.getContext('2d');
  if (!outCtx) return null;

  const sx = Math.max(0, Math.floor(r.x0 * SCALE));
  const sy = Math.max(0, Math.floor((pageH - yTop) * SCALE));
  const sw = Math.min(full.width - sx, w);
  const sh = Math.min(full.height - sy, h);
  if (sw <= 0 || sh <= 0) return null;

  outCtx.drawImage(full, sx, sy, sw, sh, 0, 0, sw, sh);
  return out;
}

export async function renderDoorRaw(page: any, items: any[]): Promise<HTMLCanvasElement | null> {
  const ops = await page.getOperatorList();
  const rects = imageRects(ops);
  const big = rects
    .filter((r) => r.x1 - r.x0 > 150 && r.y1 - r.y0 > 150)
    .sort((a, b) => (b.x1 - b.x0) * (b.y1 - b.y0) - (a.x1 - a.x0) * (a.y1 - a.y0))[0];

  if (!big) return null;
  let yTop = big.y1;
  const hdr = items.find((i) => typeof i.str === 'string' && /Qty/.test(i.str));
  if (hdr) {
    const limit = hdr.transform[5] - 24;
    if (limit > big.y0 + 40) yTop = Math.min(yTop, limit);
  }
  return renderRegion(page, big, yTop);
}

export function isBackground(r: number, g: number, b: number): boolean {
  return (
    (r > 236 && g > 236 && b > 236) ||
    (r > 238 && g > 200 && g < 240 && b > 150 && b < 225 && r - b > 25)
  );
}

export function trimCanvas(c: HTMLCanvasElement): string {
  const w = c.width;
  const h = c.height;
  const ctx = c.getContext('2d');
  if (!ctx) return c.toDataURL('image/png');

  const d = ctx.getImageData(0, 0, w, h).data;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 20 || isBackground(d[i], d[i + 1], d[i + 2])) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }

  if (x1 < 0) return c.toDataURL('image/png');
  const pad = 12;
  x0 = Math.max(0, x0 - pad);
  y0 = Math.max(0, y0 - pad);
  x1 = Math.min(w - 1, x1 + pad);
  y1 = Math.min(h - 1, y1 + pad);

  const o = document.createElement('canvas');
  o.width = x1 - x0 + 1;
  o.height = y1 - y0 + 1;
  const oCtx = o.getContext('2d');
  if (!oCtx) return c.toDataURL('image/png');

  oCtx.drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
  return o.toDataURL('image/png');
}

export function recropDoorLine(line: StudioDoorItem): void {
  const canvas = line.rawCanvas || line.raw;
  if (!canvas || typeof document === 'undefined') return;

  const l = Math.round(line.trimLeft * SCALE);
  const b = Math.round(line.trimBottom * SCALE);
  const w = canvas.width - l;
  const h = canvas.height - b;

  if (w < 20 || h < 20) {
    line.image = canvas.toDataURL('image/png');
    return;
  }

  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const cCtx = c.getContext('2d');
  if (!cCtx) return;

  cCtx.drawImage(canvas, l, 0, w, h, 0, 0, w, h);
  line.image = trimCanvas(c);
}

export const recropDoorLineDrawing = recropDoorLine;


