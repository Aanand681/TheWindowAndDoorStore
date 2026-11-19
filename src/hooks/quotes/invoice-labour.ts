export interface InvoiceLabourItemsParams {
  isSupplyOnly?: boolean
  hasWindows: boolean
  winLabourCents: number
  effectiveWindows?: any[]
  taxTotals?: any
  hasDoors: boolean
  effectiveDoors?: any[]
  effectiveDoorTotals?: any
  hasSealedUnits: boolean
  effectiveSUTotals?: any
  isAttachedSUService?: boolean
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
  hasSealedUnits,
  effectiveSUTotals,
  isAttachedSUService = false,
}: InvoiceLabourItemsParams): { label: string; amount: number }[] {
  if (isSupplyOnly) return []

  const items: { label: string; amount: number }[] = []

  // 1. Window Labour
  if (hasWindows && winLabourCents > 0) {
    const rawWinLabour = Number(taxTotals?.labourWindows || 0) * 100
    const count = effectiveWindows.length
    const label =
      count > 0
        ? `Window installation labour (${count} unit${count !== 1 ? "s" : ""})`
        : "Window installation labour"
    const amount = rawWinLabour > 0 ? Math.round(rawWinLabour) : winLabourCents
    items.push({ label, amount })
  }

  // 2. Door Labour & Upcharges
  if (hasDoors && effectiveDoorTotals) {
    const count = effectiveDoors.length
    const unitLab = Math.round(Number(effectiveDoorTotals.unitLabourTotal || 0) * 100)
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

    const totalUpchargesCents = Math.round(
      Number(effectiveDoorTotals.upchargesTotal || 0) * 100
    )
    if (!upchargesAdded && totalUpchargesCents > 0) {
      items.push({
        label: "Door custom options & upcharges",
        amount: totalUpchargesCents,
      })
    }

    // Fallback if neither unitLabour nor upcharges were broken out
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
  }

  // 3. Sealed Unit Labour
  if (hasSealedUnits && effectiveSUTotals) {
    const suLab = Math.round(
      Number(
        effectiveSUTotals.serviceLabourTotal ??
          effectiveSUTotals.unitLabourSum ??
          0
      ) * 100
    )
    if (suLab > 0) {
      const label = isAttachedSUService
        ? "Sealed unit service labour"
        : "Sealed unit installation labour"
      items.push({ label, amount: suLab })
    }
  }

  return items
}
