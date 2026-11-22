import { toCents } from "@/lib/promo-logic"

export function computeEffectiveCents(
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

  const effectiveJCCents = isSupply
    ? hasSupplyJC
      ? customJC !== ""
        ? toCents(customJC)
        : taxJC || 0
      : 0
    : customJC !== ""
      ? toCents(customJC)
      : taxJC || 0

  const effectiveMiscCents = isSupply
    ? customMisc !== ""
      ? toCents(customMisc)
      : 0
    : customMisc !== ""
      ? toCents(customMisc)
      : taxMisc || 0

  const effectiveLabourCents = isSupply
    ? 0
    : customLabour !== ""
      ? toCents(customLabour)
      : taxLabour || 0

  return {
    hasSupplyJC,
    effectiveJCCents,
    effectiveMiscCents,
    effectiveLabourCents,
  }
}
