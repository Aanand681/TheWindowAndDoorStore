import React from "react"

export const ADDONS = [
  {
    id: "blinds",
    label: "Blinds back on per window @ $60.00",
    lab: 60,
    misc: 0,
  },
  {
    id: "drip",
    label: "Drip edge install @ $30.00 per window",
    lab: 30,
    misc: 6.99,
  },
  { id: "base", label: "Basement windows $100.00 extra", lab: 100, misc: 0 },
  {
    id: "stucco",
    label: "Cut stucco around NF for BM @ $75",
    lab: 75,
    misc: 0,
  },
  {
    id: "siding",
    label: "Removal siding per window/door @ $130.00",
    lab: 130,
    misc: 0,
  },
  {
    id: "scaf1",
    label: "Scaffolding set up 1 section @ $60.00",
    lab: 60,
    misc: 0,
  },
  {
    id: "scaf2",
    label: "Scaffolding set up 2 sections @ $80.00",
    lab: 80,
    misc: 0,
  },
  { id: "alum", label: "Cut aluminum siding for BM @ $450", lab: 450, misc: 0 },
  {
    id: "jchan",
    label: "J channels (qty × $325 labour + $180 misc)",
    lab: 325,
    misc: 180,
  },
]

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

export interface TaxCalculatorTabProps {
  windows: any[]
  onWindowsChange: (w: any[]) => void
  onCalculated?: (totals: any) => void
  savedTaxTotals?: any
  readOnly?: boolean
  onOpenPreview?: () => void
  isSupplyOnly?: boolean
  isServiceOnly?: boolean
  onModeChange?: (mode: "installation" | "supply_only" | "service_only") => void
  summarySlot?: React.ReactNode
}
