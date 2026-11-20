import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { InvoiceCalculationsResult, AttachedUpgradeOption } from "../types"
import { QuoteInvoiceNotes } from "../QuoteInvoiceNotes"
import { QuoteUnifiedOptionsSection } from "./QuoteUnifiedOptionsSection"

export interface InvoiceBreakdownTablesProps {
  calc: InvoiceCalculationsResult
  wantsUpgrade?: boolean
  shownUpgrade?: number
  attachedUpgrade?: AttachedUpgradeOption | null
  quoteNotes?: string
  isDualOption?: boolean
  attachedInstallOption?: any | null
  customOptions?: any[] | null
}

interface LabourAndAddOnsSectionProps {
  labourItems?: { label: string; amount: number }[]
  extrasList: { key: string; label: string; qty: number; amount: number }[]
  isSupplyOnly?: boolean
  smallFs: number
}

function LabourAndAddOnsSection({
  labourItems = [],
  extrasList = [],
  isSupplyOnly = false,
  smallFs,
}: LabourAndAddOnsSectionProps) {
  const showLabour = !isSupplyOnly && labourItems.length > 0
  const showExtras = extrasList.length > 0
  if (!showLabour && !showExtras) return null

  return (
    <div>
      <div
        style={{ fontSize: `${smallFs}px` }}
        className="mb-0.5 border-b border-[#cbd5e1] pb-0.5 font-bold tracking-wider text-[#0f172a] uppercase"
      >
        Labour &amp; Extra Add-ons
      </div>
      <table
        className="w-full border-collapse"
        style={{ fontSize: `${smallFs}px` }}
      >
        <tbody>
          {showLabour &&
            labourItems.map((item, idx) => (
              <tr key={`labour-${idx}`} className="border-b border-[#e2e8f0]">
                <td className="py-0.5 font-medium text-[#1e293b]">
                  {item.label}
                </td>
                <td className="py-0.5 text-right font-mono font-bold text-[#0f172a]">
                  {formatMoney(item.amount)}
                </td>
              </tr>
            ))}
          {showExtras &&
            extrasList.map((item) => (
              <tr key={item.key} className="border-b border-[#e2e8f0]">
                <td className="py-0.5 font-medium text-[#1e293b]">
                  {item.label} (×{item.qty})
                </td>
                <td className="py-0.5 text-right font-mono font-bold text-[#0f172a]">
                  {formatMoney(item.amount)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

interface SectionTableProps {
  title: string
  items: { label: string; amount: number }[]
  smallFs: number
}

function SectionTable({ title, items, smallFs }: SectionTableProps) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <div
        style={{ fontSize: `${smallFs}px` }}
        className="mb-0.5 border-b border-[#cbd5e1] pb-0.5 font-bold tracking-wider text-[#0f172a] uppercase"
      >
        {title}
      </div>
      <table
        className="w-full border-collapse"
        style={{ fontSize: `${smallFs}px` }}
      >
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="border-b border-[#e2e8f0]">
              <td className="py-0.5 font-medium text-[#1e293b]">
                {item.label}
              </td>
              <td className="py-0.5 text-right font-mono font-bold text-[#0f172a]">
                {formatMoney(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function InvoiceBreakdownTables({
  calc,
  wantsUpgrade,
  shownUpgrade = 0,
  attachedUpgrade,
  quoteNotes,
  isDualOption = false,
  attachedInstallOption = null,
  customOptions = null,
}: InvoiceBreakdownTablesProps) {
  const {
    labourBreakdownItems,
    travelItems,
    jcItems,
    detailedExtrasList,
    isSupplyOnly,
    doorUpgradeItems,
    smallFs,
  } = calc

  return (
    <div className="space-y-2">
      {/* 1. Labour & Extra Add-ons */}
      <LabourAndAddOnsSection
        labourItems={labourBreakdownItems}
        extrasList={detailedExtrasList}
        isSupplyOnly={isSupplyOnly}
        smallFs={smallFs}
      />

      {/* 2. Jamb & Casing Specifications */}
      <SectionTable
        title="Jamb & Casing Specifications"
        items={jcItems}
        smallFs={smallFs}
      />

      {/* 3. Travel & Set-up Details */}
      {!isSupplyOnly && (
        <SectionTable
          title="Travel & Set-up Details"
          items={travelItems}
          smallFs={smallFs}
        />
      )}

      {/* 4. Special Instructions & Notes */}
      {quoteNotes && quoteNotes.trim() && (
        <div className="space-y-0.5 rounded border border-[#cbd5e1] bg-white p-2 text-[#0f172a]">
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="mb-0.5 border-b border-[#cbd5e1] pb-0.5 font-bold tracking-wider text-[#0f172a] uppercase"
          >
            Special Instructions &amp; Notes
          </div>
          <QuoteInvoiceNotes notes={quoteNotes} noteFs={smallFs} />
        </div>
      )}

      {/* 5. Unified Options Section */}
      <QuoteUnifiedOptionsSection
        calc={calc}
        isDualOption={isDualOption}
        attachedInstallOption={attachedInstallOption}
        customOptions={customOptions || undefined}
        wantsUpgrade={wantsUpgrade}
        shownUpgrade={shownUpgrade}
        attachedUpgrade={attachedUpgrade}
        doorUpgradeItems={doorUpgradeItems}
      />
    </div>
  )
}
