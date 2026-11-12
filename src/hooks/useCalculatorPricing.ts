"use client"

import { useState, useCallback } from "react"
import {
  DBPromo,
  toCents,
  calculatePromo,
  calculateUpgrade,
  ILabourUpgradeTier,
} from "@/lib/promo-logic"
import { UIWindowItem } from "./useCalculatorWindows"

export interface UseCalculatorPricingProps {
  surchargeRate: number
  labourUpgradeTiers?: ILabourUpgradeTier[]
}

export const DEFAULT_TAX_TOTALS = {
  isSupplyOnly: false,
  isServiceOnly: false,
  standardLabourCents: 0,
  miscLabourCents: 0,
  finalLabour: 0,
  finalMisc: 0,
  jc: 0,
  finalJC: 0,
  jcLabourCents: 0,
  selectedJamb: null,
  selectedCasing: null,
  jambId: "j3",
  casingId: "vinyl",
  jambRate: 0,
  casingRate: 0,
  jambTot: 0,
  casingTot: 0,
}

export function useCalculatorPricing({
  surchargeRate,
  labourUpgradeTiers,
}: UseCalculatorPricingProps) {
  const [availablePromos, setAvailablePromos] = useState<DBPromo[]>([])
  const [activePromoId, setActivePromoId] = useState<string>("none")
  const [lockedPromoId, setLockedPromoId] = useState<string | null>(null)
  const [quoteResult, setQuoteResult] = useState<any>(null)
  const [compareOptions, setCompareOptions] = useState<any[]>([])

  // Additional costs & tax totals
  const [taxTotals, setTaxTotals] = useState<any>(DEFAULT_TAX_TOTALS)
  const [customJC, setCustomJC] = useState<string>("")
  const [customMisc, setCustomMisc] = useState<string>("")
  const [customLabour, setCustomLabour] = useState<string>("")
  const [includeJCInPromo, setIncludeJCInPromo] = useState<boolean>(true)
  const [includeMiscInPromo, setIncludeMiscInPromo] = useState<boolean>(true)
  const [includeLabourInPromo, setIncludeLabourInPromo] =
    useState<boolean>(true)
  const [wantsUpgrade, setWantsUpgrade] = useState<boolean>(false)
  const [hstRate, setHstRate] = useState<number>(13)

  const isSupplyOnly = Boolean(taxTotals?.isSupplyOnly)
  const hasSupplyJC = isSupplyOnly
    ? Boolean(
        (taxTotals?.selectedJamb &&
          taxTotals.selectedJamb.id !== "none" &&
          Number(
            taxTotals.selectedJamb.total || taxTotals.selectedJamb.rate || 0
          ) > 0) ||
        (taxTotals?.selectedCasing &&
          taxTotals.selectedCasing.id !== "none" &&
          Number(
            taxTotals.selectedCasing.total || taxTotals.selectedCasing.rate || 0
          ) > 0) ||
        (taxTotals?.jcLabourCents && taxTotals.jcLabourCents > 0)
      )
    : true

  // Effective extra cost amounts
  const taxJC =
    taxTotals?.jcLabourCents !== undefined
      ? taxTotals.jcLabourCents
      : Math.round(
          Number(
            taxTotals?.finalJC ?? taxTotals?.jcTotal ?? taxTotals?.jc ?? 0
          ) * 100
        )

  const taxMisc =
    taxTotals?.miscLabourCents !== undefined
      ? taxTotals.miscLabourCents
      : Math.round(
          Number(taxTotals?.finalMisc ?? taxTotals?.miscTotal ?? 0) * 100
        )

  const taxLabour =
    taxTotals?.standardLabourCents !== undefined
      ? taxTotals.standardLabourCents
      : Math.round(
          Number(
            taxTotals?.finalLabour ??
              taxTotals?.labourTotal ??
              taxTotals?.labourWindows ??
              0
          ) * 100
        )

  const effectiveJC = isSupplyOnly
    ? hasSupplyJC
      ? customJC !== ""
        ? toCents(customJC)
        : taxJC
      : 0
    : customJC !== ""
      ? toCents(customJC)
      : taxJC
  const effectiveMisc = isSupplyOnly
    ? customMisc !== ""
      ? toCents(customMisc)
      : 0
    : customMisc !== ""
      ? toCents(customMisc)
      : taxMisc
  const effectiveLabour = isSupplyOnly
    ? 0
    : customLabour !== ""
      ? toCents(customLabour)
      : taxLabour

  const calculateQuote = useCallback(
    (windows: UIWindowItem[]) => {
      const validWindows = windows.map((w) => ({
        id: w.id,
        qty: Math.max(1, Number(w.qty) || 1),
        base: toCents(w.base),
        argon: toCents(w.argon),
        solar: toCents(w.solar),
        triple: toCents(w.triple),
        w: w.w || "",
        h: w.h || "",
        color: w.color || "White",
      }))

      const options = availablePromos.map((p) =>
        calculatePromo(p, validWindows, surchargeRate)
      )
      setCompareOptions(options)

      const validOptions = options.filter((o) => o.promoId !== "none")
      const lowest =
        validOptions.length > 0
          ? validOptions.reduce((prev, curr) =>
              curr.promoDiscount > prev.promoDiscount ? curr : prev
            )
          : null

      const selectedId =
        lockedPromoId && options.some((o) => o.promoId === lockedPromoId)
          ? lockedPromoId
          : lowest
            ? lowest.promoId
            : "none"

      setActivePromoId(selectedId)
      const selectedOption =
        options.find((o) => o.promoId === selectedId) ||
        options.find((o) => o.promoId === "none")
      setQuoteResult(selectedOption || null)
    },
    [
      availablePromos,
      surchargeRate,
      includeJCInPromo,
      includeMiscInPromo,
      includeLabourInPromo,
      effectiveJC,
      effectiveMisc,
      effectiveLabour,
      lockedPromoId,
    ]
  )

  const customMaterialsCents = Math.round(
    ((taxTotals as any)?.customMaterialsTotal || 0) * 100
  )

  const beforeTaxDiscount = quoteResult
    ? quoteResult.base +
      quoteResult.surcharge +
      (includeJCInPromo ? effectiveJC : 0) +
      (includeMiscInPromo ? effectiveMisc : 0) +
      (includeLabourInPromo ? effectiveLabour : 0) +
      (!includeJCInPromo ? effectiveJC : 0) +
      (!includeMiscInPromo ? effectiveMisc : 0) +
      (!includeLabourInPromo ? effectiveLabour : 0) +
      customMaterialsCents
    : customMaterialsCents > 0
      ? customMaterialsCents + effectiveJC + effectiveLabour + effectiveMisc
      : 0

  const afterDiscount = Math.max(
    0,
    beforeTaxDiscount - (quoteResult?.promoDiscount || 0)
  )
  const upgrade = calculateUpgrade(afterDiscount, labourUpgradeTiers)
  const shownUpgrade = wantsUpgrade ? upgrade.charge : 0

  // Factory surcharge is excluded from materials (treated as handling/service).
  // Materials = Window base - Promo discount + Jambs & Casings + Custom materials.
  const materialAfterDiscount = quoteResult
    ? Math.max(
        0,
        quoteResult.base -
          (quoteResult?.promoDiscount || 0) +
          effectiveJC +
          customMaterialsCents
      )
    : customMaterialsCents + effectiveJC

  const serviceAfterDiscount = Math.max(
    0,
    afterDiscount - materialAfterDiscount
  )

  let hst = 0
  let hstBase = 0
  let materialExemption = 0

  if (hstRate === 13) {
    hst = Math.round(afterDiscount * 0.13)
    hstBase = hst
    materialExemption = 0
  } else if (hstRate === 8) {
    // 8% Provincial Point-of-Sale Exemption (First Nations):
    // Formula: (13% on all) - (8% on material)
    hstBase = Math.round(afterDiscount * 0.13)
    materialExemption = Math.round(materialAfterDiscount * 0.08)
    hst = Math.max(0, hstBase - materialExemption)
  } else {
    // 0% No Tax (Exempt)
    hst = 0
    hstBase = 0
    materialExemption = 0
  }

  const total = afterDiscount + hst
  const firstPayment = Math.floor(total / 2)
  const secondPayment = total - firstPayment

  const resetPricingOverrides = () => {
    setCustomJC("")
    setCustomMisc("")
    setCustomLabour("")
    setIncludeJCInPromo(true)
    setIncludeMiscInPromo(true)
    setIncludeLabourInPromo(true)
    setLockedPromoId(null)
    setActivePromoId("none")
    setTaxTotals(DEFAULT_TAX_TOTALS)
  }

  return {
    availablePromos,
    setAvailablePromos,
    activePromoId,
    setActivePromoId,
    lockedPromoId,
    setLockedPromoId,
    quoteResult,
    setQuoteResult,
    compareOptions,
    setCompareOptions,
    taxTotals,
    setTaxTotals,
    customJC,
    setCustomJC,
    customMisc,
    setCustomMisc,
    customLabour,
    setCustomLabour,
    includeJCInPromo,
    setIncludeJCInPromo,
    includeMiscInPromo,
    setIncludeMiscInPromo,
    includeLabourInPromo,
    setIncludeLabourInPromo,
    wantsUpgrade,
    setWantsUpgrade,
    hstRate,
    setHstRate,
    effectiveJC,
    effectiveMisc,
    effectiveLabour,
    taxJC,
    taxMisc,
    taxLabour,
    hasSupplyJC,
    beforeTaxDiscount,
    afterDiscount,
    upgrade,
    shownUpgrade,
    hst,
    hstBase,
    materialExemption,
    total,
    firstPayment,
    secondPayment,
    calculateQuote,
    resetPricingOverrides,
  }
}
