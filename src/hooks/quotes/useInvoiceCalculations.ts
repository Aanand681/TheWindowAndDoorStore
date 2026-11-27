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
import { getInvoiceLabourItems } from "./invoice-labour"
import {
  getWindowBreakdown,
  getInvoiceSubtitle,
} from "./invoice-product-breakdowns"
import { calculateInvoicePricingRollup } from "./invoice-pricing-rollup"
import { computeDeduplicatedInstallCompareAmounts } from "@/lib/quotes/supply-install-delta"

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
  includeLabourInPromo: _includeLabourInPromo = true,
  includeMiscInPromo: _includeMiscInPromo = true,
  includeJCInPromo: _includeJCInPromo = true,
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
  customLabour,
  customMisc,
  customDiscount,
  customDiscountLabel,
  loyaltyDiscount,
  loyaltyDiscountLabel,
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

  // 1. Identify primary host quote type
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

  // 2. Resolve product line lists and totals across host & attached quotes
  const effectiveWinTaxTotals =
    taxTotals || attachedWindowQuote?.taxTotals || undefined
  const effectiveWindows =
    windows && windows.length > 0
      ? windows
      : attachedWindowQuote?.windows || attachedWindowQuote?.lineItems || []
  const hasWindows =
    effectiveWindows.length > 0 || basePrice > 0 || Boolean(quoteResult?.base)

  const effectiveDoors =
    doors && doors.length > 0 ? doors : attachedDoorQuote?.lineItems || []
  const effectiveDoorTotals = doorTotals || attachedDoorQuote?.totals || {}
  const effectiveDoorUpcharges = isDoorHost
    ? globalUpcharges?.length
      ? globalUpcharges
      : effectiveDoorTotals?.globalUpcharges || []
    : attachedDoorQuote?.globalUpcharges || effectiveDoorTotals?.globalUpcharges || []
  const hasDoors =
    effectiveDoors.length > 0 || Boolean(effectiveDoorTotals?.grandTotal)

  const effectiveSealedUnits =
    sealedUnits && sealedUnits.length > 0
      ? sealedUnits
      : attachedSealedUnit?.lineItems || []
  const effectiveSUTotals = sealedUnitTotals || attachedSealedUnit?.totals || {}
  const effectiveSUUpcharges = isSUHost
    ? Array.isArray(globalUpcharges) && globalUpcharges.length > 0
      ? globalUpcharges
      : Array.isArray(effectiveSUTotals?.globalUpcharges)
        ? effectiveSUTotals.globalUpcharges
        : []
    : Array.isArray(attachedSealedUnit?.globalUpcharges) && attachedSealedUnit.globalUpcharges.length > 0
      ? attachedSealedUnit.globalUpcharges
      : Array.isArray(effectiveSUTotals?.globalUpcharges)
        ? effectiveSUTotals.globalUpcharges
        : []
  const isAttachedSUService =
    attachedSealedUnit?.sealedUnitMode === "service_only" ||
    attachedSealedUnit?.data?.sealedUnitMode === "service_only" ||
    Boolean(effectiveSUTotals.isServiceOnly) ||
    Boolean(Number(effectiveSUTotals.serviceLabourTotal) > 0)
  const hasSealedUnits =
    effectiveSealedUnits.length > 0 ||
    (isAttachedSUService &&
      ((effectiveSUTotals.totalSqft || 0) > 0 ||
        Number(effectiveSUTotals.serviceLabourTotal) > 0 ||
        Number(effectiveSUTotals.extraLabour) > 0 ||
        effectiveSUUpcharges.length > 0)) ||
    (primaryQuoteType === "sealed_unit" &&
      (Number(effectiveSUTotals.grandTotal) > 0 ||
        Number(effectiveSUTotals.pureLabour) > 0 ||
        Number(effectiveSUTotals.extraLabour) > 0 ||
        effectiveSUUpcharges.length > 0))

  const isSUHostService = Boolean(isSUHost && isAttachedSUService)
  const isSupplyOnly =
    !isSUHostService &&
    Boolean(
      isSupplyOnlyProp !== undefined
        ? isSupplyOnlyProp
        : effectiveWinTaxTotals?.isSupplyOnly ||
            regionName?.toLowerCase().includes("supply") ||
            effectiveWinTaxTotals?.regionName?.toLowerCase().includes("supply")
    )

  const isWinSupply = isWindowHost
    ? isSupplyOnly
    : Boolean(attachedWindowQuote?.isSupplyOnly || effectiveWinTaxTotals?.isSupplyOnly)
  const isDoorSupply = isDoorHost
    ? isSupplyOnly
    : Boolean(
        attachedDoorQuote?.isSupplyOnly ||
          attachedDoorQuote?.mode === "supply_only" ||
          attachedDoorQuote?.data?.mode === "supply_only" ||
          effectiveDoorTotals?.isSupplyOnly
      )
  const isSUSupply = isSUHost
    ? isSupplyOnly
    : Boolean(
        attachedSealedUnit?.isSupplyOnly ||
          attachedSealedUnit?.sealedUnitMode === "supply_only" ||
          attachedSealedUnit?.data?.sealedUnitMode === "supply_only" ||
          (effectiveSUTotals?.isSupplyOnly && !isAttachedSUService)
      )

  // 3. Logistics & Travel Deduplication
  const travelItems = getInvoiceTravelItems({
    isWindowHost,
    taxTotals: effectiveWinTaxTotals,
    regionName,
    isDoorHost,
    effectiveDoorTotals,
    isSUHost,
    effectiveSUTotals,
    isSupplyOnly,
    attachedWindowQuote,
    attachedDoorQuote,
    attachedSealedUnit,
  })

  const hasSupplyJamb = Boolean(
    (effectiveWinTaxTotals?.selectedJamb &&
      (Number(effectiveWinTaxTotals.selectedJamb.rate) > 0 ||
        Number(effectiveWinTaxTotals.selectedJamb.total) > 0)) ||
      (effectiveWinTaxTotals?.jambTot && Number(effectiveWinTaxTotals.jambTot) > 0) ||
      (effectiveWinTaxTotals?.jambRate && Number(effectiveWinTaxTotals.jambRate) > 0) ||
      (effectiveWinTaxTotals?.jambId && effectiveWinTaxTotals.jambId !== "none")
  )
  const hasSupplyCasing = Boolean(
    (effectiveWinTaxTotals?.selectedCasing &&
      (Number(effectiveWinTaxTotals.selectedCasing.rate) > 0 ||
        Number(effectiveWinTaxTotals.selectedCasing.total) > 0)) ||
      (effectiveWinTaxTotals?.casingTot && Number(effectiveWinTaxTotals.casingTot) > 0) ||
      (effectiveWinTaxTotals?.casingRate && Number(effectiveWinTaxTotals.casingRate) > 0) ||
      (effectiveWinTaxTotals?.casingId && effectiveWinTaxTotals.casingId !== "none")
  )
  const isLooseSupplyJC = Boolean(
    isWinSupply && (hasSupplyJamb || hasSupplyCasing)
  )

  const taxJCCents = isWindowHost
    ? isSupplyOnly && !isLooseSupplyJC && effectiveJC === undefined
      ? 0
      : effectiveJC !== undefined
        ? effectiveJC
        : Math.round(
            Number(
              effectiveWinTaxTotals?.finalJC ??
                effectiveWinTaxTotals?.jcTotal ??
                effectiveWinTaxTotals?.jc ??
                0
            ) * 100
          )
    : hasWindows && (!isWinSupply || isLooseSupplyJC)
      ? Math.round(
          Number(
            effectiveWinTaxTotals?.finalJC ??
              effectiveWinTaxTotals?.jcTotal ??
              effectiveWinTaxTotals?.jc ??
              attachedWindowQuote?.totals?.jc ??
              0
          ) * 100
        )
      : 0

  const taxMiscCents =
    isSupplyOnly && effectiveMisc === undefined
      ? 0
      : effectiveMisc !== undefined
        ? effectiveMisc
        : Math.round(
            Number(
              effectiveWinTaxTotals?.finalMisc ??
                effectiveWinTaxTotals?.miscTotal ??
                attachedWindowQuote?.totals?.misc ??
                0
            ) * 100
          )
  const taxLabourCents =
    isSupplyOnly && effectiveLabour === undefined
      ? 0
      : effectiveLabour !== undefined
        ? effectiveLabour
        : Math.round(
            Number(
              effectiveWinTaxTotals?.finalLabour ??
                effectiveWinTaxTotals?.labourTotal ??
                effectiveWinTaxTotals?.labourWindows ??
                attachedWindowQuote?.totals?.labour ??
                0
            ) * 100
          )

  const jcItems: { label: string; amount: number }[] = []
  if (taxJCCents > 0) {
    const rawJamb =
      effectiveWinTaxTotals?.selectedJamb &&
      ((effectiveWinTaxTotals.selectedJamb.total ?? 0) > 0 ||
        (effectiveWinTaxTotals.selectedJamb.rate ?? 0) > 0)
        ? Math.round(Number(effectiveWinTaxTotals.selectedJamb.total || 0) * 100)
        : 0
    const rawCasing =
      effectiveWinTaxTotals?.selectedCasing &&
      ((effectiveWinTaxTotals.selectedCasing.total ?? 0) > 0 ||
        (effectiveWinTaxTotals.selectedCasing.rate ?? 0) > 0)
        ? Math.round(Number(effectiveWinTaxTotals.selectedCasing.total || 0) * 100)
        : 0
    const rawTotal = rawJamb + rawCasing

    const jName = effectiveWinTaxTotals?.selectedJamb?.name || "Jamb"
    const cName = effectiveWinTaxTotals?.selectedCasing?.name || "Casing"
    if (rawJamb > 0 && rawCasing > 0 && rawTotal > 0) {
      const allocatedJamb = Math.round(taxJCCents * (rawJamb / rawTotal))
      jcItems.push({ label: jName, amount: allocatedJamb })
      jcItems.push({ label: cName, amount: taxJCCents - allocatedJamb })
    } else if (rawJamb > 0) {
      jcItems.push({ label: jName, amount: taxJCCents })
    } else if (rawCasing > 0) {
      jcItems.push({ label: cName, amount: taxJCCents })
    } else {
      jcItems.push({
        label: attachedWindowQuote?.jcLabel || "Jambs & Casings",
        amount: taxJCCents,
      })
    }
  }

  const detailedExtrasList = getInvoiceDetailedExtrasList(
    effectiveWinTaxTotals?.selectedAddons ||
      attachedWindowQuote?.totals?.selectedAddons ||
      []
  )

  const hasAnyAttached = Boolean(
    attachedSealedUnit || attachedDoorQuote || attachedWindowQuote
  )

  const pricing = calculateInvoicePricingRollup({
    hasWindows, hasSealedUnits, hasDoors, hasAnyAttached,
    isWindowHost, isDoorHost, isSUHost, isAttachedSUService,
    quoteResult, basePrice, surcharge,
    taxLabourCents, taxMiscCents, taxJCCents,
    taxDiscount: effectiveWinTaxTotals?.discount || 0,
    customLabour,
    customMisc,
    customDiscount,
    customDiscountLabel,
    loyaltyDiscount,
    loyaltyDiscountLabel,
    activePromo, attachedWindowQuote, effectiveSUTotals, effectiveDoorTotals,
    hstRate, afterDiscount, taxTotals: effectiveWinTaxTotals, isSupplyOnly,
  })

  const resolvedWinLabourCents = isWindowHost
    ? taxLabourCents
    : Math.max(
        Math.round((pricing.universal?.winNorm?.pureLabour || 0) * 100),
        taxLabourCents
      )

  const labourBreakdownItems = getInvoiceLabourItems({
    isSupplyOnly,
    isWinSupply,
    isDoorSupply,
    isSUSupply,
    hasWindows,
    winLabourCents: resolvedWinLabourCents,
    effectiveWindows,
    taxTotals: effectiveWinTaxTotals,
    hasDoors,
    effectiveDoors,
    effectiveDoorTotals,
    doorUpcharges: effectiveDoorUpcharges,
    hasSealedUnits,
    effectiveSUTotals,
    suUpcharges: effectiveSUUpcharges,
    isAttachedSUService,
  })

  const suSummarySentence = isAttachedSUService
    ? getSealedUnitServiceSummaryLabel(effectiveSealedUnits, effectiveSUTotals.totalSqft)
    : formatSealedUnitSummarySentence(effectiveSealedUnits)

  const doorSummarySentence = formatDoorSummarySentence(effectiveDoors)
  const doorUpgradeItems = effectiveDoors.filter((d: any) => d.upgradeOption?.enabled)

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
    effectiveWindows, pricing.winMaterialsCents
  )

  const invoiceSubtitle = getInvoiceSubtitle({
    hasWindows, hasDoors, hasSealedUnits, isSupplyOnly, isAttachedSUService,
  })

  const isSingleLineMergedItem = Boolean(
    !hasDoors && !hasSealedUnits && effectiveWindows.length === 1 && pricing.winMaterialsCents > 0
  )

  const compareDedup = computeDeduplicatedInstallCompareAmounts({
    hasWindows,
    isWinSupplyOnly: isWinSupply,
    winTaxTotals: effectiveWinTaxTotals,
    attachedWindowQuote,
    hasDoors,
    isDoorSupplyOnly: isDoorSupply,
    doorTotals: effectiveDoorTotals,
    attachedDoorQuote,
    hasSealedUnits,
    isSUSupplyOnly: isSUSupply,
    suTotals: effectiveSUTotals,
    attachedSealedUnit,
  })

  return {
    currentDate, invoiceSubtitle, hasWindows, hasSealedUnits, hasDoors,
    isWindowHost, isDoorHost, isSUHost, isSupplyOnly, isLooseSupplyJC,
    effectiveWindows, effectiveSealedUnits, effectiveDoors,
    effectiveSUTotals, effectiveDoorTotals,
    attachedWindowQuote, attachedSealedUnit, attachedDoorQuote,
    isAttachedSUService, labourBreakdownItems, travelItems, jcItems, detailedExtrasList, doorUpgradeItems,
    finalTotalCents: pricing.finalTotalCents,
    finalFirstPayment: pricing.finalFirstPayment,
    finalSecondPayment: pricing.finalSecondPayment,
    finalSubtotal: pricing.finalSubtotal,
    finalHstAmount: pricing.finalHstAmount,
    finalTotal: pricing.finalTotal,
    finalFirstPaymentDollar: pricing.finalFirstPaymentDollar,
    finalSecondPaymentDollar: pricing.finalSecondPaymentDollar,
    winMaterials: pricing.winMaterials,
    totalWindowBase: totalWindowBaseCents / 100,
    suGlass: pricing.suGlass,
    doorNetMaterials: pricing.doorNetMaterials,
    effectiveLabourTotal: pricing.effectiveLabourTotal,
    effectiveMiscTotal: pricing.effectiveMiscTotal,
    effectiveSurchargeTotal: pricing.effectiveSurchargeTotal,
    promoDiscount: pricing.promoDiscount,
    monthlyDiscount: pricing.monthlyDiscount,
    baseFs, titleFs, h2Fs, thFs, bodyFs, smallFs, microFs, rowPy, cardGap, sectionMb,
    taxTotals: effectiveWinTaxTotals, quoteResult,
    winMaterialsCents: pricing.winMaterialsCents, totalWindowBaseCents, windowSummarySentence,
    suGlassCents: pricing.suGlassCents, suSummarySentence,
    doorNetMaterialsCents: pricing.doorNetMaterialsCents, doorSummarySentence,
    promoDiscountCents: pricing.promoDiscountCents,
    monthlyDiscountCents: pricing.monthlyDiscountCents,
    activePromo, finalSubtotalCents: pricing.finalSubtotalCents,
    finalHstAmountCents: pricing.finalHstAmountCents,
    finalHstBaseCents: pricing.finalHstBaseCents,
    finalMaterialExemptionCents: pricing.finalMaterialExemptionCents,
    hstRate, finalHstLabel: pricing.finalHstLabel,
    effectiveLabourTotalCents: pricing.effectiveLabourTotalCents,
    effectiveMiscTotalCents: pricing.effectiveMiscTotalCents,
    effectiveSurchargeTotalCents: pricing.effectiveSurchargeTotalCents,
    surchargeRate: 0.08, isSingleLineMergedItem,
    discountLineItems: pricing.universal?.discountLineItems || [],
    compareInstallLabourCents: Math.round(compareDedup.compareLabourAmount * 100),
    compareInstallMiscCents: Math.round(compareDedup.compareMiscAmount * 100),
    compareInstallJCCents: Math.round(compareDedup.installJCAmount * 100),
  }
}
