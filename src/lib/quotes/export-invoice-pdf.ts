import { domToCanvas } from "modern-screenshot"
import { PDFDocument } from "pdf-lib"

export const LETTER_WIDTH_PT = 612 // 8.5 in * 72 pt/in
export const LETTER_HEIGHT_PT = 792 // 11 in * 72 pt/in
export const LETTER_MARGIN_PT = 18 // 0.25 in margin matching @page print rule

export interface PdfPageSlice {
  startY: number
  height: number
}

export interface ComputePdfPageSlicesInput {
  totalHeightPx: number
  pageHeightPx: number
  /** Sorted vertical top boundaries (px) of cards/rows that should not be split when avoidable */
  safeBreakOffsetsPx?: number[]
}

/**
 * Splits a rendered invoice canvas height into US Letter page slices while preferring
 * clean block/row boundaries so cards and table lines are not cut across page breaks.
 */
export function computePdfPageSlices({
  totalHeightPx,
  pageHeightPx,
  safeBreakOffsetsPx = [],
}: ComputePdfPageSlicesInput): PdfPageSlice[] {
  const total = Math.max(0, Math.ceil(totalHeightPx))
  const pageH = Math.max(1, Math.floor(pageHeightPx))
  if (total === 0) return []
  if (total <= pageH) return [{ startY: 0, height: total }]

  const sortedBreaks = Array.from(
    new Set(
      safeBreakOffsetsPx
        .filter((y) => Number.isFinite(y) && y > 0 && y < total)
        .map((y) => Math.round(y))
    )
  ).sort((a, b) => a - b)

  const slices: PdfPageSlice[] = []
  let startY = 0
  const minSliceHeight = Math.max(1, Math.floor(pageH * 0.35))

  while (startY < total) {
    const remaining = total - startY
    if (remaining <= pageH) {
      slices.push({ startY, height: remaining })
      break
    }

    const rawEndY = startY + pageH
    // Pick the lowest candidate break just above rawEndY that keeps the page reasonably full
    let chosenEndY = rawEndY
    for (let i = sortedBreaks.length - 1; i >= 0; i -= 1) {
      const candidate = sortedBreaks[i]
      if (candidate <= rawEndY && candidate >= startY + minSliceHeight) {
        chosenEndY = candidate
        break
      }
    }

    const height = Math.max(1, chosenEndY - startY)
    slices.push({ startY, height })
    startY += height
  }

  return slices
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode invoice canvas to PNG"))
          return
        }
        blob.arrayBuffer().then(resolve, reject)
      },
      "image/png",
      1
    )
  })
}

function collectSafeBreakOffsetsCssPx(root: HTMLElement): number[] {
  const rootRect = root.getBoundingClientRect()
  if (rootRect.height <= 0) return []

  const selectors = [
    "[data-invoice-block]",
    ".split-row-wrap",
    ".print-avoid-break",
    "tr",
  ]
  const nodes = root.querySelectorAll(selectors.join(","))
  const offsets: number[] = []

  nodes.forEach((node) => {
    if (node instanceof HTMLElement) {
      const rect = node.getBoundingClientRect()
      const topRel = rect.top - rootRect.top
      if (topRel > 4) offsets.push(topRel)
    }
  })

  return offsets
}

export interface DownloadInvoiceElementAsPdfOptions {
  element: HTMLElement
  filename: string
  scale?: number
}

/**
 * Renders the live invoice composer DOM directly into an 8.5x11" Letter portrait PDF
 * using modern-screenshot + pdf-lib and immediately triggers a file download without
 * opening any browser/OS Print Preview window.
 */
export async function downloadInvoiceElementAsPdf({
  element,
  filename,
  scale = 2.5,
}: DownloadInvoiceElementAsPdfOptions): Promise<void> {
  if (typeof window === "undefined") return

  const rect = element.getBoundingClientRect()
  const cssBreakOffsets = collectSafeBreakOffsetsCssPx(element)

  const canvas = await domToCanvas(element, {
    scale,
    backgroundColor: "#ffffff",
    style: {
      boxShadow: "none",
      border: "none",
      margin: "0",
    },
    filter: (node) => {
      if (node instanceof Element) {
        if (
          node.classList.contains("no-print") ||
          node.classList.contains("print:hidden")
        ) {
          return false
        }
      }
      return true
    },
    onCloneEachNode: (cloned) => {
      if (cloned instanceof HTMLElement && cloned.classList.contains("comp-block")) {
        cloned.style.boxShadow = "none"
        cloned.style.outline = "none"
      }
    },
  })

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error("Invoice preview rendered empty bounds")
  }

  const contentWidthPt = LETTER_WIDTH_PT - LETTER_MARGIN_PT * 2
  const contentHeightPt = LETTER_HEIGHT_PT - LETTER_MARGIN_PT * 2

  // Map CSS vertical block starts to canvas pixel coordinates
  const scaleY = rect.height > 0 ? canvas.height / rect.height : scale
  const canvasBreakOffsets = cssBreakOffsets.map((y) => y * scaleY)

  // Canvas px height that corresponds to one 8.5x11" printable body area at full contentWidthPt
  const ptPerCanvasPx = contentWidthPt / canvas.width
  const pageHeightPx = contentHeightPt / ptPerCanvasPx

  const slices = computePdfPageSlices({
    totalHeightPx: canvas.height,
    pageHeightPx,
    safeBreakOffsetsPx: canvasBreakOffsets,
  })

  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle(filename.replace(/\.pdf$/i, ""))

  for (const slice of slices) {
    let sliceCanvas = canvas
    if (slices.length > 1 || slice.startY !== 0 || slice.height !== canvas.height) {
      sliceCanvas = document.createElement("canvas")
      sliceCanvas.width = canvas.width
      sliceCanvas.height = slice.height
      const ctx = sliceCanvas.getContext("2d")
      if (!ctx) throw new Error("Unable to initialize 2D context for PDF page slice")
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
      ctx.drawImage(
        canvas,
        0,
        slice.startY,
        canvas.width,
        slice.height,
        0,
        0,
        canvas.width,
        slice.height
      )
    }

    const pngBytes = await canvasToPngBytes(sliceCanvas)
    const pngImage = await pdfDoc.embedPng(pngBytes)
    const page = pdfDoc.addPage([LETTER_WIDTH_PT, LETTER_HEIGHT_PT])
    const drawHeightPt = slice.height * ptPerCanvasPx

    page.drawImage(pngImage, {
      x: LETTER_MARGIN_PT,
      y: LETTER_HEIGHT_PT - LETTER_MARGIN_PT - drawHeightPt,
      width: contentWidthPt,
      height: drawHeightPt,
    })
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
