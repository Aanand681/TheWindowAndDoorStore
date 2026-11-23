"use client"

import React from "react"
import { DoorQuoteTotals } from "@/lib/doors/types"
import { UnifiedTaxAndDeposit } from "@/components/shared/summary/UnifiedTaxAndDeposit"

export interface DoorSummaryTaxAndTotalProps {
  totals: DoorQuoteTotals
  isFirstNation: boolean
  onToggleFirstNation: (val: boolean) => void
  hstRate?: number
  setHstRate?: (val: number) => void
  combinedTax: number
  displayGrandTotal: number
  firstPayment: number
  secondPayment: number
  isReadOnly?: boolean
  combinedHstBase?: number
  combinedMaterialExemption?: number
}

export function DoorSummaryTaxAndTotal({
  totals,
  isFirstNation,
  onToggleFirstNation,
  hstRate,
  setHstRate,
  combinedTax,
  displayGrandTotal,
  firstPayment,
  secondPayment,
  isReadOnly = false,
  combinedHstBase,
  combinedMaterialExemption,
}: DoorSummaryTaxAndTotalProps) {
  const effectiveRate = hstRate !== undefined ? hstRate : isFirstNation ? 8 : 13

  return (
    <UnifiedTaxAndDeposit
      hstRate={effectiveRate}
      setHstRate={setHstRate}
      onToggleFirstNation={onToggleFirstNation}
      taxAmount={combinedTax}
      hstBase={combinedHstBase ?? totals.hstBase}
      materialExemption={combinedMaterialExemption ?? totals.materialExemption}
      total={displayGrandTotal}
      firstPayment={firstPayment}
      secondPayment={secondPayment}
      isReadOnly={isReadOnly}
      idPrefix="door"
    />
  )
}
