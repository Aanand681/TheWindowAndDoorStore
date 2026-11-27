function pickPositiveTravel(...vals: unknown[]): number {
  for (const val of vals) {
    const n = Number(val)
    if (Number.isFinite(n) && n > 0) return n
  }
  return 0
}

function resolveTotalsTravelSum(totals: any): number {
  if (!totals || typeof totals !== "object") return 0
  return (
    pickPositiveTravel(totals.baseSetupFee, totals.travelBaseSetupFee) +
    pickPositiveTravel(totals.additionalFarFee, totals.travelAdditionalFarFee) +
    pickPositiveTravel(totals.vehicleTravelFee, totals.travelVehicleFee) +
    pickPositiveTravel(totals.crewTravelFee, totals.travelCrewFee)
  )
}

function appendFeeBasedTravelItems(
  travelItems: { label: string; amount: number }[],
  activeTotals: any,
  fallbackTotal: number,
  fallbackLabel: string,
  formatRemoteLabel: () => string
): void {
  const baseSetupFee = pickPositiveTravel(
    activeTotals?.baseSetupFee,
    activeTotals?.travelBaseSetupFee
  )
  const additionalFarFee = pickPositiveTravel(
    activeTotals?.additionalFarFee,
    activeTotals?.travelAdditionalFarFee
  )
  const vehicleTravelFee = pickPositiveTravel(
    activeTotals?.vehicleTravelFee,
    activeTotals?.travelVehicleFee
  )
  const crewTravelFee = pickPositiveTravel(
    activeTotals?.crewTravelFee,
    activeTotals?.travelCrewFee
  )

  if (baseSetupFee > 0) {
    travelItems.push({
      label: "Job set-up fee( standard)",
      amount: Math.round(baseSetupFee * 100),
    })
  }
  if (additionalFarFee > 0) {
    travelItems.push({
      label: formatRemoteLabel(),
      amount: Math.round(additionalFarFee * 100),
    })
  }
  if (vehicleTravelFee > 0) {
    travelItems.push({
      label: "Vehicle travel",
      amount: Math.round(vehicleTravelFee * 100),
    })
  }
  if (crewTravelFee > 0) {
    travelItems.push({
      label: "Crew travel",
      amount: Math.round(crewTravelFee * 100),
    })
  }
  if (travelItems.length === 0 && fallbackTotal > 0) {
    travelItems.push({
      label: fallbackLabel,
      amount: Math.round(fallbackTotal * 100),
    })
  }
}

export function getInvoiceTravelItems({
  isWindowHost,
  taxTotals,
  regionName,
  isDoorHost,
  effectiveDoorTotals,
  isSUHost,
  effectiveSUTotals,
  isSupplyOnly = false,
  attachedWindowQuote,
  attachedDoorQuote,
  attachedSealedUnit,
}: {
  isWindowHost: boolean
  taxTotals: any
  regionName?: string
  isDoorHost: boolean
  effectiveDoorTotals: any
  isSUHost: boolean
  effectiveSUTotals: any
  isSupplyOnly?: boolean
  attachedWindowQuote?: any
  attachedDoorQuote?: any
  attachedSealedUnit?: any
}): { label: string; amount: number }[] {
  if (isSupplyOnly) {
    return []
  }

  const travelItems: { label: string; amount: number }[] = []

  const winTravel = pickPositiveTravel(
    taxTotals?.extras,
    taxTotals?.totalTravelAndSetup,
    attachedWindowQuote?.totals?.travelAndSetupFee,
    attachedWindowQuote?.taxTotals?.extras
  )
  const doorTravel = pickPositiveTravel(
    effectiveDoorTotals?.travelAndSetupFee,
    effectiveDoorTotals?.totalTravelAndSetup,
    resolveTotalsTravelSum(effectiveDoorTotals),
    attachedDoorQuote?.totals?.travelAndSetupFee,
    attachedDoorQuote?.taxTotals?.travelAndSetupFee,
    resolveTotalsTravelSum(attachedDoorQuote?.totals),
    resolveTotalsTravelSum(attachedDoorQuote?.taxTotals)
  )
  const suTravel = pickPositiveTravel(
    effectiveSUTotals?.travelAndSetupFee,
    effectiveSUTotals?.totalTravelAndSetup,
    resolveTotalsTravelSum(effectiveSUTotals),
    attachedSealedUnit?.totals?.travelAndSetupFee,
    attachedSealedUnit?.taxTotals?.totalTravelAndSetup,
    resolveTotalsTravelSum(attachedSealedUnit?.totals),
    resolveTotalsTravelSum(attachedSealedUnit?.taxTotals)
  )

  const maxTravel = Math.max(winTravel, doorTravel, suTravel)
  const canUseWindow = Boolean(taxTotals || attachedWindowQuote?.taxTotals)
  const canUseDoor = Boolean(effectiveDoorTotals || attachedDoorQuote?.totals)

  const useWindowTravel =
    canUseWindow &&
    winTravel > 0 &&
    winTravel >= doorTravel &&
    winTravel >= suTravel
  const useDoorTravel =
    !useWindowTravel &&
    canUseDoor &&
    doorTravel > 0 &&
    (doorTravel >= suTravel || (isDoorHost && suTravel === 0))

  const activeTotals = useWindowTravel
    ? (isWindowHost ? taxTotals : attachedWindowQuote?.taxTotals ?? taxTotals)
    : useDoorTravel
      ? (isDoorHost
          ? effectiveDoorTotals
          : {
              ...(attachedDoorQuote?.taxTotals || {}),
              ...(attachedDoorQuote?.totals || effectiveDoorTotals || {}),
            })
      : isSUHost
        ? effectiveSUTotals
        : {
            ...(attachedSealedUnit?.taxTotals || {}),
            ...(attachedSealedUnit?.totals || effectiveSUTotals || {}),
          }

  const resolvedRegion =
    useWindowTravel && !isWindowHost
      ? attachedWindowQuote?.taxTotals?.regionName ||
        attachedWindowQuote?.regionName ||
        regionName
      : useDoorTravel && !isDoorHost
        ? attachedDoorQuote?.regionName ||
          attachedDoorQuote?.taxTotals?.regionName ||
          regionName
        : !useWindowTravel && !useDoorTravel && !isSUHost
          ? attachedSealedUnit?.regionName ||
            attachedSealedUnit?.totals?.regionName ||
            regionName
          : regionName

  const formatRemoteLabel = () => {
    const regLower = resolvedRegion ? resolvedRegion.toLowerCase() : ""
    if (regLower.includes("dryden")) return "Setup charges for (dryden)"
    if (regLower.includes("sioux")) return "Setup charges for (sioux lookout)"
    if (regLower) return `Setup charges for (${regLower})`
    return "Setup charges for (dryden / sioux lookout)"
  }

  if (useWindowTravel && activeTotals) {
    if (activeTotals.km > 0) {
      travelItems.push({
        label: `Vehicle travel (${activeTotals.km} km @ $${activeTotals.vehicleRate?.toFixed(2) || "0.98"}/km)`,
        amount: (activeTotals.vehicle || 0) * 100,
      })
    }
    if (activeTotals.hrs > 0 && activeTotals.crew && activeTotals.crew !== "none") {
      travelItems.push({
        label: `Crew travel (${activeTotals.crew} crew × ${activeTotals.hrs}h @ $${activeTotals.crewRate || 0}/h)`,
        amount: (activeTotals.crewTravel || 0) * 100,
      })
    }
    const effectiveFixedSetup =
      activeTotals.fixedSetupFee !== undefined
        ? Number(activeTotals.fixedSetupFee)
        : !activeTotals.isSupplyOnly
          ? 140
          : 0

    if (effectiveFixedSetup > 0) {
      travelItems.push({
        label: "Job set-up fee( standard)",
        amount: Math.round(effectiveFixedSetup * 100),
      })
    }
    if (activeTotals.setup > 0) {
      travelItems.push({
        label: formatRemoteLabel(),
        amount: Math.round((activeTotals.setup || 0) * 100),
      })
    }
    if (activeTotals.baseTravelFee > 0) {
      travelItems.push({
        label: "Base travel fee",
        amount: (activeTotals.baseTravelFee || 0) * 100,
      })
    }
    if (travelItems.length === 0 && maxTravel > 0) {
      travelItems.push({
        label: "Site set-up & travel fee",
        amount: Math.round(maxTravel * 100),
      })
    }
  } else if (useDoorTravel && activeTotals) {
    appendFeeBasedTravelItems(
      travelItems,
      activeTotals,
      doorTravel,
      "Job set-up & travel fee (door quote)",
      formatRemoteLabel
    )
  } else if ((isSUHost || suTravel > 0) && activeTotals) {
    appendFeeBasedTravelItems(
      travelItems,
      activeTotals,
      suTravel,
      "Job set-up & travel fee (sealed unit)",
      formatRemoteLabel
    )
  }

  return travelItems
}

export function getInvoiceDetailedExtrasList(extrasList: any[]): {
  key: string
  label: string
  qty: number
  amount: number
}[] {
  const detailedExtrasList: {
    key: string
    label: string
    qty: number
    amount: number
  }[] = []

  extrasList.forEach((a: any, idx: number) => {
    const labCents = Math.round((Number(a.lab) || 0) * 100)
    const miscCents = Math.round((Number(a.misc) || 0) * 100)

    if (labCents > 0 && miscCents > 0) {
      detailedExtrasList.push({
        key: `${a.id || idx}-lab`,
        label: `${a.label} — Labour`,
        qty: a.qty || 1,
        amount: labCents,
      })
      detailedExtrasList.push({
        key: `${a.id || idx}-misc`,
        label: `${a.label} — Materials / Misc`,
        qty: a.qty || 1,
        amount: miscCents,
      })
    } else if (labCents > 0) {
      detailedExtrasList.push({
        key: `${a.id || idx}-lab`,
        label: `${a.label} — Labour`,
        qty: a.qty || 1,
        amount: labCents,
      })
    } else if (miscCents > 0) {
      detailedExtrasList.push({
        key: `${a.id || idx}-misc`,
        label: `${a.label} — Materials / Misc`,
        qty: a.qty || 1,
        amount: miscCents,
      })
    } else {
      const combinedCents = Math.round(
        ((Number(a.lab) || 0) + (Number(a.misc) || 0)) * 100
      )
      detailedExtrasList.push({
        key: `${a.id || idx}-all`,
        label: a.label,
        qty: a.qty || 1,
        amount: combinedCents,
      })
    }
  })

  return detailedExtrasList
}
