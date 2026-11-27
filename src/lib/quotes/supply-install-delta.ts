export interface DeduplicatedInstallCompareInput {
  hasWindows: boolean
  isWinSupplyOnly?: boolean
  winTaxTotals?: any
  attachedWindowQuote?: any | null
  winOverrideLabourDollars?: number
  winOverrideMiscDollars?: number

  hasDoors: boolean
  isDoorSupplyOnly?: boolean
  doorTotals?: any
  attachedDoorQuote?: any | null
  doorOverrideLabourDollars?: number
  doorOverrideMiscDollars?: number

  hasSealedUnits: boolean
  isSUSupplyOnly?: boolean
  suTotals?: any
  attachedSealedUnit?: any | null
}

export interface DeduplicatedInstallCompareResult {
  pureWinLabour: number
  pureDoorLabour: number
  pureSULabour: number
  maxTravel: number
  compareLabourAmount: number
  compareMiscAmount: number
  installJCAmount: number
}

function toDollars(val: unknown): number {
  const n = Number(val)
  return Number.isFinite(n) && n > 0 ? n : 0
}

function extractDoorInstallComponents(
  doorTotals: any,
  attachedDoorQuote: any,
  isDoorSupplyOnly: boolean,
  overrideLabour?: number,
  overrideMisc?: number
) {
  const t = doorTotals || attachedDoorQuote?.totals || {}
  const travel = toDollars(
    t.fullTravelAndSetup ?? t.travelAndSetupFee ?? t.totalTravelAndSetup
  )
  const misc =
    overrideMisc !== undefined
      ? Math.max(0, overrideMisc)
      : toDollars(t.fullInstallMisc ?? t.miscTotal ?? t.misc)

  let pureLabour = 0
  if (overrideLabour !== undefined) {
    pureLabour = Math.max(0, overrideLabour)
  } else if (t.unitLabourTotal !== undefined || t.upchargesTotal !== undefined) {
    pureLabour = toDollars(t.unitLabourTotal) + toDollars(t.upchargesTotal)
  } else if (t.doorPureLabourTotal !== undefined && (!isDoorSupplyOnly || Number(t.doorPureLabourTotal) > 0)) {
    pureLabour = toDollars(t.doorPureLabourTotal)
  } else {
    const fullLab = toDollars(t.fullInstallLabour ?? t.combinedLabourTotal)
    pureLabour = Math.max(0, fullLab - travel)
  }

  return { pureLabour, travel, misc }
}

function extractSUInstallComponents(
  suTotals: any,
  attachedSealedUnit: any,
  isSUSupplyOnly: boolean
) {
  const t = suTotals || attachedSealedUnit?.totals || {}
  const isService = Boolean(t.isServiceOnly || attachedSealedUnit?.sealedUnitMode === "service_only")
  const travel = isService
    ? toDollars(t.travelAndSetupFee ?? t.totalTravelAndSetup)
    : toDollars(t.fullTravelAndSetup ?? t.travelAndSetupFee ?? t.totalTravelAndSetup)

  const misc = isService
    ? toDollars(t.miscTotal)
    : toDollars(t.fullInstallMisc ?? t.miscTotal)

  let pureLabour = 0
  if (isService) {
    pureLabour = toDollars(t.serviceLabourTotal) + toDollars(t.extraLabour)
  } else if (t.fullUnitLabourSum !== undefined) {
    pureLabour = toDollars(t.fullUnitLabourSum) + toDollars(t.extraLabour)
  } else if (!isSUSupplyOnly && t.unitLabourSum !== undefined) {
    pureLabour = toDollars(t.unitLabourSum) + toDollars(t.extraLabour)
  } else if (t.pureLabourTotal !== undefined && Number(t.pureLabourTotal) > 0) {
    pureLabour = toDollars(t.pureLabourTotal)
  } else {
    const fullLab = toDollars(t.fullInstallLabour ?? t.combinedLabourTotal)
    pureLabour = Math.max(0, fullLab - travel)
  }

  return { pureLabour, travel, misc }
}

function extractWindowInstallComponents(
  winTaxTotals: any,
  attachedWindowQuote: any,
  isWinSupplyOnly: boolean,
  overrideLabour?: number,
  overrideMisc?: number
) {
  const tx = winTaxTotals || attachedWindowQuote?.taxTotals || {}
  const attTotals = attachedWindowQuote?.totals || {}

  const travel = isWinSupplyOnly
    ? toDollars(
        tx.fullInstallExtrasCents !== undefined
          ? Number(tx.fullInstallExtrasCents) / 100
          : tx.extras ?? attTotals.travelAndSetupFee
      )
    : toDollars(tx.extras ?? tx.totalTravelAndSetup ?? attTotals.travelAndSetupFee)

  let pureLabour = 0
  if (overrideLabour !== undefined) {
    pureLabour = Math.max(0, overrideLabour - travel)
  } else if (isWinSupplyOnly && tx.fullInstallLabourCents !== undefined) {
    const fullLab = Number(tx.fullInstallLabourCents) / 100
    pureLabour = Math.max(0, fullLab - travel)
  } else if (tx.labourWindows !== undefined) {
    pureLabour = toDollars(tx.labourWindows)
  } else if (attTotals.labour !== undefined) {
    pureLabour = toDollars(attTotals.labour)
  } else {
    const finalLab = toDollars(tx.finalLabour ?? attTotals.fullLabour)
    pureLabour = Math.max(0, finalLab - travel)
  }

  const misc =
    overrideMisc !== undefined
      ? Math.max(0, overrideMisc)
      : isWinSupplyOnly && tx.fullInstallMiscCents !== undefined
        ? Number(tx.fullInstallMiscCents) / 100
        : toDollars(tx.finalMisc ?? tx.miscTotal ?? attTotals.misc)

  const installJC =
    tx.fullInstallJCCents !== undefined && Number(tx.fullInstallJCCents) > 0
      ? Number(tx.fullInstallJCCents) / 100
      : toDollars(tx.finalJC ?? tx.jcTotal ?? attTotals.jc)

  return { pureLabour, travel, misc, installJC }
}

/**
 * Computes deduplicated Installation vs Supply-Only delta components across Window, Door,
 * and Sealed Unit quotes (sums pure labour per product + adds maximum travel once).
 */
export function computeDeduplicatedInstallCompareAmounts(
  input: DeduplicatedInstallCompareInput
): DeduplicatedInstallCompareResult {
  const win = input.hasWindows
    ? extractWindowInstallComponents(
        input.winTaxTotals,
        input.attachedWindowQuote,
        Boolean(input.isWinSupplyOnly),
        input.winOverrideLabourDollars,
        input.winOverrideMiscDollars
      )
    : { pureLabour: 0, travel: 0, misc: 0, installJC: 0 }

  const door = input.hasDoors
    ? extractDoorInstallComponents(
        input.doorTotals,
        input.attachedDoorQuote,
        Boolean(input.isDoorSupplyOnly),
        input.doorOverrideLabourDollars,
        input.doorOverrideMiscDollars
      )
    : { pureLabour: 0, travel: 0, misc: 0 }

  const su = input.hasSealedUnits
    ? extractSUInstallComponents(
        input.suTotals,
        input.attachedSealedUnit,
        Boolean(input.isSUSupplyOnly)
      )
    : { pureLabour: 0, travel: 0, misc: 0 }

  const maxTravel = Math.max(win.travel, door.travel, su.travel)
  const compareLabourAmount =
    Math.round((win.pureLabour + door.pureLabour + su.pureLabour + maxTravel) * 100) /
    100
  const compareMiscAmount =
    Math.round((win.misc + door.misc + su.misc) * 100) / 100

  return {
    pureWinLabour: Math.round(win.pureLabour * 100) / 100,
    pureDoorLabour: Math.round(door.pureLabour * 100) / 100,
    pureSULabour: Math.round(su.pureLabour * 100) / 100,
    maxTravel: Math.round(maxTravel * 100) / 100,
    compareLabourAmount,
    compareMiscAmount,
    installJCAmount: Math.round(win.installJC * 100) / 100,
  }
}
