"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  applyLayoutContextAction,
  applyPredictedDrop,
  areLayoutRowsEqual,
  cloneLayoutRows,
  computeSmartAutoLayout,
  getActiveInvoiceBlockIds,
  INVOICE_BLOCK_LABELS,
  reconcileSavedLayout,
  type BlockSlotSide,
  type InvoiceBlockId,
  type LayoutContextAction,
  type LayoutRow,
  type PredictedDropPlacement,
  type SavedQuoteLayout,
  type SmartAutoLayoutResult,
  type SmartLayoutInput,
} from "@/lib/quotes/invoice-layout-engine"
import type { AttachedUpgradeOption, InvoiceCalculationsResult } from "../types"
import { hasQuoteOptionEntries } from "../tables/QuoteUnifiedOptionsSection"

export interface OptionsDerivationInput {
  isDualOption?: boolean
  wantsUpgrade?: boolean
  shownUpgrade?: number
  attachedUpgrade?: AttachedUpgradeOption | null
  customOptions?: any[] | null
  quoteNotes?: string
}

export interface ActiveDragState {
  blockId: InvoiceBlockId
  active: boolean
  startX: number
  startY: number
  clientX: number
  clientY: number
  cardWidth: number
  pred: PredictedDropPlacement | null
}

export interface ContextMenuState {
  blockId: InvoiceBlockId
  x: number
  y: number
  isSplit: boolean
  side: BlockSlotSide
  widthPct: number
}

export interface InvoiceComposerController {
  displayedRows: LayoutRow[]
  autoResult: SmartAutoLayoutResult
  isCustomized: boolean
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  resetToAutoFit: () => void
  clearCommittedRows: () => void
  applyContextAction: (action: LayoutContextAction) => void
  dragState: ActiveDragState | null
  ctxMenu: ContextMenuState | null
  openContextMenu: (e: React.MouseEvent, blockId: InvoiceBlockId) => void
  closeContextMenu: () => void
  handleBlockPointerDown: (e: React.PointerEvent, blockId: InvoiceBlockId) => void
  sheetRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Derives SmartLayoutInput directly from consolidated invoice calculations and option flags.
 */
export function deriveSmartLayoutInput(
  calc: InvoiceCalculationsResult,
  opts: OptionsDerivationInput
): SmartLayoutInput {
  const windowCount = calc.hasWindows ? calc.effectiveWindows.length : 0
  const doorCount = calc.hasDoors ? calc.effectiveDoors.length : 0
  const sealedUnitCount = calc.hasSealedUnits
    ? Math.max(
        calc.effectiveSealedUnits.length,
        calc.isAttachedSUService || Number(calc.effectiveSUTotals?.serviceLabourTotal) > 0
          ? 1
          : 0
      )
    : 0

  const hasInstall =
    !calc.isSupplyOnly &&
    (calc.labourBreakdownItems.length > 0 || calc.travelItems.length > 0)
  const hasMaterials =
    calc.jcItems.length > 0 || calc.detailedExtrasList.length > 0
  const hasOptions = hasQuoteOptionEntries({
    isSupplyOnly: calc.isSupplyOnly,
    isDualOption: opts.isDualOption,
    wantsUpgrade: opts.wantsUpgrade,
    shownUpgrade: opts.shownUpgrade,
    attachedUpgrade: opts.attachedUpgrade,
    doorUpgradeItems: calc.doorUpgradeItems,
    customOptions: opts.customOptions || undefined,
  })
  const hasNotes = Boolean(opts.quoteNotes && opts.quoteNotes.trim().length > 0)

  return {
    windowCount,
    doorCount,
    sealedUnitCount,
    hasInstall,
    hasMaterials,
    hasOptions,
    hasNotes,
  }
}

function predictDropFromContainer(
  container: HTMLElement | null,
  clientX: number,
  clientY: number,
  dragBlockId: InvoiceBlockId
): PredictedDropPlacement | null {
  if (!container) return null
  const sheetRect = container.getBoundingClientRect()
  const blocks = Array.from(
    container.querySelectorAll<HTMLElement>("[data-invoice-block]")
  ).filter((el) => el.dataset.invoiceBlock !== dragBlockId)

  if (blocks.length === 0) return null

  // If pointer is inside a split column container below its shorter block list, anchor to that column's last block
  const splitCols = Array.from(container.querySelectorAll<HTMLElement>("[data-split-col]"))
  for (const colEl of splitCols) {
    const cr = colEl.getBoundingClientRect()
    if (clientX < cr.left || clientX > cr.right || clientY < cr.top || clientY > cr.bottom) {
      continue
    }
    const colSide = (colEl.dataset.splitCol || "left") as BlockSlotSide
    const splitWrap = colEl.closest<HTMLElement>("[data-split-row]")
    const sRect = splitWrap ? splitWrap.getBoundingClientRect() : cr
    const colBlocks = Array.from(
      colEl.querySelectorAll<HTMLElement>("[data-invoice-block]")
    ).filter((el) => el.dataset.invoiceBlock !== dragBlockId)

    if (colBlocks.length > 0 && (colSide === "left" || colSide === "right")) {
      const lastBlock = colBlocks[colBlocks.length - 1]
      const lr = lastBlock.getBoundingClientRect()
      if (clientY > lr.bottom && clientY < sRect.bottom - 20) {
        const anchorBlockId = lastBlock.dataset.invoiceBlock as InvoiceBlockId
        const anchorName = INVOICE_BLOCK_LABELS[anchorBlockId] || anchorBlockId
        return {
          action: "insert_in_col",
          position: "after",
          side: colSide,
          anchorBlockId,
          guideMode: "line",
          rect: { left: cr.left, top: lr.bottom + 2, width: cr.width, height: 4 },
          label: `${colSide === "left" ? "Left" : "Right"} Col · Below ${anchorName}`,
        }
      }
    }
  }

  let bestEl: HTMLElement | null = null
  let bestDist = Infinity
  for (const el of blocks) {
    const r = el.getBoundingClientRect()
    const dy =
      clientY < r.top ? r.top - clientY : clientY > r.bottom ? clientY - r.bottom : 0
    const dx =
      clientX < r.left ? r.left - clientX : clientX > r.right ? clientX - r.right : 0
    const dist = dy * 2 + dx
    if (dist < bestDist) {
      bestDist = dist
      bestEl = el
    }
  }
  if (!bestEl) return null

  const r = bestEl.getBoundingClientRect()
  const anchorBlockId = bestEl.dataset.invoiceBlock as InvoiceBlockId
  const anchorName = INVOICE_BLOCK_LABELS[anchorBlockId] || anchorBlockId
  const col = (bestEl.dataset.col || "full") as BlockSlotSide
  const relY = Math.max(0, Math.min(1, (clientY - r.top) / Math.max(1, r.height)))
  const relX = Math.max(0, Math.min(1, (clientX - r.left) / Math.max(1, r.width)))

  if (col === "full") {
    if (relY < 0.25) {
      return {
        action: "insert_full",
        position: "before",
        anchorBlockId,
        guideMode: "line",
        rect: {
          left: sheetRect.left,
          top: Math.max(sheetRect.top, r.top - 3),
          width: sheetRect.width,
          height: 4,
        },
        label: `Place 100% Width ABOVE ${anchorName}`,
      }
    }
    if (relY > 0.75) {
      return {
        action: "insert_full",
        position: "after",
        anchorBlockId,
        guideMode: "line",
        rect: {
          left: sheetRect.left,
          top: r.bottom + 1,
          width: sheetRect.width,
          height: 4,
        },
        label: `Place 100% Width BELOW ${anchorName}`,
      }
    }
    const side = relX < 0.5 ? "left" : "right"
    const halfW = r.width / 2
    return {
      action: "pair_side",
      side,
      anchorBlockId,
      guideMode: "box",
      rect: {
        left: side === "left" ? r.left : r.left + halfW,
        top: r.top,
        width: halfW,
        height: r.height,
      },
      label: `Split 50/50 -> Put ${side === "left" ? "LEFT" : "RIGHT"} of ${anchorName}`,
    }
  }

  const splitWrap = bestEl.closest<HTMLElement>("[data-split-row]")
  const sRect = splitWrap ? splitWrap.getBoundingClientRect() : r
  if (clientY <= sRect.top + 20) {
    return {
      action: "insert_full",
      position: "before",
      anchorBlockId,
      guideMode: "line",
      rect: { left: sheetRect.left, top: sRect.top - 3, width: sheetRect.width, height: 4 },
      label: "Pull Out as 100% Full Row ABOVE",
    }
  }
  if (clientY >= sRect.bottom - 20) {
    return {
      action: "insert_full",
      position: "after",
      anchorBlockId,
      guideMode: "line",
      rect: { left: sheetRect.left, top: sRect.bottom + 1, width: sheetRect.width, height: 4 },
      label: "Pull Out as 100% Full Row BELOW",
    }
  }

  const pos = relY < 0.5 ? "before" : "after"
  return {
    action: "insert_in_col",
    position: pos,
    side: col,
    anchorBlockId,
    guideMode: "line",
    rect: {
      left: r.left,
      top: pos === "before" ? r.top - 3 : r.bottom + 1,
      width: r.width,
      height: 4,
    },
    label: `${col === "left" ? "Left" : "Right"} Col · ${pos === "before" ? "Above" : "Below"} ${anchorName}`,
  }
}

export interface UseInvoiceComposerOptions {
  smartInput: SmartLayoutInput
  savedLayout: SavedQuoteLayout | null
  enabled: boolean
  onResetTypography?: (fontSize: number, spacing: number) => void
}

/**
 * Interactive composer hook owning layout state, Undo/Redo stacks, pointer drag-and-drop prediction,
 * keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z), and right-click context menu state.
 */
export function useInvoiceComposerState({
  smartInput,
  savedLayout,
  enabled,
  onResetTypography,
}: UseInvoiceComposerOptions): InvoiceComposerController {
  const sheetRef = useRef<HTMLDivElement | null>(null)

  const autoResult = useMemo(() => computeSmartAutoLayout(smartInput), [smartInput])
  const activeBlockIds = useMemo(() => getActiveInvoiceBlockIds(smartInput), [smartInput])

  const [committedRows, setCommittedRows] = useState<LayoutRow[] | null>(null)
  const [undoStack, setUndoStack] = useState<LayoutRow[][]>([])
  const [redoStack, setRedoStack] = useState<LayoutRow[][]>([])
  const [dragState, setDragState] = useState<ActiveDragState | null>(null)
  const dragStateRef = useRef<ActiveDragState | null>(null)
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState | null>(null)

  const displayedRows = useMemo(() => {
    if (committedRows) return reconcileSavedLayout(committedRows, activeBlockIds)
    if (savedLayout?.rows?.length) {
      return reconcileSavedLayout(savedLayout.rows, activeBlockIds)
    }
    return autoResult.rows
  }, [committedRows, savedLayout, activeBlockIds, autoResult.rows])

  const displayedRowsRef = useRef(displayedRows)
  useEffect(() => {
    displayedRowsRef.current = displayedRows
  }, [displayedRows])

  const commitRows = useCallback((nextRows: LayoutRow[]) => {
    const prevRows = displayedRowsRef.current
    if (areLayoutRowsEqual(prevRows, nextRows)) return
    setUndoStack((prev) => [...prev.slice(-39), cloneLayoutRows(prevRows)])
    setRedoStack([])
    setCommittedRows(cloneLayoutRows(nextRows))
  }, [])

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev
      const previous = prev[prev.length - 1]
      setRedoStack((rPrev) => [...rPrev, cloneLayoutRows(displayedRowsRef.current)])
      setCommittedRows(cloneLayoutRows(previous))
      return prev.slice(0, -1)
    })
  }, [])

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev
      const next = prev[prev.length - 1]
      setUndoStack((uPrev) => [...uPrev, cloneLayoutRows(displayedRowsRef.current)])
      setCommittedRows(cloneLayoutRows(next))
      return prev.slice(0, -1)
    })
  }, [])

  const resetToAutoFit = useCallback(() => {
    commitRows(autoResult.rows)
    onResetTypography?.(autoResult.suggestedFontSize, 1.05)
  }, [autoResult, commitRows, onResetTypography])

  const clearCommittedRows = useCallback(() => {
    setCommittedRows(null)
    setUndoStack([])
    setRedoStack([])
  }, [])

  const applyContextAction = useCallback(
    (action: LayoutContextAction) => {
      const nextRows = applyLayoutContextAction(displayedRowsRef.current, action)
      commitRows(nextRows)
    },
    [commitRows]
  )

  const closeContextMenu = useCallback(() => setCtxMenu(null), [])

  const openContextMenu = useCallback(
    (e: React.MouseEvent, blockId: InvoiceBlockId) => {
      if (!enabled) return
      e.preventDefault()
      e.stopPropagation()

      const rows = displayedRowsRef.current
      const rowObj = rows.find(
        (r) =>
          (r.type === "full" && r.blockId === blockId) ||
          (r.type === "split" && (r.left.includes(blockId) || r.right.includes(blockId)))
      )
      if (!rowObj) return
      const isSplit = rowObj.type === "split"
      const side: BlockSlotSide = isSplit
        ? rowObj.left.includes(blockId)
          ? "left"
          : "right"
        : "full"
      const widthPct = isSplit
        ? side === "left"
          ? rowObj.leftPct
          : 100 - rowObj.leftPct
        : 100

      setCtxMenu({ blockId, x: e.clientX, y: e.clientY, isSplit, side, widthPct })
    },
    [enabled]
  )

  const handleBlockPointerDown = useCallback(
    (e: React.PointerEvent, blockId: InvoiceBlockId) => {
      if (!enabled || e.button !== 0) return
      const target = e.target as HTMLElement | null
      if (target?.closest("button, a, input, select, textarea, [contenteditable='true'], .no-drag")) {
        return
      }
      setCtxMenu(null)
      const blockEl = e.currentTarget as HTMLElement
      const rect = blockEl.getBoundingClientRect()
      const initial: ActiveDragState = {
        blockId,
        active: false,
        startX: e.clientX,
        startY: e.clientY,
        clientX: e.clientX,
        clientY: e.clientY,
        cardWidth: rect.width,
        pred: null,
      }
      dragStateRef.current = initial
      setDragState(initial)
    },
    [enabled]
  )

  const isPointerDown = dragState !== null

  useEffect(() => {
    if (!enabled || !isPointerDown) return

    const handlePointerMove = (e: PointerEvent) => {
      const prev = dragStateRef.current
      if (!prev) return
      const movedEnough =
        prev.active || Math.hypot(e.clientX - prev.startX, e.clientY - prev.startY) > 5
      if (!movedEnough) return
      const pred = predictDropFromContainer(
        sheetRef.current,
        e.clientX,
        e.clientY,
        prev.blockId
      )
      const next: ActiveDragState = {
        ...prev,
        active: true,
        clientX: e.clientX,
        clientY: e.clientY,
        pred,
      }
      dragStateRef.current = next
      setDragState(next)
    }

    const handlePointerUp = () => {
      const finalDrag = dragStateRef.current
      dragStateRef.current = null
      setDragState(null)

      if (finalDrag?.active && finalDrag.pred && finalDrag.pred.anchorBlockId !== finalDrag.blockId) {
        const nextRows = applyPredictedDrop(
          displayedRowsRef.current,
          finalDrag.blockId,
          finalDrag.pred
        )
        commitRows(nextRows)
      }
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
    }
  }, [enabled, isPointerDown, commitRows])

  useEffect(() => {
    if (!enabled) return
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return
      }
      const isMod = e.metaKey || e.ctrlKey
      if (!isMod) return
      const key = e.key.toLowerCase()
      if (key === "z" && !e.shiftKey) {
        if (undoStack.length > 0) {
          e.preventDefault()
          undo()
        }
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        if (redoStack.length > 0) {
          e.preventDefault()
          redo()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enabled, undo, redo, undoStack.length, redoStack.length])

  return {
    displayedRows,
    autoResult,
    isCustomized: committedRows !== null,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undo,
    redo,
    resetToAutoFit,
    clearCommittedRows,
    applyContextAction,
    dragState,
    ctxMenu,
    openContextMenu,
    closeContextMenu,
    handleBlockPointerDown,
    sheetRef,
  }
}
