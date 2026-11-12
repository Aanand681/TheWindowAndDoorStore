import { UIWindowItem } from "@/hooks/useCalculatorWindows"
import {
  toCents,
  calculatePromo,
  parseInches,
  DBPromo,
} from "@/lib/promo-logic"
import {
  OptionBFinancials,
  ComparisonDelta,
  StagedOptionBData,
} from "@/components/calculator/comparison/types"

interface CalculateOptionBParams {
  isComparisonStaging?: boolean
  stagedOptionB?: StagedOptionBData
  effectiveOptionBWindows: UIWindowItem[] | null
  surchargeRate: number
  extraLinPerWindow: number
  effectiveJambRateB: number
  effectiveCasingRateB: number
  overrideJambId: string
  overrideCasingId: string
  effectiveJC: number
  effectiveMisc: number
  effectiveLabour: number
  availablePromos: DBPromo[]
  activePromoId: string
  hstRate: number
}

export function calculateOptionBFinancials(
  params: CalculateOptionBParams
): OptionBFinancials | null {
  const {
    isComparisonStaging,
    stagedOptionB,
    effectiveOptionBWindows,
    surchargeRate,
    extraLinPerWindow,
    effectiveJambRateB,
    effectiveCasingRateB,
    overrideJambId,
    overrideCasingId,
    effectiveJC,
    effectiveMisc,
    effectiveLabour,
    availablePromos,
    activePromoId,
    hstRate,
  } = params

  if (isComparisonStaging && stagedOptionB) {
    const validWindows = (stagedOptionB.windows || []).map((w) => ({
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

    const base = Number(stagedOptionB.quoteResult?.base) || 0
    const surcharge = Number(stagedOptionB.quoteResult?.surcharge) || 0
    const promoDiscount = Number(stagedOptionB.quoteResult?.promoDiscount) || 0
    const jc = Number(stagedOptionB.effectiveJC) || 0
    const misc = Number(stagedOptionB.effectiveMisc) || 0
    const labour = Number(stagedOptionB.effectiveLabour) || 0
    const beforeTaxDiscount = base + surcharge + jc + misc + labour
    const afterDiscount =
      stagedOptionB.afterDiscount !== undefined
        ? stagedOptionB.afterDiscount
        : Math.max(0, beforeTaxDiscount - promoDiscount)
    const total =
      stagedOptionB.total !== undefined ? stagedOptionB.total : afterDiscount
    const hst = Math.max(0, total - afterDiscount)
    const firstPayment =
      stagedOptionB.firstPayment !== undefined
        ? stagedOptionB.firstPayment
        : Math.floor(total / 2)
    const secondPayment =
      stagedOptionB.secondPayment !== undefined
        ? stagedOptionB.secondPayment
        : total - firstPayment

    return {
      validWindows,
      base,
      surcharge,
      promoDiscount,
      jc,
      linearFeet: 0,
      labour,
      misc,
      beforeTaxDiscount,
      afterDiscount,
      hst,
      total,
      firstPayment,
      secondPayment,
      promoResult: stagedOptionB.quoteResult,
    }
  }

  if (!effectiveOptionBWindows || effectiveOptionBWindows.length === 0)
    return null

  const validWindows = effectiveOptionBWindows.map((w) => ({
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

  let jcTotalCents = 0
  let linearFeet = 0

  if (overrideJambId === "none" && overrideCasingId === "none") {
    jcTotalCents = 0
  } else if (overrideJambId === "inherit" && overrideCasingId === "inherit") {
    jcTotalCents = effectiveJC
  } else {
    effectiveOptionBWindows.forEach((w) => {
      const W = parseInches(w.w)
      const H = parseInches(w.h)
      const q = Math.max(1, Number(w.qty) || 1)
      if (W && H) {
        linearFeet += ((W * 2 + H * 2) / 12) * q + q * extraLinPerWindow
      }
    })
    linearFeet = Math.round(linearFeet * 100) / 100
    const combinedRate = effectiveJambRateB + effectiveCasingRateB
    jcTotalCents = Math.round(linearFeet * combinedRate * 100)
  }

  const selectedPromo = availablePromos.find((p) => p._id === activePromoId) ||
    availablePromos.find((p) => p.isActive) || {
      _id: "none",
      name: "Standard Price",
      type: "PERCENTAGE",
      isActive: true,
    }

  const promoResult = calculatePromo(
    selectedPromo as any,
    validWindows,
    surchargeRate
  )

  const beforeTaxDiscount =
    promoResult.base +
    promoResult.surcharge +
    jcTotalCents +
    effectiveMisc +
    effectiveLabour

  const promoDiscount = promoResult.promoDiscount || 0
  const afterDiscount = Math.max(0, beforeTaxDiscount - promoDiscount)

  let hst = 0
  if (hstRate === 13) {
    hst = Math.round(afterDiscount * 0.13)
  } else if (hstRate === 8) {
    const material = Math.max(
      0,
      promoResult.base + promoResult.surcharge - promoDiscount + jcTotalCents
    )
    const service = Math.max(0, afterDiscount - material)
    hst = Math.round(material * 0.05) + Math.round(service * 0.13)
  }

  const total = afterDiscount + hst
  const firstPayment = Math.floor(total / 2)
  const secondPayment = total - firstPayment

  return {
    validWindows,
    base: promoResult.base,
    surcharge: promoResult.surcharge,
    promoDiscount,
    jc: jcTotalCents,
    linearFeet,
    labour: effectiveLabour,
    misc: effectiveMisc,
    beforeTaxDiscount,
    afterDiscount,
    hst,
    total,
    firstPayment,
    secondPayment,
    promoResult,
  }
}

export function calculateComparisonDelta(
  optionBFinancials: OptionBFinancials | null,
  afterDiscountA: number,
  totalA: number
): ComparisonDelta | null {
  if (!optionBFinancials) return null
  const preTax = optionBFinancials.afterDiscount - afterDiscountA
  const tax = optionBFinancials.hst - (totalA - afterDiscountA)
  const total = optionBFinancials.total - totalA
  const payment = Math.floor(total / 2)

  return {
    preTax,
    tax,
    total,
    payment,
    isUpgrade: preTax > 0,
    isSavings: preTax < 0,
    isEqual: preTax === 0,
  }
}

export function detectUpgradeTitle(
  effectiveOptionBWindows: UIWindowItem[] | null,
  currentWindows: UIWindowItem[]
): string {
  if (!effectiveOptionBWindows) return "Upgrade to Premium Windows"
  let tripleDiff = 0
  let paintedDiff = 0
  effectiveOptionBWindows.forEach((wb, i) => {
    const wa = currentWindows[i]
    const isTripleB = Number(wb.triple) > 0 || toCents(wb.triple) > 0
    const isTripleA = wa && (Number(wa.triple) > 0 || toCents(wa.triple) > 0)
    if (isTripleB && !isTripleA) tripleDiff += Number(wb.qty) || 1

    const isPaintedB = wb.color?.toLowerCase() === "painted"
    const isPaintedA = wa && wa.color?.toLowerCase() === "painted"
    if (isPaintedB && !isPaintedA) paintedDiff += Number(wb.qty) || 1
  })

  if (tripleDiff > 0 && paintedDiff > 0)
    return "Upgrade to Triple Pane & Painted Windows"
  if (tripleDiff > 0) return "Upgrade to Triple Pane Windows"
  if (paintedDiff > 0) return "Upgrade to Painted Windows"
  return "Optional Window Upgrade"
}
