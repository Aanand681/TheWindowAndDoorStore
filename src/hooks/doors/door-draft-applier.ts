"use client"

import { QuoteDraftItem, clearActiveAutoSave } from "@/lib/quote-drafts-storage"
import type { CustomMaterialItem } from "@/types/calculator"
import {
  writeSessionAttachedInstallOption,
  writeSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface DoorWorkspaceSetters {
  setCustomerName: (name: string) => void
  setQuoteNumber: (num: string) => void
  setMode: (mode: any) => void
  setLineItems: (items: any[]) => void
  setGlobalUpcharges: (u: any[]) => void
  setSelectedRegionId?: (id: string) => void
  resetRegionToDefault?: () => void
  setTravelFeeType: (t: any) => void
  setCustomTravelFee: (f: string) => void
  setShowOutTownTravel: (show: boolean) => void
  setTravelKm: (km: string) => void
  setCrewHours: (h: string) => void
  setCrewSize: (s: "2" | "3") => void
  setQuoteNotes: (notes: string) => void
  setIsFirstNation: (fn: boolean) => void
  setHstRate?: (rate: number) => void
  setCustomLabour: (l: string) => void
  setCustomMisc: (m: string) => void
  setCustomDiscount?: (d: string) => void
  setCustomDiscountLabel?: (l: string) => void
  setLoyaltyDiscount?: (l: string) => void
  setLoyaltyDiscountLabel?: (l: string) => void
  setDiscountType?: (t: "none" | "custom" | "loyalty") => void
  setLoyaltyPoints?: (p: number) => void
  setLoyaltyGrossAmount?: (a: number) => void
  setCustomMaterials?: (m: CustomMaterialItem[]) => void
  setAttachedWindowQuote: (q: any) => void
  setAttachedSealedUnit: (u: any) => void
}

export function applyDoorDraftToWorkspace(
  draft: QuoteDraftItem,
  setters: DoorWorkspaceSetters
) {
  const d = draft.data as any
  if (!d) return

  if (d.customerName) setters.setCustomerName(d.customerName)
  if (d.quoteNumber) setters.setQuoteNumber(d.quoteNumber)
  if (d.mode) setters.setMode(d.mode)
  if (Array.isArray(d.lineItems)) setters.setLineItems(d.lineItems)
  if (Array.isArray(d.globalUpcharges))
    setters.setGlobalUpcharges(d.globalUpcharges)
  if (d.selectedRegionId && setters.setSelectedRegionId) {
    setters.setSelectedRegionId(d.selectedRegionId)
  }
  if (d.travelFeeType) setters.setTravelFeeType(d.travelFeeType)
  if (d.customTravelFee !== undefined) {
    setters.setCustomTravelFee(d.customTravelFee)
  }
  if (d.showOutTownTravel !== undefined) {
    setters.setShowOutTownTravel(d.showOutTownTravel)
  }
  if (d.travelKm !== undefined) setters.setTravelKm(d.travelKm)
  if (d.crewHours !== undefined) setters.setCrewHours(d.crewHours)
  if (d.crewSize) setters.setCrewSize(d.crewSize)
  if (d.quoteNotes !== undefined) setters.setQuoteNotes(d.quoteNotes)
  if (d.hstRate !== undefined && setters.setHstRate) {
    setters.setHstRate(Number(d.hstRate))
    setters.setIsFirstNation(Number(d.hstRate) === 8)
  } else if (d.isFirstNation !== undefined) {
    setters.setIsFirstNation(d.isFirstNation)
  }
  setters.setCustomLabour(
    d.customLabour !== undefined ? String(d.customLabour) : ""
  )
  setters.setCustomMisc(
    d.customMisc !== undefined ? String(d.customMisc) : ""
  )
  setters.setCustomDiscount?.(
    d.customDiscount !== undefined ? String(d.customDiscount) : ""
  )
  setters.setCustomDiscountLabel?.(d.customDiscountLabel || "")
  setters.setLoyaltyDiscount?.(
    d.loyaltyDiscount !== undefined ? String(d.loyaltyDiscount) : ""
  )
  setters.setLoyaltyDiscountLabel?.(d.loyaltyDiscountLabel || "")
  setters.setDiscountType?.(d.discountType || "none")
  setters.setLoyaltyPoints?.(Number(d.loyaltyPoints) || 0)
  setters.setLoyaltyGrossAmount?.(Number(d.loyaltyGrossAmount) || 0)
  const restoredMats = Array.isArray(d.customMaterials)
    ? d.customMaterials
    : Array.isArray(d.totals?.customMaterials)
      ? d.totals.customMaterials
      : []
  setters.setCustomMaterials?.(restoredMats)
  setters.setAttachedWindowQuote(
    d.attachedWindowQuote !== undefined ? d.attachedWindowQuote : null
  )
  setters.setAttachedSealedUnit(
    d.attachedSealedUnit !== undefined ? d.attachedSealedUnit : null
  )

  writeSessionAttachedInstallOption(d.attachedInstallOption ?? null, "door")
  writeSessionCustomOptions(
    Array.isArray(d.customOptions) ? d.customOptions : [],
    "door"
  )
}

export interface DoorResetWorkspaceParams {
  setters: DoorWorkspaceSetters
  setEditingItem: (item: any) => void
  setLastSavedAt: (time: string | null) => void
  setShowResetModal: (show: boolean) => void
}

export function resetDoorWorkspace({
  setters,
  setEditingItem,
  setLastSavedAt,
  setShowResetModal,
}: DoorResetWorkspaceParams) {
  setters.setLineItems([])
  setEditingItem(null)
  setters.setMode("installation")
  setters.setGlobalUpcharges([])
  setters.resetRegionToDefault?.()
  setters.setTravelFeeType("local_std")
  setters.setCustomTravelFee("")
  setters.setShowOutTownTravel(false)
  setters.setTravelKm("")
  setters.setCrewHours("")
  setters.setCrewSize("3")
  setters.setQuoteNotes("")
  setters.setIsFirstNation(false)
  setters.setCustomLabour("")
  setters.setCustomMisc("")
  setters.setCustomDiscount?.("")
  setters.setCustomDiscountLabel?.("")
  setters.setLoyaltyDiscount?.("")
  setters.setLoyaltyDiscountLabel?.("")
  setters.setDiscountType?.("none")
  setters.setLoyaltyPoints?.(0)
  setters.setLoyaltyGrossAmount?.(0)
  setters.setCustomMaterials?.([])
  setters.setHstRate?.(13)
  setters.setCustomerName("")
  setters.setQuoteNumber("")
  setters.setAttachedWindowQuote(null)
  setters.setAttachedSealedUnit(null)
  writeSessionAttachedInstallOption(null, "door")
  writeSessionCustomOptions([], "door")
  clearActiveAutoSave("door")
  setLastSavedAt(null)
  setShowResetModal(false)
}

