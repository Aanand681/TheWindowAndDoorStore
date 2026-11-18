import { describe, it, expect } from "vitest"
import { mapSavedWindowToDoorLineItem } from "@/hooks/doors/door-review-loader"
import { buildDoorUpdatePayload } from "@/hooks/doors/door-review-payload"
import { buildSealedUnitsUpdatePayload } from "@/hooks/sealed-units/sealed-units-review-payload"
import { computeQuotePricing } from "@/components/quotes/tab/quote-pricing-helper"
import { DoorPreset, DoorFormulaSettings } from "@/lib/doors/types"

describe("Polymorphic Quote Review & Loaders", () => {
  const mockPresets: DoorPreset[] = [
    {
      id: "preset_1",
      label: "34 x 80 Single Entry Door",
      category: "entry",
      labour: 250,
      misc: 45,
    },
    {
      id: "preset_storm",
      label: "36 x 80 Storm Door",
      category: "storm",
      labour: 120,
      misc: 25,
    },
  ]

  const mockFormula: DoorFormulaSettings = {
    surchargeRate: 8,
    doorDiscountPercent: 10,
    locksetDeadboltPrice: 158,
    customerSuppliedHardwareFee: 80,
  }

  it("accurately reconstructs a DoorLineItem from saved window database structure", () => {
    const rawWindow = {
      id: "door_item_1",
      combinationName: "Front Entry Door",
      doorPresetId: "preset_1",
      category: "entry",
      quantity: 2,
      inksterBasePrice: 1200,
      hardwareType: "standard",
      hardwarePrice: 158,
      lineTotal: 2800,
    }

    const doorItem = mapSavedWindowToDoorLineItem(rawWindow, mockPresets, mockFormula)

    expect(doorItem.id).toBe("door_item_1")
    expect(doorItem.presetId).toBe("preset_1")
    expect(doorItem.presetLabel).toBe("34 x 80 Single Entry Door")
    expect(doorItem.category).toBe("entry")
    expect(doorItem.quantity).toBe(2)
    expect(doorItem.inksterBasePrice).toBe(1200)
    expect(doorItem.surchargeAmount).toBe(96) // 8% of 1200
    expect(doorItem.discountAmount).toBe(120) // 10% of 1200
    expect(doorItem.unitLabour).toBe(250)
    expect(doorItem.unitMisc).toBe(45)
    expect(doorItem.hardwareType).toBe("standard")
    expect(doorItem.hardwarePrice).toBe(158)
  })

  it("handles storm doors without discount correctly", () => {
    const rawWindow = {
      id: "storm_1",
      doorPresetId: "preset_storm",
      quantity: 1,
      inksterBasePrice: 500,
      hardwareType: "none",
    }

    const doorItem = mapSavedWindowToDoorLineItem(rawWindow, mockPresets, mockFormula)

    expect(doorItem.category).toBe("storm")
    expect(doorItem.discountAmount).toBe(0) // Storm doors get 0% discount
    expect(doorItem.surchargeAmount).toBe(40) // 8% of 500
  })

  it("builds a complete Door update payload for PUT /api/quotes/:id", () => {
    const payload = buildDoorUpdatePayload({
      customerName: "Jane Smith",
      quoteNumber: "D-9001",
      quoteNotes: "Leave at rear",
      mode: "installation",
      lineItems: [
        {
          id: "d1",
          presetId: "preset_1",
          presetLabel: "Front Door",
          category: "entry",
          inksterBasePrice: 1000,
          surchargePercent: 8,
          surchargeAmount: 80,
          priceWithSurcharge: 1080,
          discountPercent: 10,
          discountAmount: 100,
          netDoorPrice: 980,
          quantity: 1,
          unitLabour: 200,
          unitMisc: 50,
          hardwareType: "standard",
          hardwarePrice: 158,
          upcharges: [],
          upchargesTotal: 0,
          lineDoorSupplyTotal: 980,
          lineLabourTotal: 200,
          lineMiscTotal: 50,
          lineHardwareTotal: 158,
          lineGrandTotal: 1388,
        },
      ],
      totals: {
        totalDoors: 1,
        totalStormDoors: 0,
        totalUnits: 1,
        rawDoorBaseTotal: 1000,
        surchargeTotal: 80,
        doorWithSurchargeTotal: 1080,
        discountTotal: 100,
        netDoorSupplyTotal: 980,
        stormDoorTotal: 0,
        hardwareTotal: 158,
        hardwareQty: 1,
        unitLabourTotal: 200,
        upchargesTotal: 0,
        miscTotal: 50,
        baseSetupFee: 140,
        additionalFarFee: 0,
        vehicleTravelFee: 0,
        crewTravelFee: 0,
        totalAdditionalTravel: 0,
        totalTravelAndSetup: 140,
        combinedLabourTotal: 340,
        fullInstallLabour: 340,
        fullInstallMisc: 50,
        subtotalPreTax: 1528,
        hstAmount: 198.64,
        grandTotal: 1726.64,
        depositAmount: 863.32,
      },
      globalUpcharges: [],
      travelFeeType: "local_std",
      customTravelFee: "0",
      showOutTownTravel: false,
      travelKm: "0",
      crewHours: "0",
      crewSize: "2",
      isFirstNation: false,
      hstRate: 13,
      customLabour: "",
      customMisc: "",
      attachedWindowQuote: null,
      attachedSealedUnit: null,
      extra: { status: "MODIFIED" },
    })

    expect(payload.quoteType).toBe("door")
    expect(payload.quoteNumber).toBe("D-9001")
    expect(payload.status).toBe("MODIFIED")
    expect(payload.windows.length).toBe(1)
    expect(payload.windows[0].doorPresetId).toBe("preset_1")
    expect(payload.taxTotals.isSupplyOnly).toBe(false)
    expect(payload.taxTotals.grandTotal).toBe(1726.64)
  })

  it("builds a complete Sealed Units update payload with service inputs", () => {
    const payload = buildSealedUnitsUpdatePayload({
      customerName: "Acme Corp",
      quoteNumber: "SU-4002",
      quoteNotes: "Storefront replacement",
      sealedUnitMode: "installation",
      isInstallation: true,
      isServiceOnly: false,
      lineItems: [],
      totals: {
        totalUnits: 0,
        totalSqft: 0,
        totalBillableSqft: 0,
        glassBefore8PercentTotal: 0,
        glass8PercentSurchargeTotal: 0,
        glassSupplyTotal: 0,
        unitLabourSum: 0,
        baseSetupFee: 140,
        additionalFarFee: 0,
        vehicleTravelFee: 0,
        crewTravelFee: 0,
        totalAdditionalTravel: 0,
        totalTravelAndSetup: 140,
        combinedLabourTotal: 140,
        miscTotal: 0,
        subtotalPreTax: 140,
        hstAmount: 18.2,
        grandTotal: 158.2,
        effectiveLabourRate: 14.4,
        effectiveMiscRate: 2.4,
      },
      serviceSqftInput: "50",
      serviceLabourRateInput: "14.4",
      serviceMiscRateInput: "2.4",
      travelFeeType: "local_std",
      customTravelFee: "0",
      showOutTownTravel: false,
      travelKm: "0",
      crewHours: "0",
      crewSize: "2",
      hstRate: 13,
      attachedWindowQuote: null,
      attachedDoorQuote: null,
      extra: { status: "APPROVED" },
    })

    expect(payload.quoteType).toBe("sealed_unit")
    expect(payload.quoteNumber).toBe("SU-4002")
    expect(payload.status).toBe("APPROVED")
    expect(payload.taxTotals.isSealedUnitQuote).toBe(true)
    expect(payload.serviceSqftInput).toBe("50")
  })

  it("recovers quote pricing from initialSnapshot when root taxTotals.grandTotal is missing and quoteSummaryTotal is 0", () => {
    const corruptedDoorQuote = {
      _id: "quote_kyle_1",
      quoteNumber: "1",
      quoteType: "door",
      status: "PENDING_REVIEW",
      quoteSummaryTotal: 0,
      taxTotals: {
        extras: 140,
        // grandTotal is missing/undefined
      },
      initialSnapshot: {
        taxTotals: {
          grandTotal: 1478.9,
          subtotal: 1308.76,
          totalPrice: 772,
        },
        quoteSummaryTotal: 1478.9,
      },
      windows: [
        {
          id: "door_item_1",
          doorPresetId: "storm_only",
          quantity: 1,
          lineTotal: 1168.76,
        },
      ],
    }

    const pricing = computeQuotePricing(corruptedDoorQuote)
    expect(pricing).not.toBeNull()
    // 1478.9 dollars converted to cents
    expect(pricing?.total).toBe(147890)
  })

  it("recovers quote pricing by summing line items when both root totals and snapshot are missing", () => {
    const missingTotalsQuote = {
      _id: "quote_door_empty_totals",
      quoteNumber: "83999",
      quoteType: "door",
      status: "PENDING_REVIEW",
      quoteSummaryTotal: 0,
      taxTotals: {},
      windows: [
        {
          id: "door_item_1",
          doorPresetId: "entry_door",
          quantity: 2,
          lineTotal: 1000,
        },
      ],
    }

    const pricing = computeQuotePricing(missingTotalsQuote)
    expect(pricing).not.toBeNull()
    // 1000 * 1.13 = 1130 dollars -> 113000 cents
    expect(pricing?.total).toBe(113000)
  })
})
