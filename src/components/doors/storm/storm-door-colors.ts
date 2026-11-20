export interface StormDoorColorStyle {
  outerFill: string
  outerStroke: string
  innerFill: string
  kickFill: string
  kickStroke: string
  handleColor: string
  swatchHex: string
}

export const ARCHITECTURAL_COLORS: Record<string, string> = {
  white: "#F8FAFC",
  black: "#1E1E1E",
  "chocolate brown": "#3E2723",
  "commercial brown": "#4A3728",
  clay: "#8D7B68",
  sandalwood: "#C4B59D",
  "iron ore": "#353839",
  "mill finish": "#B5B8BC",
  cranberry: "#8A1C30",
  "forest green": "#1E3F20",
  "hunter green": "#1B4D3E",
  green: "#2E7D32",
  navy: "#1B365D",
  blue: "#2563EB",
  "slate blue": "#475569",
  burgundy: "#6B1D2F",
  red: "#B91C1C",
  charcoal: "#2C3539",
  bronze: "#544436",
  almond: "#E8DCC4",
  sandstone: "#D2C4A7",
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "")
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean
  const num = parseInt(full, 16)
  if (isNaN(num)) return { r: 248, g: 250, b: 252 }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  const h = (clamp(r) << 16) | (clamp(g) << 8) | clamp(b)
  return `#${h.toString(16).padStart(6, "0")}`
}

function adjustTone(hex: string, factor: number): string {
  const { r, g, b } = parseHex(hex)
  if (factor < 0) {
    const f = 1 + factor
    return toHex(r * f, g * f, b * f)
  }
  return toHex(r + (255 - r) * factor, g + (255 - g) * factor, b + (255 - b) * factor)
}

function isDarkColor(hex: string): boolean {
  const { r, g, b } = parseHex(hex)
  const luma = 0.299 * r + 0.587 * g + 0.114 * b
  return luma < 140
}

export function resolveColorHex(colorOrHex?: string): string {
  if (!colorOrHex) return "#F8FAFC"
  const clean = colorOrHex.trim().toLowerCase()
  if (clean.startsWith("#")) return colorOrHex.trim()
  if (ARCHITECTURAL_COLORS[clean]) return ARCHITECTURAL_COLORS[clean]

  for (const [key, hex] of Object.entries(ARCHITECTURAL_COLORS)) {
    if (clean.includes(key)) return hex
  }
  return "#8A1C30"
}

export function getStormDoorColorStyles(colorOrHex?: string): StormDoorColorStyle {
  const hex = resolveColorHex(colorOrHex)
  const dark = isDarkColor(hex)

  return {
    outerFill: hex,
    outerStroke: adjustTone(hex, -0.35),
    innerFill: adjustTone(hex, dark ? 0.08 : -0.05),
    kickFill: adjustTone(hex, -0.06),
    kickStroke: adjustTone(hex, -0.32),
    handleColor: dark ? "#E4E4E7" : "#27272A",
    swatchHex: hex,
  }
}
