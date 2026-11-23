/**
 * Helper utilities for quote diffing, label normalization, and cents normalization.
 */

export const fmtDollar = (val: number): string =>
  `$${Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

/**
 * Normalizes legacy dollar snapshot totals to integer cents.
 * If val is ~100x smaller than counterpart (or < 10000 while counterpart >= 10000),
 * it converts raw dollars into integer cents.
 */
export function normalizeDiffTotalCents(
  val: number,
  counterpartCents?: number
): number {
  if (val <= 0) return 0
  if (counterpartCents && counterpartCents > 0) {
    // If val in dollars matches counterpart in cents within $1
    if (
      Math.abs(val * 100 - counterpartCents) <=
      Math.max(100, counterpartCents * 0.05)
    ) {
      return Math.round(val * 100)
    }
    // If val is raw dollars (< 10000) and counterpart is in cents (>= 10000)
    if (val < 10000 && counterpartCents >= 10000 && val * 50 < counterpartCents) {
      return Math.round(val * 100)
    }
  }
  return Math.round(val)
}

export function cleanJambLabel(name: string): string {
  if (!name || name.toLowerCase() === "none") return "None"
  const sizeMatch = name.match(/3\/4\s*x\s*(\d+(?:\s+\d+\/\d+)?)/i)
  if (sizeMatch) return sizeMatch[1].trim()
  const generalSize = name.match(/(\d+\s+\d+\/\d+|\d+\/\d+)/i)
  if (generalSize) return generalSize[1].trim()
  return name
    .replace(/Vinyl Wrapped Jamb\s*[-–]?\s*/i, "")
    .replace(/Jamb\s*[-–]?\s*/i, "")
    .trim()
}

export function cleanCasingLabel(name: string): string {
  if (!name || name.toLowerCase() === "none") return "None"
  return name
    .replace(/\s*casing\s*charge/i, "")
    .replace(/\s*casing/i, "")
    .trim()
}

export function detectWindowDiffs(
  origWindows: any[],
  curWindows: any[]
): string[] {
  const changes: string[] = []
  if (origWindows.length === 0 || curWindows.length === 0) return changes

  if (origWindows.length !== curWindows.length) {
    changes.push(
      `Window line items changed (${curWindows.length} windows vs ${origWindows.length} originally)`
    )
    return changes
  }

  origWindows.forEach((ow: any, idx: number) => {
    const cw = curWindows[idx]
    if (!cw) return
    const owSize = `${ow.w || "0"}" × ${ow.h || "0"}"`
    const cwSize = `${cw.w || "0"}" × ${cw.h || "0"}"`
    if (owSize !== cwSize && (ow.w || ow.h || cw.w || cw.h)) {
      changes.push(`Window #${idx + 1} size adjusted from ${owSize} to ${cwSize}`)
    }
    if (String(cw.qty || "") !== String(ow.qty || "")) {
      changes.push(
        `Window #${idx + 1} qty updated from ${ow.qty || 1} to ${cw.qty || 1}`
      )
    }
    if (Number(cw.base || 0) !== Number(ow.base || 0) && Number(cw.base || 0) > 0) {
      changes.push(
        `Window #${idx + 1} base price updated from ${fmtDollar(Number(ow.base || 0))} to ${fmtDollar(Number(cw.base || 0))}`
      )
    }
  })

  return changes
}

export function detectAddonDiffs(
  origAddons: any[],
  curAddons: any[]
): string[] {
  const changes: string[] = []
  const origAddonMap = new Map<string, any>()
  origAddons.forEach((a: any) => {
    const key = (a.label || a.name || a.id || "").trim().toLowerCase()
    if (key) origAddonMap.set(key, a)
  })

  const curAddonMap = new Map<string, any>()
  curAddons.forEach((a: any) => {
    const key = (a.label || a.name || a.id || "").trim().toLowerCase()
    if (key) curAddonMap.set(key, a)
  })

  curAddons.forEach((ca: any) => {
    const key = (ca.label || ca.name || ca.id || "").trim().toLowerCase()
    const oa = origAddonMap.get(key)
    const label = ca.label || ca.name || "Add-on"
    const caQty = Number(ca.quantity ?? ca.qty ?? 1)
    const caCost = Number(ca.total || (ca.lab || 0) + (ca.misc || 0) || ca.price || ca.cost || ca.amount || 0)

    if (!oa) {
      const priceText = caCost > 0 ? ` (+${fmtDollar(caCost)})` : ""
      changes.push(`Added Add-on: "${label}" (Qty: ${caQty}${priceText})`)
    } else {
      const oaQty = Number(oa.quantity ?? oa.qty ?? 1)
      const oaCost = Number(oa.total || (oa.lab || 0) + (oa.misc || 0) || oa.price || oa.cost || oa.amount || 0)
      if (caQty !== oaQty) {
        changes.push(
          `Add-on "${label}": Qty updated from ${oaQty} to ${caQty}`
        )
      } else if (Math.abs(caCost - oaCost) > 0.5) {
        changes.push(
          `Add-on "${label}": Price adjusted from ${fmtDollar(oaCost)} to ${fmtDollar(caCost)}`
        )
      }
    }
  })

  origAddons.forEach((oa: any) => {
    const key = (oa.label || oa.name || oa.id || "").trim().toLowerCase()
    if (!curAddonMap.has(key)) {
      const label = oa.label || oa.name || "Add-on"
      changes.push(`Removed Add-on: "${label}"`)
    }
  })

  return changes
}

export function detectDoorDiffs(
  origDoors: any[],
  curDoors: any[]
): string[] {
  const changes: string[] = []
  if (origDoors.length === 0 || curDoors.length === 0) return changes

  if (origDoors.length !== curDoors.length) {
    changes.push(
      `Door line items changed (${curDoors.length} doors vs ${origDoors.length} originally)`
    )
    return changes
  }

  origDoors.forEach((od: any, idx: number) => {
    const cd = curDoors[idx]
    if (!cd) return

    const odLabel = od.presetLabel || od.combinationName || od.label || `Door #${idx + 1}`
    const cdLabel = cd.presetLabel || cd.combinationName || cd.label || `Door #${idx + 1}`
    if (odLabel !== cdLabel) {
      changes.push(`Door #${idx + 1} model changed to "${cdLabel}" (was "${odLabel}")`)
    }

    const odQty = Number(od.quantity ?? od.qty ?? 1)
    const cdQty = Number(cd.quantity ?? cd.qty ?? 1)
    if (odQty !== cdQty) {
      changes.push(`Door #${idx + 1} qty updated from ${odQty} to ${cdQty}`)
    }

    const odSlab = od.slabWidth && od.slabHeight ? `${od.slabWidth}" × ${od.slabHeight}"` : ""
    const cdSlab = cd.slabWidth && cd.slabHeight ? `${cd.slabWidth}" × ${cd.slabHeight}"` : ""
    if (odSlab && cdSlab && odSlab !== cdSlab) {
      changes.push(`Door #${idx + 1} slab size updated from ${odSlab} to ${cdSlab}`)
    }

    const odPrice = Number(od.netDoorPrice ?? od.inksterBasePrice ?? od.finalUnitPrice ?? od.base ?? 0)
    const cdPrice = Number(cd.netDoorPrice ?? cd.inksterBasePrice ?? cd.finalUnitPrice ?? cd.base ?? 0)
    if (odPrice > 0 && cdPrice > 0 && Math.abs(odPrice - cdPrice) > 0.01) {
      changes.push(`Door #${idx + 1} price updated from ${fmtDollar(odPrice)} to ${fmtDollar(cdPrice)}`)
    }

    const odHw = od.hardwareType || (od.hardwarePrice ? "Custom" : "Standard")
    const cdHw = cd.hardwareType || (cd.hardwarePrice ? "Custom" : "Standard")
    if (odHw && cdHw && odHw.toLowerCase() !== cdHw.toLowerCase()) {
      changes.push(`Door #${idx + 1} hardware updated to ${cdHw} (was ${odHw})`)
    }
  })

  return changes
}

export function detectSealedUnitDiffs(
  origUnits: any[],
  curUnits: any[]
): string[] {
  const changes: string[] = []
  if (origUnits.length === 0 || curUnits.length === 0) return changes

  if (origUnits.length !== curUnits.length) {
    changes.push(
      `Sealed unit line items changed (${curUnits.length} vs ${origUnits.length} originally)`
    )
    return changes
  }

  origUnits.forEach((ou: any, idx: number) => {
    const cu = curUnits[idx]
    if (!cu) return

    const ouSize = ou.width && ou.height ? `${ou.width}" × ${ou.height}"` : ""
    const cuSize = cu.width && cu.height ? `${cu.width}" × ${cu.height}"` : ""
    if (ouSize && cuSize && ouSize !== cuSize) {
      changes.push(`Sealed Unit #${idx + 1} dimensions updated from ${ouSize} to ${cuSize}`)
    }

    const ouQty = Number(ou.quantity ?? ou.qty ?? 1)
    const cuQty = Number(cu.quantity ?? cu.qty ?? 1)
    if (ouQty !== cuQty) {
      changes.push(`Sealed Unit #${idx + 1} qty updated from ${ouQty} to ${cuQty}`)
    }

    const ouGlass = ou.glassType || ou.glass || ""
    const cuGlass = cu.glassType || cu.glass || ""
    if (ouGlass && cuGlass && ouGlass.toLowerCase() !== cuGlass.toLowerCase()) {
      changes.push(`Sealed Unit #${idx + 1} glass updated to "${cuGlass}" (was "${ouGlass}")`)
    }

    const ouSpacer = ou.spacer || ""
    const cuSpacer = cu.spacer || ""
    if (ouSpacer && cuSpacer && ouSpacer.toLowerCase() !== cuSpacer.toLowerCase()) {
      changes.push(`Sealed Unit #${idx + 1} spacer updated to "${cuSpacer}" (was "${ouSpacer}")`)
    }

    const ouGas = Boolean(ou.argon || ou.gasFill)
    const cuGas = Boolean(cu.argon || cu.gasFill)
    if (ouGas !== cuGas) {
      changes.push(`Sealed Unit #${idx + 1} gas fill changed to ${cuGas ? "Argon" : "Air"}`)
    }

    const ouLabour = Number(ou.unitGlazingLabour ?? ou.labour ?? 0)
    const cuLabour = Number(cu.unitGlazingLabour ?? cu.labour ?? 0)
    if (ouLabour > 0 && cuLabour > 0 && Math.abs(ouLabour - cuLabour) > 0.01) {
      changes.push(`Sealed Unit #${idx + 1} glazing labour updated from ${fmtDollar(ouLabour)} to ${fmtDollar(cuLabour)}`)
    }
  })

  return changes
}
