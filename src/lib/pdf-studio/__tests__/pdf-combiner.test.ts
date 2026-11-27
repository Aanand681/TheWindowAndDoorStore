import { describe, it, expect } from "vitest"
import { PDFDocument } from "pdf-lib"
import {
  buildCombinedPdfFileName,
  combineWindowAndDoorPdfs,
} from "../pdf-combiner"
import { buildStandardQuotePdfFileName } from "@/lib/quotes/pdf-filename"

describe("pdf-combiner", () => {
  describe("buildCombinedPdfFileName", () => {
    it("formats combined filename with # prefixes: 'Name #winNo & #doorNo.pdf'", () => {
      const fileName = buildCombinedPdfFileName({
        customerName: "John Smith",
        windowQuoteNo: "WQ-1024",
        doorQuoteNo: "DQ-502",
      })
      expect(fileName).toBe("John Smith #WQ-1024 & #DQ-502.pdf")
    })

    it("formats 3 attached quote numbers cleanly with 'for #quote3'", () => {
      const fileName = buildCombinedPdfFileName({
        customerName: "John Smith",
        windowQuoteNo: "83546",
        doorQuoteNo: "83547",
        sealedUnitQuoteNo: "83548",
      })
      expect(fileName).toBe("John Smith #83546 & #83547 for #83548.pdf")
    })

    it("sanitizes forbidden characters from customer name and quote numbers", () => {
      const fileName = buildCombinedPdfFileName({
        customerName: "ACME Corp/Special:Project?",
        windowQuoteNo: "WQ/2026*01",
        doorQuoteNo: "DQ<99>",
      })
      expect(fileName).toBe("ACME CorpSpecialProject #WQ202601 & #DQ99.pdf")
    })

    it("provides safe fallbacks when values are omitted", () => {
      const fileName = buildCombinedPdfFileName({})
      expect(fileName).toBe("Customer #WindowQuote & #DoorQuote.pdf")
    })

    it("formats single quote without duplicating existing # prefix", () => {
      expect(
        buildStandardQuotePdfFileName({
          customerName: "John Smith",
          quoteNumbers: ["#83546"],
        })
      ).toBe("John Smith #83546.pdf")
      expect(
        buildStandardQuotePdfFileName({
          customerName: "Jane Doe",
          quoteNumbers: ["83546"],
          withExtension: false,
        })
      ).toBe("Jane Doe #83546")
    })
  })

  describe("combineWindowAndDoorPdfs", () => {
    it("merges pages from two valid PDFs into one multi-page document", async () => {
      // Create a 1-page dummy window PDF
      const doc1 = await PDFDocument.create()
      doc1.addPage([400, 600])
      const pdfBytes1 = await doc1.save()

      // Create a 2-page dummy door PDF
      const doc2 = await PDFDocument.create()
      doc2.addPage([400, 600])
      doc2.addPage([400, 600])
      const pdfBytes2 = await doc2.save()

      // Combine them
      const combinedBytes = await combineWindowAndDoorPdfs(pdfBytes1, pdfBytes2)
      expect(combinedBytes).toBeInstanceOf(Uint8Array)

      // Verify page count of merged PDF is 1 + 2 = 3
      const loadedMerged = await PDFDocument.load(combinedBytes)
      expect(loadedMerged.getPageCount()).toBe(3)
    })
  })
})
