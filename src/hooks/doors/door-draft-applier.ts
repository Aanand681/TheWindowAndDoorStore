"use client"

import { QuoteDraftItem } from "@/lib/quote-drafts-storage"
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
  setTravelFeeType: (t: any) => void
  setCustomTravelFee: (f: string) => void
  setShowOutTownTravel: (show: boolean) => void
  setTravelKm: (km: string) => void
  setCrewHours: (h: string) => void
  setCrewSize: (s: "2" | "3") => void
  setQuoteNotes: (notes: string) => void
  setIsFirstNation: (fn: boolean) => void
  setCustomLabour: (l: string) => void
  setCustomMisc: (m: string) => void
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
  if (d.isFirstNation !== undefined) setters.setIsFirstNation(d.isFirstNation)
  setters.setCustomLabour(
    d.customLabour !== undefined ? String(d.customLabour) : ""
  )
  setters.setCustomMisc(
    d.customMisc !== undefined ? String(d.customMisc) : ""
  )
  setters.setAttachedWindowQuote(
    d.attachedWindowQuote !== undefined ? d.attachedWindowQuote : null
  )
  setters.setAttachedSealedUnit(
    d.attachedSealedUnit !== undefined ? d.attachedSealedUnit : null
  )

  writeSessionAttachedInstallOption(d.attachedInstallOption ?? null)
  writeSessionCustomOptions(
    Array.isArray(d.customOptions) ? d.customOptions : []
  )
}

