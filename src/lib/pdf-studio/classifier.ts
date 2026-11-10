import * as pdfjsLib from 'pdfjs-dist';
import { ensurePdfWorker } from './pdf-init';

export type QuotePdfType = 'window' | 'door' | 'mixed' | 'unknown';

export interface PdfClassificationResult {
  type: QuotePdfType;
}

export function classifyPdfContent(rawText: string): QuotePdfType {
  const upper = (rawText || '').toUpperCase();

  const hasDoorMarkers = Boolean(
    upper.includes('STEEL DOORS') ||
      upper.includes('*** PANEL ***') ||
      upper.includes('*** WRAPPING - OVERALL DIMENSIONS ***') ||
      upper.includes('OVERALL FRAME WIDTH') ||
      upper.includes('DOOR SUPPLY') ||
      /LINE\s*\|\s*QTY\s*\|\s*PRODUCT\s*DESCRIPTION/i.test(upper) ||
      /\b\d{3}\b\s+STEEL\b/i.test(upper) ||
      /\bFIBERGLASS\s+DOOR\b/i.test(upper)
  );

  const hasWindowMarkers = Boolean(
    upper.includes('FR:') ||
      upper.includes('CASEMENT') ||
      upper.includes('AWNING') ||
      upper.includes('PICTURE') ||
      upper.includes('SLIDER') ||
      upper.includes('HUNG') ||
      upper.includes('SOLAR GAIN') ||
      upper.includes('TRIPLE GLAZED')
  );

  if (hasDoorMarkers && hasWindowMarkers) return 'mixed';
  if (hasDoorMarkers) return 'door';
  if (hasWindowMarkers) return 'window';

  return 'unknown';
}

export async function classifyPdfFile(file: File): Promise<QuotePdfType> {
  try {
    ensurePdfWorker();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const maxPages = Math.min(pdf.numPages, 3);
    const textPieces: string[] = [];

    for (let n = 1; n <= maxPages; n++) {
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      const pageText = (content.items || [])
        .map((it: any) => (typeof it.str === 'string' ? it.str : ''))
        .join(' ');
      textPieces.push(pageText);
    }

    return classifyPdfContent(textPieces.join('\n'));
  } catch {
    return 'unknown';
  }
}
