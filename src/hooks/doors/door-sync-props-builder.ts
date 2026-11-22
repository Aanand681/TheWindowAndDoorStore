import { DoorLineItem, DoorSelectedUpcharge, DoorQuotingMode } from "@/lib/doors/types"

export interface DoorSharedSyncState {
  customerName: string
  setCustomerName: (v: string) => void
  quoteNumber: string
  setQuoteNumber: (v: string) => void
  mode: DoorQuotingMode
  setMode: (m: DoorQuotingMode) => void
  lineItems: DoorLineItem[]
  setLineItems: React.Dispatch<React.SetStateAction<DoorLineItem[]>>
  globalUpcharges: DoorSelectedUpcharge[]
  setGlobalUpcharges: React.Dispatch<React.SetStateAction<DoorSelectedUpcharge[]>>
  selectedRegionId: string
  setSelectedRegionId: (id: string) => void
  travelFeeType: any
  setTravelFeeType: (t: any) => void
  customTravelFee: string
  setCustomTravelFee: (f: string) => void
  showOutTownTravel: boolean
  setShowOutTownTravel: (s: boolean) => void
  travelKm: string
  setTravelKm: (km: string) => void
  crewHours: string
  setCrewHours: (h: string) => void
  crewSize: "2" | "3"
  setCrewSize: (s: "2" | "3") => void
  quoteNotes: string
  setQuoteNotes: (n: string) => void
  isFirstNation: boolean
  handleToggleFirstNation: (val: boolean) => void
  hstRate: number
  setHstRate: (r: number) => void
  customLabour: string
  setCustomLabour: (l: string) => void
  customMisc: string
  setCustomMisc: (m: string) => void
  customDiscount: string
  setCustomDiscount: (d: string) => void
  attachedWindowQuote: any
  setAttachedWindowQuote: (q: any) => void
  attachedSealedUnit: any
  setAttachedSealedUnit: (u: any) => void
  totals: any
}

export function buildDoorSharedSyncProps(state: DoorSharedSyncState) {
  return {
    customerName: state.customerName,
    setCustomerName: state.setCustomerName,
    quoteNumber: state.quoteNumber,
    setQuoteNumber: state.setQuoteNumber,
    mode: state.mode,
    setMode: state.setMode,
    lineItems: state.lineItems,
    setLineItems: state.setLineItems,
    globalUpcharges: state.globalUpcharges,
    setGlobalUpcharges: state.setGlobalUpcharges,
    selectedRegionId: state.selectedRegionId,
    setSelectedRegionId: state.setSelectedRegionId,
    travelFeeType: state.travelFeeType,
    setTravelFeeType: state.setTravelFeeType,
    customTravelFee: state.customTravelFee,
    setCustomTravelFee: state.setCustomTravelFee,
    showOutTownTravel: state.showOutTownTravel,
    setShowOutTownTravel: state.setShowOutTownTravel,
    travelKm: state.travelKm,
    setTravelKm: state.setTravelKm,
    crewHours: state.crewHours,
    setCrewHours: state.setCrewHours,
    crewSize: state.crewSize,
    setCrewSize: state.setCrewSize,
    quoteNotes: state.quoteNotes,
    setQuoteNotes: state.setQuoteNotes,
    isFirstNation: state.isFirstNation,
    setIsFirstNation: state.handleToggleFirstNation,
    hstRate: state.hstRate,
    setHstRate: state.setHstRate,
    customLabour: state.customLabour,
    setCustomLabour: state.setCustomLabour,
    customMisc: state.customMisc,
    setCustomMisc: state.setCustomMisc,
    customDiscount: state.customDiscount,
    setCustomDiscount: state.setCustomDiscount,
    attachedWindowQuote: state.attachedWindowQuote,
    setAttachedWindowQuote: state.setAttachedWindowQuote,
    attachedSealedUnit: state.attachedSealedUnit,
    setAttachedSealedUnit: state.setAttachedSealedUnit,
    totals: state.totals,
  }
}
