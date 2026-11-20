"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { DoorPreviewModalProps } from "./preview/types"
import { DoorPrintToolbar } from "./preview/DoorPrintToolbar"
import { DoorPrintInvoice } from "./preview/DoorPrintInvoice"
import { computeEffectiveDoorGrandTotal } from "@/lib/doors/totals-calculator"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
  CUSTOM_OPTIONS_CHANGE_EVENT,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export { type DoorPreviewModalProps } from "./preview/types"

export function DoorPreviewModal({
  isOpen,
  onClose,
  lineItems,
  totals,
  mode,
  globalUpcharges,
  customerName = "Valued Customer",
  quoteNumber: propQuoteNumber,
  preparedBy = "The Window & Door Store",
  quoteNotes,
  onQuoteNotesChange,
  isFirstNation,
  attachedWindowQuote,
  attachedSealedUnit,
}: DoorPreviewModalProps) {
  const quoteNumber = propQuoteNumber || "DQ-DRAFT"
  const [mounted, setMounted] = useState(false)
  const [showNotesEditor, setShowNotesEditor] = useState(false)
  const [isDualOption, setIsDualOption] = useState<boolean>(false)
  const [quoteDate, setQuoteDate] = useState<string>("")
  const [liveCustomOptions, setLiveCustomOptions] = useState<any[]>(() =>
    readSessionCustomOptions()
  )

  useEffect(() => {
    if (isOpen) {
      setLiveCustomOptions(readSessionCustomOptions())
      const sync = () => setLiveCustomOptions(readSessionCustomOptions())
      window.addEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, sync)
      return () => window.removeEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, sync)
    }
    return undefined
  }, [isOpen])

  const hasAttachedWindow = Boolean(attachedWindowQuote)
  const hasAttachedSU = Boolean(attachedSealedUnit)
  const hasAnyAttached = hasAttachedWindow || hasAttachedSU
  const isInstallation = mode === "installation"

  const winBase = hasAttachedWindow
    ? Number(attachedWindowQuote.totals?.base ?? attachedWindowQuote.totals?.subtotal ?? 0)
    : 0
  const winJC = hasAttachedWindow
    ? Number(attachedWindowQuote.totals?.jc ?? attachedWindowQuote.jcDollars ?? 0)
    : 0
  const winJCDescription = attachedWindowQuote?.jcLabel || "Jambs & Casing"
  const winCustomMaterialsList = hasAttachedWindow
    ? (attachedWindowQuote.totals?.customMaterialsList || attachedWindowQuote.taxTotals?.customMaterials || [])
    : []
  const winCustomMaterials = hasAttachedWindow
    ? Number(attachedWindowQuote.totals?.customMaterials ||
        (Array.isArray(winCustomMaterialsList)
          ? winCustomMaterialsList.reduce((acc: number, m: any) => acc + (Number(m.amount) || 0), 0)
          : 0))
    : 0
  const winDiscount = hasAttachedWindow
    ? (attachedWindowQuote.totals?.promoDiscount ||
        attachedWindowQuote.quoteResult?.promoDiscount ||
        attachedWindowQuote.data?.promoDiscount ||
        0) / (attachedWindowQuote.quoteResult?.promoDiscount ? 100 : 1)
    : 0
  const winPromoName =
    attachedWindowQuote?.promoName ||
    attachedWindowQuote?.quoteResult?.promoName ||
    "Window Promo"
  const suGlass = hasAttachedSU
    ? Number(attachedSealedUnit.totals?.glassBefore8PercentTotal || 0)
    : 0
  const winLabour = hasAttachedWindow ? Number(attachedWindowQuote.totals?.labour || 0) : 0
  const suExtraLabour = hasAttachedSU ? Number(attachedSealedUnit.totals?.extraLabour || 0) : 0
  const suLabour = hasAttachedSU
    ? Number(
        attachedSealedUnit.totals?.pureLabourTotal ??
        (attachedSealedUnit.sealedUnitMode === "service_only"
          ? Number(attachedSealedUnit.totals?.serviceLabourTotal || 0) + suExtraLabour
          : Number(attachedSealedUnit.totals?.unitLabourSum || attachedSealedUnit.totals?.combinedLabourTotal || 0) + suExtraLabour)
      )
    : 0
  const winMisc = hasAttachedWindow ? Number(attachedWindowQuote.totals?.misc || 0) : 0
  const suMisc = hasAttachedSU ? Number(attachedSealedUnit.totals?.miscTotal || 0) : 0
  const rawWinSurcharge = hasAttachedWindow
    ? Number(attachedWindowQuote.totals?.surcharge || 0)
    : 0
  const winSurcharge =
    rawWinSurcharge > winBase && winBase > 0
      ? Math.round(winBase * 0.08 * 100) / 100
      : rawWinSurcharge
  const suSurcharge = hasAttachedSU
    ? Number(attachedSealedUnit.totals?.glass8PercentSurchargeTotal || 0)
    : 0

  const defaultDoorLabour = isInstallation ? totals.combinedLabourTotal : 0
  const combinedLabour = defaultDoorLabour + winLabour + suLabour

  const defaultDoorMisc = isInstallation ? totals.miscTotal : 0
  const combinedMisc = defaultDoorMisc + winMisc + suMisc

  const combinedSurcharge = totals.surchargeTotal + winSurcharge + suSurcharge
  const {
    combinedSubtotal,
    combinedTax,
    grandTotal: finalGrandTotal,
  } = computeEffectiveDoorGrandTotal({
    totals,
    mode,
    isFirstNation,
    attachedWindowQuote,
    attachedSealedUnit,
  })

  const firstPayment = Math.floor((finalGrandTotal / 2) * 100) / 100
  const secondPayment = Math.round((finalGrandTotal - firstPayment) * 100) / 100

  useEffect(() => {
    setMounted(true)
    setQuoteDate(
      new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    )
  }, [])

  useEffect(() => {
    if (isOpen) {
      const cached = readSessionAttachedInstallOption()
      if (cached?.enabled) {
        setIsDualOption(true)
      }
      document.body.classList.add("quote-modal-open")
      return () => {
        document.body.classList.remove("quote-modal-open")
      }
    }
    return undefined
  }, [isOpen])

  if (!isOpen) return null

  const upgradeItems = lineItems.filter((i) => i.upgradeOption?.enabled)

  const handlePrint = () => {
    window.print()
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background/95 backdrop-blur-md print:static print:m-0 print:overflow-visible print:bg-white print:p-0">
      <DoorPrintToolbar
        showNotesEditor={showNotesEditor}
        setShowNotesEditor={setShowNotesEditor}
        quoteNotes={quoteNotes}
        onQuoteNotesChange={onQuoteNotesChange}
        onPrint={handlePrint}
        onClose={onClose}
        mode={mode}
        isDualOption={isDualOption}
        setIsDualOption={setIsDualOption}
      />

      <div className="flex flex-1 justify-center overflow-y-auto bg-muted/30 p-4 sm:p-8 print:m-0 print:block print:w-full print:overflow-visible print:bg-white print:p-0">
        <DoorPrintInvoice
          quoteNumber={quoteNumber}
          quoteDate={quoteDate}
          customerName={customerName}
          preparedBy={preparedBy}
          isInstallation={isInstallation}
          isDualOption={isDualOption}
          totals={totals}
          lineItems={lineItems}
          globalUpcharges={globalUpcharges}
          upgradeItems={upgradeItems}
          quoteNotes={quoteNotes}
          isFirstNation={isFirstNation}
          hasAttachedWindow={hasAttachedWindow}
          hasAttachedSU={hasAttachedSU}
          attachedWindowQuote={attachedWindowQuote}
          winBase={winBase}
          winJC={winJC}
          winJCDescription={winJCDescription}
          winCustomMaterialsList={winCustomMaterialsList}
          suGlass={suGlass}
          combinedLabour={combinedLabour}
          combinedMisc={combinedMisc}
          combinedSurcharge={combinedSurcharge}
          winDiscount={winDiscount}
          winPromoName={winPromoName}
          combinedSubtotal={combinedSubtotal}
          combinedTax={combinedTax}
          finalGrandTotal={finalGrandTotal}
          firstPayment={firstPayment}
          secondPayment={secondPayment}
          customOptions={liveCustomOptions}
        />
      </div>
    </div>
  )

  if (mounted && typeof document !== "undefined") {
    return createPortal(modalContent, document.body)
  }
  return modalContent
}
