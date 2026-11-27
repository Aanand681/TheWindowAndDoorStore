import React from "react"
import { Layers, Package, Truck, Wrench } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"
import type { AttachedUpgradeOption, InvoiceCalculationsResult } from "../types"
import { QuoteInvoiceNotes } from "../QuoteInvoiceNotes"
import { QuoteUnifiedOptionsSection } from "../tables/QuoteUnifiedOptionsSection"

interface DetailRowProps {
  icon: React.ReactNode
  label: React.ReactNode
  value?: React.ReactNode
  fontSize: number
  rowPy: number
  tone?: "normal" | "note"
}

function BorderedIconRow({
  icon,
  label,
  value,
  fontSize,
  rowPy,
  tone = "normal",
}: DetailRowProps) {
  return (
    <div
      style={{ fontSize: `${fontSize}px`, padding: `${Math.max(2, rowPy)}px 7px` }}
      className={`flex items-center justify-between gap-2 ${
        tone === "note" ? "bg-[#f8fafc] text-[#334155]" : "bg-white text-[#0f172a]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="shrink-0 text-[#475569]">{icon}</span>
        <span className={tone === "note" ? "italic" : "font-medium"}>{label}</span>
      </div>
      {value !== undefined && value !== null && (
        <span className="shrink-0 font-mono font-bold text-[#0f172a]">{value}</span>
      )}
    </div>
  )
}

/**
 * Bordered installation labour & travel card with compact icon rows (no redundant title banner).
 */
export function InstallDetailsCard({ calc }: { calc: InvoiceCalculationsResult }) {
  if (calc.isSupplyOnly) return null
  const { labourBreakdownItems, travelItems, smallFs, rowPy } = calc
  if (labourBreakdownItems.length === 0 && travelItems.length === 0) return null

  return (
    <div className="divide-y divide-[#e2e8f0] overflow-hidden rounded border border-[#cbd5e1] bg-white">
      {labourBreakdownItems.map((item, idx) => (
        <BorderedIconRow
          key={`lab-${idx}`}
          icon={<Wrench className="h-3 w-3" />}
          label={item.label}
          value={formatMoney(item.amount)}
          fontSize={smallFs}
          rowPy={rowPy}
        />
      ))}
      {travelItems.map((item, idx) => (
        <BorderedIconRow
          key={`trv-${idx}`}
          icon={<Truck className="h-3 w-3" />}
          label={item.label}
          value={formatMoney(item.amount)}
          fontSize={smallFs}
          rowPy={rowPy}
        />
      ))}
    </div>
  )
}

/**
 * Bordered jambs, casings, and add-on extras card with compact icon rows (no redundant title banner).
 */
export function MaterialsDetailsCard({ calc }: { calc: InvoiceCalculationsResult }) {
  const { jcItems, detailedExtrasList, smallFs, rowPy } = calc
  if (jcItems.length === 0 && detailedExtrasList.length === 0) return null

  return (
    <div className="divide-y divide-[#e2e8f0] overflow-hidden rounded border border-[#cbd5e1] bg-white">
      {jcItems.map((item, idx) => (
        <BorderedIconRow
          key={`jc-${idx}`}
          icon={<Layers className="h-3 w-3" />}
          label={item.label}
          value={formatMoney(item.amount)}
          fontSize={smallFs}
          rowPy={rowPy}
        />
      ))}
      {detailedExtrasList.map((item) => (
        <BorderedIconRow
          key={item.key}
          icon={<Package className="h-3 w-3" />}
          label={`${item.label} (×${item.qty})`}
          value={formatMoney(item.amount)}
          fontSize={smallFs}
          rowPy={rowPy}
        />
      ))}
    </div>
  )
}

export interface OptionsDetailsCardProps {
  calc: InvoiceCalculationsResult
  isDualOption?: boolean
  attachedInstallOption?: any | null
  wantsUpgrade?: boolean
  shownUpgrade?: number
  attachedUpgrade?: AttachedUpgradeOption | null
  customOptions?: any[] | null
}

/**
 * Bordered quote options card reusing unified option entries without outer chrome banners.
 */
export function OptionsDetailsCard({
  calc,
  isDualOption = false,
  attachedInstallOption = null,
  wantsUpgrade = false,
  shownUpgrade = 0,
  attachedUpgrade = null,
  customOptions = null,
}: OptionsDetailsCardProps) {
  return (
    <QuoteUnifiedOptionsSection
      calc={calc}
      isDualOption={isDualOption}
      attachedInstallOption={attachedInstallOption}
      wantsUpgrade={wantsUpgrade}
      shownUpgrade={shownUpgrade}
      attachedUpgrade={attachedUpgrade}
      doorUpgradeItems={calc.doorUpgradeItems}
      customOptions={customOptions || undefined}
      variant="universal"
    />
  )
}

/**
 * Bordered compact notes card placing a crisp paper icon in front of each note line.
 */
export function NotesDetailsCard({
  quoteNotes,
  smallFs,
  rowPy,
}: {
  quoteNotes?: string
  smallFs: number
  rowPy: number
}) {
  if (!quoteNotes || !quoteNotes.trim()) return null

  return (
    <QuoteInvoiceNotes
      notes={quoteNotes}
      noteFs={smallFs}
      rowPy={rowPy}
      variant="paper-rows"
    />
  )
}
