import { DoorQuotingMode, DoorLineItem } from "@/lib/doors/types"
import { QuoteDraftItem } from "@/lib/quote-drafts-storage"

export interface UseDoorDraftsProps {
  customerName: string
  setCustomerName: (name: string) => void
  quoteNumber: string
  setQuoteNumber: (num: string) => void
  mode: any
  setMode: (mode: any) => void
  lineItems: any[]
  setLineItems: (items: any[]) => void
  setEditingItem: (item: any) => void
  globalUpcharges: any[]
  setGlobalUpcharges: (u: any[]) => void
  selectedRegionId?: string
  setSelectedRegionId?: (id: string) => void
  travelFeeType: any
  setTravelFeeType: (t: any) => void
  customTravelFee: string
  setCustomTravelFee: (f: string) => void
  showOutTownTravel: boolean
  setShowOutTownTravel: (show: boolean) => void
  travelKm: string
  setTravelKm: (km: string) => void
  crewHours: string
  setCrewHours: (h: string) => void
  crewSize: "2" | "3"
  setCrewSize: (s: "2" | "3") => void
  quoteNotes: string
  setQuoteNotes: (notes: string) => void
  isFirstNation: boolean
  setIsFirstNation: (fn: boolean) => void
  customLabour: string
  setCustomLabour: (l: string) => void
  customMisc: string
  setCustomMisc: (m: string) => void
  attachedWindowQuote: any
  setAttachedWindowQuote: (q: any) => void
  attachedSealedUnit: any
  setAttachedSealedUnit: (u: any) => void
  totals: any
  setLastSavedAt: (time: string | null) => void
}
