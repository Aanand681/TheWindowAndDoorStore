import { toast } from "sonner"
import { UIWindowItem } from "@/hooks/useCalculatorWindows"
import {
  readPdfItems,
  parseManufacturerPdfItems,
  extractPdfMetadata,
} from "@/lib/pdf-parser"

export interface ParsedOptionBPdfResult {
  meta: { customerName?: string; quoteNumber?: string }
  parsed: UIWindowItem[]
}

export async function parseAndValidateOptionBPdf(
  file: File,
  currentWindows: UIWindowItem[]
): Promise<ParsedOptionBPdfResult | null> {
  if (!file) return null
  try {
    toast.info("Parsing upgrade PDF...")
    const items = await readPdfItems(file)
    const meta = extractPdfMetadata(items)

    const parsed: UIWindowItem[] = parseManufacturerPdfItems(items).map(
      (w) => ({
        id: w.id,
        qty: String(w.qty),
        base: w.base ? (w.base / 100).toString() : "",
        argon: w.argon ? (w.argon / 100).toString() : "",
        solar: w.solar ? (w.solar / 100).toString() : "",
        triple: w.triple ? (w.triple / 100).toString() : "",
        w: w.w || "",
        h: w.h || "",
        color: w.color || "White",
      })
    )

    if (parsed.length === 0) {
      toast.error("No valid window configurations found in the uploaded PDF.")
      return null
    }

    // Check if identical to current quote
    const isDuplicate =
      parsed.length === currentWindows.length &&
      parsed.every((pw, idx) => {
        const cw = currentWindows[idx]
        if (!cw) return false
        return (
          String(pw.qty || "1") === String(cw.qty || "1") &&
          String(pw.base || "") === String(cw.base || "") &&
          String(pw.triple || "") === String(cw.triple || "") &&
          String(pw.argon || "") === String(cw.argon || "") &&
          String(pw.solar || "") === String(cw.solar || "") &&
          String(pw.w || "").trim() === String(cw.w || "").trim() &&
          String(pw.h || "").trim() === String(cw.h || "").trim() &&
          String(pw.color || "White").toLowerCase() ===
            String(cw.color || "White").toLowerCase()
        )
      })

    if (isDuplicate) {
      toast.error(
        "This PDF has identical window configurations to Option A. Please select an upgraded quote (e.g. Triple Pane or Painted) to compare."
      )
      return null
    }

    toast.success(`Parsed ${parsed.length} window(s) from ${file.name}`)
    return { meta, parsed }
  } catch (err: any) {
    toast.error(`Failed to parse PDF: ${err.message || "Unknown error"}`)
    return null
  }
}
