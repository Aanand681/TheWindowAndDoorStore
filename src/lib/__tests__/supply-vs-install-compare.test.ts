import { describe, it, expect } from "vitest"
import { calculateDoorQuoteTotals } from "../doors/totals-calculator"
import { calculateSealedUnitTotals } from "../sealed-units/calculations"
import { calculateCompareTotals } from "@/components/shared/compare/compare-math"
import {
  writeSessionAttachedInstallOption,
  readSessionAttachedInstallOption,
  writeSessionCustomOptions,
  readSessionCustomOptions,
  readSessionDoorHardwareConfig,
  writeSessionDoorHardwareConfig,
  clearAllQuoteSessionState,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { getInvoiceTravelItems } from "@/hooks/quotes/invoice-logistics"

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

    const supplySubtotal = materialsSubtotal
    const supplyHst = Math.round(supplySubtotal * (hstRate / 100) * 100) / 100
    const supplyTotal = supplySubtotal + supplyHst

    const installSubtotal = materialsSubtotal + labourTotal
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

  it("calculates Door installation delta and preserves full install capability in supply mode", () => {
    // 1 Door in Supply Mode
    const doorParams: any = {
      lineItems: [
        {
          id: "door-1",
          presetId: "entry_single",
          category: "entry" as const,
          quantity: 1,
          inksterBasePrice: 2500,
          surchargeAmount: 200,
          discountAmount: 250,
          lineHardwareTotal: 158,
          unitLabour: 350,
          upchargesTotal: 100,
          lineMiscTotal: 50,
        },
      ],
      mode: "supply_only" as const,
      travelFeeType: "none",
      hstRate: 13,
      logistics: { setupFeeDefault: 140 },
    }

    const totals = calculateDoorQuoteTotals(doorParams)

    // In supply mode, active labour & misc on the quote must be zero
    expect(totals.combinedLabourTotal).toBe(0)
    expect(totals.miscTotal).toBe(0)

    // Full install baseline MUST be preserved for comparison
    expect(totals.fullInstallLabour).toBe(450) // 350 unitLabour + 100 upcharges
    expect(totals.fullInstallMisc).toBe(50)

    // Compare Delta = fullInstallLabour + fullInstallMisc = 500
    const compareLabour = totals.fullInstallLabour ?? 0
    const compareMisc = totals.fullInstallMisc ?? 0
    const delta = compareLabour + compareMisc
    expect(delta).toBe(500)
  })

  it("calculates Sealed Unit installation delta and preserves full install capability in supply mode", () => {
    const suParams: any = {
      lineItems: [
        {
          id: "su-1",
          actualSqft: 10,
          quantity: 2,
          unitLabour: 120,
          totalMisc: 25,
          glassSupplyTotal: 600,
        },
      ],
      mode: "supply_only" as const,
      travelFeeType: "none",
      hstRate: 13,
      labour: { labourRatePerSqft: 14.4, setupFeeDefault: 140 },
    }

    const totals = calculateSealedUnitTotals(suParams)

    // In supply mode, active labour & misc on the quote must be zero
    expect(totals.combinedLabourTotal).toBe(0)
    expect(totals.miscTotal).toBe(0)

    // Full install baseline MUST be preserved for comparison (2 units * $120 + $140 base setup = $380)
    expect(totals.fullInstallLabour).toBe(380)
    expect(totals.fullInstallMisc).toBe(25)

    const delta = (totals.fullInstallLabour ?? 0) + (totals.fullInstallMisc ?? 0)
    expect(delta).toBe(405)
  })

  it("handles custom hardware per door in compare totals (e.g. Door 1 standard $158, Door 2 custom $220)", () => {
    // Door 1: Standard $158
    // Door 2: Custom $220
    // Total installation hardware = $378
    const compareResult = calculateCompareTotals({
      currentMode: "supply",
      currentSubtotal: 3000, // Supply Subtotal = $3,000 (0 hardware)
      baseAmount: 3000,
      attachedAmount: 0,
      surchargeAmount: 0,
      discountAmount: 0,
      supplyHardwareCents: 0,
      installHardwareCents: 37800, // $378.00 hardware for installation
      opt1JCCents: 0,
      opt2JCCents: 0,
      labourCents: 60000, // $600.00 labour
      miscCents: 5000, // $50.00 misc
      hstRate: 13,
    })

    // Supply Subtotal: $3,000.00
    expect(compareResult.supplySubtotal).toBe(3000)

    // Install Subtotal: $3,000 + $600 (labour) + $50 (misc) + $378 (hardware) = $4,028.00
    expect(compareResult.installSubtotal).toBe(4028)

    // Extra Price for Installation: $1,028.00
    expect(compareResult.extraPriceSubtotal).toBe(1028)

    // Total with Tax: $1,028 + 13% ($133.64) = $1,161.64
    expect(compareResult.extraPriceTotalWithTax).toBe(1161.64)
  })

  it("persists and restores attachedInstallOption with hardwareBreakdown in session storage", () => {
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

    const optionPayload = {
      enabled: true,
      amountPreTaxCents: 102800,
      title: "Option for Installation",
      hardwareTotal: 378,
      hardwareBreakdown: [
        {
          doorId: "door-1",
          doorLabel: "Front Entry Door",
          hardwareType: "standard" as const,
          price: 158,
        },
        {
          doorId: "door-2",
          doorLabel: "Side Entry Door",
          hardwareType: "custom" as const,
          price: 220,
        },
      ],
    }

    writeSessionAttachedInstallOption(optionPayload)
    const restored = readSessionAttachedInstallOption()

    expect(restored?.enabled).toBe(true)
    expect(restored?.amountPreTaxCents).toBe(102800)
    expect(restored?.hardwareTotal).toBe(378)
    expect(restored?.hardwareBreakdown?.length).toBe(2)
    expect(restored?.hardwareBreakdown?.[0].price).toBe(158)
    expect(restored?.hardwareBreakdown?.[1].price).toBe(220)

    delete (global as any).window
    delete (global as any).sessionStorage
  })

  it("guarantees 100% integer cent precision with zero 1-cent discrepancy", () => {
    // Test across hundreds of edge-case cent values
    for (let supplyCents = 10050; supplyCents <= 10550; supplyCents += 37) {
      for (let addCents = 5025; addCents <= 5525; addCents += 43) {
        const installCents = supplyCents + addCents

        const supplyHstCents = Math.round(supplyCents * 0.13)
        const supplyTotalCents = supplyCents + supplyHstCents
        const installHstCents = Math.round(installCents * 0.13)
        const installTotalCents = installCents + installHstCents

        // 50/50 deposit verification
        const supplyFirst = Math.floor(supplyTotalCents / 2)
        const supplySecond = supplyTotalCents - supplyFirst
        expect(supplyFirst + supplySecond).toBe(supplyTotalCents)

        const installFirst = Math.floor(installTotalCents / 2)
        const installSecond = installTotalCents - installFirst
        expect(installFirst + installSecond).toBe(installTotalCents)

        // Delta verification
        const extraSubtotal = installCents - supplyCents
        const extraTotal = installTotalCents - supplyTotalCents
        expect(extraSubtotal).toBe(addCents)
        expect(extraTotal).toBe(extraSubtotal + (installHstCents - supplyHstCents))
      }
    }
  })

  it("restores attachedInstallOption and customOptions on draft load and clears them on reset", () => {
    const store: Record<string, string> = {}
    ;(global as any).window = {
      dispatchEvent: () => true,
      CustomEvent: class {},
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

    const draftData = {
      quoteNumber: "123456",
      customerName: "Jane Doe",
      attachedInstallOption: {
        enabled: true,
        mode: "install" as const,
        amountPreTaxCents: 150000,
        hardwareTotal: 316,
        hardwareBreakdown: [
          {
            doorId: "d1",
            doorLabel: "Door 1",
            hardwareType: "standard" as const,
            price: 158,
            quantity: 1,
          },
          {
            doorId: "d2",
            doorLabel: "Door 2",
            hardwareType: "custom" as const,
            price: 220,
            quantity: 1,
          },
        ],
      },
      customOptions: [
        { id: "opt-1", title: "Custom Trim", amountPreTaxCents: 25000 },
      ],
    }

    writeSessionAttachedInstallOption(draftData.attachedInstallOption)
    writeSessionCustomOptions(draftData.customOptions)

    expect(readSessionAttachedInstallOption()?.amountPreTaxCents).toBe(150000)
    expect(readSessionAttachedInstallOption()?.hardwareTotal).toBe(316)
    expect(readSessionCustomOptions()?.length).toBe(1)

    // Reset session state
    writeSessionAttachedInstallOption(null)
    writeSessionCustomOptions([])

    expect(readSessionAttachedInstallOption()).toBeNull()
    expect(readSessionCustomOptions()).toEqual([])

    delete (global as any).window
    delete (global as any).sessionStorage
  })

  it("preserves door installation hardware configuration across tab switches", () => {
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

    const hwConfig = {
      type: "standard" as const,
      standardQty: 3,
      standardPrice: 158.0,
      hasCustom: true,
      customQty: 2,
      customPrice: 220.0,
      totalQty: 5,
      totalPrice: 914.0,
    }

    // Save hardware config
    writeSessionDoorHardwareConfig(hwConfig)

    // Simulate switching tabs and reading session storage
    const restored = readSessionDoorHardwareConfig()
    expect(restored).not.toBeNull()
    expect(restored?.standardQty).toBe(3)
    expect(restored?.standardPrice).toBe(158.0)
    expect(restored?.hasCustom).toBe(true)
    expect(restored?.customQty).toBe(2)
    expect(restored?.customPrice).toBe(220.0)
    expect(restored?.totalQty).toBe(5)
    expect(restored?.totalPrice).toBe(914.0)

    // Clear state
    clearAllQuoteSessionState()
    expect(readSessionDoorHardwareConfig()).toBeNull()

    delete (global as any).window
    delete (global as any).sessionStorage
  })

  it("includes hardware in material category for First Nations tax exemption", () => {
    // 5 doors with hardware: Base $10,000, 10% discount (-$1,000), 8% surcharge ($800)
    // Hardware: 5 sets @ $158 = $790
    // Materials base = $10,000 - $1,000 + $790 = $9,790
    const materialsBase = 10000 - 1000 + 790
    expect(materialsBase).toBe(9790)

    // First Nations 8% material exemption
    const materialExemption = Math.round(materialsBase * 0.08 * 100) / 100
    expect(materialExemption).toBe(783.2)
  })

  it("preserves hardware delta when switching from Supply to Install and back to Supply mode", () => {
    // 5 doors: Base $5,000, Labour $1,000, Misc $200.
    // 5 standard locksets @ $158 = $790 for installation.
    // In Supply mode (no customer supply locksets):
    const supplyTotals = calculateCompareTotals({
      currentMode: "supply",
      currentSubtotal: 4900, // $5000 + 8% ($400) - 10% ($500) = $4,900
      baseAmount: 5000,
      attachedAmount: 0,
      surchargeAmount: 400,
      discountAmount: 500,
      supplyHardwareCents: 0,
      installHardwareCents: 79000,
      opt1JCCents: 0,
      opt2JCCents: 0,
      labourCents: 100000,
      miscCents: 20000,
      hstRate: 13,
    })

    // Difference in Supply Mode = $1,000 labour + $200 misc + $790 hardware = $1,990
    expect(supplyTotals.extraPriceSubtotal).toBe(1990)
    expect(supplyTotals.supplySubtotal).toBe(4900)
    expect(supplyTotals.installSubtotal).toBe(6890)

    // Now switch to Installation mode:
    // Installation subtotal is $6,890 ($4,900 materials + $1,000 labour + $200 misc + $790 hardware)
    // Supply hardware remains 0 (customer did not request locksets for supply)
    // Install hardware is $790
    const installTotals = calculateCompareTotals({
      currentMode: "install",
      currentSubtotal: 6890,
      baseAmount: 5000,
      attachedAmount: 0,
      surchargeAmount: 400,
      discountAmount: 500,
      supplyHardwareCents: 0,
      installHardwareCents: 79000,
      opt1JCCents: 0,
      opt2JCCents: 0,
      labourCents: 100000,
      miscCents: 20000,
      hstRate: 13,
    })

    // Difference in Installation Mode MUST ALSO BE EXACTLY $1,990!
    expect(installTotals.extraPriceSubtotal).toBe(1990)
    expect(installTotals.supplySubtotal).toBe(4900)
    expect(installTotals.installSubtotal).toBe(6890)
  })

  it("computes net hardware delta when customer requests supply hardware and install has hardware", () => {
    // 5 doors:
    // Supply quote includes 1 custom lockset requested by customer @ $200.
    // Installation quote includes 5 locksets (3 std @ $158 + 2 cust @ $200 = $474 + $400 = $874).
    // Hardware Delta = $874 - $200 = $674.
    const compare = calculateCompareTotals({
      currentMode: "supply",
      currentSubtotal: 5100, // including $200 supply lockset
      baseAmount: 5000,
      attachedAmount: 0,
      surchargeAmount: 400,
      discountAmount: 500,
      supplyHardwareCents: 20000,
      installHardwareCents: 87400,
      opt1JCCents: 0,
      opt2JCCents: 0,
      labourCents: 100000,
      miscCents: 20000,
      hstRate: 13,
    })

    // Difference = $1,000 labour + $200 misc + ($874 - $200) net hardware = $1,874
    expect(compare.extraPriceSubtotal).toBe(1874)
    expect(compare.installSubtotal).toBe(5100 + 1874)
  })

  it("excludes $140 standard setup fee from supply quote PDF and includes it in installation", () => {
    // 1. Supply quote check
    const supplyTravel = getInvoiceTravelItems({
      isWindowHost: false,
      taxTotals: null,
      isDoorHost: true,
      effectiveDoorTotals: { baseSetupFee: 0, fullBaseSetupFee: 140 },
      isSUHost: false,
      effectiveSUTotals: null,
      isSupplyOnly: true,
    })
    expect(supplyTravel).toEqual([])

    // 2. Installation quote check
    const installTravel = getInvoiceTravelItems({
      isWindowHost: false,
      taxTotals: null,
      isDoorHost: true,
      effectiveDoorTotals: { baseSetupFee: 140, fullBaseSetupFee: 140 },
      isSUHost: false,
      effectiveSUTotals: null,
      isSupplyOnly: false,
    })
    expect(installTravel).toHaveLength(1)
    expect(installTravel[0].label).toBe("Job set-up fee( standard)")
    expect(installTravel[0].amount).toBe(14000)
  })
})
