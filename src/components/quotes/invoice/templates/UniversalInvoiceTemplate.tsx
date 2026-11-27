"use client"

import React, { useMemo } from "react"
import { GripVertical } from "lucide-react"
import {
  computeSmartAutoLayout,
  getActiveInvoiceBlockIds,
  INVOICE_BLOCK_LABELS,
  reconcileSavedLayout,
  type BlockSlotSide,
  type InvoiceBlockId,
  type LayoutRow,
  type SavedQuoteLayout,
} from "@/lib/quotes/invoice-layout-engine"
import type { AttachedUpgradeOption, InvoiceCalculationsResult } from "../types"
import { WindowsScheduleTable } from "../tables/WindowsScheduleTable"
import { DoorsScheduleTable } from "../tables/DoorsScheduleTable"
import { SealedUnitsScheduleTable } from "../tables/SealedUnitsScheduleTable"
import {
  InstallDetailsCard,
  MaterialsDetailsCard,
  NotesDetailsCard,
  OptionsDetailsCard,
} from "../composer/InvoiceDetailCards"
import { UniversalSummaryCard } from "../composer/UniversalSummaryCard"
import { BlockContextMenu } from "../composer/BlockContextMenu"
import {
  deriveSmartLayoutInput,
  type InvoiceComposerController,
} from "../composer/useInvoiceComposerState"

export interface UniversalInvoiceTemplateProps {
  calc: InvoiceCalculationsResult
  customerName?: string
  quoteNumber?: string
  regionName?: string
  preparedBy?: string
  wantsUpgrade?: boolean
  shownUpgrade?: number
  attachedUpgrade?: AttachedUpgradeOption | null
  quoteNotes?: string
  globalUpcharges?: any[]
  isDualOption?: boolean
  attachedInstallOption?: any | null
  customOptions?: any[] | null
  isInteractivePreview?: boolean
  savedLayout?: SavedQuoteLayout | null
  composer?: InvoiceComposerController | null
}

/**
 * Single Universal Portrait/Landscape Quote Template with stacked Cards header,
 * Smart Auto-Fit 1-page packing, ink-saver Summary card, and optional interactive composer controls.
 */
export function UniversalInvoiceTemplate({
  calc,
  customerName,
  quoteNumber,
  regionName,
  preparedBy,
  wantsUpgrade,
  shownUpgrade,
  attachedUpgrade,
  quoteNotes,
  globalUpcharges,
  isDualOption = false,
  attachedInstallOption = null,
  customOptions = null,
  isInteractivePreview = false,
  savedLayout = null,
  composer = null,
}: UniversalInvoiceTemplateProps) {
  const {
    titleFs,
    smallFs,
    invoiceSubtitle,
    h2Fs,
    currentDate,
    bodyFs,
    cardGap,
  } = calc

  const standaloneRows = useMemo<LayoutRow[]>(() => {
    if (composer) return composer.displayedRows
    const smartInput = deriveSmartLayoutInput(calc, {
      isDualOption,
      wantsUpgrade,
      shownUpgrade,
      attachedUpgrade,
      customOptions,
      quoteNotes,
    })
    const activeIds = getActiveInvoiceBlockIds(smartInput)
    if (savedLayout?.rows?.length) {
      return reconcileSavedLayout(savedLayout.rows, activeIds)
    }
    return computeSmartAutoLayout(smartInput).rows
  }, [
    composer,
    calc,
    isDualOption,
    wantsUpgrade,
    shownUpgrade,
    attachedUpgrade,
    customOptions,
    quoteNotes,
    savedLayout,
  ])

  const layoutRows = composer ? composer.displayedRows : standaloneRows
  const rowGapPx = Math.max(5, Math.round(cardGap * 0.55))

  const renderBlockContent = (blockId: InvoiceBlockId, widthPct: number) => {
    const isCompactSide = widthPct < 65
    switch (blockId) {
      case "windows":
        return (
          <WindowsScheduleTable
            theme="cards"
            calc={calc}
            universal
            compactSide={isCompactSide}
          />
        )
      case "doors":
        return (
          <DoorsScheduleTable
            theme="cards"
            calc={calc}
            globalUpcharges={globalUpcharges}
            universal
            compactSide={isCompactSide}
          />
        )
      case "su":
        return (
          <SealedUnitsScheduleTable
            theme="cards"
            calc={calc}
            universal
            compactSide={isCompactSide}
          />
        )
      case "install":
        return <InstallDetailsCard calc={calc} />
      case "materials":
        return <MaterialsDetailsCard calc={calc} />
      case "options":
        return (
          <OptionsDetailsCard
            calc={calc}
            isDualOption={isDualOption}
            attachedInstallOption={attachedInstallOption}
            wantsUpgrade={wantsUpgrade}
            shownUpgrade={shownUpgrade}
            attachedUpgrade={attachedUpgrade}
            customOptions={customOptions}
          />
        )
      case "notes":
        return (
          <NotesDetailsCard
            quoteNotes={quoteNotes}
            smallFs={calc.smallFs}
            rowPy={calc.rowPy}
          />
        )
      case "summary":
        return (
          <UniversalSummaryCard
            calc={calc}
            columnWidthPct={widthPct}
            quoteNumber={quoteNumber}
          />
        )
      default:
        return null
    }
  }

  const renderBlockNode = (
    blockId: InvoiceBlockId,
    side: BlockSlotSide,
    widthPct: number
  ) => {
    const content = renderBlockContent(blockId, widthPct)
    if (!content) return null

    if (!isInteractivePreview || !composer) {
      return (
        <div key={blockId} className="print-avoid-break min-w-0">
          {content}
        </div>
      )
    }

    const isBeingDragged =
      composer.dragState?.active && composer.dragState.blockId === blockId

    return (
      <div
        key={blockId}
        data-invoice-block={blockId}
        data-col={side}
        data-width-pct={widthPct}
        onPointerDown={(e) => composer.handleBlockPointerDown(e, blockId)}
        onContextMenu={(e) => composer.openContextMenu(e, blockId)}
        className={`comp-block group relative min-w-0 cursor-grab rounded transition active:cursor-grabbing ${
          isBeingDragged
            ? "opacity-35 ring-2 ring-dashed ring-[#6366f1]"
            : "hover:ring-[1.5px] hover:ring-[#818cf8]"
        }`}
      >
        <div
          className="no-print pointer-events-none absolute -top-2.5 right-1.5 z-20 hidden items-center gap-1 rounded bg-[#0f172a] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white shadow group-hover:flex print:hidden"
        >
          <GripVertical className="h-2.5 w-2.5 text-[#94a3b8]" />
          <span>{INVOICE_BLOCK_LABELS[blockId]}</span>
          <span className="text-[#818cf8]">{widthPct}%</span>
          <span className="text-[#94a3b8]">· Right-click</span>
        </div>
        {content}
      </div>
    )
  }

  const dragActive = isInteractivePreview && Boolean(composer?.dragState?.active)
  const dragPred = dragActive ? composer?.dragState?.pred ?? null : null

  return (
    <>
      {/* Interactive Composer Hint Strip (hidden on print) */}
      {isInteractivePreview && composer && (
        <div className="no-print mb-2 flex flex-wrap items-center justify-between gap-2 rounded border border-[#c7d2fe] bg-[#eef2ff] px-2.5 py-1 text-[10.5px] font-semibold text-[#312e81] print:hidden">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#4f46e5] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
              {composer.isCustomized
                ? "Custom Layout"
                : savedLayout?.rows?.length
                  ? "Saved Default"
                  : composer.autoResult.mode === "spacious"
                    ? "Auto Spacious (~14px)"
                    : composer.autoResult.mode === "dense_tuck"
                      ? "Auto Dense 1-Page"
                      : "Auto 1-Page Fit"}
            </span>
            <span>
              Drag any section to reposition/pair · Right-click for width (35%–70%), split &amp; swap
            </span>
          </div>
          <span className="text-[10px] font-medium text-[#4338ca]">
            Ctrl/Cmd+Z Undo
          </span>
        </div>
      )}

      {/* Standardized Architectural Stacked Cards Header */}
      <div className="mb-2 border-t-2 border-b-2 border-[#0f172a] py-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <h1
              style={{ fontSize: `${titleFs}px` }}
              className="m-0 leading-none font-black tracking-tight text-[#0f172a] uppercase"
            >
              The Window &amp; Door Store
            </h1>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="mt-0.5 flex flex-wrap items-center gap-2 font-bold tracking-wider text-[#334155] uppercase"
            >
              <span>{invoiceSubtitle}</span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div
              style={{ fontSize: `${h2Fs}px` }}
              className="font-mono font-black text-[#0f172a]"
            >
              {quoteNumber || "REF-QUOTE"}
            </div>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="font-semibold text-[#334155]"
              suppressHydrationWarning
            >
              {currentDate}
            </div>
          </div>
        </div>

        {(customerName || regionName || preparedBy) && (
          <div
            style={{ fontSize: `${bodyFs}px` }}
            className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-[#cbd5e1] pt-1 text-[#0f172a]"
          >
            <div className="flex flex-wrap items-center gap-3">
              {customerName && (
                <div>
                  <span className="mr-1 text-[9px] font-bold text-[#334155] uppercase">
                    Client:
                  </span>
                  <span className="font-black text-[#0f172a]">{customerName}</span>
                </div>
              )}
              {regionName && (
                <div>
                  <span className="mr-1 text-[9px] font-bold text-[#334155] uppercase">
                    Region:
                  </span>
                  <span className="font-bold text-[#0f172a]">{regionName}</span>
                </div>
              )}
            </div>
            {preparedBy && (
              <div>
                <span className="mr-1 text-[9px] font-bold text-[#334155] uppercase">
                  Prepared By:
                </span>
                <span className="font-bold text-[#0f172a]">{preparedBy}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composable Sheet Body */}
      <div
        ref={composer?.sheetRef}
        className="sheet-body flex flex-col"
        style={{ gap: `${rowGapPx}px` }}
      >
        {layoutRows.map((row) => {
          if (row.type === "full") {
            return renderBlockNode(row.blockId, "full", 100)
          }

          const leftPct = row.leftPct
          const rightPct = 100 - leftPct
          return (
            <div
              key={row.id}
              data-split-row={row.id}
              className="split-row-wrap grid items-stretch gap-2"
              style={{
                gridTemplateColumns: `minmax(0, ${leftPct}fr) minmax(0, ${rightPct}fr)`,
              }}
            >
              <div
                data-split-col="left"
                data-split-row-id={row.id}
                className={`flex min-w-0 flex-col ${isInteractivePreview ? "min-h-[28px]" : ""}`}
                style={{ gap: `${rowGapPx}px` }}
              >
                {row.left.map((bid) => renderBlockNode(bid, "left", leftPct))}
              </div>
              <div
                data-split-col="right"
                data-split-row-id={row.id}
                className={`flex min-w-0 flex-col ${isInteractivePreview ? "min-h-[28px]" : ""}`}
                style={{ gap: `${rowGapPx}px` }}
              >
                {row.right.map((bid) => renderBlockNode(bid, "right", rightPct))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Predictive Drop Indicator & Floating Ghost (never printed) */}
      {dragActive && composer?.dragState && (
        <>
          <div
            style={{
              left: composer.dragState.clientX - Math.min(240, composer.dragState.cardWidth * 0.45) / 2,
              top: composer.dragState.clientY - 16,
              width: Math.max(150, Math.min(240, composer.dragState.cardWidth * 0.45)),
            }}
            className="no-print pointer-events-none fixed z-[9998] rounded border-2 border-[#4f46e5] bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-[#1e1b4b] shadow-2xl print:hidden"
          >
            {INVOICE_BLOCK_LABELS[composer.dragState.blockId]}
          </div>

          {dragPred && (
            <div
              style={{
                left: dragPred.rect.left,
                top: dragPred.rect.top,
                width: dragPred.rect.width,
                height: dragPred.rect.height,
              }}
              className={`no-print pointer-events-none fixed z-[9997] print:hidden ${
                dragPred.guideMode === "box"
                  ? "rounded border-2 border-dashed border-[#4f46e5] bg-[#6366f1]/15"
                  : "rounded bg-[#4f46e5] shadow-[0_0_0_2px_rgba(79,70,229,0.22)]"
              }`}
            >
              <span
                className={`absolute left-1.5 rounded bg-[#4f46e5] px-1.5 py-0.5 text-[10px] font-bold whitespace-nowrap text-white shadow ${
                  dragPred.guideMode === "box" ? "top-1.5" : "-top-6"
                }`}
              >
                {dragPred.label}
              </span>
            </div>
          )}
        </>
      )}

      {/* Right-Click Context Menu */}
      {isInteractivePreview && composer?.ctxMenu && (
        <BlockContextMenu
          blockId={composer.ctxMenu.blockId}
          x={composer.ctxMenu.x}
          y={composer.ctxMenu.y}
          isSplit={composer.ctxMenu.isSplit}
          activeWidthPct={composer.ctxMenu.widthPct}
          side={composer.ctxMenu.side}
          onAction={composer.applyContextAction}
          onClose={composer.closeContextMenu}
        />
      )}
    </>
  )
}
