/**
 * Pure TypeScript helper to compare an original/baseline quote state with a current state
 * and return human-readable diff bullet points detailing everything that changed.
 * Safe for both Client and Server environments.
 */

import {
  fmtDollar as fmt,
  cleanJambLabel,
  cleanCasingLabel,
  detectWindowDiffs,
  detectAddonDiffs,
  normalizeDiffTotalCents,
} from "./quote-diff-helpers"

export { normalizeDiffTotalCents }

export function detectQuoteChanges(original: any, current: any): string[] {
  if (!original || !current) return []
  const changes: string[] = []

  // 1. Custom Misc Price Override
  const origCustomMiscStr = String(original.customMisc ?? "").trim()
  const curCustomMiscStr = String(current.customMisc ?? "").trim()
  const origCustomMisc = origCustomMiscStr !== "" ? Number(origCustomMiscStr) : null
  const curCustomMisc = curCustomMiscStr !== "" ? Number(curCustomMiscStr) : null
  const origTaxMisc = Number(original.taxTotals?.finalMisc ?? original.taxTotals?.miscTotal ?? 0)
  const curTaxMisc = Number(current.taxTotals?.finalMisc ?? current.taxTotals?.miscTotal ?? 0)

  if (curCustomMisc !== null && origCustomMisc === null) {
    changes.push(`Custom Misc price override set to ${fmt(curCustomMisc)} (was calculated as ${fmt(origTaxMisc)})`)
  } else if (curCustomMisc !== null && origCustomMisc !== null && Math.abs(curCustomMisc - origCustomMisc) > 0.01) {
    changes.push(`Custom Misc price updated from ${fmt(origCustomMisc)} to ${fmt(curCustomMisc)}`)
  } else if (curCustomMisc === null && origCustomMisc !== null) {
    changes.push(`Custom Misc override removed (reverted to tax calculation ${fmt(curTaxMisc)})`)
  }

  // 2. Custom JC (Jambs & Casing) Override
  const origCustomJCStr = String(original.customJC ?? "").trim()
  const curCustomJCStr = String(current.customJC ?? "").trim()
  const origCustomJC = origCustomJCStr !== "" ? Number(origCustomJCStr) : null
  const curCustomJC = curCustomJCStr !== "" ? Number(curCustomJCStr) : null
  const origTaxJC = Number(original.taxTotals?.finalJC ?? original.taxTotals?.jcTotal ?? 0)
  const curTaxJC = Number(current.taxTotals?.finalJC ?? current.taxTotals?.jcTotal ?? 0)

  if (curCustomJC !== null && origCustomJC === null) {
    changes.push(`Custom Jambs & Casing override set to ${fmt(curCustomJC)} (was calculated as ${fmt(origTaxJC)})`)
  } else if (curCustomJC !== null && origCustomJC !== null && Math.abs(curCustomJC - origCustomJC) > 0.01) {
    changes.push(`Custom Jambs & Casing updated from ${fmt(origCustomJC)} to ${fmt(curCustomJC)}`)
  } else if (curCustomJC === null && origCustomJC !== null) {
    changes.push(`Custom Jambs & Casing override removed (reverted to calculated ${fmt(curTaxJC)})`)
  }

  // 2b. Jamb & Casing Selection Diffs
  const origJambName = (original.taxTotals?.selectedJamb?.name || original.taxTotals?.jambName || (original.taxTotals?.selectedJamb === null ? "None" : "")).trim()
  const curJambName = (current.taxTotals?.selectedJamb?.name || current.taxTotals?.jambName || (current.taxTotals?.selectedJamb === null ? "None" : "")).trim()
  if (origJambName && curJambName && origJambName.toLowerCase() !== curJambName.toLowerCase()) {
    changes.push(`Jambs changed to ${cleanJambLabel(curJambName)} from ${cleanJambLabel(origJambName)}`)
  }

  const origCasingName = (original.taxTotals?.selectedCasing?.name || original.taxTotals?.casingName || (original.taxTotals?.selectedCasing === null ? "None" : "")).trim()
  const curCasingName = (current.taxTotals?.selectedCasing?.name || current.taxTotals?.casingName || (current.taxTotals?.selectedCasing === null ? "None" : "")).trim()
  if (origCasingName && curCasingName && origCasingName.toLowerCase() !== curCasingName.toLowerCase()) {
    changes.push(`Casing changed to ${cleanCasingLabel(curCasingName)} from ${cleanCasingLabel(origCasingName)}`)
  }

  // 3. Custom Labour Override
  const origCustomLabourStr = String(original.customLabour ?? "").trim()
  const curCustomLabourStr = String(current.customLabour ?? "").trim()
  const origCustomLabour = origCustomLabourStr !== "" ? Number(origCustomLabourStr) : null
  const curCustomLabour = curCustomLabourStr !== "" ? Number(curCustomLabourStr) : null
  const origTaxLabour = Number(original.taxTotals?.finalLabour ?? original.taxTotals?.labourTotal ?? 0)
  const curTaxLabour = Number(current.taxTotals?.finalLabour ?? current.taxTotals?.labourTotal ?? 0)

  if (curCustomLabour !== null && origCustomLabour === null) {
    changes.push(`Custom Labour override set to ${fmt(curCustomLabour)} (was calculated as ${fmt(origTaxLabour)})`)
  } else if (curCustomLabour !== null && origCustomLabour !== null && Math.abs(curCustomLabour - origCustomLabour) > 0.01) {
    changes.push(`Custom Labour updated from ${fmt(origCustomLabour)} to ${fmt(curCustomLabour)}`)
  } else if (curCustomLabour === null && origCustomLabour !== null) {
    changes.push(`Custom Labour override updated (reverted to calculated ${fmt(curTaxLabour)})`)
  }

  // 4. Base Window Total Price
  const origBase = Number(original.quoteResult?.base ?? 0)
  const curBase = Number(current.quoteResult?.base ?? 0)
  if (origBase > 0 && curBase > 0 && Math.abs(origBase - curBase) > 0) {
    changes.push(`Base window total updated from ${fmt(origBase / 100)} to ${fmt(curBase / 100)}`)
  }

  // 5. Window Items inspection
  const origWindows = Array.isArray(original.windows) ? original.windows : []
  const curWindows = Array.isArray(current.windows) ? current.windows : []
  changes.push(...detectWindowDiffs(origWindows, curWindows))

  // 6. Travel and Setup
  const origTravel = (Number(original.taxTotals?.vehicle) || 0) + (Number(original.taxTotals?.crewTravel) || 0) + (Number(original.taxTotals?.setup) || 0)
  const curTravel = (Number(current.taxTotals?.vehicle) || 0) + (Number(current.taxTotals?.crewTravel) || 0) + (Number(current.taxTotals?.setup) || 0)
  if (Math.abs(origTravel - curTravel) > 0.5) {
    changes.push(`Travel & Setup fee updated from ${fmt(origTravel)} to ${fmt(curTravel)}`)
  }

  // 7. Addons and Extras
  const origAddons = Array.isArray(original.taxTotals?.selectedAddons) ? original.taxTotals.selectedAddons : []
  const curAddons = Array.isArray(current.taxTotals?.selectedAddons) ? current.taxTotals.selectedAddons : []
  changes.push(...detectAddonDiffs(origAddons, curAddons))

  // 8. Surcharge Rate
  if (original.surchargeRate !== undefined && current.surchargeRate !== undefined && Number(original.surchargeRate) !== Number(current.surchargeRate)) {
    changes.push(`Surcharge rate updated from ${original.surchargeRate}% to ${current.surchargeRate}%`)
  }

  // 9. Promotion
  if (original.activePromoId && current.activePromoId && original.activePromoId !== current.activePromoId) {
    changes.push(`Promotion updated to ${current.quoteResult?.promoName || current.activePromoId}`)
  }

  // 10. Discount
  const origDiscount = Number(original.taxTotals?.discount) || 0
  const curDiscount = Number(current.taxTotals?.discount) || 0
  if (Math.abs(origDiscount - curDiscount) > 0.01) {
    changes.push(`Discount updated from ${fmt(origDiscount)} to ${fmt(curDiscount)}`)
  }

  // 11. Total Quote Price (Overall Summary - only if no specific itemized change was found)
  let origTotal = Number(original.quoteSummaryTotal ?? 0)
  const curTotal = Number(current.quoteSummaryTotal ?? 0)

  // Normalize legacy snapshots if origTotal was saved in raw dollars instead of cents
  origTotal = normalizeDiffTotalCents(origTotal, curTotal)

  if (changes.length === 0 && origTotal > 0 && curTotal > 0 && Math.abs(origTotal - curTotal) > 0) {
    const diff = (curTotal - origTotal) / 100
    const sign = diff > 0 ? `+${fmt(diff)}` : `-${fmt(Math.abs(diff))}`
    changes.push(`Quote Total updated from ${fmt(origTotal / 100)} to ${fmt(curTotal / 100)} (${sign})`)
  }

  return changes
}
