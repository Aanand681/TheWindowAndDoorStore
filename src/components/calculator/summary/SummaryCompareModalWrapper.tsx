"use client"

import React from "react"
import { SupplyVsInstallCompareModal } from "@/components/shared/SupplyVsInstallCompareModal"

export interface SummaryCompareModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  quoteNumber?: string
  customerName?: string
  isSupplyOnly: boolean
  currentSubtotal: number
  windowGroupsBaseTotal: number
  jcSummaryLabel: string
  isSupply: boolean
  supplyJCAmount: number
  installJCAmount: number
  taxTotals: any
  compareLabourAmount: number
  compareMiscAmount: number
  attachedLabel?: string
  attachedAmount?: number
  quoteResult: any
  surchargeRate: number
  hstRate: number
  setIsSupplyOnly?: (supply: boolean) => void
  setAttachedInstallOption: (opt: any) => void
}

export function SummaryCompareModalWrapper({
  isOpen,
  onClose,
  quoteNumber,
  customerName,
  isSupplyOnly,
  currentSubtotal,
  windowGroupsBaseTotal,
  jcSummaryLabel,
  isSupply,
  supplyJCAmount,
  installJCAmount,
  taxTotals,
  compareLabourAmount,
  compareMiscAmount,
  attachedLabel,
  attachedAmount,
  quoteResult,
  surchargeRate,
  hstRate,
  setIsSupplyOnly,
  setAttachedInstallOption,
}: SummaryCompareModalWrapperProps) {
  return (
    <SupplyVsInstallCompareModal
      isOpen={isOpen}
      onClose={onClose}
      title="Window Quote Comparison"
      quoteNumber={quoteNumber}
      customerName={customerName}
      currentMode={isSupplyOnly ? "supply" : "install"}
      currentSubtotal={currentSubtotal}
      baseLabel="Windows"
      baseAmount={windowGroupsBaseTotal}
      attachedLabel={attachedLabel}
      attachedAmount={attachedAmount}
      jcLabel={jcSummaryLabel}
      jcAmount={isSupply ? supplyJCAmount : installJCAmount}
      supplyJCAmount={supplyJCAmount}
      installJCAmount={installJCAmount}
      materialsAmount={
        taxTotals?.customMaterialsTotalCents
          ? taxTotals.customMaterialsTotalCents / 100
          : taxTotals?.customMaterialsTotal || 0
      }
      materialsLabel={
        Array.isArray(taxTotals?.customMaterials) &&
        taxTotals.customMaterials.length === 1 &&
        taxTotals.customMaterials[0]?.label
          ? taxTotals.customMaterials[0].label
          : "Additional Materials"
      }
      labourAmount={compareLabourAmount}
      miscAmount={compareMiscAmount}
      surchargeAmount={(quoteResult?.surcharge || 0) / 100}
      surchargeLabel={`Surcharge (${surchargeRate}%)`}
      discountAmount={(quoteResult?.promoDiscount || 0) / 100}
      discountLabel={quoteResult?.promoName || "Promo Discount"}
      hstRate={hstRate}
      onApplyMode={(m) => setIsSupplyOnly && setIsSupplyOnly(m === "supply")}
      onToggleAttachOption={(att, c, title, hasSupplyJC) =>
        setAttachedInstallOption(
          att
            ? {
                enabled: true,
                amountPreTaxCents: c,
                title,
                hasSupplyJC: hasSupplyJC ?? supplyJCAmount > 0,
              }
            : null
        )
      }
    />
  )
}
