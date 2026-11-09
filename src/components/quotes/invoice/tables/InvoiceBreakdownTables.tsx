import React from 'react';
import { formatMoney } from '@/lib/promo-logic';
import type { InvoiceCalculationsResult, AttachedUpgradeOption } from '../types';
import { QuoteInvoiceNotes } from '../QuoteInvoiceNotes';

export interface InvoiceBreakdownTablesProps {
  calc: InvoiceCalculationsResult;
  wantsUpgrade?: boolean;
  shownUpgrade?: number;
  attachedUpgrade?: AttachedUpgradeOption | null;
  quoteNotes?: string;
}

export function InvoiceBreakdownTables({
  calc,
  wantsUpgrade,
  shownUpgrade = 0,
  attachedUpgrade,
  quoteNotes,
}: InvoiceBreakdownTablesProps) {
  const {
    travelItems,
    jcItems,
    detailedExtrasList,
    isSupplyOnly,
    doorUpgradeItems,
    smallFs,
    microFs,
  } = calc;

  return (
    <div className="space-y-2">
      {/* Travel & Set-up Breakdown */}
      {travelItems.length > 0 && (
        <div>
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="font-bold uppercase tracking-wider text-[#0f172a] mb-0.5 pb-0.5 border-b border-[#cbd5e1]"
          >
            Travel &amp; Set-up Details
          </div>
          <table className="w-full border-collapse" style={{ fontSize: `${smallFs}px` }}>
            <tbody>
              {travelItems.map((item, idx) => (
                <tr key={idx} className="border-b border-[#e2e8f0]">
                  <td className="py-0.5 text-[#1e293b] font-medium">{item.label}</td>
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
            className="font-bold uppercase tracking-wider text-[#0f172a] mb-0.5 pb-0.5 border-b border-[#cbd5e1]"
          >
            Jamb &amp; Casing Specifications
          </div>
          <table className="w-full border-collapse" style={{ fontSize: `${smallFs}px` }}>
            <tbody>
              {jcItems.map((item, idx) => (
                <tr key={idx} className="border-b border-[#e2e8f0]">
                  <td className="py-0.5 text-[#1e293b] font-medium">{item.label}</td>
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
            className="font-bold uppercase tracking-wider text-[#0f172a] mb-0.5 pb-0.5 border-b border-[#cbd5e1]"
          >
            Extras &amp; Add-ons
          </div>
          <table className="w-full border-collapse" style={{ fontSize: `${smallFs}px` }}>
            <tbody>
              {detailedExtrasList.map((item) => (
                <tr key={item.key} className="border-b border-[#e2e8f0]">
                  <td className="py-0.5 text-[#1e293b] font-medium">
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
        <div className="p-2 bg-white border border-emerald-600 rounded text-[#0f172a]">
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="font-bold uppercase tracking-wider flex justify-between items-center text-[#0f172a]"
          >
            <span>Optional 5-Year Labour Upgrade</span>
            <span className="font-mono text-emerald-700 font-bold">
              +{formatMoney(shownUpgrade)}
            </span>
          </div>
          <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] mt-0.5">
            Optional extended labour warranty coverage. Not included in quote total.
          </div>
        </div>
      )}

      {/* Optional Window Upgrade Offer */}
      {attachedUpgrade && attachedUpgrade.amountPreTaxCents > 0 && (
        <div className="p-2 bg-white border border-[#d97706] rounded text-[#0f172a]">
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="font-bold uppercase tracking-wider flex justify-between items-center text-[#0f172a]"
          >
            <span>Optional Upgrade Offer</span>
            <span className="font-mono text-[#b45309] font-bold">
              +{formatMoney(attachedUpgrade.amountPreTaxCents)}
            </span>
          </div>
          <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] mt-0.5">
            {attachedUpgrade.title} adds {formatMoney(attachedUpgrade.amountPreTaxCents)}
          </div>
        </div>
      )}

      {/* Optional Door Upgrade Offers */}
      {doorUpgradeItems.map((dItem: any, dIdx: number) => (
        <div key={dIdx} className="p-2 bg-white border border-[#d97706] rounded text-[#0f172a]">
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="font-bold uppercase tracking-wider flex justify-between items-center text-[#0f172a]"
          >
            <span>Option for Door: {dItem.upgradeOption?.title}</span>
            <span className="font-mono text-[#b45309] font-bold">
              +
              {formatMoney(
                Math.round((dItem.upgradeOption?.subtotalDifference || 0) * 100)
              )}
            </span>
          </div>
          <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] mt-0.5">
            Optional upgrade for {dItem.customDescription || dItem.presetLabel || 'Door'}. Net
            pre-tax difference, not included in quote total.
          </div>
        </div>
      ))}

      {/* Special Instructions & Notes */}
      {quoteNotes && quoteNotes.trim() && (
        <div className="p-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] space-y-0.5">
          <div
            style={{ fontSize: `${smallFs}px` }}
            className="font-bold text-[#0f172a] uppercase tracking-wider mb-0.5 pb-0.5 border-b border-[#cbd5e1]"
          >
            Special Instructions &amp; Notes
          </div>
          <QuoteInvoiceNotes notes={quoteNotes} noteFs={smallFs} />
        </div>
      )}
    </div>
  );
}

