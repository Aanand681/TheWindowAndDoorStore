"use client"

import React from "react"
import type { NormalizedQuoteFinancials } from "@/lib/quotes/quote-financial-normalizer"

export interface AttachedQuoteDiscountRowsProps {
  hostType: "window" | "door" | "sealed_unit"
  winNorm?: NormalizedQuoteFinancials | null
  doorNorm?: NormalizedQuoteFinancials | null
  suNorm?: NormalizedQuoteFinancials | null
  winDiscount?: number
  winLoyaltyDiscount?: number
  doorDiscount?: number
  doorLoyaltyDiscount?: number
  suDiscount?: number
  suLoyaltyDiscount?: number
  attachedWindowQuote?: any
  attachedDoorQuote?: any
  attachedSealedUnit?: any
}

interface DiscountRowItem {
  key: string
  label: string
  amount: number
}

function buildDiscountRows({
  hostType,
  winNorm,
  doorNorm,
  suNorm,
  winDiscount = 0,
  winLoyaltyDiscount = 0,
  doorDiscount = 0,
  doorLoyaltyDiscount = 0,
  suDiscount = 0,
  suLoyaltyDiscount = 0,
  attachedWindowQuote,
  attachedDoorQuote,
}: AttachedQuoteDiscountRowsProps): DiscountRowItem[] {
  const rows: DiscountRowItem[] = []
  const effWinDisc = winNorm ? winNorm.discount : winDiscount
  const effWinLoy = winNorm ? winNorm.loyaltyDiscount || 0 : winLoyaltyDiscount
  const effDoorDisc = doorNorm ? doorNorm.discount : doorDiscount
  const effDoorLoy = doorNorm ? doorNorm.loyaltyDiscount || 0 : doorLoyaltyDiscount
  const effSuDisc = suNorm ? suNorm.discount : suDiscount
  const effSuLoy = suNorm ? suNorm.loyaltyDiscount || 0 : suLoyaltyDiscount

  if (hostType !== "window" && (effWinDisc > 0 || effWinLoy > 0)) {
    if (effWinDisc > 0) {
      const winLabel =
        attachedWindowQuote?.discountLabel ||
        attachedWindowQuote?.promoName ||
        attachedWindowQuote?.quoteResult?.promoName ||
        winNorm?.discountLabel ||
        "Window Promo"
      rows.push({
        key: "win-discount",
        label: `Window Discount (${winLabel})`,
        amount: effWinDisc,
      })
    }
    if (effWinLoy > 0) {
      rows.push({
        key: "win-loyalty",
        label:
          winNorm?.loyaltyDiscountLabel ||
          attachedWindowQuote?.loyaltyDiscountLabel ||
          "Window Loyalty Discount",
        amount: effWinLoy,
      })
    }
  }

  if (hostType !== "door" && (effDoorDisc > 0 || effDoorLoy > 0)) {
    if (effDoorDisc > 0) {
      const doorLabel =
        attachedDoorQuote?.discountLabel ||
        doorNorm?.discountLabel ||
        "Door Discount"
      rows.push({
        key: "door-discount",
        label: `${doorLabel} (attached door)`,
        amount: effDoorDisc,
      })
    }
    if (effDoorLoy > 0) {
      rows.push({
        key: "door-loyalty",
        label:
          doorNorm?.loyaltyDiscountLabel ||
          attachedDoorQuote?.loyaltyDiscountLabel ||
          "Door Loyalty Discount",
        amount: effDoorLoy,
      })
    }
  }

  if (hostType !== "sealed_unit" && (effSuDisc > 0 || effSuLoy > 0)) {
    if (effSuDisc > 0) {
      rows.push({
        key: "su-discount",
        label: `${suNorm?.discountLabel || "Sealed Unit Discount"} (attached)`,
        amount: effSuDisc,
      })
    }
    if (effSuLoy > 0) {
      rows.push({
        key: "su-loyalty",
        label:
          suNorm?.loyaltyDiscountLabel ||
          "Sealed Unit Loyalty Discount",
        amount: effSuLoy,
      })
    }
  }

  return rows
}

/**
 * Shared ledger rows displaying all promo, custom, and loyalty discounts from
 * attached Window, Door, and Sealed Unit quotes consistently across summary cards.
 */
export function AttachedQuoteDiscountRows(props: AttachedQuoteDiscountRowsProps) {
  const rows = buildDiscountRows(props)
  if (rows.length === 0) return null

  return (
    <>
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between gap-2 py-0.5 text-xs font-medium text-emerald-600 sm:text-sm dark:text-emerald-400"
        >
          <span className="truncate">{row.label}</span>
          <span className="shrink-0 font-mono whitespace-nowrap">
            -${row.amount.toFixed(2)}
          </span>
        </div>
      ))}
    </>
  )
}
