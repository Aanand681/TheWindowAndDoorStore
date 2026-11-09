import { PDFDocument, PDFFont, PDFImage } from 'pdf-lib';

export const cash = (n: string | number) => {
  const num = Number(n);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
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

export async function embedImage(doc: PDFDocument, dataUrl: string): Promise<PDFImage | null> {
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

export async function resolveCompanyLogo(doc: PDFDocument, logoDataUrl?: string): Promise<PDFImage | null> {
  if (logoDataUrl) {
    return await embedImage(doc, logoDataUrl);
  }

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
        const logoImage = p.endsWith('.png') ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        if (logoImage) return logoImage;
      }
    } catch {
      // Continue searching
    }
  }
  return null;
}
