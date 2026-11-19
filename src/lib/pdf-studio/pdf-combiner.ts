import { PDFDocument } from "pdf-lib"

export interface CombinedPdfMetadata {
  customerName?: string
  windowQuoteNo?: string
  doorQuoteNo?: string
}

/**
 * Sanitizes a string for safe usage in file system and browser download file names.
 */
export function sanitizeFileNamePart(str: string): string {
  return str.replace(/[/\\?%*:|"<>]/g, "").trim()
}

/**
 * Generates the clean download file name according to user specification:
 * "( Name windowQuoteNo. & doorQuoteNo )" -> e.g., "John Smith WQ-1024 & DQ-502.pdf"
 */
export function buildCombinedPdfFileName(params: CombinedPdfMetadata): string {
  const rawName = (params.customerName || "Customer").trim()
  const name = sanitizeFileNamePart(rawName) || "Customer"

  const winNo = sanitizeFileNamePart(params.windowQuoteNo || "WindowQuote")
  const doorNo = sanitizeFileNamePart(params.doorQuoteNo || "DoorQuote")

  return `${name} ${winNo} & ${doorNo}.pdf`
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
