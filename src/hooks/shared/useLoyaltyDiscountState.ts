"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { resolveLoyaltyDiscountForTaxChange } from "@/lib/loyalty/loyalty-engine"

export type LoyaltyDiscountType = "none" | "custom" | "loyalty"

export interface UseLoyaltyDiscountStateOptions {
  hstRate?: number
  isFirstNation?: boolean
}

/**
 * Shared state hook for Loyalty Points and Custom Extra Discounts across
 * Window, Door, and Sealed Unit calculators. Automatically keeps tax-inclusive
 * loyalty rewards synchronized when tax mode changes after selection.
 */
export function useLoyaltyDiscountState(
  options?: UseLoyaltyDiscountStateOptions
) {
  const [loyaltyDiscount, setLoyaltyDiscount] = useState<string>("")
  const [loyaltyDiscountLabel, setLoyaltyDiscountLabel] = useState<string>("")
  const [discountType, setDiscountType] = useState<LoyaltyDiscountType>("none")
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0)
  const [loyaltyGrossAmount, setLoyaltyGrossAmount] = useState<number>(0)

  const hstRate = options?.hstRate
  const isFirstNation = options?.isFirstNation ?? hstRate === 8

  const prevStateRef = useRef({
    discountType,
    loyaltyGrossAmount,
    taxKey: "",
  })

  useEffect(() => {
    const prev = prevStateRef.current
    if (hstRate === undefined) {
      prevStateRef.current = {
        discountType,
        loyaltyGrossAmount,
        taxKey: "",
      }
      return
    }

    const { nextTaxKey, nextDiscount } = resolveLoyaltyDiscountForTaxChange({
      prevDiscountType: prev.discountType,
      prevLoyaltyGrossAmount: prev.loyaltyGrossAmount,
      prevTaxKey: prev.taxKey,
      discountType,
      loyaltyGrossAmount,
      hstRate,
      isFirstNation,
    })

    prevStateRef.current = {
      discountType,
      loyaltyGrossAmount,
      taxKey: nextTaxKey,
    }

    if (nextDiscount !== null) {
      setLoyaltyDiscount((curr) => (curr === nextDiscount ? curr : nextDiscount))
    }
  }, [discountType, loyaltyGrossAmount, hstRate, isFirstNation])

  const resetLoyaltyDiscount = useCallback(() => {
    setLoyaltyDiscount("")
    setLoyaltyDiscountLabel("")
    setDiscountType("none")
    setLoyaltyPoints(0)
    setLoyaltyGrossAmount(0)
  }, [])

  return {
    loyaltyDiscount,
    setLoyaltyDiscount,
    loyaltyDiscountLabel,
    setLoyaltyDiscountLabel,
    discountType,
    setDiscountType,
    loyaltyPoints,
    setLoyaltyPoints,
    loyaltyGrossAmount,
    setLoyaltyGrossAmount,
    resetLoyaltyDiscount,
  }
}
