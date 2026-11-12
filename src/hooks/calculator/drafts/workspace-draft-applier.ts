"use client"

import { UseCalculatorDraftsWorkspace } from "./types"

export function applyDraftDataToWorkspace(
  workspace: UseCalculatorDraftsWorkspace,
  d: any,
  setLoadedDraftTaxTotals?: (totals: any | null) => void
) {
  if (!d) return

  if (d.quoteNumber) workspace.setQuoteNumber(d.quoteNumber)
  if (d.customerName !== undefined) workspace.setCustomerName(d.customerName)
  if (d.quoteNotes !== undefined) workspace.setQuoteNotes(d.quoteNotes)
  if (d.surchargeRate !== undefined) workspace.setSurchargeRate(d.surchargeRate)
  if (Array.isArray(d.windows) && d.windows.length > 0)
    workspace.setWindows(d.windows)
  if (d.activePromoId) workspace.setActivePromoId(d.activePromoId)
  if (d.isSupplyOnly !== undefined) workspace.setIsSupplyOnly(d.isSupplyOnly)
  if (d.supplyJambId !== undefined) workspace.setSupplyJambId(d.supplyJambId)
  if (d.supplyJambRate !== undefined)
    workspace.setSupplyJambRate(d.supplyJambRate)
  if (d.supplyCasingId !== undefined)
    workspace.setSupplyCasingId(d.supplyCasingId)
  if (d.supplyCasingRate !== undefined)
    workspace.setSupplyCasingRate(d.supplyCasingRate)
  if (d.customJC !== undefined)
    workspace.setCustomJC(
      d.customJC !== "" && d.customJC !== null ? String(d.customJC) : ""
    )
  if (d.customMisc !== undefined)
    workspace.setCustomMisc(
      d.customMisc !== "" && d.customMisc !== null ? String(d.customMisc) : ""
    )
  if (d.customLabour !== undefined)
    workspace.setCustomLabour(
      d.customLabour !== "" && d.customLabour !== null
        ? String(d.customLabour)
        : ""
    )
  if (d.includeJCInPromo !== undefined)
    workspace.setIncludeJCInPromo(d.includeJCInPromo)
  if (d.includeMiscInPromo !== undefined)
    workspace.setIncludeMiscInPromo(d.includeMiscInPromo)
  if (d.includeLabourInPromo !== undefined)
    workspace.setIncludeLabourInPromo(d.includeLabourInPromo)
  if (d.hstRate !== undefined) workspace.setHstRate(d.hstRate)
  if (d.attachedUpgrade !== undefined)
    workspace.setAttachedUpgrade(d.attachedUpgrade)
  else workspace.setAttachedUpgrade(null)
  if (d.attachedSealedUnit !== undefined)
    workspace.setAttachedSealedUnit(d.attachedSealedUnit)
  else workspace.setAttachedSealedUnit(null)
  if (d.attachedDoorQuote !== undefined)
    workspace.setAttachedDoorQuote(d.attachedDoorQuote)
  else workspace.setAttachedDoorQuote(null)
  if (d.wantsUpgrade !== undefined)
    workspace.setWantsUpgrade(Boolean(d.wantsUpgrade))
  if (d.taxTotals) {
    workspace.setTaxTotals(d.taxTotals)
    if (setLoadedDraftTaxTotals) {
      setLoadedDraftTaxTotals(d.taxTotals)
    }
  }
}
