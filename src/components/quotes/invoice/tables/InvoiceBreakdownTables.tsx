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
    microFs,
  } = calc

  return (
    <div className="space-y-2">
      {/* 1. Installation Labour */}
      {!isSupplyOnly && labourBreakdownItems && labourBreakdownItems.length > 0 && (
        <div>
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="mb-0.5 border-b border-[#cbd5e1] pb-0.5 font-bold tracking-wider text-[#0f172a] uppercase"
          >
            Installation Labour
          </div>
          <table
            className="w-full border-collapse"
            style={{ fontSize: `${smallFs}px` }}
          >
            <tbody>
              {labourBreakdownItems.map((item, idx) => (
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
      )}

      {/* 2. Extras & Add-ons */}
      {detailedExtrasList.length > 0 && (
        <div>
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="mb-0.5 border-b border-[#cbd5e1] pb-0.5 font-bold tracking-wider text-[#0f172a] uppercase"
          >
            Extras &amp; Add-ons
          </div>
          <table
            className="w-full border-collapse"
            style={{ fontSize: `${smallFs}px` }}
          >
            <tbody>
              {detailedExtrasList.map((item) => (
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
      )}

      {/* 3. Jamb & Casing Specifications */}
      {jcItems.length > 0 && (
        <div>
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="mb-0.5 border-b border-[#cbd5e1] pb-0.5 font-bold tracking-wider text-[#0f172a] uppercase"
          >
            Jamb &amp; Casing Specifications
          </div>
          <table
            className="w-full border-collapse"
            style={{ fontSize: `${smallFs}px` }}
          >
            <tbody>
              {jcItems.map((item, idx) => (
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
      )}

      {/* 4. Travel & Set-up Details */}
      {!isSupplyOnly && travelItems.length > 0 && (
        <div>
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="mb-0.5 border-b border-[#cbd5e1] pb-0.5 font-bold tracking-wider text-[#0f172a] uppercase"
          >
            Travel &amp; Set-up Details
          </div>
          <table
            className="w-full border-collapse"
            style={{ fontSize: `${smallFs}px` }}
          >
            <tbody>
              {travelItems.map((item, idx) => (
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
      )}

      {/* 5. Special Instructions & Notes */}
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

      {/* 6. Unified Options Section */}
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
