"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import {
  Scale,
  PackageCheck,
  Wrench,
  X,
  CheckCircle2,
  Plus,
} from "lucide-react"
import { OptionCompareColumn } from "./compare/OptionCompareColumn"
import {
  readSessionAttachedInstallOption,
  writeSessionAttachedInstallOption,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface SupplyVsInstallCompareProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  quoteNumber?: string
  customerName?: string
  currentMode: "supply" | "install"
  currentSubtotal?: number
  baseLabel?: string
  baseAmount: number
  jcLabel?: string
  jcAmount?: number
  supplyJCAmount?: number
  installJCAmount?: number
  attachedLabel?: string
  attachedAmount?: number
  labourAmount: number
  miscAmount: number
  surchargeAmount?: number
  surchargeLabel?: string
  discountAmount?: number
  discountLabel?: string
  hardwareAmount?: number
  hardwareLabel?: string
  hstRate: number
  onApplyMode: (mode: "supply" | "install") => void
  onPrintDualOption?: () => void
  onToggleAttachOption?: (
    attached: boolean,
    extraCents: number,
    title?: string,
    hasSupplyJC?: boolean
  ) => void
}

export function SupplyVsInstallCompareModal(
  props: SupplyVsInstallCompareProps
) {
  const {
    isOpen,
    onClose,
    title = "Compare Quote Options",
    quoteNumber = "",
    customerName = "",
    currentMode,
    currentSubtotal,
    baseLabel = "Base Units",
    baseAmount,
    jcLabel,
    jcAmount = 0,
    supplyJCAmount,
    installJCAmount,
    attachedLabel,
    attachedAmount = 0,
    labourAmount,
    miscAmount,
    surchargeAmount = 0,
    surchargeLabel,
    discountAmount = 0,
    discountLabel,
    hardwareAmount = 0,
    hardwareLabel,
    hstRate,
    onApplyMode,
    onPrintDualOption,
    onToggleAttachOption,
  } = props
  const [mounted, setMounted] = useState(false)
  const [isOptionAttached, setIsOptionAttached] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const cached = readSessionAttachedInstallOption()
      setIsOptionAttached(Boolean(cached?.enabled))
      document.body.classList.add("quote-modal-open")
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose()
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        document.body.classList.remove("quote-modal-open")
        window.removeEventListener("keydown", handleKeyDown)
      }
    }
    return undefined
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  const opt1JCAmount =
    supplyJCAmount !== undefined
      ? supplyJCAmount
      : currentMode === "supply"
        ? jcAmount || 0
        : 0
  const opt2JCAmount =
    installJCAmount !== undefined ? installJCAmount : jcAmount || 0

  const hasSupplyJC = opt1JCAmount > 0

  // 1. Calculate Subtotals: Check current subtotal when provided for exact ledger alignment
  const opt1JCCents = Math.round((opt1JCAmount || 0) * 100)
  const opt2JCCents = Math.round((opt2JCAmount || 0) * 100)
  const labourCents = Math.round((labourAmount || 0) * 100)
  const miscCents = Math.round((miscAmount || 0) * 100)
  const jcDiffCents = Math.max(0, opt2JCCents - opt1JCCents)
  const totalInstallAddCents = labourCents + miscCents + jcDiffCents

  let supplySubtotalCents = 0
  let installSubtotalCents = 0

  if (currentSubtotal !== undefined && currentSubtotal > 0) {
    const curCents = Math.round(currentSubtotal * 100)
    if (currentMode === "install") {
      installSubtotalCents = curCents
      supplySubtotalCents = Math.max(
        0,
        installSubtotalCents - totalInstallAddCents
      )
    } else {
      supplySubtotalCents = curCents
      installSubtotalCents = supplySubtotalCents + totalInstallAddCents
    }
  } else {
    const baseCents = Math.round(baseAmount * 100)
    const attachedCents = Math.round((attachedAmount || 0) * 100)
    const surchargeCents = Math.round((surchargeAmount || 0) * 100)
    const hardwareCents = Math.round((hardwareAmount || 0) * 100)
    const discountCents = Math.round((discountAmount || 0) * 100)

    supplySubtotalCents = Math.max(
      0,
      baseCents +
        opt1JCCents +
        attachedCents +
        surchargeCents +
        hardwareCents -
        discountCents
    )

    installSubtotalCents = Math.max(
      0,
      baseCents +
        opt2JCCents +
        attachedCents +
        surchargeCents +
        hardwareCents -
        discountCents +
        labourCents +
        miscCents
    )
  }

  // Tax calculations strictly in integer cents
  const computeTaxCents = (subCents: number) => {
    if (hstRate === 13) {
      return Math.round(subCents * 0.13)
    }
    if (hstRate === 8) {
      return Math.round(subCents * 0.05)
    }
    if (hstRate === 5) {
      return Math.round(subCents * 0.05)
    }
    if (hstRate === 0) {
      return 0
    }
    return Math.round((subCents * hstRate) / 100)
  }

  const supplyHstCents = computeTaxCents(supplySubtotalCents)
  const supplyTotalCents = supplySubtotalCents + supplyHstCents
  const supplyFirstPaymentCents = Math.floor(supplyTotalCents / 2)
  const supplySecondPaymentCents = supplyTotalCents - supplyFirstPaymentCents

  const installHstCents = computeTaxCents(installSubtotalCents)
  const installTotalCents = installSubtotalCents + installHstCents
  const installFirstPaymentCents = Math.floor(installTotalCents / 2)
  const installSecondPaymentCents =
    installTotalCents - installFirstPaymentCents

  // Extra price formula: Install Subtotal - Supply Subtotal in exact cents
  const extraSubtotalCents = Math.max(
    0,
    installSubtotalCents - supplySubtotalCents
  )
  const extraTotalCents = Math.max(
    0,
    installTotalCents - supplyTotalCents
  )

  // Convert to dollars strictly for presentation
  const supplySubtotal = supplySubtotalCents / 100
  const supplyHst = supplyHstCents / 100
  const supplyTotal = supplyTotalCents / 100
  const supplyFirstPayment = supplyFirstPaymentCents / 100
  const supplySecondPayment = supplySecondPaymentCents / 100

  const installSubtotal = installSubtotalCents / 100
  const installHst = installHstCents / 100
  const installTotal = installTotalCents / 100
  const installFirstPayment = installFirstPaymentCents / 100
  const installSecondPayment = installSecondPaymentCents / 100

  const extraPriceSubtotal = extraSubtotalCents / 100
  const extraPriceTotalWithTax = extraTotalCents / 100

  const attachTitle =
    currentMode === "install"
      ? hasSupplyJC
        ? "Option with J&C for Supply Only"
        : "Option for Supply Only"
      : "Option for Installation"

  const handleToggleAttach = () => {
    const next = !isOptionAttached
    setIsOptionAttached(next)
    const extraCents = extraSubtotalCents
    writeSessionAttachedInstallOption(
      next
        ? {
            enabled: true,
            amountPreTaxCents: extraCents,
            mode: currentMode,
            title: attachTitle,
            hasSupplyJC,
          }
        : null
    )
    if (onToggleAttachOption)
      onToggleAttachOption(next, extraCents, attachTitle, hasSupplyJC)
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex animate-in items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-md duration-200 fade-in sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="my-auto flex w-full max-w-4xl animate-in flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl duration-150 zoom-in-95">
        {/* Header Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary shadow-xs">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight sm:text-lg">
                  {title}
                </h2>
                <span className="rounded-full border border-primary/25 bg-primary/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                  Supply vs. Install
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {customerName ? `${customerName} • ` : ""}
                {quoteNumber ? `Quote #${quoteNumber} • ` : ""}
                Side-by-side pricing evaluation
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 cursor-pointer rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 overflow-y-auto p-4 sm:p-6">
          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <OptionCompareColumn
              optionNumber={1}
              title="Supply"
              badgeLabel="Materials Only"
              icon={PackageCheck}
              isActive={currentMode === "supply"}
              applyLabel="Apply Supply Mode"
              baseLabel={baseLabel}
              baseAmount={baseAmount}
              jcLabel={jcLabel}
              jcAmount={opt1JCAmount}
              attachedLabel={attachedLabel}
              attachedAmount={attachedAmount}
              labourAmount={0}
              miscAmount={0}
              surchargeAmount={surchargeAmount}
              surchargeLabel={surchargeLabel}
              discountAmount={discountAmount}
              discountLabel={discountLabel}
              hardwareAmount={hardwareAmount}
              hardwareLabel={hardwareLabel}
              subtotal={supplySubtotal}
              hstRate={hstRate}
              hstAmount={supplyHst}
              total={supplyTotal}
              firstPayment={supplyFirstPayment}
              secondPayment={supplySecondPayment}
              onApply={() => onApplyMode("supply")}
            />

            <OptionCompareColumn
              optionNumber={2}
              title="Supply & Installation"
              badgeLabel="Turnkey + 5-Yr Warranty"
              icon={Wrench}
              isActive={currentMode === "install"}
              applyLabel="Apply Installation Mode"
              baseLabel={baseLabel}
              baseAmount={baseAmount}
              jcLabel={jcLabel}
              jcAmount={opt2JCAmount}
              attachedLabel={attachedLabel}
              attachedAmount={attachedAmount}
              labourAmount={labourAmount}
              miscAmount={miscAmount}
              surchargeAmount={surchargeAmount}
              surchargeLabel={surchargeLabel}
              discountAmount={discountAmount}
              discountLabel={discountLabel}
              hardwareAmount={hardwareAmount}
              hardwareLabel={hardwareLabel}
              subtotal={installSubtotal}
              hstRate={hstRate}
              hstAmount={installHst}
              total={installTotal}
              firstPayment={installFirstPayment}
              secondPayment={installSecondPayment}
              totalColorClass="text-primary"
              buttonVariant="default"
              onApply={() => onApplyMode("install")}
            />
          </div>

          {/* Subtotal Delta Banner */}
          <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs sm:flex-row">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-emerald-600 sm:justify-start dark:text-emerald-400">
                {currentMode === "install" ? (
                  <>
                    <span>
                      {hasSupplyJC
                        ? "Savings with J&C for Supply Only:"
                        : "Savings for Supply Only (Self-Installation):"}
                    </span>
                    <span className="font-mono text-base font-extrabold text-sky-600 dark:text-sky-400">
                      -${extraPriceSubtotal.toFixed(2)}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      (-${extraPriceTotalWithTax.toFixed(2)} incl. HST)
                    </span>
                  </>
                ) : (
                  <>
                    <span>Extra Price for Installation:</span>
                    <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      +${extraPriceSubtotal.toFixed(2)}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      (+${extraPriceTotalWithTax.toFixed(2)} incl. HST)
                    </span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Install Subtotal (${installSubtotal.toFixed(2)}) − Supply
                Subtotal (${supplySubtotal.toFixed(2)})
              </div>
            </div>

            <Button
              type="button"
              variant={isOptionAttached ? "default" : "outline"}
              size="sm"
              onClick={handleToggleAttach}
              className="h-8 shrink-0 cursor-pointer gap-1.5 text-xs font-semibold shadow-xs"
            >
              {isOptionAttached ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    {currentMode === "install"
                      ? hasSupplyJC
                        ? "Supply with J&C Option Attached"
                        : "Supply Option Attached to PDF"
                      : "Install Option Attached to PDF"}
                  </span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>
                    {currentMode === "install"
                      ? hasSupplyJC
                        ? "Attach Supply with J&C Option (Less)"
                        : "Attach Supply Option to PDF (Less)"
                      : "Attach Install Option to PDF (Add)"}
                  </span>
                </>
              )}
            </Button>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-2 sm:flex-row">
            <div className="text-[11px] text-muted-foreground">
              Switch modes with one click or attach the installation option card
              to your supply PDF.
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 flex-1 cursor-pointer text-xs sm:flex-initial"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
