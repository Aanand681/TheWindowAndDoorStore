"use client"

import { useState, useCallback } from "react"

export type LoyaltyDiscountType = "none" | "custom" | "loyalty"

/**
 * Shared state hook for Loyalty Points and Custom Extra Discounts across
 * Window, Door, and Sealed Unit calculators.
 */
export function useLoyaltyDiscountState() {
  const [loyaltyDiscount, setLoyaltyDiscount] = useState<string>("")
  const [loyaltyDiscountLabel, setLoyaltyDiscountLabel] = useState<string>("")
  const [discountType, setDiscountType] = useState<LoyaltyDiscountType>("none")
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0)
  const [loyaltyGrossAmount, setLoyaltyGrossAmount] = useState<number>(0)

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
