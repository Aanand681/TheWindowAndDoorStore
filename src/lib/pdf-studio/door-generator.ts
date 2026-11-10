import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { StudioDoorQuoteData } from './door-types';
import { embedImage, resolveCompanyLogo } from './generator-helpers';

const ascii = (s: any) =>
  String(s == null ? '' : s)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x20-\x7E]/g, '?');

function wrapTextLines(s: string, font: any, size: number, width: number): string[] {
  const out: string[] = [];
  for (const para of String(s || '').split('\n')) {
    let cur = '';
    for (const w of para.replace(/\s+/g, ' ').trim().split(' ')) {
      if (!w) continue;
      const t = cur ? `${cur} ${w}` : w;
      if (cur && font.widthOfTextAtSize(t, size) > width) {
        out.push(cur);
        cur = w;
      } else {
        cur = t;
      }
    }
    if (cur) out.push(cur);
  }
  return out;
}

export async function generateStudioDoorPdf(data: StudioDoorQuoteData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const black = rgb(0, 0, 0);
  const beige = rgb(1, 0.89, 0.76);

  const logo = await resolveCompanyLogo(doc, data.logoDataUrl || undefined);
  const maker = data.makerLogo ? await embedImage(doc, data.makerLogo) : null;

  for (let i = 0; i < data.lines.length; i++) {
    const ln = data.lines[i];
    const page = doc.addPage([612, 792]);

    const T = (s: string, x: number, top: number, size = 8, font = reg) => {
      page.drawText(ascii(s), {
        x,
        y: 792 - top,
        size,
        font,
        color: black,
      });
    };

    const rect = (x: number, top: number, w: number, h: number, color: any) => {
      page.drawRectangle({
        x,
        y: 792 - top - h,
        width: w,
        height: h,
        color,
      });
    };

    const hline = (x1: number, x2: number, top: number, th = 0.8) => {
      page.drawLine({
        start: { x: x1, y: 792 - top },
        end: { x: x2, y: 792 - top },
        thickness: th,
        color: black,
      });
    };

    let barTop = 21;
    if (i === 0) {
      barTop = 166;
      if (logo) {
        const f = logo.scaleToFit(56, 66);
        page.drawImage(logo, {
          x: 18,
          y: 792 - 16 - f.height,
          width: f.width,
          height: f.height,
        });
      }
      if (maker) {
        const f = maker.scaleToFit(166, 44);
        page.drawImage(maker, {
          x: 19,
          y: 792 - 92 - f.height,
          width: f.width,
          height: f.height,
        });
      }
      T(`# ${data.quoteNumber || ''}`, 448, 58, 14, bold);
      if (data.customerName) T(data.customerName, 454, 78, 10, bold);
      rect(19, 138, 71, 26, beige);
      T('Job Comments:', 22, 153, 8, bold);
      page.drawRectangle({
        x: 90,
        y: 792 - 164,
        width: 500,
        height: 26,
        borderColor: black,
        borderWidth: 0.8,
      });
      if (data.jobComments) {
        const commentLines = wrapTextLines(data.jobComments, reg, 8, 490);
        commentLines.slice(0, 2).forEach((cl, ci) => {
          T(cl, 94, 149 + ci * 10, 8, reg);
        });
      }
    }

    rect(19, barTop, 571, 15, beige);
    T(`Line ${ln.number}  |  Qty  |  Product Description`, 22, barTop + 10, 7.6);
    T(ln.qty || '1', 66, barTop + 26, 8);

    const imgTop = barTop + 34;
    const imgH = 125;
    if (ln.image) {
      const im = await embedImage(doc, ln.image);
      if (im) {
        const f = im.scaleToFit(270, imgH);
        const left = 280 - f.width / 2;
        page.drawImage(im, {
          x: left,
          y: 792 - imgTop - (imgH + f.height) / 2,
          width: f.width,
          height: f.height,
        });
        const cx = left + f.width * 0.68;
        const lab = 'Exterior view';
        const lw = bold.widthOfTextAtSize(lab, 8.5);
        T(lab, cx - lw / 2, imgTop + imgH + 13, 8.5, bold);
      }
    }

    let ry = imgTop + 52;
    const nm = (ln.name || '').trim();
    if (nm) {
      T(nm, 482, ry, 9);
      ry += 12;
    }

    const price = Number(ln.price);
    if (String(ln.price).trim() !== '' && Number.isFinite(price) && price > 0) {
      const priceText = `$${price.toLocaleString('en-CA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
      T(priceText, 482, ry, 9);
    }

    const gTop = imgTop + imgH + 26;
    hline(90, 517, gTop);
    T('Glass Style:', 93, gTop + 9, 8, bold);
    const gl = wrapTextLines(ln.glass, reg, 10, 420);
    gl.forEach((s, k) => T(s, 93, gTop + 22 + k * 11, 10));
    const gBottom = gTop + 22 + Math.max(0, gl.length - 1) * 11 + 8;
    hline(90, 517, gBottom);

    const specTop = gBottom + 26;
    const rows: { t: string; f: any }[] = [];
    for (const s of ln.spec) {
      const f = s.bold ? bold : reg;
      for (const w of wrapTextLines(s.text, f, 7.4, 445)) {
        rows.push({ t: w, f });
      }
    }

    const pitch = Math.min(9.7, (758 - specTop) / Math.max(1, rows.length));
    const size = Math.min(7.4, pitch * 0.76);
    rows.forEach((r, k) => T(r.t, 86, specTop + k * pitch, size, r.f));

    T('Pages:', 330, 775, 6.5, bold);
    T(`${i + 1} of ${data.lines.length}`, 362, 775, 6.5);
  }

  return await doc.save();
}

