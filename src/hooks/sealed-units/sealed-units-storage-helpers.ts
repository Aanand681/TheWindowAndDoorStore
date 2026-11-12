import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { SealedUnitTotals } from "@/components/sealed-units/invoice/types"

export interface SealedUnitSnapshotParams {
  quoteNumber: string
  customerName: string
  lineItems: SealedUnitLineItem[]
  sealedUnitMode: "installation" | "supply_only" | "service_only"
  isInstallation: boolean
  serviceSqftInput: string
  serviceLabourRateInput: string
  serviceMiscRateInput: string
  travelFeeType: "none" | "local_std" | "far_std" | "far_small" | "custom"
  customTravelFee: string
  showOutTownTravel: boolean
  travelKm: string
  crewHours: string
  crewSize: "2" | "3"
  hstRate: number
  selectedRegionId?: string
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
}

export function serializeSealedUnitSnapshot(
  params: SealedUnitSnapshotParams
): string {
  return JSON.stringify({
    quoteNumber: params.quoteNumber.trim(),
    customerName: params.customerName.trim(),
    lineItems: params.lineItems,
    sealedUnitMode: params.sealedUnitMode,
    isInstallation: params.isInstallation,
    serviceSqftInput: params.serviceSqftInput,
    serviceLabourRateInput: params.serviceLabourRateInput,
    serviceMiscRateInput: params.serviceMiscRateInput,
    travelFeeType: params.travelFeeType,
    customTravelFee: params.customTravelFee,
    showOutTownTravel: params.showOutTownTravel,
    travelKm: params.travelKm,
    crewHours: params.crewHours,
    crewSize: params.crewSize,
    hstRate: params.hstRate,
    attachedWindowQuote: params.attachedWindowQuote || null,
    attachedDoorQuote: params.attachedDoorQuote || null,
  })
}

export interface WorkspaceSetters {
  setQuoteNumber: (val: string) => void
  setCustomerName: (val: string) => void
  setQuoteNotes: (val: string) => void
  setLineItems: React.Dispatch<React.SetStateAction<SealedUnitLineItem[]>>
  setSealedUnitMode: (
    mode: "installation" | "supply_only" | "service_only"
  ) => void
  setIsInstallation: (val: boolean) => void
  setServiceSqftInput: (val: string) => void
  setServiceLabourRateInput: (val: string) => void
  setServiceMiscRateInput: (val: string) => void
  setTravelFeeType: (
    val: "none" | "local_std" | "far_std" | "far_small" | "custom"
  ) => void
  setCustomTravelFee: (val: string) => void
  setShowOutTownTravel: (val: boolean) => void
  setTravelKm: (val: string) => void
  setCrewHours: (val: string) => void
  setCrewSize: (val: "2" | "3") => void
  setHstRate: (val: number) => void
  setSelectedRegionId?: (val: string) => void
  setAttachedWindowQuote: (val: any) => void
  setAttachedDoorQuote: (val: any) => void
}

export function applyDraftDataToWorkspace(d: any, setters: WorkspaceSetters) {
  if (!d) return
  if (d.quoteNumber) setters.setQuoteNumber(d.quoteNumber)
  if (d.customerName !== undefined) setters.setCustomerName(d.customerName)
  if (d.quoteNotes !== undefined) setters.setQuoteNotes(d.quoteNotes)
  if (Array.isArray(d.lineItems)) setters.setLineItems(d.lineItems)
  if (d.sealedUnitMode) {
    setters.setSealedUnitMode(d.sealedUnitMode)
  } else if (d.isInstallation !== undefined) {
    setters.setIsInstallation(d.isInstallation)
  }
  if (d.serviceSqftInput !== undefined)
    setters.setServiceSqftInput(d.serviceSqftInput)
  if (d.serviceLabourRateInput !== undefined)
    setters.setServiceLabourRateInput(d.serviceLabourRateInput)
  if (d.serviceMiscRateInput !== undefined)
    setters.setServiceMiscRateInput(d.serviceMiscRateInput)
  if (d.travelFeeType !== undefined) setters.setTravelFeeType(d.travelFeeType)
  if (d.customTravelFee !== undefined)
    setters.setCustomTravelFee(d.customTravelFee)
  if (d.showOutTownTravel !== undefined)
    setters.setShowOutTownTravel(d.showOutTownTravel)
  if (d.travelKm !== undefined) setters.setTravelKm(d.travelKm)
  if (d.crewHours !== undefined) setters.setCrewHours(d.crewHours)
  if (d.crewSize !== undefined) setters.setCrewSize(d.crewSize)
  if (d.hstRate !== undefined) setters.setHstRate(d.hstRate)
  if (d.selectedRegionId && setters.setSelectedRegionId)
    setters.setSelectedRegionId(d.selectedRegionId)
  if (d.attachedWindowQuote !== undefined)
    setters.setAttachedWindowQuote(d.attachedWindowQuote)
  if (d.attachedDoorQuote !== undefined)
    setters.setAttachedDoorQuote(d.attachedDoorQuote)
}

export function createDraftSavePayload(
  params: SealedUnitSnapshotParams & {
    quoteNotes: string
    totals: SealedUnitTotals
  }
) {
  return {
    quoteNumber: params.quoteNumber,
    customerName: params.customerName.trim(),
    quoteNotes: params.quoteNotes,
    lineItems: params.lineItems,
    sealedUnitMode: params.sealedUnitMode,
    isInstallation: params.isInstallation,
    serviceSqftInput: params.serviceSqftInput,
    serviceLabourRateInput: params.serviceLabourRateInput,
    serviceMiscRateInput: params.serviceMiscRateInput,
    travelFeeType: params.travelFeeType,
    customTravelFee: params.customTravelFee,
    showOutTownTravel: params.showOutTownTravel,
    travelKm: params.travelKm,
    crewHours: params.crewHours,
    crewSize: params.crewSize,
    hstRate: params.hstRate,
    attachedWindowQuote: params.attachedWindowQuote || null,
    attachedDoorQuote: params.attachedDoorQuote || null,
    subtotal: params.totals.subtotalPreTax || 0,
    grandTotal: params.totals.grandTotal || 0,
    itemCount: params.lineItems.length,
    totals: params.totals,
  }
}
