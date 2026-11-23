export interface InvoiceLabourItemsParams {
  isSupplyOnly?: boolean
  hasWindows: boolean
  winLabourCents: number
  effectiveWindows?: any[]
  taxTotals?: any
  hasDoors: boolean
  effectiveDoors?: any[]
  effectiveDoorTotals?: any
  doorUpcharges?: any[]
  hasSealedUnits: boolean
  effectiveSUTotals?: any
  suUpcharges?: any[]
  isAttachedSUService?: boolean
}

function getWindowLabourItems(
  hasWindows: boolean,
  winLabourCents: number,
  effectiveWindows: any[],
  taxTotals?: any
): { label: string; amount: number }[] {
  if (!hasWindows || winLabourCents <= 0) return []
  const rawWinLabour =
    taxTotals?.wLab !== undefined
      ? Math.round(Number(taxTotals.wLab) * 100)
      : taxTotals?.aLab !== undefined && taxTotals?.labourWindows !== undefined
        ? Math.round((Number(taxTotals.labourWindows) - Number(taxTotals.aLab)) * 100)
        : Number(taxTotals?.labourWindows || 0) * 100
  const count = effectiveWindows.length
  const label =
    count > 0
      ? `Window installation labour (${count} unit${count !== 1 ? "s" : ""})`
      : "Window installation labour"
  const amount = rawWinLabour > 0 ? rawWinLabour : winLabourCents
  return [{ label, amount }]
}

function getDoorLabourItems(
  hasDoors: boolean,
  effectiveDoors: any[],
  effectiveDoorTotals?: any,
  doorUpcharges: any[] = []
): { label: string; amount: number }[] {
  if (!hasDoors || !effectiveDoorTotals) return []
  const items: { label: string; amount: number }[] = []
  const count = effectiveDoors.length

  const totalUpcharges = Number(effectiveDoorTotals.upchargesTotal || 0)
  const rawUnitLabour = Number(effectiveDoorTotals.unitLabourTotal || 0)
  const doorPure =
    effectiveDoorTotals.doorPureLabourTotal !== undefined
      ? Number(effectiveDoorTotals.doorPureLabourTotal)
      : undefined

  // If doorPure was explicitly set (e.g. custom override or attached), determine base unit labour
  const baseLabour =
    doorPure !== undefined && (rawUnitLabour === 0 || doorPure !== rawUnitLabour + totalUpcharges)
      ? Math.max(0, doorPure - totalUpcharges)
      : rawUnitLabour

  const unitLab = Math.round(baseLabour * 100)
  if (unitLab > 0) {
    const label =
      count > 0
        ? `Door installation labour (${count} unit${count !== 1 ? "s" : ""})`
        : "Door installation labour"
    items.push({ label, amount: unitLab })
  }

  let upchargesAdded = false
  effectiveDoors.forEach((door: any) => {
    if (Array.isArray(door.upcharges)) {
      door.upcharges.forEach((up: any) => {
        const amt = Math.round(Number(up.total || up.rate || 0) * 100)
        if (amt > 0) {
          upchargesAdded = true
          const qtyStr = up.qty && up.qty > 1 ? ` (×${up.qty})` : ""
          items.push({
            label: `Door ${up.label || "Upcharge"}${qtyStr}`,
            amount: amt,
          })
        }
      })
    }
  })

  if (Array.isArray(doorUpcharges) && doorUpcharges.length > 0) {
    doorUpcharges.forEach((up: any) => {
      const amt = Math.round(Number(up.total ?? up.price ?? up.rate ?? 0) * 100)
      if (amt > 0) {
        upchargesAdded = true
        const qtyStr = up.qty && up.qty > 1 ? ` (×${up.qty})` : ""
        items.push({
          label: `Door ${up.label || "Upcharge"}${qtyStr}`,
          amount: amt,
        })
      }
    })
  }

  const totalUpchargesCents = Math.round(
    Number(effectiveDoorTotals.upchargesTotal || 0) * 100
  )
  if (!upchargesAdded && totalUpchargesCents > 0) {
    items.push({
      label: "Door custom options & upcharges",
      amount: totalUpchargesCents,
    })
  }

  if (unitLab === 0 && !upchargesAdded && totalUpchargesCents === 0) {
    const pureDoor = Math.round(
      (effectiveDoorTotals.doorPureLabourTotal !== undefined
        ? Number(effectiveDoorTotals.doorPureLabourTotal)
        : Math.max(
            0,
            (effectiveDoorTotals.combinedLabourTotal || 0) -
              (effectiveDoorTotals.baseSetupFee || 0) -
              (effectiveDoorTotals.totalTravelAndSetup || 0)
          )) * 100
    )
    if (pureDoor > 0) {
      items.push({ label: "Door installation labour", amount: pureDoor })
    }
  }

  return items
}

function getSealedUnitLabourItems(
  hasSealedUnits: boolean,
  effectiveSUTotals?: any,
  isAttachedSUService = false,
  suUpcharges: any[] = []
): { label: string; amount: number }[] {
  if (!hasSealedUnits || !effectiveSUTotals) return []
  const items: { label: string; amount: number }[] = []
  const rawSuLab = isAttachedSUService
    ? Number(effectiveSUTotals.serviceLabourTotal || 0)
    : Number(
        effectiveSUTotals.unitLabourSum ||
          effectiveSUTotals.doorPureLabourTotal ||
          effectiveSUTotals.pureLabourTotal ||
          effectiveSUTotals.combinedLabourTotal ||
          0
      )
  const suLab = Math.round(rawSuLab * 100)
  if (suLab > 0) {
    const label = isAttachedSUService
      ? "Sealed unit service labour"
      : "Sealed unit installation labour"
    items.push({ label, amount: suLab })
  }

  const effectiveSUUp =
    Array.isArray(suUpcharges) && suUpcharges.length > 0
      ? suUpcharges
      : Array.isArray(effectiveSUTotals.globalUpcharges)
        ? effectiveSUTotals.globalUpcharges
        : []

  effectiveSUUp.forEach((up: any) => {
    const amt = Math.round(
      Number(up.total ?? up.price ?? up.rate ?? 0) * 100
    )
    if (amt > 0) {
      items.push({
        label: `Sealed unit ${up.label || "extra labour"}`,
        amount: amt,
      })
    }
  })

  // Include extraLabour if defined on effectiveSUTotals and not already itemized
  const extraLabourCents = Math.round(Number(effectiveSUTotals.extraLabour || 0) * 100)
  const hasExtraLabourInUpcharges = effectiveSUUp.some((u: any) =>
    (u.label || "").toLowerCase().includes("extra labour")
  )
  if (extraLabourCents > 0 && !hasExtraLabourInUpcharges) {
    items.push({
      label: "Sealed unit extra labour",
      amount: extraLabourCents,
    })
  }

  return items
}

export function getInvoiceLabourItems({
  isSupplyOnly = false,
  hasWindows,
  winLabourCents,
  effectiveWindows = [],
  taxTotals,
  hasDoors,
  effectiveDoors = [],
  effectiveDoorTotals,
  doorUpcharges = [],
  hasSealedUnits,
  effectiveSUTotals,
  suUpcharges = [],
  isAttachedSUService = false,
}: InvoiceLabourItemsParams): { label: string; amount: number }[] {
  if (isSupplyOnly) return []
  return [
    ...getWindowLabourItems(hasWindows, winLabourCents, effectiveWindows, taxTotals),
    ...getDoorLabourItems(hasDoors, effectiveDoors, effectiveDoorTotals, doorUpcharges),
    ...getSealedUnitLabourItems(hasSealedUnits, effectiveSUTotals, isAttachedSUService, suUpcharges),
  ]
}
