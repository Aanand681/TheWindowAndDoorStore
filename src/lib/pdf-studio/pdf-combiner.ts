import { PDFDocument } from "pdf-lib"
import {
  buildStandardQuotePdfFileName,
  sanitizePdfFileNamePart,
} from "@/lib/quotes/pdf-filename"

export interface CombinedPdfMetadata {
  customerName?: string
  windowQuoteNo?: string
  doorQuoteNo?: string
  sealedUnitQuoteNo?: string
}

/**
 * Sanitizes a string for safe usage in file system and browser download file names.
 */
export function sanitizeFileNamePart(str: string): string {
  return sanitizePdfFileNamePart(str)
}

/**
 * Generates clean quote download file names:
 * - 1 quote:  "John Smith #WQ-1024.pdf"
 * - 2 quotes: "John Smith #WQ-1024 & #DQ-502.pdf"
 * - 3 quotes: "John Smith #WQ-1024 & #DQ-502 for #SU-301.pdf"
 */
export function buildCombinedPdfFileName(params: CombinedPdfMetadata): string {
  const winNo = sanitizePdfFileNamePart(params.windowQuoteNo || "WindowQuote") || "WindowQuote"
  const doorNo = sanitizePdfFileNamePart(params.doorQuoteNo || "DoorQuote") || "DoorQuote"
  const nums = [winNo, doorNo]
  if (params.sealedUnitQuoteNo) {
    nums.push(params.sealedUnitQuoteNo)
  }
  return buildStandardQuotePdfFileName({
    customerName: params.customerName || "Customer",
    quoteNumbers: nums,
    withExtension: true,
  })
}

/**
 * Combines two PDF binary documents (Window Quote & Door Quote) into one consolidated PDF.
 * Preserves all vector pages, annotations, embedded fonts, and cropped images.
 */
export async function combineWindowAndDoorPdfs(
  windowPdfBytes: Uint8Array | ArrayBuffer,
  doorPdfBytes: Uint8Array | ArrayBuffer
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create()

  // 1. Load and append Window Quote pages
  const winDoc = await PDFDocument.load(windowPdfBytes)
  const winPageIndices = winDoc.getPageIndices()
  if (winPageIndices.length > 0) {
    const copiedWinPages = await mergedPdf.copyPages(winDoc, winPageIndices)
    copiedWinPages.forEach((page) => mergedPdf.addPage(page))
  }

  // 2. Load and append Door Quote pages
  const doorDoc = await PDFDocument.load(doorPdfBytes)
  const doorPageIndices = doorDoc.getPageIndices()
  if (doorPageIndices.length > 0) {
    const copiedDoorPages = await mergedPdf.copyPages(doorDoc, doorPageIndices)
    copiedDoorPages.forEach((page) => mergedPdf.addPage(page))
  }

  return await mergedPdf.save()
}
