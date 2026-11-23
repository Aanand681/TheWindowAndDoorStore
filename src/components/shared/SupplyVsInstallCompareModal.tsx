"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { PackageCheck, Wrench } from "lucide-react"
import {
  OptionCompareColumn,
  CompareDeltaBanner,
  CompareHeaderBar,
  DoorHardwareCompareSection,
  calculateCompareTotals,
} from "./compare"
import { useCompareModalHardware } from "./compare/useCompareModalHardware"
import {
  writeSessionAttachedInstallOption,
  type DoorInstallHardwareConfig,
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
  materialsAmount?: number
  materialsLabel?: string
  labourAmount: number
  miscAmount: number
  surchargeAmount?: number
  surchargeLabel?: string
  discountAmount?: number
  discountLabel?: string
  hardwareAmount?: number
  hardwareLabel?: string
  doorItems?: any[]
  standardHardwarePrice?: number
  onApplyDoorHardware?: (config: DoorInstallHardwareConfig) => void
  hstRate: number
  onApplyMode: (mode: "supply" | "install") => void
  onPrintDualOption?: () => void
  onToggleAttachOption?: (
    attached: boolean,
    extraCents: number,
    title?: string,
    hasSupplyJC?: boolean,
    hardwareConfig?: DoorInstallHardwareConfig,
    hardwareTotal?: number
  ) => void
}

export function SupplyVsInstallCompareModal(props: SupplyVsInstallCompareProps) {
  const {
    isOpen,
    onClose,
    title = "Supply vs Installation Comparison",
    quoteNumber,
    customerName,
    currentMode,
    currentSubtotal,
    baseLabel = "Base Units",
    baseAmount,
    jcLabel,
    jcAmount,
    supplyJCAmount,
    installJCAmount,
    attachedLabel,
    attachedAmount,
    materialsAmount = 0,
    materialsLabel,
    labourAmount,
    miscAmount,
    surchargeAmount = 0,
    surchargeLabel,
    discountAmount = 0,
    discountLabel,
    hardwareAmount = 0,
    doorItems,
    standardHardwarePrice = 158.0,
    onApplyDoorHardware,
    hstRate,
    onApplyMode,
    onToggleAttachOption,
  } = props

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
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

  const opt1JCAmount =
    supplyJCAmount !== undefined
      ? supplyJCAmount
      : currentMode === "supply"
        ? jcAmount || 0
        : 0
  const opt2JCAmount =
    installJCAmount !== undefined ? installJCAmount : jcAmount || 0

  const hasSupplyJC = opt1JCAmount > 0

  const attachTitle =
    currentMode === "install"
      ? hasSupplyJC
        ? "Option with J&C for Supply Only"
        : "Option for Supply Only"
      : "Option for Installation"

  const {
    totalDoorCount,
    hardwareConfig,
    isOptionAttached,
    setIsOptionAttached,
    supplyHardwareTotal,
    supplyHardwareLabel,
    installHardwareTotal,
    installHardwareLabel,
    supplyHardwareCents,
    installHardwareCents,
    handleHardwareConfigChange,
  } = useCompareModalHardware({
    doorItems,
    standardHardwarePrice,
    hardwareAmount,
    currentMode,
    currentSubtotal,
    baseAmount,
    attachedAmount,
    surchargeAmount,
    discountAmount,
    opt1JCAmount,
    opt2JCAmount,
    labourAmount,
    miscAmount,
    hstRate,
    attachTitle,
    hasSupplyJC,
    onToggleAttachOption,
    isOpen,
  })

  if (!mounted || !isOpen) return null

  const totals = calculateCompareTotals({
    currentMode,
    currentSubtotal,
    baseAmount,
    attachedAmount: attachedAmount || 0,
    surchargeAmount,
    discountAmount,
    supplyHardware: supplyHardwareTotal,
    installHardware: installHardwareTotal,
    opt1JC: opt1JCAmount,
    opt2JC: opt2JCAmount,
    labourAmount: labourAmount || 0,
    miscAmount: miscAmount || 0,
    hstRate,
  })

  const handleToggleAttach = () => {
    const next = !isOptionAttached
    setIsOptionAttached(next)
    const extraCents = totals.extraSubtotalCents
    const extraDollars = totals.extraSubtotal
    writeSessionAttachedInstallOption(
      next
        ? {
            enabled: true,
            amountPreTax: extraDollars,
            amountPreTaxCents: extraCents,
            mode: currentMode,
            title: attachTitle,
            hasSupplyJC,
            hardwareTotal: installHardwareTotal,
            hardwareQty: hardwareConfig.totalQty,
            hardwareConfig,
          }
        : null
    )
    if (onToggleAttachOption) {
      onToggleAttachOption(
        next,
        extraCents,
        attachTitle,
        hasSupplyJC,
        hardwareConfig,
        installHardwareTotal
      )
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex animate-in items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-md duration-200 fade-in sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="my-auto flex w-full max-w-4xl animate-in flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl duration-150 zoom-in-95">
        <CompareHeaderBar
          title={title}
          quoteNumber={quoteNumber}
          customerName={customerName}
          onClose={onClose}
        />

        <div className="space-y-4 overflow-y-auto p-4 sm:p-6">
          {/* 1. Door Hardware Configuration Section (Placed above comparison columns) */}
          {doorItems && doorItems.length > 0 && (
            <DoorHardwareCompareSection
              totalDoorCount={totalDoorCount}
              config={hardwareConfig}
              onChangeConfig={handleHardwareConfigChange}
              standardPrice={standardHardwarePrice}
            />
          )}

          {/* 2. Side-by-Side Comparison Columns (Stopping cleanly at Subtotal) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <OptionCompareColumn
              optionNumber={1}
              title="Supply Only"
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
              materialsAmount={materialsAmount}
              materialsLabel={materialsLabel}
              labourAmount={0}
              miscAmount={0}
              surchargeAmount={surchargeAmount}
              surchargeLabel={surchargeLabel}
              discountAmount={discountAmount}
              discountLabel={discountLabel}
              hardwareAmount={supplyHardwareTotal}
              hardwareLabel={supplyHardwareLabel}
              subtotal={totals.supplySubtotal}
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
              materialsAmount={materialsAmount}
              materialsLabel={materialsLabel}
              labourAmount={labourAmount}
              miscAmount={miscAmount}
              surchargeAmount={surchargeAmount}
              surchargeLabel={surchargeLabel}
              discountAmount={discountAmount}
              discountLabel={discountLabel}
              hardwareAmount={installHardwareTotal}
              hardwareLabel={installHardwareLabel}
              subtotal={totals.installSubtotal}
              totalColorClass="text-primary"
              buttonVariant="default"
              onApply={() => {
                if (onApplyDoorHardware) {
                  onApplyDoorHardware(hardwareConfig)
                }
                onApplyMode("install")
              }}
            />
          </div>

          {/* 3. Subtotal Delta Banner */}
          <CompareDeltaBanner
            currentMode={currentMode}
            hasSupplyJC={hasSupplyJC}
            extraPriceSubtotal={totals.extraPriceSubtotal}
            installSubtotal={totals.installSubtotal}
            supplySubtotal={totals.supplySubtotal}
            isOptionAttached={isOptionAttached}
            onToggleAttach={handleToggleAttach}
          />

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
