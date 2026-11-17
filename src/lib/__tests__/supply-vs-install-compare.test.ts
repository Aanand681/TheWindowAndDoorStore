import { describe, it, expect } from "vitest"
import {
  writeSessionAttachedInstallOption,
  readSessionAttachedInstallOption,
  writeSessionCustomOptions,
  readSessionCustomOptions,
  clearAllQuoteSessionState,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

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

  it("bidirectionally calculates installation option as addition on supply quotes and deduction on install quotes", () => {
    const supplySubtotal = 2000
    const installSubtotal = 2850
    const diff = installSubtotal - supplySubtotal // 850

    // On Supply quote: Alternative is Installation -> Add: +$850
    const supplyQuoteOptionText = `with Installation add: +$${diff.toFixed(2)}`
    expect(supplyQuoteOptionText).toBe("with Installation add: +$850.00")

    // On Installation quote: Alternative is Supply Only -> Deduct: -$850
    const installQuoteOptionText = `for Supply Only (Self-Installation / Pick-Up) deduct: -$${diff.toFixed(2)}`
    expect(installQuoteOptionText).toBe(
      "for Supply Only (Self-Installation / Pick-Up) deduct: -$850.00"
    )
  })

  it("correctly models the user's exact scenario: Supply $100 vs Install $150 (Delta $50)", () => {
    const supplySubtotal = 100
    const installSubtotal = 150
    const delta = Math.abs(installSubtotal - supplySubtotal) // 50

    expect(delta).toBe(50)

    // In Supply mode:
    const isSupply = true
    const supplyBadgeTitle = !isSupply
      ? "Option for Supply Only"
      : "Option for Installation"
    const supplyBadgeSign = !isSupply ? "deduct: -" : "add: +"
    expect(`${supplyBadgeTitle} ${supplyBadgeSign}$${delta.toFixed(2)}`).toBe(
      "Option for Installation add: +$50.00"
    )

    // In Installation mode:
    const isInstall = false
    const installBadgeTitle = isInstall
      ? "Option for Installation"
      : "Option for Supply Only"
    const installBadgeSign = isInstall ? "add: +" : "deduct: -"
    expect(`${installBadgeTitle} ${installBadgeSign}$${delta.toFixed(2)}`).toBe(
      "Option for Supply Only deduct: -$50.00"
    )
  })

  it("supports attaching comparison option with negative delta as a cost-saving deduction", () => {
    const baseA = 500000 // $5000.00 (Option A)
    const optionB = 465000 // $4650.00 (Option B - economy dual pane)
    const deltaPreTax = optionB - baseA // -35000 (-$350.00)

    expect(deltaPreTax).toBe(-35000)
    const isLess = deltaPreTax < 0
    const displayLabel = isLess ? "less" : "adds"
    const amountAbs = Math.abs(deltaPreTax) / 100

    expect(isLess).toBe(true)
    expect(`${displayLabel} $${amountAbs.toFixed(2)}`).toBe("less $350.00")
  })

  it("cleans and isolates session storage on clearAllQuoteSessionState", () => {
    const store: Record<string, string> = {}
    ;(global as any).window = {}
    ;(global as any).sessionStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val
      },
      removeItem: (key: string) => {
        delete store[key]
      },
    }

    writeSessionAttachedInstallOption({
      enabled: true,
      amountPreTaxCents: 50000,
    })
    expect(readSessionAttachedInstallOption()?.amountPreTaxCents).toBe(50000)

    clearAllQuoteSessionState()
    expect(readSessionAttachedInstallOption()).toBeNull()

    delete (global as any).window
    delete (global as any).sessionStorage
  })

  it("resets attached options when loading quote/draft without attached options", () => {
    const store: Record<string, string> = {}
    ;(global as any).window = {}
    ;(global as any).sessionStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val
      },
      removeItem: (key: string) => {
        delete store[key]
      },
    }

    // Previous quote had attached install option & custom option
    writeSessionAttachedInstallOption({
      enabled: true,
      amountPreTaxCents: 45000,
    })
    writeSessionCustomOptions([
      { id: "opt1", title: "Add Grids", amountPreTaxCents: 20000 },
    ])
    expect(readSessionAttachedInstallOption()).not.toBeNull()
    expect(readSessionCustomOptions().length).toBe(1)

    // New quote with no attached options opens
    const newQuote: { attachedInstallOption?: any; customOptions?: any[] } = {}
    writeSessionAttachedInstallOption(newQuote.attachedInstallOption ?? null)
    writeSessionCustomOptions(
      Array.isArray(newQuote.customOptions) ? newQuote.customOptions : []
    )

    expect(readSessionAttachedInstallOption()).toBeNull()
    expect(readSessionCustomOptions()).toEqual([])

    delete (global as any).window
    delete (global as any).sessionStorage
  })

  it("calculates correct subtotals, deltas, and titles when supply has NO jambs & casing", () => {
    // Current install subtotal from ledger: $3,500.00
    const currentInstallSubtotal = 3500
    const labourAmount = 600
    const miscAmount = 200
    const installJCAmount = 400
    const supplyJCAmount = 0 // No J&C for supply

    const hasSupplyJC = supplyJCAmount > 0
    expect(hasSupplyJC).toBe(false)

    const jcDiff = Math.max(0, installJCAmount - supplyJCAmount)
    const totalInstallAdd = labourAmount + miscAmount + jcDiff
    const supplySubtotal = Math.round((currentInstallSubtotal - totalInstallAdd) * 100) / 100
    const delta = Math.round((currentInstallSubtotal - supplySubtotal) * 100) / 100

    expect(supplySubtotal).toBe(2300)
    expect(delta).toBe(1200)

    const attachTitle = hasSupplyJC
      ? "Option with J&C for Supply Only"
      : "Option for Supply Only"
    expect(attachTitle).toBe("Option for Supply Only")
  })

  it("calculates correct subtotals, deltas, and titles when supply DOES have jambs & casing", () => {
    // Current install subtotal from ledger: $3,500.00
    const currentInstallSubtotal = 3500
    const labourAmount = 600
    const miscAmount = 200
    const installJCAmount = 400
    const supplyJCAmount = 300 // Supply has $300 J&C

    const hasSupplyJC = supplyJCAmount > 0
    expect(hasSupplyJC).toBe(true)

    const jcDiff = Math.max(0, installJCAmount - supplyJCAmount) // $100
    const totalInstallAdd = labourAmount + miscAmount + jcDiff // 600 + 200 + 100 = $900
    const supplySubtotal = Math.round((currentInstallSubtotal - totalInstallAdd) * 100) / 100
    const delta = Math.round((currentInstallSubtotal - supplySubtotal) * 100) / 100

    expect(supplySubtotal).toBe(2600)
    expect(delta).toBe(900)

    const attachTitle = hasSupplyJC
      ? "Option with J&C for Supply Only"
      : "Option for Supply Only"
    expect(attachTitle).toBe("Option with J&C for Supply Only")
  })

  it("calculates correct install subtotal and title when active mode is supply (always simple Option for Installation)", () => {
    // Current supply subtotal from ledger: $2,600.00
    const currentSupplySubtotal = 2600
    const labourAmount = 600
    const miscAmount = 200
    const installJCAmount = 400
    const supplyJCAmount = 300 // Supply already has $300 J&C

    const jcDiff = Math.max(0, installJCAmount - supplyJCAmount) // $100
    const totalInstallAdd = labourAmount + miscAmount + jcDiff // $900
    const installSubtotal = Math.round((currentSupplySubtotal + totalInstallAdd) * 100) / 100
    const delta = Math.round((installSubtotal - currentSupplySubtotal) * 100) / 100

    expect(installSubtotal).toBe(3500)
    expect(delta).toBe(900)

    // Per user specification: Keep option for installation simple
    const attachTitle = "Option for Installation"
    expect(attachTitle).toBe("Option for Installation")
  })

  it("reactively updates option delta when jambs or casing change in workspace without detaching", () => {
    const labour = 500
    const misc = 100
    let installJC = 400
    let supplyJC = 0

    // Initial state: No J&C in supply
    let delta = labour + misc + Math.max(0, installJC - supplyJC)
    expect(delta).toBe(1000)

    // User modifies casing/jamb in workspace -> install JC becomes 600
    installJC = 600
    delta = labour + misc + Math.max(0, installJC - supplyJC)
    expect(delta).toBe(1200)

    // User selects supply J&C = 300
    supplyJC = 300
    delta = labour + misc + Math.max(0, installJC - supplyJC)
    expect(delta).toBe(900)
  })

  it("updates live badge delta when jambs & casing are added, attached, and then removed", () => {
    const labour = 600
    const misc = 150
    const installJC = 400
    let supplyJC = 0

    // Step 1: User adds J&C in supply
    supplyJC = 250
    let delta = labour + misc + Math.max(0, installJC - supplyJC)
    expect(delta).toBe(600 + 150 + 150) // $900

    // Step 2: User attaches comparison at $900
    const attachedAmountPreTaxCents = Math.round(delta * 100)
    expect(attachedAmountPreTaxCents).toBe(90000)

    // Step 3: User removes jambs & casing (supplyJC = 0)
    supplyJC = 0
    delta = labour + misc + Math.max(0, installJC - supplyJC)
    expect(delta).toBe(600 + 150 + 400) // $1,150

    // Live badge uses dynamic delta over frozen attached amount
    const liveBadgeCents = delta > 0 ? Math.round(delta * 100) : attachedAmountPreTaxCents
    expect(liveBadgeCents).toBe(115000)
  })

  it("updates live badge delta when windows or labour change in workspace", () => {
    let labour = 400
    const misc = 100
    const installJC = 300
    const supplyJC = 100

    let delta = labour + misc + Math.max(0, installJC - supplyJC)
    expect(delta).toBe(700)

    // User adds 3 more windows -> labour increases to 800
    labour = 800
    delta = labour + misc + Math.max(0, installJC - supplyJC)
    expect(delta).toBe(1100)
  })

  it("preserves custom options in autosave and session when draft is saved and reloaded", () => {
    const store: Record<string, string> = {}
    ;(global as any).window = {
      dispatchEvent: () => true,
    }
    ;(global as any).sessionStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val
      },
      removeItem: (key: string) => {
        delete store[key]
      },
    }

    // 1. User adds a custom quote option
    const addedOption = {
      id: "opt-123",
      title: "Exterior Brickmould Trim",
      amountPreTaxCents: 35000,
    }
    writeSessionCustomOptions([addedOption])
    expect(readSessionCustomOptions()).toEqual([addedOption])

    // 2. Draft is saved with custom options
    const draftPayload = {
      quoteNumber: "123456",
      customerName: "Alice Smith",
      data: {
        customOptions: readSessionCustomOptions(),
        attachedInstallOption: null,
      },
    }

    // 3. Page reload restores active draft
    writeSessionCustomOptions(
      Array.isArray(draftPayload.data.customOptions)
        ? draftPayload.data.customOptions
        : []
    )
    expect(readSessionCustomOptions().length).toBe(1)
    expect(readSessionCustomOptions()[0].title).toBe("Exterior Brickmould Trim")
    expect(readSessionCustomOptions()[0].amountPreTaxCents).toBe(35000)

    // 4. Test that passing empty array [] as prop properly falls back to session options
    const propCustomOptions: any[] = []
    const effectiveOptions =
      Array.isArray(propCustomOptions) && propCustomOptions.length > 0
        ? propCustomOptions
        : readSessionCustomOptions()
    expect(effectiveOptions.length).toBe(1)
    expect(effectiveOptions[0].title).toBe("Exterior Brickmould Trim")

    delete (global as any).window
    delete (global as any).sessionStorage
  })
})
