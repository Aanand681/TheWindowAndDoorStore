export type InvoiceBlockId =
  | "windows"
  | "doors"
  | "su"
  | "install"
  | "materials"
  | "options"
  | "notes"
  | "summary"

export type LayoutColumnSide = "left" | "right"
export type BlockSlotSide = "full" | LayoutColumnSide

export interface FullLayoutRow {
  id: string
  type: "full"
  blockId: InvoiceBlockId
}

export interface SplitLayoutRow {
  id: string
  type: "split"
  leftPct: number
  left: InvoiceBlockId[]
  right: InvoiceBlockId[]
}

export type LayoutRow = FullLayoutRow | SplitLayoutRow

export interface SavedQuoteLayout {
  rows: LayoutRow[]
  fontSize?: number
  spacing?: number
  updatedAt?: string
}

export interface SmartLayoutInput {
  windowCount: number
  doorCount: number
  sealedUnitCount: number
  hasInstall: boolean
  hasMaterials: boolean
  hasOptions: boolean
  hasNotes: boolean
}

export interface SmartAutoLayoutResult {
  rows: LayoutRow[]
  mode: "spacious" | "standard" | "dense_tuck"
  suggestedFontSize: number
  suggestedSummaryWidthMode: "compact" | "wide"
  description: string
}

export type LayoutContextAction =
  | { type: "make_full"; blockId: InvoiceBlockId }
  | { type: "swap_sides"; blockId: InvoiceBlockId }
  | { type: "move_side"; blockId: InvoiceBlockId; targetSide: LayoutColumnSide }
  | { type: "set_width"; blockId: InvoiceBlockId; pct: number }
  | { type: "divide_row"; blockId: InvoiceBlockId }
  | { type: "move_row"; blockId: InvoiceBlockId; direction: -1 | 1 }

export type PredictedDropPlacement =
  | {
      action: "insert_full"
      position: "before" | "after"
      anchorBlockId: InvoiceBlockId
      guideMode: "line"
      rect: { left: number; top: number; width: number; height: number }
      label: string
    }
  | {
      action: "pair_side"
      side: LayoutColumnSide
      anchorBlockId: InvoiceBlockId
      guideMode: "box"
      rect: { left: number; top: number; width: number; height: number }
      label: string
    }
  | {
      action: "insert_in_col"
      position: "before" | "after"
      side: LayoutColumnSide
      anchorBlockId: InvoiceBlockId
      guideMode: "line"
      rect: { left: number; top: number; width: number; height: number }
      label: string
    }

export const ALL_INVOICE_BLOCK_IDS: readonly InvoiceBlockId[] = [
  "windows",
  "doors",
  "su",
  "install",
  "materials",
  "options",
  "notes",
  "summary",
] as const

export const INVOICE_BLOCK_LABELS: Record<InvoiceBlockId, string> = {
  windows: "Windows Schedule",
  doors: "Doors Schedule",
  su: "Sealed Units Schedule",
  install: "Installation & Travel",
  materials: "Extra Materials & Add-ons",
  options: "Options",
  notes: "Notes",
  summary: "Quote Summary",
}

const PRODUCT_BLOCK_PRIORITY: Record<"windows" | "doors" | "su", number> = {
  windows: 0,
  doors: 1,
  su: 2,
}

const VALID_BLOCK_SET = new Set<string>(ALL_INVOICE_BLOCK_IDS)
const DETAIL_BLOCKS: readonly InvoiceBlockId[] = ["install", "materials", "options", "notes"]
const PRODUCT_BLOCKS: readonly ("windows" | "doors" | "su")[] = ["windows", "doors", "su"]

let rowCounter = 0
function nextRowId(prefix = "r"): string {
  rowCounter += 1
  return `${prefix}_${rowCounter}`
}

/**
 * Clones layout rows safely so state transitions and Undo/Redo snapshots remain immutable.
 */
export function cloneLayoutRows(rows: LayoutRow[]): LayoutRow[] {
  return rows.map((row) =>
    row.type === "full"
      ? { ...row }
      : { ...row, left: [...row.left], right: [...row.right] }
  )
}

/**
 * Checks whether two layout row lists represent the exact same block arrangement and widths.
 */
export function areLayoutRowsEqual(a: LayoutRow[], b: LayoutRow[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i += 1) {
    const rA = a[i]
    const rB = b[i]
    if (rA.type !== rB.type) return false
    if (rA.type === "full" && rB.type === "full") {
      if (rA.blockId !== rB.blockId) return false
    } else if (rA.type === "split" && rB.type === "split") {
      if (
        rA.leftPct !== rB.leftPct ||
        rA.left.length !== rB.left.length ||
        rA.right.length !== rB.right.length
      ) {
        return false
      }
      for (let j = 0; j < rA.left.length; j += 1) {
        if (rA.left[j] !== rB.left[j]) return false
      }
      for (let j = 0; j < rA.right.length; j += 1) {
        if (rA.right[j] !== rB.right[j]) return false
      }
    }
  }
  return true
}

/**
 * Returns product table IDs sorted by descending item count with fixed tie-breaker: Windows -> Doors -> Sealed Units.
 */
export function getOrderedProductIds(input: Pick<SmartLayoutInput, "windowCount" | "doorCount" | "sealedUnitCount">): ("windows" | "doors" | "su")[] {
  const entries: { id: "windows" | "doors" | "su"; count: number; priority: number }[] = []
  if (input.windowCount > 0) entries.push({ id: "windows", count: input.windowCount, priority: PRODUCT_BLOCK_PRIORITY.windows })
  if (input.doorCount > 0) entries.push({ id: "doors", count: input.doorCount, priority: PRODUCT_BLOCK_PRIORITY.doors })
  if (input.sealedUnitCount > 0) entries.push({ id: "su", count: input.sealedUnitCount, priority: PRODUCT_BLOCK_PRIORITY.su })

  entries.sort((a, b) => b.count - a.count || a.priority - b.priority)
  return entries.map((e) => e.id)
}

/**
 * Computes active block IDs for a quote snapshot in canonical order.
 */
export function getActiveInvoiceBlockIds(input: SmartLayoutInput): InvoiceBlockId[] {
  const orderedProducts = getOrderedProductIds(input)
  const details: InvoiceBlockId[] = []
  if (input.hasInstall) details.push("install")
  if (input.hasMaterials) details.push("materials")
  if (input.hasOptions) details.push("options")
  if (input.hasNotes) details.push("notes")
  return [...orderedProducts, ...details, "summary"]
}

/**
 * Computes the adaptive 1-page smart layout for a quote:
 * - No-window sparse quote: enlarged ~14px font + 60% (or 100%) summary card.
 * - Multi-product overflow risk: tucks secondary schedules into Left column alongside details beside Summary.
 * - Standard quote: ordered schedules full width on top, [details 50% | summary 50%] below.
 */
export function computeSmartAutoLayout(input: SmartLayoutInput): SmartAutoLayoutResult {
  const activeIds = getActiveInvoiceBlockIds(input)
  const orderedTables = getOrderedProductIds(input)
  const detailIds = DETAIL_BLOCKS.filter((id) => activeIds.includes(id))
  const totalProductRows = input.windowCount + input.doorCount + input.sealedUnitCount

  // Sparse / No-Window Quote -> spacious 14px feel + wider summary card
  if (input.windowCount === 0 && totalProductRows <= 6) {
    const rows: LayoutRow[] = [
      ...orderedTables.map((id, idx) => ({ id: `auto_tbl_${idx}`, type: "full" as const, blockId: id })),
      detailIds.length > 0
        ? { id: "auto_split_wide", type: "split" as const, leftPct: 40, left: [...detailIds], right: ["summary"] }
        : { id: "auto_sum_full", type: "full" as const, blockId: "summary" },
    ]
    return {
      rows,
      mode: "spacious",
      suggestedFontSize: 14,
      suggestedSummaryWidthMode: "wide",
      description: "Spacious no-window layout with ~14px text and wide summary.",
    }
  }

  // Dense multi-product quote -> tuck secondary schedules beside Summary to hold Page 1
  const estimatedPortraitUnits =
    totalProductRows * 1.15 +
    orderedTables.length * 1.4 +
    detailIds.length * 2.2
  const shouldTuckSecondaryTables =
    orderedTables.length > 1 && estimatedPortraitUnits > 16.5 && input.windowCount > 0

  if (shouldTuckSecondaryTables) {
    const [primaryTable, ...secondaryTables] = orderedTables
    const rows: LayoutRow[] = [
      { id: "auto_primary", type: "full", blockId: primaryTable },
      {
        id: "auto_tucked_split",
        type: "split",
        leftPct: 54,
        left: [...secondaryTables, ...detailIds],
        right: ["summary"],
      },
    ]
    return {
      rows,
      mode: "dense_tuck",
      suggestedFontSize: totalProductRows >= 15 ? 9.5 : 10,
      suggestedSummaryWidthMode: "compact",
      description: `Dense 1-page tuck: placed ${secondaryTables.map((id) => INVOICE_BLOCK_LABELS[id]).join(" + ")} left beside Summary.`,
    }
  }

  const rows: LayoutRow[] = [
    ...orderedTables.map((id, idx) => ({ id: `auto_std_${idx}`, type: "full" as const, blockId: id })),
    detailIds.length > 0
      ? { id: "auto_bottom", type: "split" as const, leftPct: 50, left: [...detailIds], right: ["summary"] }
      : { id: "auto_sum_full", type: "full" as const, blockId: "summary" },
  ]
  return {
    rows,
    mode: "standard",
    suggestedFontSize: totalProductRows >= 12 ? 9.5 : 10.5,
    suggestedSummaryWidthMode: "compact",
    description: "Standard 1-page layout with sorted product schedules and 50/50 details & summary.",
  }
}

/**
 * Reconciles a saved (or edited) layout with the currently active blocks of a quote:
 * - Removes inactive/empty blocks cleanly while collapsing empty split columns safely.
 * - Inserts newly active product schedules above detail/summary rows in count-sorted order.
 * - Inserts newly active detail blocks into any split column opposite Summary (or right before Summary).
 */
export function reconcileSavedLayout(
  savedRows: LayoutRow[],
  activeBlockIds: InvoiceBlockId[]
): LayoutRow[] {
  const validSet = new Set<InvoiceBlockId>(activeBlockIds)
  const present = new Set<InvoiceBlockId>()
  const cleaned: LayoutRow[] = []

  for (const row of savedRows) {
    if (row.type === "full") {
      if (validSet.has(row.blockId) && !present.has(row.blockId)) {
        present.add(row.blockId)
        cleaned.push({ ...row })
      }
    } else {
      const left = row.left.filter((id) => {
        if (!validSet.has(id) || present.has(id)) return false
        present.add(id)
        return true
      })
      const right = row.right.filter((id) => {
        if (!validSet.has(id) || present.has(id)) return false
        present.add(id)
        return true
      })
      if (left.length > 0 && right.length > 0) {
        cleaned.push({
          ...row,
          leftPct: clampLeftPct(row.leftPct),
          left,
          right,
        })
      } else {
        const remaining = left.length > 0 ? left : right
        for (const id of remaining) {
          cleaned.push({ id: `${row.id}_${id}`, type: "full", blockId: id })
        }
      }
    }
  }

  for (const id of activeBlockIds) {
    if (present.has(id)) continue
    present.add(id)

    if ((PRODUCT_BLOCKS as readonly string[]).includes(id)) {
      const insertAt = cleaned.findIndex(
        (r) =>
          r.type === "split" ||
          r.blockId === "summary" ||
          (DETAIL_BLOCKS as readonly string[]).includes(r.blockId)
      )
      const newRow: FullLayoutRow = { id: nextRowId("add"), type: "full", blockId: id }
      if (insertAt === -1) cleaned.push(newRow)
      else cleaned.splice(insertAt, 0, newRow)
      continue
    }

    if ((DETAIL_BLOCKS as readonly string[]).includes(id)) {
      const splitWithSummary = cleaned.find(
        (r): r is SplitLayoutRow =>
          r.type === "split" && (r.left.includes("summary") || r.right.includes("summary"))
      )
      if (splitWithSummary) {
        if (splitWithSummary.right.includes("summary")) splitWithSummary.left.push(id)
        else splitWithSummary.right.push(id)
        continue
      }
      const sumIdx = cleaned.findIndex((r) => r.type === "full" && r.blockId === "summary")
      const newRow: FullLayoutRow = { id: nextRowId("add"), type: "full", blockId: id }
      if (sumIdx !== -1) cleaned.splice(sumIdx, 0, newRow)
      else cleaned.push(newRow)
      continue
    }

    cleaned.push({ id: nextRowId("add"), type: "full", blockId: id })
  }

  return cleaned
}

function clampLeftPct(pct: number): number {
  if (!Number.isFinite(pct)) return 50
  return Math.max(25, Math.min(75, Math.round(pct)))
}

function findBlockPosition(
  rows: LayoutRow[],
  blockId: InvoiceBlockId
): { rowIdx: number; side: BlockSlotSide; itemIdx: number } | null {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    if (row.type === "full" && row.blockId === blockId) {
      return { rowIdx: i, side: "full", itemIdx: 0 }
    }
    if (row.type === "split") {
      const li = row.left.indexOf(blockId)
      if (li !== -1) return { rowIdx: i, side: "left", itemIdx: li }
      const ri = row.right.indexOf(blockId)
      if (ri !== -1) return { rowIdx: i, side: "right", itemIdx: ri }
    }
  }
  return null
}

function removeBlockInPlace(rows: LayoutRow[], blockId: InvoiceBlockId): void {
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    const row = rows[i]
    if (row.type === "full" && row.blockId === blockId) {
      rows.splice(i, 1)
      return
    }
    if (row.type === "split") {
      if (!row.left.includes(blockId) && !row.right.includes(blockId)) {
        continue
      }
      row.left = row.left.filter((id) => id !== blockId)
      row.right = row.right.filter((id) => id !== blockId)
      if (row.left.length === 0 && row.right.length === 0) {
        rows.splice(i, 1)
      } else if (row.right.length === 0) {
        rows.splice(
          i,
          1,
          ...row.left.map((bid, k) => ({ id: `${row.id}_${k}`, type: "full" as const, blockId: bid }))
        )
      } else if (row.left.length === 0) {
        rows.splice(
          i,
          1,
          ...row.right.map((bid, k) => ({ id: `${row.id}_${k}`, type: "full" as const, blockId: bid }))
        )
      }
      return
    }
  }
}

/**
 * Pure transition applying a right-click context menu action onto layout rows.
 */
export function applyLayoutContextAction(
  currentRows: LayoutRow[],
  action: LayoutContextAction
): LayoutRow[] {
  const rows = cloneLayoutRows(currentRows)
  const pos = findBlockPosition(rows, action.blockId)
  if (!pos) return rows

  const { rowIdx, side, itemIdx } = pos
  const targetRow = rows[rowIdx]

  if (action.type === "make_full") {
    if (side === "full") return rows
    const anchorRowId = targetRow.id
    removeBlockInPlace(rows, action.blockId)
    const afterIdx = rows.findIndex((r) => r.id === anchorRowId)
    const insertIdx = afterIdx !== -1 ? afterIdx + 1 : Math.min(rows.length, rowIdx)
    rows.splice(insertIdx, 0, { id: nextRowId("full"), type: "full", blockId: action.blockId })
    return rows
  }

  if (action.type === "swap_sides") {
    if (targetRow.type === "split") {
      const tmp = targetRow.left
      targetRow.left = targetRow.right
      targetRow.right = tmp
    }
    return rows
  }

  if (action.type === "move_side") {
    if (targetRow.type === "split") {
      if (side !== action.targetSide) {
        if (side !== "full" && targetRow[side].length === 1) {
          const tmp = targetRow.left
          targetRow.left = targetRow.right
          targetRow.right = tmp
        } else {
          targetRow.left = targetRow.left.filter((x) => x !== action.blockId)
          targetRow.right = targetRow.right.filter((x) => x !== action.blockId)
          targetRow[action.targetSide].push(action.blockId)
        }
      }
      return rows
    }

    const neighborSplit =
      (rows[rowIdx + 1]?.type === "split" ? rows[rowIdx + 1] : null) ??
      (rows[rowIdx - 1]?.type === "split" ? rows[rowIdx - 1] : null)
    const isNextSplit = rows[rowIdx + 1]?.type === "split"

    if (neighborSplit && neighborSplit.type === "split") {
      const splitId = neighborSplit.id
      removeBlockInPlace(rows, action.blockId)
      const dest = rows.find((r): r is SplitLayoutRow => r.id === splitId && r.type === "split")
      if (dest) {
        if (isNextSplit) dest[action.targetSide].unshift(action.blockId)
        else dest[action.targetSide].push(action.blockId)
      }
      return rows
    }

    const partner =
      rows[rowIdx + 1]?.type === "full"
        ? rows[rowIdx + 1]
        : rows[rowIdx - 1]?.type === "full"
          ? rows[rowIdx - 1]
          : null

    if (partner && partner.type === "full") {
      const pId = partner.blockId
      removeBlockInPlace(rows, pId)
      const nowIdx = rows.findIndex((r) => r.type === "full" && r.blockId === action.blockId)
      if (nowIdx !== -1) {
        rows[nowIdx] = {
          id: nextRowId("split"),
          type: "split",
          leftPct: 50,
          left: action.targetSide === "left" ? [action.blockId] : [pId],
          right: action.targetSide === "right" ? [action.blockId] : [pId],
        }
      }
    }
    return rows
  }

  if (action.type === "set_width") {
    const pct = clampLeftPct(action.pct)
    if (targetRow.type === "split") {
      targetRow.leftPct = side === "left" ? pct : clampLeftPct(100 - pct)
      return rows
    }

    const neighbor = rows[rowIdx + 1] ?? rows[rowIdx - 1]
    if (neighbor?.type === "split") {
      const neighborId = neighbor.id
      removeBlockInPlace(rows, action.blockId)
      const dest = rows.find((r): r is SplitLayoutRow => r.id === neighborId && r.type === "split")
      if (dest) {
        if (action.blockId === "summary") {
          dest.right.unshift(action.blockId)
          dest.leftPct = clampLeftPct(100 - pct)
        } else {
          dest.left.unshift(action.blockId)
          dest.leftPct = pct
        }
      }
    } else if (neighbor?.type === "full") {
      const pId = neighbor.blockId
      const placeRight = action.blockId === "summary"
      removeBlockInPlace(rows, pId)
      const nowIdx = rows.findIndex((r) => r.type === "full" && r.blockId === action.blockId)
      if (nowIdx !== -1) {
        rows[nowIdx] = {
          id: nextRowId("split"),
          type: "split",
          leftPct: placeRight ? clampLeftPct(100 - pct) : pct,
          left: placeRight ? [pId] : [action.blockId],
          right: placeRight ? [action.blockId] : [pId],
        }
      }
    }
    return rows
  }

  if (action.type === "divide_row") {
    if (targetRow.type === "split") {
      const allIds = [...targetRow.left, ...targetRow.right]
      rows.splice(
        rowIdx,
        1,
        ...allIds.map((id, k) => ({ id: nextRowId(`div_${k}`), type: "full" as const, blockId: id }))
      )
      return rows
    }

    const neighbor =
      rows[rowIdx + 1]?.type === "full"
        ? rows[rowIdx + 1]
        : rows[rowIdx - 1]?.type === "full"
          ? rows[rowIdx - 1]
          : null

    if (neighbor && neighbor.type === "full") {
      const pId = neighbor.blockId
      const isBelow = neighbor === rows[rowIdx + 1]
      removeBlockInPlace(rows, pId)
      const nowIdx = rows.findIndex((r) => r.type === "full" && r.blockId === action.blockId)
      if (nowIdx !== -1) {
        rows[nowIdx] = {
          id: nextRowId("split"),
          type: "split",
          leftPct: 50,
          left: isBelow ? [action.blockId] : [pId],
          right: isBelow ? [pId] : [action.blockId],
        }
      }
    }
    return rows
  }

  if (action.type === "move_row") {
    const dir = action.direction
    if (side === "full") {
      const targetIdx = rowIdx + dir
      if (targetIdx >= 0 && targetIdx < rows.length) {
        const tmp = rows[rowIdx]
        rows[rowIdx] = rows[targetIdx]
        rows[targetIdx] = tmp
      }
      return rows
    }

    if (targetRow.type === "split") {
      const list = targetRow[side]
      const targetItemIdx = itemIdx + dir
      if (targetItemIdx >= 0 && targetItemIdx < list.length) {
        const tmp = list[itemIdx]
        list[itemIdx] = list[targetItemIdx]
        list[targetItemIdx] = tmp
      } else {
        const targetRowIdx = rowIdx + dir
        if (targetRowIdx >= 0 && targetRowIdx < rows.length) {
          const tmp = rows[rowIdx]
          rows[rowIdx] = rows[targetRowIdx]
          rows[targetRowIdx] = tmp
        }
      }
    }
    return rows
  }

  return rows
}

/**
 * Applies a pointer drag-and-drop prediction (`insert_full`, `pair_side`, or `insert_in_col`).
 */
export function applyPredictedDrop(
  currentRows: LayoutRow[],
  dragBlockId: InvoiceBlockId,
  pred: PredictedDropPlacement
): LayoutRow[] {
  if (!pred || pred.anchorBlockId === dragBlockId) return currentRows
  const rows = cloneLayoutRows(currentRows)
  removeBlockInPlace(rows, dragBlockId)

  const anchorPos = findBlockPosition(rows, pred.anchorBlockId)
  if (!anchorPos) return currentRows
  const { rowIdx: aRowIdx, itemIdx: aItemIdx } = anchorPos

  if (pred.action === "insert_full") {
    const insertIdx = pred.position === "before" ? aRowIdx : aRowIdx + 1
    rows.splice(insertIdx, 0, { id: nextRowId("drop"), type: "full", blockId: dragBlockId })
    return rows
  }

  if (pred.action === "pair_side") {
    rows[aRowIdx] = {
      id: rows[aRowIdx].id,
      type: "split",
      leftPct: 50,
      left: pred.side === "left" ? [dragBlockId] : [pred.anchorBlockId],
      right: pred.side === "right" ? [dragBlockId] : [pred.anchorBlockId],
    }
    return rows
  }

  const targetRow = rows[aRowIdx]
  if (targetRow.type === "split") {
    const list = targetRow[pred.side]
    const insertAt = pred.position === "before" ? aItemIdx : aItemIdx + 1
    list.splice(Math.max(0, Math.min(list.length, insertAt)), 0, dragBlockId)
  } else {
    rows[aRowIdx] = {
      id: targetRow.id,
      type: "split",
      leftPct: 50,
      left: pred.side === "left" ? [dragBlockId] : [pred.anchorBlockId],
      right: pred.side === "right" ? [dragBlockId] : [pred.anchorBlockId],
    }
  }
  return rows
}

/**
 * Validates and sanitizes untrusted SavedQuoteLayout payloads (DB / localStorage / API request body).
 */
export function sanitizeSavedQuoteLayout(raw: unknown): SavedQuoteLayout | null {
  if (!raw || typeof raw !== "object") return null
  const obj = raw as Record<string, unknown>
  if (!Array.isArray(obj.rows) || obj.rows.length === 0) return null

  const seen = new Set<InvoiceBlockId>()
  const cleanRows: LayoutRow[] = []

  for (let i = 0; i < obj.rows.length; i += 1) {
    const r = obj.rows[i]
    if (!r || typeof r !== "object") continue
    const rec = r as Record<string, unknown>
    const id = typeof rec.id === "string" && rec.id.trim() ? rec.id.slice(0, 64) : `row_${i}`

    if (rec.type === "full" && typeof rec.blockId === "string" && VALID_BLOCK_SET.has(rec.blockId)) {
      const bId = rec.blockId as InvoiceBlockId
      if (!seen.has(bId)) {
        seen.add(bId)
        cleanRows.push({ id, type: "full", blockId: bId })
      }
    } else if (rec.type === "split" && Array.isArray(rec.left) && Array.isArray(rec.right)) {
      const left = rec.left
        .filter((x): x is InvoiceBlockId => typeof x === "string" && VALID_BLOCK_SET.has(x) && !seen.has(x as InvoiceBlockId))
        .map((x) => {
          seen.add(x)
          return x
        })
      const right = rec.right
        .filter((x): x is InvoiceBlockId => typeof x === "string" && VALID_BLOCK_SET.has(x) && !seen.has(x as InvoiceBlockId))
        .map((x) => {
          seen.add(x)
          return x
        })

      if (left.length > 0 && right.length > 0) {
        cleanRows.push({
          id,
          type: "split",
          leftPct: clampLeftPct(typeof rec.leftPct === "number" ? rec.leftPct : 50),
          left,
          right,
        })
      } else {
        const lone = left.length > 0 ? left : right
        for (const bid of lone) {
          cleanRows.push({ id: `${id}_${bid}`, type: "full", blockId: bid })
        }
      }
    }
  }

  if (cleanRows.length === 0) return null

  const result: SavedQuoteLayout = { rows: cleanRows }
  if (typeof obj.fontSize === "number" && Number.isFinite(obj.fontSize)) {
    result.fontSize = Math.max(8.5, Math.min(18, Math.round(obj.fontSize * 10) / 10))
  }
  if (typeof obj.spacing === "number" && Number.isFinite(obj.spacing)) {
    result.spacing = Math.max(0.65, Math.min(1.6, Math.round(obj.spacing * 100) / 100))
  }
  if (typeof obj.updatedAt === "string") {
    result.updatedAt = obj.updatedAt.slice(0, 64)
  }
  return result
}

const LAYOUT_STORAGE_PREFIX = "twds_saved_quote_layout"
const LAYOUT_CHANGE_EVENT = "twds-quote-layout-change"

let cachedSnapshotRaw: string | null | undefined = undefined
let cachedSnapshotKey = ""
let cachedSnapshotParsed: SavedQuoteLayout | null = null

function getLayoutStorageKey(userId?: string | null): string {
  return userId ? `${LAYOUT_STORAGE_PREFIX}:${userId}` : LAYOUT_STORAGE_PREFIX
}

function readRawLayoutString(userId?: string | null): string | null {
  if (typeof window === "undefined") return null
  try {
    return (
      (userId ? localStorage.getItem(getLayoutStorageKey(userId)) : null) ??
      localStorage.getItem(LAYOUT_STORAGE_PREFIX)
    )
  } catch {
    return null
  }
}

export function readLocalSavedQuoteLayout(userId?: string | null): SavedQuoteLayout | null {
  const raw = readRawLayoutString(userId)
  if (!raw) return null
  try {
    return sanitizeSavedQuoteLayout(JSON.parse(raw))
  } catch {
    return null
  }
}

/**
 * Referentially stable snapshot getter for React useSyncExternalStore without SSR hydration mismatch.
 */
export function getSavedQuoteLayoutSnapshot(userId?: string | null): SavedQuoteLayout | null {
  const key = getLayoutStorageKey(userId)
  const raw = readRawLayoutString(userId)
  if (cachedSnapshotRaw !== undefined && cachedSnapshotKey === key && cachedSnapshotRaw === raw) {
    return cachedSnapshotParsed
  }
  cachedSnapshotKey = key
  cachedSnapshotRaw = raw
  if (!raw) {
    cachedSnapshotParsed = null
    return null
  }
  try {
    cachedSnapshotParsed = sanitizeSavedQuoteLayout(JSON.parse(raw))
  } catch {
    cachedSnapshotParsed = null
  }
  return cachedSnapshotParsed
}

export function subscribeSavedQuoteLayout(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(LAYOUT_STORAGE_PREFIX)) {
      cachedSnapshotRaw = undefined
      onStoreChange()
    }
  }
  const onCustom = () => {
    cachedSnapshotRaw = undefined
    onStoreChange()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener(LAYOUT_CHANGE_EVENT, onCustom)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(LAYOUT_CHANGE_EVENT, onCustom)
  }
}

export function writeLocalSavedQuoteLayout(
  layout: SavedQuoteLayout | null,
  userId?: string | null
): void {
  if (typeof window === "undefined") return
  try {
    if (!layout) {
      if (userId) localStorage.removeItem(getLayoutStorageKey(userId))
      localStorage.removeItem(LAYOUT_STORAGE_PREFIX)
    } else {
      const serialized = JSON.stringify(layout)
      if (userId) localStorage.setItem(getLayoutStorageKey(userId), serialized)
      localStorage.setItem(LAYOUT_STORAGE_PREFIX, serialized)
    }
    cachedSnapshotRaw = undefined
    window.dispatchEvent(new CustomEvent(LAYOUT_CHANGE_EVENT))
  } catch {
    // Ignore storage quota / private mode failures
  }
}
