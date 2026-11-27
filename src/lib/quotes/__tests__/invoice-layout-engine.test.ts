import { describe, expect, it } from "vitest"
import {
  applyLayoutContextAction,
  applyPredictedDrop,
  areLayoutRowsEqual,
  computeSmartAutoLayout,
  getActiveInvoiceBlockIds,
  getOrderedProductIds,
  reconcileSavedLayout,
  sanitizeSavedQuoteLayout,
  type LayoutRow,
} from "../invoice-layout-engine"

describe("invoice-layout-engine", () => {
  describe("getOrderedProductIds", () => {
    it("orders product tables by descending count with tie-breaker Windows -> Doors -> Sealed Units", () => {
      expect(
        getOrderedProductIds({ windowCount: 2, doorCount: 2, sealedUnitCount: 2 })
      ).toEqual(["windows", "doors", "su"])

      expect(
        getOrderedProductIds({ windowCount: 3, doorCount: 8, sealedUnitCount: 5 })
      ).toEqual(["doors", "su", "windows"])

      expect(
        getOrderedProductIds({ windowCount: 0, doorCount: 4, sealedUnitCount: 4 })
      ).toEqual(["doors", "su"])
    })
  })

  describe("computeSmartAutoLayout", () => {
    it("switches to spacious ~14px mode with wide summary when windows are absent and rows <= 6", () => {
      const res = computeSmartAutoLayout({
        windowCount: 0,
        doorCount: 2,
        sealedUnitCount: 2,
        hasInstall: true,
        hasMaterials: true,
        hasOptions: false,
        hasNotes: false,
      })

      expect(res.mode).toBe("spacious")
      expect(res.suggestedFontSize).toBe(14)
      expect(res.suggestedSummaryWidthMode).toBe("wide")
      expect(res.rows).toHaveLength(3)
      expect(res.rows[2]).toMatchObject({
        type: "split",
        leftPct: 40,
        left: ["install", "materials"],
        right: ["summary"],
      })
    })

    it("uses dense_tuck on heavy multi-product quotes to hold secondary schedules beside Summary", () => {
      const res = computeSmartAutoLayout({
        windowCount: 9,
        doorCount: 3,
        sealedUnitCount: 4,
        hasInstall: true,
        hasMaterials: true,
        hasOptions: true,
        hasNotes: true,
      })

      expect(res.mode).toBe("dense_tuck")
      expect(res.rows).toHaveLength(2)
      expect(res.rows[0]).toMatchObject({ type: "full", blockId: "windows" })
      expect(res.rows[1]).toMatchObject({
        type: "split",
        leftPct: 54,
        left: ["su", "doors", "install", "materials", "options", "notes"],
        right: ["summary"],
      })
    })

    it("uses full summary when sparse quote has no detail cards", () => {
      const res = computeSmartAutoLayout({
        windowCount: 0,
        doorCount: 1,
        sealedUnitCount: 0,
        hasInstall: false,
        hasMaterials: false,
        hasOptions: false,
        hasNotes: false,
      })

      expect(res.mode).toBe("spacious")
      expect(res.rows[1]).toMatchObject({ type: "full", blockId: "summary" })
    })
  })

  describe("reconcileSavedLayout", () => {
    it("preserves user column widths and collapses emptied split rows safely", () => {
      const saved: LayoutRow[] = [
        { id: "r1", type: "full", blockId: "windows" },
        { id: "r2", type: "split", leftPct: 60, left: ["install", "materials"], right: ["summary"] },
      ]
      const active = getActiveInvoiceBlockIds({
        windowCount: 0,
        doorCount: 2,
        sealedUnitCount: 0,
        hasInstall: false,
        hasMaterials: false,
        hasOptions: true,
        hasNotes: false,
      })

      const reconciled = reconcileSavedLayout(saved, active)
      // doors inserted before summary; install & materials stripped -> summary becomes full; options inserted before summary
      expect(reconciled.map((r) => (r.type === "full" ? r.blockId : "split"))).toEqual([
        "doors",
        "options",
        "summary",
      ])
    })

    it("places newly active detail cards inside the split column opposite Summary when possible", () => {
      const saved: LayoutRow[] = [
        { id: "r1", type: "full", blockId: "windows" },
        { id: "r2", type: "split", leftPct: 45, left: ["install"], right: ["summary"] },
      ]
      const active = getActiveInvoiceBlockIds({
        windowCount: 4,
        doorCount: 2,
        sealedUnitCount: 0,
        hasInstall: true,
        hasMaterials: true,
        hasOptions: false,
        hasNotes: false,
      })

      const reconciled = reconcileSavedLayout(saved, active)
      expect(reconciled[0]).toMatchObject({ type: "full", blockId: "windows" })
      expect(reconciled[1]).toMatchObject({ type: "full", blockId: "doors" })
      expect(reconciled[2]).toMatchObject({
        type: "split",
        leftPct: 45,
        left: ["install", "materials"],
        right: ["summary"],
      })
    })
  })

  describe("applyLayoutContextAction", () => {
    const baseSplit: LayoutRow[] = [
      { id: "r1", type: "full", blockId: "windows" },
      { id: "r2", type: "split", leftPct: 50, left: ["install", "materials"], right: ["summary"] },
    ]

    it("updates Summary card width ratio from either right or left column", () => {
      const widened = applyLayoutContextAction(baseSplit, {
        type: "set_width",
        blockId: "summary",
        pct: 65,
      })
      expect(widened[1]).toMatchObject({ type: "split", leftPct: 35 })

      const leftWidened = applyLayoutContextAction(widened, {
        type: "set_width",
        blockId: "install",
        pct: 60,
      })
      expect(leftWidened[1]).toMatchObject({ type: "split", leftPct: 60 })
    })

    it("swaps left and right columns when moving a lone split block to opposite side", () => {
      const moved = applyLayoutContextAction(baseSplit, {
        type: "move_side",
        blockId: "summary",
        targetSide: "left",
      })
      expect(moved[1]).toMatchObject({
        type: "split",
        left: ["summary"],
        right: ["install", "materials"],
      })
    })

    it("divides a split row into full rows and can pair full rows back side-by-side", () => {
      const divided = applyLayoutContextAction(baseSplit, {
        type: "divide_row",
        blockId: "summary",
      })
      expect(divided.every((r) => r.type === "full")).toBe(true)
      expect(divided.map((r) => (r.type === "full" ? r.blockId : ""))).toEqual([
        "windows",
        "install",
        "materials",
        "summary",
      ])

      const paired = applyLayoutContextAction(divided, {
        type: "divide_row",
        blockId: "materials",
      })
      expect(paired[2]).toMatchObject({
        type: "split",
        leftPct: 50,
        left: ["materials"],
        right: ["summary"],
      })
    })
  })

  describe("applyPredictedDrop", () => {
    it("reorders blocks via insert_full, pair_side, and insert_in_col cleanly", () => {
      const rows: LayoutRow[] = [
        { id: "r1", type: "full", blockId: "windows" },
        { id: "r2", type: "split", leftPct: 50, left: ["install", "materials"], right: ["summary"] },
      ]

      // Pair summary on LEFT of windows
      const pairedTop = applyPredictedDrop(rows, "summary", {
        action: "pair_side",
        side: "left",
        anchorBlockId: "windows",
        guideMode: "box",
        rect: { left: 0, top: 0, width: 100, height: 100 },
        label: "Pair left",
      })
      expect(pairedTop[0]).toMatchObject({
        type: "split",
        leftPct: 50,
        left: ["summary"],
        right: ["windows"],
      })

      // Move materials inside right col of top split below windows
      const movedRight = applyPredictedDrop(pairedTop, "materials", {
        action: "insert_in_col",
        side: "right",
        position: "after",
        anchorBlockId: "windows",
        guideMode: "line",
        rect: { left: 0, top: 0, width: 100, height: 4 },
        label: "Insert after windows",
      })
      expect(movedRight[0]).toMatchObject({
        type: "split",
        left: ["summary"],
        right: ["windows", "materials"],
      })
      expect(movedRight[1]).toMatchObject({ type: "full", blockId: "install" })
    })

    it("supports multi-step consecutive dragging of su and doors without stalling or returning no-op equality", () => {
      const start: LayoutRow[] = [
        { id: "r1", type: "full", blockId: "windows" },
        { id: "r2", type: "split", leftPct: 54, left: ["su", "doors", "install"], right: ["summary"] },
      ]

      // 1. Pull su out to full row above windows
      const step1 = applyPredictedDrop(start, "su", {
        action: "insert_full",
        position: "before",
        anchorBlockId: "windows",
        guideMode: "line",
        rect: { left: 0, top: 0, width: 100, height: 4 },
        label: "Above windows",
      })
      expect(areLayoutRowsEqual(start, step1)).toBe(false)
      expect(step1[0]).toMatchObject({ type: "full", blockId: "su" })

      // 2. Drag doors next to su (right side)
      const step2 = applyPredictedDrop(step1, "doors", {
        action: "pair_side",
        side: "right",
        anchorBlockId: "su",
        guideMode: "box",
        rect: { left: 50, top: 0, width: 50, height: 100 },
        label: "Right of su",
      })
      expect(areLayoutRowsEqual(step1, step2)).toBe(false)
      expect(step2[0]).toMatchObject({ type: "split", left: ["su"], right: ["doors"] })

      // 3. Move su out below windows
      const step3 = applyPredictedDrop(step2, "su", {
        action: "insert_full",
        position: "after",
        anchorBlockId: "windows",
        guideMode: "line",
        rect: { left: 0, top: 0, width: 100, height: 4 },
        label: "Below windows",
      })
      expect(areLayoutRowsEqual(step2, step3)).toBe(false)
      expect(step3.map((r) => (r.type === "full" ? r.blockId : "split"))).toEqual([
        "doors",
        "windows",
        "su",
        "split",
      ])
      expect(areLayoutRowsEqual(step3, step3)).toBe(true)
    })
  })

  describe("sanitizeSavedQuoteLayout", () => {
    it("filters duplicate or invalid blocks and clamps typography values", () => {
      const sanitized = sanitizeSavedQuoteLayout({
        rows: [
          { id: "a", type: "full", blockId: "windows" },
          { id: "dup", type: "full", blockId: "windows" },
          { id: "bad", type: "full", blockId: "hacked_block" },
          { id: "b", type: "split", leftPct: 99, left: ["install"], right: ["summary"] },
        ],
        fontSize: 40,
        spacing: 0.1,
      })

      expect(sanitized).not.toBeNull()
      expect(sanitized?.rows).toHaveLength(2)
      expect(sanitized?.rows[1]).toMatchObject({ type: "split", leftPct: 75 })
      expect(sanitized?.fontSize).toBe(18)
      expect(sanitized?.spacing).toBe(0.65)
    })

    it("rejects empty or non-object payloads", () => {
      expect(sanitizeSavedQuoteLayout(null)).toBeNull()
      expect(sanitizeSavedQuoteLayout({ rows: [] })).toBeNull()
    })
  })
})
