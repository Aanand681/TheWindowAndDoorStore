import { WorkspaceSetters } from "./sealed-units-storage-helpers"

export function createWorkspaceSetters(
  drafts: any,
  travel: any,
  setLineItems: (items: any) => void
): WorkspaceSetters {
  return {
    setQuoteNumber: drafts.setQuoteNumber,
    setCustomerName: drafts.setCustomerName,
    setQuoteNotes: drafts.setQuoteNotes,
    setLineItems,
    setSealedUnitMode: travel.handleSetSealedUnitMode,
    setIsInstallation: travel.setIsInstallation,
    setServiceSqftInput: travel.setServiceSqftInput,
    setServiceLabourRateInput: travel.setServiceLabourRateInput,
    setServiceMiscRateInput: travel.setServiceMiscRateInput,
    setTravelFeeType: travel.setTravelFeeType,
    setCustomTravelFee: travel.setCustomTravelFee,
    setShowOutTownTravel: travel.setShowOutTownTravel,
    setTravelKm: travel.setTravelKm,
    setCrewHours: travel.setCrewHours,
    setCrewSize: travel.setCrewSize,
    setExtraLabour: travel.setExtraLabour,
    setGlobalUpcharges: travel.setGlobalUpcharges,
    setHstRate: travel.setHstRate,
    setSelectedRegionId: travel.setSelectedRegionId,
    regions: travel.regions,
    setAttachedWindowQuote: drafts.setAttachedWindowQuote,
    setAttachedDoorQuote: drafts.setAttachedDoorQuote,
  }
}
