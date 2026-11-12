import { describe, it, expect } from "vitest"
import { calculateTaxTotals } from "../tax-calculations"

describe("calculateTaxTotals - Jamb and Casing Calculations", () => {
  const dummyRegion: any = {
    _id: "r1",
    name: "Fort Frances",
    labourPerSqft: 10,
    labourMin: 50,
    miscPerSqft: 2,
    miscMin: 10,
    extraLinPerWindow: 2.17,
    fixedSetupFee: 0,
    baseTravelFee: 0,
  }

  const dummyWindows = [{ id: "w1", w: "36", h: "48", qty: "1", base: "500" }]

  const dbJambsWithRate = [
    { id: "j3", label: "Vinyl Wrapped Jamb – 3/4 x 4 1/2", rate: 7.34 },
    { id: "j4", label: "Vinyl Wrapped Jamb – 3/4 x 5 1/4", rate: 8.49 },
  ]

  const dbJambsWithPricePerFoot = [
    { id: "j3", label: "Vinyl Wrapped Jamb – 3/4 x 4 1/2", pricePerFoot: 7.34 },
    { id: "j4", label: "Vinyl Wrapped Jamb – 3/4 x 5 1/4", pricePerFoot: 8.49 },
  ]

  const dbCasings = [{ id: "vinyl", label: "Vinyl Casing", rate: 5.69 }]

  it("calculates jamb totals when jamb has .rate property", () => {
    const res = calculateTaxTotals({
      windows: dummyWindows,
      region: dummyRegion,
      effectiveIsSupplyOnly: false,
      dbAddons: [],
      addons: {},
      manualKm: "0",
      manualHours: "0",
      crew: "2",
      dbCrewRates: [],
      dbVehicleRate: 0.98,
      setupFee: "0",
      jambId: "j3",
      jambName: "",
      jambRate: "",
      dbJambs: dbJambsWithRate,
      casingId: "none",
      casingName: "",
      casingRate: "",
      dbCasings,
      includeLabour: true,
      includeMisc: true,
      includeJC: true,
      discount: "0",
      hstOn: true,
      selectedRegionId: "r1",
      coords: "",
    })

    expect(res).not.toBeNull()
    // 36" x 48": Perimeter = (36*2 + 48*2)/12 = 14 ft + extra 2.17 = 16.17 ft
    expect(res?.ln).toBeCloseTo(16.17, 2)
    // Jamb total = 16.17 * 7.34 = 118.6878
    expect(res?.finalJC).toBeCloseTo(118.69, 1)
    expect(res?.selectedJamb?.id).toBe("j3")
    expect(res?.selectedJamb?.rate).toBe(7.34)
    expect(res?.jcLabourCents).toBeGreaterThan(0)
  })

  it("calculates jamb totals when jamb has .pricePerFoot fallback property", () => {
    const res = calculateTaxTotals({
      windows: dummyWindows,
      region: dummyRegion,
      effectiveIsSupplyOnly: false,
      dbAddons: [],
      addons: {},
      manualKm: "0",
      manualHours: "0",
      crew: "2",
      dbCrewRates: [],
      dbVehicleRate: 0.98,
      setupFee: "0",
      jambId: "j4",
      jambName: "",
      jambRate: "",
      dbJambs: dbJambsWithPricePerFoot,
      casingId: "none",
      casingName: "",
      casingRate: "",
      dbCasings,
      includeLabour: true,
      includeMisc: true,
      includeJC: true,
      discount: "0",
      hstOn: true,
      selectedRegionId: "r1",
      coords: "",
    })

    expect(res).not.toBeNull()
    expect(res?.selectedJamb?.id).toBe("j4")
    expect(res?.selectedJamb?.rate).toBe(8.49)
    // 16.17 * 8.49 = 137.28
    expect(res?.finalJC).toBeCloseTo(137.28, 1)
  })

  it("sets jamb total to 0 when jambId is none", () => {
    const res = calculateTaxTotals({
      windows: dummyWindows,
      region: dummyRegion,
      effectiveIsSupplyOnly: false,
      dbAddons: [],
      addons: {},
      manualKm: "0",
      manualHours: "0",
      crew: "2",
      dbCrewRates: [],
      dbVehicleRate: 0.98,
      setupFee: "0",
      jambId: "none",
      jambName: "",
      jambRate: "",
      dbJambs: dbJambsWithRate,
      casingId: "none",
      casingName: "",
      casingRate: "",
      dbCasings,
      includeLabour: true,
      includeMisc: true,
      includeJC: true,
      discount: "0",
      hstOn: true,
      selectedRegionId: "r1",
      coords: "",
    })

    expect(res?.finalJC).toBe(0)
    expect(res?.selectedJamb).toBeNull()
  })
})
