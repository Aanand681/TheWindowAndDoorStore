import { toDollars } from "@/lib/promo-logic"

export function computeEffectiveDollars(
  isSupply: boolean,
  taxTotals: any,
  taxJC?: number,
  taxMisc?: number,
  taxLabour?: number,
  customJC = "",
  customMisc = "",
  customLabour = ""
) {
  const hasSupplyJC = isSupply
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

  // Support inputs that may be either raw cents (> 1000) or pure dollars
  const baseJCDollars =
    taxJC !== undefined
      ? taxTotals?.finalJC !== undefined
        ? Number(taxTotals.finalJC)
        : taxJC > 1000
          ? taxJC / 100
          : taxJC
      : 0
  const baseMiscDollars =
    taxMisc !== undefined
      ? taxTotals?.finalMisc !== undefined
        ? Number(taxTotals.finalMisc)
        : taxMisc > 1000
          ? taxMisc / 100
          : taxMisc
      : 0
  const baseLabourDollars =
    taxLabour !== undefined
      ? taxTotals?.finalLabour !== undefined
        ? Number(taxTotals.finalLabour)
        : taxLabour > 1000
          ? taxLabour / 100
          : taxLabour
      : 0

  const effectiveJC = isSupply
    ? hasSupplyJC
      ? customJC !== ""
        ? toDollars(customJC)
        : baseJCDollars
      : 0
    : customJC !== ""
      ? toDollars(customJC)
      : baseJCDollars

  const effectiveMisc = isSupply
    ? customMisc !== ""
      ? toDollars(customMisc)
      : 0
    : customMisc !== ""
      ? toDollars(customMisc)
      : baseMiscDollars

  const effectiveLabour = isSupply
    ? 0
    : customLabour !== ""
      ? toDollars(customLabour)
      : baseLabourDollars

  return {
    hasSupplyJC,
    effectiveJC,
    effectiveMisc,
    effectiveLabour,
    effectiveJCCents: Math.round(effectiveJC * 100),
    effectiveMiscCents: Math.round(effectiveMisc * 100),
    effectiveLabourCents: Math.round(effectiveLabour * 100),
  }
}
