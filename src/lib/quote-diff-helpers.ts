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
    if (!oa) {
      const priceVal = Number(ca.total || (ca.lab || 0) + (ca.misc || 0))
      const priceText = priceVal > 0 ? ` (+${fmtDollar(priceVal)})` : ""
      changes.push(`Added Add-on: "${label}" (Qty: ${ca.qty || 1}${priceText})`)
    } else if (Number(ca.qty || 0) !== Number(oa.qty || 0)) {
      changes.push(
        `Add-on "${label}": Qty updated from ${oa.qty || 1} to ${ca.qty || 1}`
      )
    } else {
      const caCost = Number(ca.total || (ca.lab || 0) + (ca.misc || 0))
      const oaCost = Number(oa.total || (oa.lab || 0) + (oa.misc || 0))
      if (Math.abs(caCost - oaCost) > 0.5) {
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
