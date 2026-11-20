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
}): { label: string; amount: number }[] {
  if (isSupplyOnly) {
    return []
  }

  const travelItems: { label: string; amount: number }[] = []

  const winTravel = Number(taxTotals?.extras ?? taxTotals?.totalTravelAndSetup ?? attachedWindowQuote?.totals?.travelAndSetupFee ?? attachedWindowQuote?.taxTotals?.extras ?? 0)
  const doorTravel = Number(effectiveDoorTotals?.totalTravelAndSetup ?? attachedDoorQuote?.totals?.travelAndSetupFee ?? 0)
  const suTravel = Number(effectiveSUTotals?.totalTravelAndSetup ?? 0)

  const useWindowTravel = (isWindowHost && taxTotals) || (winTravel >= Math.max(doorTravel, suTravel) && attachedWindowQuote?.taxTotals)
  const useDoorTravel = !useWindowTravel && ((isDoorHost && effectiveDoorTotals) || (doorTravel >= suTravel && attachedDoorQuote?.totals))

  const activeTotals = useWindowTravel
    ? (isWindowHost ? taxTotals : attachedWindowQuote.taxTotals)
    : useDoorTravel
      ? (isDoorHost ? effectiveDoorTotals : attachedDoorQuote.totals)
      : effectiveSUTotals

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
      const regLower = regionName ? regionName.toLowerCase() : ""
      const remoteLabel =
        regLower.includes("dryden")
          ? "Setup charges for (dryden)"
          : regLower.includes("sioux")
            ? "Setup charges for (sioux lookout)"
            : regLower
              ? `Setup charges for (${regLower})`
              : "Setup charges for (dryden/ sioux lookout)"

      travelItems.push({
        label: remoteLabel,
        amount: Math.round((activeTotals.setup || 0) * 100),
      })
    }
    if (activeTotals.baseTravelFee > 0) {
      travelItems.push({
        label: "Base travel fee",
        amount: (activeTotals.baseTravelFee || 0) * 100,
      })
    }
  } else if (useDoorTravel && activeTotals) {
    if ((effectiveDoorTotals.baseSetupFee || 0) > 0) {
      travelItems.push({
        label: "Job set-up fee( standard)",
        amount: Math.round((effectiveDoorTotals.baseSetupFee || 0) * 100),
      })
    }
    if ((effectiveDoorTotals.additionalFarFee || 0) > 0) {
      const regLower = regionName ? regionName.toLowerCase() : ""
      const remoteLabel =
        regLower.includes("dryden")
          ? "Setup charges for (dryden)"
          : regLower.includes("sioux")
            ? "Setup charges for (sioux lookout)"
            : regLower
              ? `Setup charges for (${regLower})`
              : "Setup charges for (dryden/ sioux lookout)"

      travelItems.push({
        label: remoteLabel,
        amount: Math.round((effectiveDoorTotals.additionalFarFee || 0) * 100),
      })
    }
    if ((effectiveDoorTotals.vehicleTravelFee || 0) > 0) {
      travelItems.push({
        label: "Vehicle travel",
        amount: Math.round((effectiveDoorTotals.vehicleTravelFee || 0) * 100),
      })
    }
    if ((effectiveDoorTotals.crewTravelFee || 0) > 0) {
      travelItems.push({
        label: "Crew travel",
        amount: Math.round((effectiveDoorTotals.crewTravelFee || 0) * 100),
      })
    }
  } else if (isSUHost && effectiveSUTotals) {
    if ((effectiveSUTotals.baseSetupFee || 0) > 0) {
      travelItems.push({
        label: "Job set-up fee( standard)",
        amount: Math.round((effectiveSUTotals.baseSetupFee || 0) * 100),
      })
    }
    if ((effectiveSUTotals.additionalFarFee || 0) > 0) {
      const regLower = regionName ? regionName.toLowerCase() : ""
      const remoteLabel =
        regLower.includes("dryden")
          ? "Setup charges for (dryden)"
          : regLower.includes("sioux")
            ? "Setup charges for (sioux lookout)"
            : regLower
              ? `Setup charges for (${regLower})`
              : "Setup charges for (dryden/ sioux lookout)"

      travelItems.push({
        label: remoteLabel,
        amount: Math.round((effectiveSUTotals.additionalFarFee || 0) * 100),
      })
    }
    if ((effectiveSUTotals.vehicleTravelFee || 0) > 0) {
      travelItems.push({
        label: "Vehicle travel",
        amount: Math.round((effectiveSUTotals.vehicleTravelFee || 0) * 100),
      })
    }
    if ((effectiveSUTotals.crewTravelFee || 0) > 0) {
      travelItems.push({
        label: "Crew travel",
        amount: Math.round((effectiveSUTotals.crewTravelFee || 0) * 100),
      })
    }
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
