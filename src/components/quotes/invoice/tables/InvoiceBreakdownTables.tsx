import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { InvoiceCalculationsResult, AttachedUpgradeOption } from "../types"
import { QuoteInvoiceNotes } from "../QuoteInvoiceNotes"
import { InstallationOptionCard } from "./InstallationOptionCard"

export interface InvoiceBreakdownTablesProps {
  calc: InvoiceCalculationsResult
  wantsUpgrade?: boolean
  shownUpgrade?: number
  attachedUpgrade?: AttachedUpgradeOption | null
  quoteNotes?: string
  isDualOption?: boolean
}

export function InvoiceBreakdownTables({
  calc,
  wantsUpgrade,
  shownUpgrade = 0,
  attachedUpgrade,
  quoteNotes,
  isDualOption = false,
}: InvoiceBreakdownTablesProps) {
  const {
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
      {/* Travel & Set-up Breakdown */}
      {travelItems.length > 0 && (
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

      {/* Jamb & Casing Breakdown */}
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

      {/* Extras Breakdown */}
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

      {/* Optional 5-Year Labour Upgrade Callout */}
      {wantsUpgrade && shownUpgrade > 0 && !isSupplyOnly && (
        <div className="rounded border border-emerald-600 bg-white p-2 text-[#0f172a]">
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="flex items-center justify-between font-bold tracking-wider text-[#0f172a] uppercase"
          >
            <span>Optional 5-Year Labour Upgrade</span>
            <span className="font-mono font-bold text-emerald-700">
              +{formatMoney(shownUpgrade)}
            </span>
          </div>
          <div
            style={{ fontSize: `${microFs}px` }}
            className="mt-0.5 text-[#334155]"
          >
            Optional extended labour warranty coverage. Not included in quote
            total.
          </div>
        </div>
      )}

      {/* Optional Window Upgrade Offer */}
      {attachedUpgrade && attachedUpgrade.amountPreTaxCents > 0 && (
        <div className="rounded border border-[#d97706] bg-white p-2 text-[#0f172a]">
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="flex items-center justify-between font-bold tracking-wider text-[#0f172a] uppercase"
          >
            <span>Optional Upgrade Offer</span>
            <span className="font-mono font-bold text-[#b45309]">
              +{formatMoney(attachedUpgrade.amountPreTaxCents)}
            </span>
          </div>
          <div
            style={{ fontSize: `${microFs}px` }}
            className="mt-0.5 text-[#334155]"
          >
            {attachedUpgrade.title} adds{" "}
            {formatMoney(attachedUpgrade.amountPreTaxCents)}
          </div>
        </div>
      )}

      {/* Option for Door Upgrade */}
      {doorUpgradeItems.map((dItem: any, dIdx: number) => (
        <div
          key={dIdx}
          className="rounded border border-[#cbd5e1] bg-white p-2 text-[#0f172a] shadow-2xs"
        >
          <div
            style={{ fontSize: `${microFs}px` }}
            className="mb-1 font-bold tracking-wider text-[#64748b] uppercase"
          >
            option for Door upgrade:
          </div>
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="flex items-center justify-between font-semibold text-[#0f172a]"
          >
            <span>
              {dItem.upgradeOption?.title ||
                dItem.customDescription ||
                "Door Upgrade"}{" "}
              Add
            </span>
            <span className="font-mono font-bold text-[#0f172a]">
              +
              {formatMoney(
                Math.round(
                  (dItem.upgradeOption?.subtotalDifference || 0) *
                    100 *
                    (dItem.quantity || 1)
                )
              )}
            </span>
          </div>
        </div>
      ))}

      {/* Optional Installation Option (Supply Quotes Only) */}
      {isSupplyOnly && isDualOption && (
        <InstallationOptionCard
          calc={calc}
          amountPreTaxCents={attachedUpgrade?.amountPreTaxCents}
        />
      )}

      {/* Special Instructions & Notes */}
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
    </div>
  )
}
