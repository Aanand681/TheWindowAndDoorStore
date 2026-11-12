import * as pdfjsLib from "pdfjs-dist"

/**
 * Ensures PDF.js workerSrc is correctly initialized before any extraction or rendering.
 * Prefers the local self-hosted worker in /public/pdf.worker.min.js for offline speed and reliability.
 */
export function ensurePdfWorker(): void {
  if (typeof window === "undefined") return
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"
  }
}
