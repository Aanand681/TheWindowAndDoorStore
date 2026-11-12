import { useState, useEffect } from "react"
import { formatDoorSummarySentence } from "@/lib/doors/calculations"
import {
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from "@/lib/sealed-units-logic"
import type {
  QuoteInvoiceProps,
  InvoiceCalculationsResult,
} from "@/components/quotes/invoice/types"
import {
  getInvoiceTravelItems,
  getInvoiceDetailedExtrasList,
} from "./invoice-logistics"
import {
  getWindowBreakdown,
  getInvoiceSubtitle,
} from "./invoice-product-breakdowns"
import { calculateInvoicePricingRollup } from "./invoice-pricing-rollup"

export function useInvoiceCalculations({
  windows = [],
  sealedUnits = [],
  doors = [],
  taxTotals,
  quoteResult,
  sealedUnitTotals,
  doorTotals,
  activePromo,
  basePrice = 0,
  surcharge = 0,
  hstRate = 13,
  afterDiscount = 0,
  regionName,
  includeLabourInPromo = true,
  includeMiscInPromo = true,
  includeJCInPromo = true,
  effectiveJC,
  effectiveMisc,
  effectiveLabour,
  fontSize = 11.5,
  spacing = 1.0,
  attachedSealedUnit = null,
  attachedDoorQuote = null,
  attachedWindowQuote = null,
  globalUpcharges = [],
  isSupplyOnly: isSupplyOnlyProp,
  primaryQuoteType,
}: QuoteInvoiceProps): InvoiceCalculationsResult {
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    )
  }, [])

  // 1. Resolve product line lists and totals across host & attached quotes
  const effectiveWindows =
    windows && windows.length > 0
      ? windows
      : attachedWindowQuote?.windows || attachedWindowQuote?.lineItems || []
  const hasWindows =
    effectiveWindows.length > 0 || basePrice > 0 || Boolean(quoteResult?.base)

  const effectiveDoors =
    doors && doors.length > 0 ? doors : attachedDoorQuote?.lineItems || []
  const effectiveDoorTotals = doorTotals || attachedDoorQuote?.totals || {}
  const effectiveDoorUpcharges =
    globalUpcharges && globalUpcharges.length > 0
      ? globalUpcharges
      : attachedDoorQuote?.globalUpcharges || []
  const hasDoors =
    effectiveDoors.length > 0 || Boolean(effectiveDoorTotals?.grandTotal)

  const effectiveSealedUnits =
    sealedUnits && sealedUnits.length > 0
      ? sealedUnits
      : attachedSealedUnit?.lineItems || []
  const effectiveSUTotals = sealedUnitTotals || attachedSealedUnit?.totals || {}
  const isAttachedSUService =
    attachedSealedUnit?.sealedUnitMode === "service_only" ||
    attachedSealedUnit?.data?.sealedUnitMode === "service_only" ||
    Boolean(effectiveSUTotals.isServiceOnly)
  const hasSealedUnits =
    effectiveSealedUnits.length > 0 ||
    (isAttachedSUService && (effectiveSUTotals.totalSqft || 0) > 0)

  // 2. Identify primary host quote type
  const isDoorHost =
    primaryQuoteType === "door" ||
    (!primaryQuoteType && doors.length > 0 && windows.length === 0)
  const isSUHost =
    primaryQuoteType === "sealed_unit" ||
    (!primaryQuoteType &&
      sealedUnits.length > 0 &&
      windows.length === 0 &&
      doors.length === 0)
  const isWindowHost = !isDoorHost && !isSUHost

  // 3. Logistics & Travel Deduplication
  const travelItems = getInvoiceTravelItems({
    isWindowHost,
    taxTotals,
    regionName,
    isDoorHost,
    effectiveDoorTotals,
    isSUHost,
    effectiveSUTotals,
  })

  const isSupplyOnly = Boolean(
    isSupplyOnlyProp !== undefined
      ? isSupplyOnlyProp
      : taxTotals?.isSupplyOnly ||
          regionName?.toLowerCase().includes("supply") ||
          taxTotals?.regionName?.toLowerCase().includes("supply")
  )

  const hasSupplyJamb = Boolean(
    (taxTotals?.selectedJamb &&
      (Number(taxTotals.selectedJamb.rate) > 0 ||
        Number(taxTotals.selectedJamb.total) > 0)) ||
    (taxTotals?.jambTot && Number(taxTotals.jambTot) > 0) ||
    (taxTotals?.jambRate && Number(taxTotals.jambRate) > 0) ||
    (taxTotals?.jambId && taxTotals.jambId !== "none")
  )
  const hasSupplyCasing = Boolean(
    (taxTotals?.selectedCasing &&
      (Number(taxTotals.selectedCasing.rate) > 0 ||
        Number(taxTotals.selectedCasing.total) > 0)) ||
    (taxTotals?.casingTot && Number(taxTotals.casingTot) > 0) ||
    (taxTotals?.casingRate && Number(taxTotals.casingRate) > 0) ||
    (taxTotals?.casingId && taxTotals.casingId !== "none")
  )
  const isLooseSupplyJC = Boolean(
    isSupplyOnly && (hasSupplyJamb || hasSupplyCasing)
  )

  const taxJCCents = includeJCInPromo
    ? isSupplyOnly && !isLooseSupplyJC && effectiveJC === undefined
      ? 0
      : effectiveJC !== undefined
        ? effectiveJC
        : Math.round(
            Number(
              taxTotals?.finalJC ?? taxTotals?.jcTotal ?? taxTotals?.jc ?? 0
            ) * 100
          )
    : 0
  const taxMiscCents = includeMiscInPromo
    ? isSupplyOnly && effectiveMisc === undefined
      ? 0
      : effectiveMisc !== undefined
        ? effectiveMisc
        : Math.round(
            Number(taxTotals?.finalMisc ?? taxTotals?.miscTotal ?? 0) * 100
          )
    : 0
  const taxLabourCents = includeLabourInPromo
    ? isSupplyOnly && effectiveLabour === undefined
      ? 0
      : effectiveLabour !== undefined
        ? effectiveLabour
        : Math.round(
            Number(
              taxTotals?.finalLabour ??
                taxTotals?.labourTotal ??
                taxTotals?.labourWindows ??
                0
            ) * 100
          )
    : 0

  const jcItems: { label: string; amount: number }[] = []
  if (taxJCCents > 0) {
    const rawJamb =
      taxTotals?.selectedJamb &&
      ((taxTotals.selectedJamb.total ?? 0) > 0 ||
        (taxTotals.selectedJamb.rate ?? 0) > 0)
        ? Math.round(Number(taxTotals.selectedJamb.total || 0) * 100)
        : 0
    const rawCasing =
      taxTotals?.selectedCasing &&
      ((taxTotals.selectedCasing.total ?? 0) > 0 ||
        (taxTotals.selectedCasing.rate ?? 0) > 0)
        ? Math.round(Number(taxTotals.selectedCasing.total || 0) * 100)
        : 0
    const rawTotal = rawJamb + rawCasing

    const jName = taxTotals?.selectedJamb?.name || "Jamb"
    const cName = taxTotals?.selectedCasing?.name || "Casing"
    if (rawJamb > 0 && rawCasing > 0 && rawTotal > 0) {
      const allocatedJamb = Math.round(taxJCCents * (rawJamb / rawTotal))
      jcItems.push({ label: jName, amount: allocatedJamb })
      jcItems.push({ label: cName, amount: taxJCCents - allocatedJamb })
    } else if (rawJamb > 0) {
      jcItems.push({ label: jName, amount: taxJCCents })
    } else if (rawCasing > 0) {
      jcItems.push({ label: cName, amount: taxJCCents })
    } else {
      jcItems.push({ label: "Jambs & Casings", amount: taxJCCents })
    }
  }

  const detailedExtrasList = getInvoiceDetailedExtrasList(
    taxTotals?.selectedAddons || []
  )

  const hasAnyAttached = Boolean(
    attachedSealedUnit || attachedDoorQuote || attachedWindowQuote
  )

  const pricing = calculateInvoicePricingRollup({
    hasWindows,
    hasSealedUnits,
    hasDoors,
    hasAnyAttached,
    isWindowHost,
    isDoorHost,
    isSUHost,
    isAttachedSUService,
    quoteResult,
    basePrice,
    surcharge,
    taxLabourCents,
    taxMiscCents,
    taxJCCents,
    taxDiscount: taxTotals?.discount || 0,
    activePromo,
    attachedWindowQuote,
    effectiveSUTotals,
    effectiveDoorTotals,
    hstRate,
    afterDiscount,
    taxTotals,
  })

  const suSummarySentence = isAttachedSUService
    ? getSealedUnitServiceSummaryLabel(
        effectiveSealedUnits,
        effectiveSUTotals.totalSqft
      )
    : formatSealedUnitSummarySentence(effectiveSealedUnits)

  const doorSummarySentence = formatDoorSummarySentence(effectiveDoors)
  const doorUpgradeItems = effectiveDoors.filter(
    (d: any) => d.upgradeOption?.enabled
  )

  // Proportional Font Scaling System
  const baseFs = fontSize
  const titleFs = Math.max(14, Math.round(baseFs * 1.55))
  const h2Fs = Math.max(10.5, Math.round(baseFs * 1.1 * 10) / 10)
  const thFs = Math.max(9, Math.round(baseFs * 0.92 * 10) / 10)
  const bodyFs = baseFs
  const smallFs = Math.max(8.5, Math.round(baseFs * 0.85 * 10) / 10)
  const microFs = Math.max(7.5, Math.round(baseFs * 0.76 * 10) / 10)

  const rowPy = Math.max(2, Math.round(4 * spacing))
  const cardGap = Math.max(4, Math.round(6 * spacing))
  const sectionMb = Math.max(6, Math.round(10 * spacing))

  const { windowSummarySentence, totalWindowBaseCents } = getWindowBreakdown(
    effectiveWindows,
    pricing.winMaterialsCents
  )

  const invoiceSubtitle = getInvoiceSubtitle({
    hasWindows,
    hasDoors,
    hasSealedUnits,
    isSupplyOnly,
    isAttachedSUService,
  })

  const isSingleLineMergedItem = Boolean(
    !hasDoors &&
    !hasSealedUnits &&
    effectiveWindows.length === 1 &&
    pricing.winMaterialsCents > 0
  )

  return {
    currentDate,
    invoiceSubtitle,
    hasWindows,
    hasSealedUnits,
    hasDoors,
    isWindowHost,
    isDoorHost,
    isSUHost,
    isSupplyOnly,
    isLooseSupplyJC,
    effectiveWindows,
    effectiveSealedUnits,
    effectiveDoors,
    effectiveSUTotals,
    effectiveDoorTotals,
    attachedWindowQuote,
    attachedSealedUnit,
    attachedDoorQuote,
    isAttachedSUService,
    travelItems,
    jcItems,
    detailedExtrasList,
    doorUpgradeItems,
    finalTotalCents: pricing.finalTotalCents,
    finalFirstPayment: pricing.finalFirstPayment,
    finalSecondPayment: pricing.finalSecondPayment,
    baseFs,
    titleFs,
    h2Fs,
    thFs,
    bodyFs,
    smallFs,
    microFs,
    rowPy,
    cardGap,
    sectionMb,
    taxTotals,
    quoteResult,
    winMaterialsCents: pricing.winMaterialsCents,
    totalWindowBaseCents,
    windowSummarySentence,
    suGlassCents: pricing.suGlassCents,
    suSummarySentence,
    doorNetMaterialsCents: pricing.doorNetMaterialsCents,
    doorSummarySentence,
    promoDiscountCents: pricing.promoDiscountCents,
    monthlyDiscountCents: pricing.monthlyDiscountCents,
    activePromo,
    finalSubtotalCents: pricing.finalSubtotalCents,
    finalHstAmountCents: pricing.finalHstAmountCents,
    finalHstBaseCents: pricing.finalHstBaseCents,
    finalMaterialExemptionCents: pricing.finalMaterialExemptionCents,
    hstRate,
    finalHstLabel: pricing.finalHstLabel,
    effectiveLabourTotalCents: pricing.effectiveLabourTotalCents,
    effectiveMiscTotalCents: pricing.effectiveMiscTotalCents,
    effectiveSurchargeTotalCents: pricing.effectiveSurchargeTotalCents,
    surchargeRate: 0.08,
    isSingleLineMergedItem,
  }
}
