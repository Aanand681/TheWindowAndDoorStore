import { describe, it, expect } from "vitest"
import {
  buildWindowAttachPayload,
  buildDoorAttachPayload,
  buildSealedUnitAttachPayload,
} from "@/components/calculator/attach/attach-payload-builders"
import { computeEffectiveDoorGrandTotal } from "@/lib/doors/totals-calculator"

describe("Three Quotes Database Reconciliation (404043, 437657, 83917)", () => {
  // SavedQuote 404043 (Window - Hannah Land)
  const windowDraft = {
    id: "6b00722bf50b2a2046d392ed",
    quoteNumber: "404043",
    type: "window",
    customerName: "Hannah Land",
    data: {
      quoteNumber: "404043",
      customerName: "Hannah Land",
      customLabour: "",
      customMisc: "",
      customJC: "",
      windows: [
        {
          id: "qvslxma",
          qty: "1",
          base: "1659.2",
          argon: "74.83",
          solar: "165.72",
          triple: "",
          w: "91 3/4",
          h: "49 3/4",
          color: "White",
        },
      ],
      taxTotals: {
        sq: 31.7,
        ln: 25.75,
        labourWindows: 632.27,
        miscTotal: 260.58,
        extras: 867.5,
        jc: 335.57,
        finalLabour: 1499.77,
        finalMisc: 260.58,
        finalJC: 335.57,
        customMaterials: [],
        selectedJamb: { name: "Vinyl Wrapped Jamb – 4 1/2", rate: 7.34, total: 189.03 },
        selectedCasing: { name: "Vinyl casing charge", rate: 5.69, total: 146.54 },
      },
    },
  }

  // SavedQuote 437657 (Sealed Unit - SL Health)
  const sealedUnitDraft = {
    id: "6b005682f50b2a2046d37601",
    quoteNumber: "437657",
    type: "sealed_unit",
    customerName: "SL Health",
    data: {
      quoteNumber: "437657",
      customerName: "SL Health",
      customLabour: "",
      customMisc: "",
      customJC: "",
      windows: [
        {
          id: "su_1",
          quantity: 2,
          multipliedTotal: 2366.26,
          surcharge8PercentTotal: 189.3,
          unitLabour: 223.214,
          totalLabour: 446.43,
          unitMisc: 37.2,
          totalMisc: 74.4,
        },
      ],
      taxTotals: {
        glassBefore8PercentTotal: 2366.26,
        glass8PercentSurchargeTotal: 189.3,
        unitLabourSum: 446.43,
        baseSetupFee: 140,
        additionalFarFee: 363.5,
        totalTravelAndSetup: 503.5,
        combinedLabourTotal: 1199.93,
        miscTotal: 74.4,
        subtotalPreTax: 3829.89,
        extraLabour: 250,
        globalUpcharges: [
          { id: "addon_1", label: "Extra for being on second floor", price: "250" },
        ],
      },
    },
  }

  // SavedQuote 83917 (Door - Hillary Hackerman)
  const doorDraft = {
    id: "6b006835f50b2a2046d38890",
    quoteNumber: "83917",
    type: "door",
    customerName: "Hillary Hackerman",
    data: {
      quoteNumber: "83917",
      customerName: "Hillary Hackerman",
      customLabour: "",
      customMisc: "",
      customJC: "",
      windows: [
        {
          id: "door_1",
          quantity: 3,
          inksterBasePrice: 1832.84666,
          lineTotal: 5498.54,
          category: "entry",
          hardwarePrice: 158,
          lineHardwareTotal: 474,
        },
        {
          id: "storm_1",
          quantity: 1,
          inksterBasePrice: 665,
          category: "storm",
        },
      ],
      taxTotals: {
        rawDoorBaseTotal: 5498.54,
        stormDoorTotal: 665,
        hardwareTotal: 474,
        surchargeTotal: 493.09,
        discountTotal: 549.86,
        unitLabourTotal: 2500,
        baseSetupFee: 140,
        additionalFarFee: 727.5,
        totalTravelAndSetup: 867.5,
        combinedLabourTotal: 3367.5,
        miscTotal: 345.6,
        subtotalPreTax: 10293.87,
        grandTotal: 11632.07,
      },
    },
  }

  it("builds exact payloads for Window, Sealed Unit, and Door drafts", () => {
    const winPayload = buildWindowAttachPayload(windowDraft as any)
    expect(winPayload.totals.base).toBe(1899.75)
    expect(winPayload.totals.surcharge).toBe(151.98)
    expect(winPayload.totals.labour).toBe(632.27)
    expect(winPayload.totals.jc).toBe(335.57)
    expect(winPayload.totals.misc).toBe(260.58)

    const suPayload = buildSealedUnitAttachPayload(sealedUnitDraft as any)
    expect(suPayload.totals.glassBefore8PercentTotal).toBe(2366.26)
    expect(suPayload.totals.glass8PercentSurchargeTotal).toBe(189.3)
    expect(suPayload.totals.unitLabourSum).toBe(446.43)
    expect(suPayload.totals.extraLabour).toBe(250)
    expect(suPayload.totals.pureLabourTotal).toBe(446.43 + 250)
    expect(suPayload.totals.miscTotal).toBe(74.4)

    const doorPayload = buildDoorAttachPayload(doorDraft as any)
    expect(doorPayload.totals.rawDoorBaseTotal).toBe(5498.54)
    expect(doorPayload.totals.stormDoorTotal).toBe(665)
    expect(doorPayload.totals.hardwareTotal).toBe(474)
    expect(doorPayload.totals.surchargeTotal).toBe(493.09)
    expect(doorPayload.totals.discountTotal).toBe(549.86)
    expect(doorPayload.totals.doorPureLabourTotal).toBe(2500)
    expect(doorPayload.totals.miscTotal).toBe(345.6)
  })

  it("calculates exact unified grand total when attaching Window and SU to Door quote", () => {
    const winPayload = buildWindowAttachPayload(windowDraft as any)
    const suPayload = buildSealedUnitAttachPayload(sealedUnitDraft as any)

    const effective = computeEffectiveDoorGrandTotal({
      totals: doorDraft.data.taxTotals as any,
      mode: "installation",
      customLabour: "",
      customMisc: "",
      customDiscount: "",
      isFirstNation: false,
      attachedWindowQuote: winPayload,
      attachedSealedUnit: suPayload,
    })

    expect(effective.combinedSubtotal).toBe(16900.41)
    expect(effective.combinedTax).toBe(2197.05)
    expect(effective.grandTotal).toBe(19097.46)
  })

  it("selects max travel fee ($867.50) when hosted from Sealed Unit with Window & Door attached", () => {
    const winPayload = buildWindowAttachPayload(windowDraft as any)
    const doorPayload = buildDoorAttachPayload(doorDraft as any)

    const effective = computeEffectiveDoorGrandTotal({
      totals: doorDraft.data.taxTotals as any,
      mode: "installation",
      customLabour: "",
      customMisc: "",
      customDiscount: "",
      isFirstNation: false,
      attachedWindowQuote: winPayload,
      attachedSealedUnit: buildSealedUnitAttachPayload(sealedUnitDraft as any),
    })

    expect(effective.combinedSubtotal).toBe(16900.41)
    expect(effective.grandTotal).toBe(19097.46)
  })

  it("increasing window labour by 1 cent increases combined total by exactly 1 cent", () => {
    const winDraftWith1CentIncrease = {
      ...windowDraft,
      data: {
        ...windowDraft.data,
        customLabour: "1499.78", // default was 1499.77 (+0.01)
      },
    }
    const winPayload = buildWindowAttachPayload(winDraftWith1CentIncrease as any)
    // Pure labour should be 1499.78 - 867.50 = 632.28
    expect(winPayload.totals.labour).toBe(632.28)

    const effective = computeEffectiveDoorGrandTotal({
      totals: doorDraft.data.taxTotals as any,
      mode: "installation",
      customLabour: "",
      customMisc: "",
      customDiscount: "",
      isFirstNation: false,
      attachedWindowQuote: winPayload,
      attachedSealedUnit: buildSealedUnitAttachPayload(sealedUnitDraft as any),
    })

    expect(effective.combinedSubtotal).toBe(16900.42) // exactly +0.01
    expect(effective.grandTotal).toBe(19097.47) // exactly +0.01
  })
})
