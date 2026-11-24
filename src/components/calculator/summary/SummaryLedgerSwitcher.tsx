"use client"

import React from "react"
import { CombinedLedgerSection } from "./CombinedLedgerSection"
import { StandardLedgerSection } from "./StandardLedgerSection"

export interface SummaryLedgerSwitcherProps {
  combinedData: any
  summaryWindowGroups?: any[]
  attachedDoorQuote?: any
  quoteResult?: any
  renderEditableRow: (
    field: "jc" | "labour" | "misc" | "discount",
    label: string,
    amountCents: number,
    customVal: string,
    defaultCents: number,
    setter: (val: string) => void,
    suffix?: string
  ) => React.ReactNode
  jcSummaryLabel: string
  effectiveJCCents: number
  effectiveLabourCents: number
  effectiveMiscCents: number
  customJC?: string
  customMisc?: string
  customLabour?: string
  customDiscount?: string
  setCustomDiscount?: (val: string) => void
  customDiscountLabel?: string
  setCustomDiscountLabel?: (val: string) => void
  loyaltyDiscount?: string
  setLoyaltyDiscount?: (val: string) => void
  loyaltyDiscountLabel?: string
  setLoyaltyDiscountLabel?: (val: string) => void
  discountType?: "none" | "custom" | "loyalty"
  setDiscountType?: (val: "none" | "custom" | "loyalty") => void
  loyaltyPoints?: number
  setLoyaltyPoints?: (val: number) => void
  loyaltyGrossAmount?: number
  setLoyaltyGrossAmount?: (val: number) => void
  combinedMaterials?: number
  taxJC?: number
  taxMisc?: number
  taxLabour?: number
  setCustomJC?: (val: string) => void
  setCustomMisc?: (val: string) => void
  setCustomLabour?: (val: string) => void
  isSupplyOnly: boolean
  surchargeRate?: number
  afterDiscount?: number
  total?: number
  firstPayment?: number
  secondPayment?: number
  hstRate: number
  setHstRate: (rate: number) => void
  taxTotals?: any
  hstBaseCents?: number
  materialExemptionCents?: number
  isReadOnly?: boolean
}

export function SummaryLedgerSwitcher(props: SummaryLedgerSwitcherProps) {
  const commonProps = {
    summaryWindowGroups: props.summaryWindowGroups || [],
    renderEditableRow: props.renderEditableRow,
    jcSummaryLabel: props.jcSummaryLabel,
    customJC: props.customJC || "",
    customMisc: props.customMisc || "",
    customLabour: props.customLabour || "",
    customDiscount: props.customDiscount,
    customDiscountLabel: props.customDiscountLabel,
    setCustomDiscountLabel: props.setCustomDiscountLabel,
    loyaltyDiscount: props.loyaltyDiscount,
    setLoyaltyDiscount: props.setLoyaltyDiscount,
    loyaltyDiscountLabel: props.loyaltyDiscountLabel,
    setLoyaltyDiscountLabel: props.setLoyaltyDiscountLabel,
    discountType: props.discountType,
    setDiscountType: props.setDiscountType,
    loyaltyPoints: props.loyaltyPoints,
    setLoyaltyPoints: props.setLoyaltyPoints,
    loyaltyGrossAmount: props.loyaltyGrossAmount,
    setLoyaltyGrossAmount: props.setLoyaltyGrossAmount,
    combinedMaterials: props.combinedMaterials,
    taxJC: props.taxJC || 0,
    taxMisc: props.taxMisc || 0,
    taxLabour: props.taxLabour || 0,
    setCustomJC: props.setCustomJC || (() => {}),
    setCustomMisc: props.setCustomMisc || (() => {}),
    setCustomLabour: props.setCustomLabour || (() => {}),
    setCustomDiscount: props.setCustomDiscount,
    isSupplyOnly: props.isSupplyOnly,
    hstRate: props.hstRate,
    setHstRate: props.setHstRate,
    isReadOnly: props.isReadOnly,
  }

  if (props.combinedData) {
    return (
      <CombinedLedgerSection
        combinedData={props.combinedData}
        attachedDoorQuote={props.attachedDoorQuote}
        {...commonProps}
      />
    )
  }

  return (
    <StandardLedgerSection
      quoteResult={props.quoteResult || {}}
      effectiveJCCents={props.effectiveJCCents}
      effectiveLabourCents={props.effectiveLabourCents}
      effectiveMiscCents={props.effectiveMiscCents}
      surchargeRate={props.surchargeRate || 0}
      afterDiscount={props.afterDiscount || 0}
      total={props.total || 0}
      firstPayment={props.firstPayment || 0}
      secondPayment={props.secondPayment || 0}
      taxTotals={props.taxTotals}
      hstBaseCents={props.hstBaseCents}
      materialExemptionCents={props.materialExemptionCents}
      {...commonProps}
    />
  )
}
