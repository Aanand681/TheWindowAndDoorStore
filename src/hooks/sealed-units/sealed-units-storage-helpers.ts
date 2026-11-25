import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { SealedUnitTotals, SealedUnitUpcharge } from "@/components/sealed-units/types"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
  writeSessionAttachedInstallOption,
  writeSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

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
  extraLabour?: string
  globalUpcharges?: SealedUnitUpcharge[]
  customMaterials?: any[]
  loyaltyDiscount?: string
  loyaltyDiscountLabel?: string
  discountType?: "none" | "custom" | "loyalty"
  loyaltyPoints?: number
  loyaltyGrossAmount?: number
  hstRate: number
  selectedRegionId?: string
  regionName?: string
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
  optionsHash?: string
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
    extraLabour: params.extraLabour || "",
    globalUpcharges: params.globalUpcharges || [],
    customMaterials: params.customMaterials || [],
    loyaltyDiscount: params.loyaltyDiscount || "",
    loyaltyDiscountLabel: params.loyaltyDiscountLabel || "",
    discountType: params.discountType || "none",
    loyaltyPoints: params.loyaltyPoints || 0,
    loyaltyGrossAmount: params.loyaltyGrossAmount || 0,
    hstRate: params.hstRate,
    selectedRegionId: params.selectedRegionId || "",
    regionName: params.regionName || "",
    attachedWindowQuote: params.attachedWindowQuote || null,
    attachedDoorQuote: params.attachedDoorQuote || null,
    optionsHash: params.optionsHash || "",
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
  setExtraLabour?: (val: string) => void
  setGlobalUpcharges?: (val: SealedUnitUpcharge[]) => void
  setCustomMaterials?: (val: any[]) => void
  setLoyaltyDiscount?: (val: string) => void
  setLoyaltyDiscountLabel?: (val: string) => void
  setDiscountType?: (val: "none" | "custom" | "loyalty") => void
  setLoyaltyPoints?: (val: number) => void
  setLoyaltyGrossAmount?: (val: number) => void
  setHstRate: (val: number) => void
  setSelectedRegionId?: (val: string) => void
  regions?: any[]
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
  if (Array.isArray(d.globalUpcharges) && setters.setGlobalUpcharges) {
    setters.setGlobalUpcharges(d.globalUpcharges)
  } else if (d.extraLabour !== undefined && setters.setExtraLabour) {
    setters.setExtraLabour(String(d.extraLabour))
    if (d.extraLabour && setters.setGlobalUpcharges) {
      setters.setGlobalUpcharges([
        { id: "addon_legacy", label: "Extra Labour", price: String(d.extraLabour) }
      ])
    }
  }
  const restoredMats = Array.isArray(d.customMaterials)
    ? d.customMaterials
    : Array.isArray(d.totals?.customMaterials)
      ? d.totals.customMaterials
      : []
  setters.setCustomMaterials?.(restoredMats)
  const restoredLoyalty =
    d.loyaltyDiscount !== undefined
      ? d.loyaltyDiscount
      : d.totals?.loyaltyDiscount
  if (restoredLoyalty !== undefined) {
    const numLoyalty = parseFloat(String(restoredLoyalty)) || 0
    setters.setLoyaltyDiscount?.(numLoyalty > 0 ? String(restoredLoyalty) : "")
  } else {
    setters.setLoyaltyDiscount?.("")
  }
  setters.setLoyaltyDiscountLabel?.(
    String(d.loyaltyDiscountLabel ?? d.totals?.loyaltyDiscountLabel ?? "")
  )
  setters.setDiscountType?.(
    (d.discountType ?? d.totals?.discountType ?? "none") as
      | "none"
      | "custom"
      | "loyalty"
  )
  setters.setLoyaltyPoints?.(
    Number(d.loyaltyPoints ?? d.totals?.loyaltyPoints ?? 0) || 0
  )
  setters.setLoyaltyGrossAmount?.(
    Number(d.loyaltyGrossAmount ?? d.totals?.loyaltyGrossAmount ?? 0) || 0
  )
  if (d.hstRate !== undefined) setters.setHstRate(d.hstRate)
  if (setters.setSelectedRegionId) {
    if (d.selectedRegionId) {
      setters.setSelectedRegionId(d.selectedRegionId)
    } else if (d.regionName && Array.isArray(setters.regions)) {
      const match = setters.regions.find((r: any) =>
        r.name?.toLowerCase().includes(d.regionName.toLowerCase())
      )
      if (match) setters.setSelectedRegionId(match._id)
    }
  }
  if (d.attachedWindowQuote !== undefined)
    setters.setAttachedWindowQuote(d.attachedWindowQuote)
  if (d.attachedDoorQuote !== undefined)
    setters.setAttachedDoorQuote(d.attachedDoorQuote)
  if (d.attachedInstallOption !== undefined) {
    writeSessionAttachedInstallOption(d.attachedInstallOption ?? null)
  }
  if (d.customOptions !== undefined) {
    writeSessionCustomOptions(
      Array.isArray(d.customOptions) ? d.customOptions : []
    )
  }
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
    extraLabour: params.extraLabour || "",
    globalUpcharges: params.globalUpcharges || [],
    customMaterials: params.customMaterials || [],
    loyaltyDiscount: params.loyaltyDiscount || "",
    loyaltyDiscountLabel: params.loyaltyDiscountLabel || "",
    discountType: params.discountType || "none",
    loyaltyPoints: params.loyaltyPoints || 0,
    loyaltyGrossAmount: params.loyaltyGrossAmount || 0,
    hstRate: params.hstRate,
    selectedRegionId: params.selectedRegionId || "",
    regionName: params.regionName || "",
    attachedWindowQuote: params.attachedWindowQuote || null,
    attachedDoorQuote: params.attachedDoorQuote || null,
    attachedInstallOption: readSessionAttachedInstallOption(),
    customOptions: readSessionCustomOptions(),
    subtotal: params.totals.subtotalPreTax || 0,
    grandTotal: params.totals.grandTotal || 0,
    itemCount: params.lineItems.length,
    totals: params.totals,
  }
}
