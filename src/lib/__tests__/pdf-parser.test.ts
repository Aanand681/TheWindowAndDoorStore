import { describe, it, expect } from "vitest"
import {
  extractPdfMetadata,
  pdfItemsToRows,
  parseManufacturerPdfItems,
} from "../pdf-parser"

describe("PDF Parser Engine", () => {
  describe("extractPdfMetadata", () => {
    it("should return empty strings for empty or invalid item arrays", () => {
      expect(extractPdfMetadata([])).toEqual({
        quoteNumber: "",
        customerName: "",
      })
      expect(extractPdfMetadata(null as any)).toEqual({
        quoteNumber: "",
        customerName: "",
      })
    })

    it("should extract quoteNumber and customerName using Strategy 1 (Table Header row)", () => {
      const items = [
        // Table header row at y = 100
        { page: 0, x: 50, y: 100, str: "ORDER" },
        { page: 0, x: 200, y: 100, str: "CUSTOMER REF" },
        { page: 0, x: 450, y: 100, str: "TERMS" },

        // Values row directly under headers at y = 115
        { page: 0, x: 55, y: 115, str: "984521" },
        { page: 0, x: 205, y: 115, str: "John Smith Residence" },

        // Next table section row at y = 140
        { page: 0, x: 50, y: 140, str: "ITEM" },
        { page: 0, x: 100, y: 140, str: "DESCRIPTION" },
      ]

      const meta = extractPdfMetadata(items)
      expect(meta.quoteNumber).toBe("984521")
      expect(meta.customerName).toBe("John Smith Residence")
    })

    it("should extract quote number using Strategy 2 (Header labels: QUOTE / #)", () => {
      const items = [
        { page: 0, x: 50, y: 40, str: "QUOTE:" },
        { page: 0, x: 95, y: 40, str: "74125" },
        { page: 0, x: 50, y: 60, str: "CUSTOMER:" },
        { page: 0, x: 120, y: 60, str: "Jane Doe" },
      ]

      const meta = extractPdfMetadata(items)
      expect(meta.quoteNumber).toBe("74125")
      expect(meta.customerName).toBe("Jane Doe")
    })

    it("should extract customer name using Strategy 3 (QUOTE NAME / REF fallback)", () => {
      const items = [
        { page: 0, x: 50, y: 30, str: "#" },
        { page: 0, x: 65, y: 30, str: "88341" },
        { page: 0, x: 50, y: 55, str: "REF:" },
        { page: 0, x: 90, y: 55, str: "Thunder Bay Cottage" },
      ]

      const meta = extractPdfMetadata(items)
      expect(meta.quoteNumber).toBe("88341")
      expect(meta.customerName).toBe("Thunder Bay Cottage")
    })

    it("should strictly ignore metadata items on page 2 or later", () => {
      const items = [
        { page: 1, x: 50, y: 40, str: "QUOTE:" },
        { page: 1, x: 95, y: 40, str: "99999" },
      ]

      const meta = extractPdfMetadata(items)
      expect(meta.quoteNumber).toBe("")
      expect(meta.customerName).toBe("")
    })
  })

  describe("pdfItemsToRows", () => {
    it("should cluster items with similar Y-coordinates into the same row and sort by X", () => {
      const items = [
        { page: 0, x: 260, y: 201, str: "2" },
        { page: 0, x: 40, y: 200, str: "1" },
        { page: 0, x: 80, y: 202, str: "Picture Window 36x48" },
        { page: 0, x: 380, y: 200, str: "$650.00" },
      ]

      const rows = pdfItemsToRows(items)
      expect(rows).toHaveLength(1)
      expect(rows[0].no).toBe("1")
      expect(rows[0].qty).toBe(2)
      expect(rows[0].label).toContain("Picture Window")
      expect(rows[0].list).toBe(650.0)
    })

    it("should filter out rows with y >= 740", () => {
      const items = [
        { page: 0, x: 40, y: 750, str: "99" },
        { page: 0, x: 40, y: 600, str: "1" },
      ]

      const rows = pdfItemsToRows(items)
      expect(rows).toHaveLength(1)
      expect(rows[0].no).toBe("1")
    })
  })

  describe("parseManufacturerPdfItems", () => {
    it("should parse standard window groups with options and dimensions", () => {
      const items = [
        // Row 1: Parent line item header
        { page: 0, x: 30, y: 150, str: "1" },
        { page: 0, x: 80, y: 150, str: "Casement Left Hinge" },
        { page: 0, x: 260, y: 150, str: "1" },
        { page: 0, x: 300, y: 150, str: "FR: 35 1/2 X 47 1/4" },

        // Row 2: Sub-option ARGON
        { page: 0, x: 80, y: 170, str: "ARGON GAS FILLED" },
        { page: 0, x: 380, y: 170, str: "$45.00" },

        // Row 3: Sub-option SOLAR GAIN
        { page: 0, x: 80, y: 190, str: "SOLAR GAIN LOW-E" },
        { page: 0, x: 380, y: 190, str: "$60.00" },

        // Row 4: Total
        { page: 0, x: 80, y: 210, str: "LINE ITEM TOTAL" },
        { page: 0, x: 450, y: 210, str: "$850.00" },
      ]

      const windows = parseManufacturerPdfItems(items)
      expect(windows).toHaveLength(1)
      expect(windows[0].qty).toBe(1)
      expect(windows[0].base).toBe(85000) // $850.00 in cents
      expect(windows[0].argon).toBe(4500) // $45.00 in cents
      expect(windows[0].solar).toBe(6000) // $60.00 in cents
      expect(windows[0].w).toBe("35 1/2")
      expect(windows[0].h).toBe("47 1/4")
      expect(windows[0].color).toBe("White")
    })

    it("should detect painted exterior color when frame text specifies custom/dark color", () => {
      const items = [
        { page: 0, x: 30, y: 150, str: "1" },
        {
          page: 0,
          x: 80,
          y: 150,
          str: "Slider Window Commercial Brown Exterior",
        },
        { page: 0, x: 260, y: 150, str: "2" },
        { page: 0, x: 300, y: 150, str: "FR: 48 X 36" },
        { page: 0, x: 80, y: 170, str: "LINE ITEM TOTAL" },
        { page: 0, x: 450, y: 170, str: "$1,200.00" },
      ]

      const windows = parseManufacturerPdfItems(items)
      expect(windows).toHaveLength(1)
      expect(windows[0].color).toBe("Painted")
      expect(windows[0].base).toBe(120000)
      expect(windows[0].qty).toBe(2)
      expect(windows[0].w).toBe("48")
      expect(windows[0].h).toBe("36")
    })

    it("should throw an error if parent group has no LINE ITEM TOTAL", () => {
      const items = [
        { page: 0, x: 30, y: 150, str: "1" },
        { page: 0, x: 80, y: 150, str: "Casement Window" },
        { page: 0, x: 260, y: 150, str: "1" },
      ]

      expect(() => parseManufacturerPdfItems(items)).toThrowError(
        /Missing parent list LINE ITEM TOTAL for group 1/
      )
    })

    it("should throw an error if no numbered window items are found", () => {
      const items = [{ page: 0, x: 80, y: 150, str: "Just some text notes" }]

      expect(() => parseManufacturerPdfItems(items)).toThrowError(
        /No numbered window items found in PDF/
      )
    })
  })
})
