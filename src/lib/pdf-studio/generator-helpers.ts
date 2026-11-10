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

/**
 * Decodes a base64 data URL into a Uint8Array in memory without calling fetch().
 * Completely avoids browser fetch restrictions, CSP blocks, and URL length limits.
 */
export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const commaIdx = dataUrl.indexOf(',');
  const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function embedImage(doc: PDFDocument, source: string): Promise<PDFImage | null> {
  try {
    if (!source || typeof source !== 'string') return null;

    if (source.startsWith('data:')) {
      const bytes = dataUrlToBytes(source);
      if (source.startsWith('data:image/png')) {
        return await doc.embedPng(bytes);
      } else if (
        source.startsWith('data:image/jpeg') ||
        source.startsWith('data:image/jpg')
      ) {
        return await doc.embedJpg(bytes);
      } else {
        // Fallback: try PNG then JPG
        try {
          return await doc.embedPng(bytes);
        } catch {
          return await doc.embedJpg(bytes);
        }
      }
    }

    // Remote or local static URL path (e.g. /images/logo.jpg)
    const res = await fetch(source);
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    const bytes = new Uint8Array(ab);

    if (source.toLowerCase().endsWith('.png')) {
      return await doc.embedPng(bytes);
    } else {
      return await doc.embedJpg(bytes);
    }
  } catch (err) {
    console.warn('Failed to embed image in PDF:', err);
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
