export function parseInches(v: string | undefined | null): number | null {
  const s = String(v ?? "")
    .trim()
    .replace(/"/g, "")
  if (!s) return null
  let m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/)
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3])
  m = s.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (m) return Number(m[1]) / Number(m[2])
  const n = Number(s)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export function computeTotalLinearFeet(
  windows: any[],
  extraLinPerWindow: number
): number {
  let ln = 0
  windows.forEach((w) => {
    const W = parseInches(w.w)
    const H = parseInches(w.h)
    const qty = Math.max(1, parseInt(String(w.qty || "1"), 10) || 1)
    if (W !== null && H !== null && W > 0 && H > 0) {
      const perimeterInches = 2 * (W + H)
      const perimeterFeet = perimeterInches / 12
      ln += (perimeterFeet + extraLinPerWindow) * qty
    }
  })
  return ln
}
