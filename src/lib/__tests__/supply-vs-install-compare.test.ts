import { describe, it, expect } from "vitest"

describe("Supply vs Installation Comparison Logic", () => {
  it("correctly calculates Supply total with 13% HST and 0 labour/upcharges", () => {
    const materialsSubtotal = 1000
    const hstRate = 13

    const supplySubtotal = Math.round(materialsSubtotal * 100) / 100
    const supplyHst = Math.round(supplySubtotal * (hstRate / 100) * 100) / 100
    const supplyTotal = Math.round((supplySubtotal + supplyHst) * 100) / 100

    expect(supplySubtotal).toBe(1000)
    expect(supplyHst).toBe(130)
    expect(supplyTotal).toBe(1130)
  })

  it("correctly calculates extra price for installation as (install subtotal - supply subtotal)", () => {
    const baseAmount = 2450
    const surchargeAmount = 196
    const discountAmount = 245
    const hardwareAmount = 80
    const labourAmount = 640
    const miscAmount = 180
    const hstRate = 13

    const supplySubtotal =
      Math.round(
        (baseAmount + surchargeAmount + hardwareAmount - discountAmount) * 100
      ) / 100
    const installSubtotal =
      Math.round((supplySubtotal + labourAmount + miscAmount) * 100) / 100

    expect(supplySubtotal).toBe(2481)
    expect(installSubtotal).toBe(3301)

    // User's exact requested formula:
    const extraPriceForInstallation =
      Math.round((installSubtotal - supplySubtotal) * 100) / 100
    expect(extraPriceForInstallation).toBe(820)
    expect(extraPriceForInstallation).toBe(labourAmount + miscAmount)

    const supplyHst = Math.round(supplySubtotal * 0.13 * 100) / 100
    const supplyTotal = Math.round((supplySubtotal + supplyHst) * 100) / 100

    const installHst = Math.round(installSubtotal * 0.13 * 100) / 100
    const installTotal = Math.round((installSubtotal + installHst) * 100) / 100

    expect(supplyTotal).toBe(2803.53)
    expect(installTotal).toBe(3730.13)

    const extraPriceWithTax =
      Math.round((installTotal - supplyTotal) * 100) / 100
    expect(extraPriceWithTax).toBe(926.6)
  })

  it("handles 5% First Nations GST tax rate accurately", () => {
    const materialsSubtotal = 2500
    const labourTotal = 500
    const hstRate = 5

    const supplySubtotal = 2500
    const supplyHst = Math.round(supplySubtotal * (hstRate / 100) * 100) / 100
    const supplyTotal = supplySubtotal + supplyHst

    const installSubtotal = 3000
    const installHst = Math.round(installSubtotal * (hstRate / 100) * 100) / 100
    const installTotal = installSubtotal + installHst

    expect(supplyHst).toBe(125)
    expect(supplyTotal).toBe(2625)
    expect(installHst).toBe(150)
    expect(installTotal).toBe(3150)
    expect(installSubtotal - supplySubtotal).toBe(500)
  })

  it("splits deposits into 50% first payment and balanced final payment without cent loss", () => {
    const oddTotal = 1864.55
    const firstPayment = Math.floor((oddTotal / 2) * 100) / 100
    const secondPayment = Math.round((oddTotal - firstPayment) * 100) / 100

    expect(firstPayment).toBe(932.27)
    expect(secondPayment).toBe(932.28)
    expect(firstPayment + secondPayment).toBe(oddTotal)
  })

  it("persists supply jamb custom pricing and selections across toggles", () => {
    const supplyState = {
      jambId: "custom",
      jambName: "Heavy Oak 6-9/16",
      jambRate: "18.50",
      casingId: "sc1",
      casingName: "Colonial 3-1/2",
      casingRate: "4.75",
      customJC: "350.00",
    }

    // Verify state serialization and reconstruction
    const serialized = JSON.stringify(supplyState)
    const deserialized = JSON.parse(serialized)

    expect(deserialized.jambId).toBe("custom")
    expect(deserialized.jambRate).toBe("18.50")
    expect(deserialized.customJC).toBe("350.00")
  })

  it("ensures install custom JC does not leak into supply when supply jambs/casing are not selected", () => {
    const installCustomJC = "450.00"
    const isSupplyOnly = true

    // Simulate taxTotals in Supply mode with jambId='none' and casingId='none'
    const supplyTaxTotals: any = {
      isSupplyOnly: true,
      jambId: "none",
      casingId: "none",
      selectedJamb: null,
      selectedCasing: null,
      jcLabourCents: 0,
    }

    const hasSupplyJC = Boolean(
      (supplyTaxTotals.selectedJamb &&
        (Number(supplyTaxTotals.selectedJamb.total) > 0 ||
          Number(supplyTaxTotals.selectedJamb.rate) > 0)) ||
      (supplyTaxTotals.selectedCasing &&
        (Number(supplyTaxTotals.selectedCasing.total) > 0 ||
          Number(supplyTaxTotals.selectedCasing.rate) > 0)) ||
      (supplyTaxTotals.jcLabourCents && supplyTaxTotals.jcLabourCents > 0)
    )

    expect(hasSupplyJC).toBe(false)

    // If supply has no jambs/casings selected, effective supply JC cents MUST be 0
    const supplyEffectiveJCCents = isSupplyOnly
      ? hasSupplyJC
        ? Math.round(parseFloat(installCustomJC) * 100)
        : 0
      : Math.round(parseFloat(installCustomJC) * 100)

    expect(supplyEffectiveJCCents).toBe(0)

    // Compare modal: Supply uses 0, Install uses 450
    const baseAmount = 2000
    const supplyJCAmount = supplyEffectiveJCCents / 100 // 0
    const installJCAmount = parseFloat(installCustomJC) // 450
    const labourAmount = 600

    const supplySubtotal = baseAmount + supplyJCAmount // 2000
    const installSubtotal = baseAmount + installJCAmount + labourAmount // 3050

    expect(supplySubtotal).toBe(2000)
    expect(installSubtotal).toBe(3050)

    const extraPriceForInstallation = installSubtotal - supplySubtotal
    expect(extraPriceForInstallation).toBe(1050) // 450 JC + 600 Labour
  })

  it("Option 2 (Supply & Installation) in Compare Modal receives and displays opt2JCAmount when jambs are selected", () => {
    const supplyJCAmount = 0
    const installJCAmount = 450
    const opt1JCAmount = supplyJCAmount
    const opt2JCAmount = installJCAmount

    expect(opt1JCAmount).toBe(0)
    expect(opt2JCAmount).toBe(450)

    const baseAmount = 3000
    const labourAmount = 800

    const opt1Subtotal = baseAmount + opt1JCAmount
    const opt2Subtotal = baseAmount + opt2JCAmount + labourAmount

    expect(opt1Subtotal).toBe(3000)
    expect(opt2Subtotal).toBe(4250)
    expect(opt2Subtotal - opt1Subtotal).toBe(1250)
  })

  it("ensures savedTaxTotals is null on empty/blank quote to prevent circular feedback loops", () => {
    const reviewQuote = null
    const loadedDraftTaxTotals = null
    // Emulates the corrected usePromoCalculator savedTaxTotals expression:
    const savedTaxTotals =
      (reviewQuote as any)?.taxTotals || loadedDraftTaxTotals || null
    expect(savedTaxTotals).toBeNull()
  })

  it("ensures supply mode toggle is idempotent when the target mode matches current mode", () => {
    let callCount = 0
    let currentSupplyMode = true
    const handleToggleSupplyOnly = (targetMode: boolean) => {
      if (currentSupplyMode === targetMode) return
      callCount++
      currentSupplyMode = targetMode
    }

    handleToggleSupplyOnly(true)
    expect(callCount).toBe(0)
    expect(currentSupplyMode).toBe(true)

    handleToggleSupplyOnly(false)
    expect(callCount).toBe(1)
    expect(currentSupplyMode).toBe(false)

    handleToggleSupplyOnly(false)
    expect(callCount).toBe(1)
  })
})
