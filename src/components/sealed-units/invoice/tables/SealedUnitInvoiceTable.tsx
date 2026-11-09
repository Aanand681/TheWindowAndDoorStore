import React from 'react';
import { SealedUnitLineItem, SealedUnitLabourSettings } from '@/lib/sealed-units-logic';
import { SealedUnitTotals } from '../types';

interface SealedUnitInvoiceTableProps {
  lineItems: SealedUnitLineItem[];
  totals: SealedUnitTotals;
  isService: boolean;
  isInstallation: boolean;
  labour: SealedUnitLabourSettings;
  variant?: 'window_style' | 'standard';
}

export function SealedUnitInvoiceTable({
  lineItems,
  totals,
  isService,
  isInstallation,
  labour,
  variant = 'window_style',
}: SealedUnitInvoiceTableProps) {
  const isStandard = variant === 'standard';

  const cellBorder = isStandard ? 'border-r border-gray-300' : '';
  const rowBorder = isStandard ? 'border-b border-gray-300' : '';
  const headRowClass = isStandard
    ? 'bg-gray-100 border-b-2 border-gray-400 font-bold text-gray-900 uppercase text-[7.5pt]'
    : 'bg-slate-100 text-slate-900 border-b-2 border-slate-400 font-bold uppercase text-[7.5pt] tracking-wider';

  const tableContent = (
    <table
      className={
        isStandard
          ? 'w-full text-left text-[8pt] border border-gray-400 border-collapse'
          : 'w-full text-left text-[8pt] border-collapse'
      }
    >
      <thead>
        <tr className={headRowClass}>
          <th className={`py-1.5 px-2 text-center w-7 ${cellBorder}`}>#</th>
          <th className={`py-1.5 px-2 ${cellBorder}`}>Glass Specs</th>
          <th className={`py-1.5 px-2 ${cellBorder}`}>Dimension</th>
          <th className={`py-1.5 px-2 ${cellBorder}`}>Grills</th>
          <th className={`py-1.5 px-2 text-center w-10 ${cellBorder}`}>Qty</th>
          <th className={`py-1.5 px-2 text-right ${cellBorder}`}>Base Price</th>
          <th className={`py-1.5 px-2 text-right ${cellBorder}`}>Labour</th>
          <th className="py-1.5 px-2 text-right">Misc</th>
        </tr>
      </thead>
      <tbody className={isStandard ? '' : 'divide-y divide-slate-200'}>
        {lineItems.length === 0 && isService ? (
          <tr className={rowBorder}>
            <td className={`py-2 px-2 text-center text-slate-500 font-mono ${cellBorder}`}>1</td>
            <td className={`py-2 px-2 font-mono text-slate-400 ${cellBorder}`}>—</td>
            <td className={`py-2 px-2 font-mono font-bold text-slate-900 ${cellBorder}`}>
              {(totals.totalSqft || 0).toFixed(2)} sq ft total
            </td>
            <td className={`py-2 px-2 text-slate-400 font-mono ${cellBorder}`}>—</td>
            <td className={`py-2 px-2 text-center font-bold font-mono ${cellBorder}`}>1</td>
            <td className={`py-2 px-2 text-right text-slate-400 font-mono ${cellBorder}`}>—</td>
            <td className={`py-2 px-2 text-right font-mono font-bold text-slate-900 ${cellBorder}`}>
              ${(totals.serviceLabourTotal || 0).toFixed(2)}
            </td>
            <td className="py-2 px-2 text-right font-mono text-slate-700">
              ${(totals.miscTotal || 0).toFixed(2)}
            </td>
          </tr>
        ) : (
          lineItems.map((item, idx) => {
            const minL = labour.labourMinPerUnit ?? 120.0;
            const labourR = totals.effectiveLabourRate || labour.labourRatePerSqft || 14.4;
            const miscR = totals.effectiveMiscRate || labour.miscRatePerSqft || 2.4;
            const unitServiceLabour = Math.max(item.actualSqft * labourR, minL);
            const totalItemServiceLabour = Math.round(unitServiceLabour * item.quantity * 100) / 100;
            const totalItemServiceMisc = Math.round(item.actualSqft * miscR * item.quantity * 100) / 100;

            const unitInstallLabour =
              item.unitLabour > 0
                ? Math.max(item.unitLabour, minL)
                : Math.max(item.actualSqft * labourR, minL);
            const totalInstallLabour = Math.round(unitInstallLabour * item.quantity * 100) / 100;

            const hasGrill = item.rawGrillCost > 0 || Boolean(item.grill);
            const grillDimText =
              item.grill?.colsCount && item.grill?.rowsCount
                ? `${item.grill.colsCount} × ${item.grill.rowsCount}`
                : '';

            return (
              <tr
                key={item.id}
                className={isStandard ? rowBorder : 'hover:bg-slate-50/50'}
              >
                <td className={`py-1.5 px-2 text-center font-mono font-bold text-slate-500 ${cellBorder}`}>
                  {idx + 1}
                </td>

                {/* Glass Specs */}
                <td className={`py-1.5 px-2 ${cellBorder}`}>
                  {!isService ? (
                    <>
                      <div className="font-bold text-slate-900">{item.combinationName}</div>
                      <div className="text-[7pt] text-slate-500 capitalize">
                        {item.treatment} · {item.paneType === 'triple' ? 'Triple Pane' : 'Dual Pane'} ·{' '}
                        {item.thicknessMm}mm
                      </div>
                    </>
                  ) : (
                    <span className="text-slate-400 font-mono">—</span>
                  )}
                </td>

                {/* Dimension */}
                <td className={`py-1.5 px-2 font-mono ${cellBorder}`}>
                  <div className="font-bold text-slate-900 whitespace-nowrap">
                    {item.widthIn}&quot; wide × {item.heightIn}&quot; high
                  </div>
                  <div className="text-[7pt] text-slate-500 font-sans">
                    {item.actualSqft.toFixed(2)} sqft{' '}
                    {!isService && item.billableSqft !== Math.round(item.actualSqft)
                      ? `(${item.billableSqft} billable)`
                      : ''}
                  </div>
                </td>

                {/* Grills */}
                <td className={`py-1.5 px-2 ${cellBorder}`}>
                  {!isService && hasGrill ? (
                    <div>
                      {grillDimText ? (
                        <div className="font-bold text-slate-900 font-mono text-[7.5pt]">
                          {grillDimText}
                        </div>
                      ) : null}
                      <div className="text-[7pt] text-amber-800 font-semibold truncate">
                        {item.grill?.color
                          ? `${item.grill.color} Grills`
                          : item.grillDescription || 'Grills'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-mono">—</span>
                  )}
                </td>

                {/* Qty */}
                <td className={`py-1.5 px-2 text-center font-mono font-bold text-slate-900 ${cellBorder}`}>
                  {item.quantity}
                </td>

                {/* Base Price */}
                <td className={`py-1.5 px-2 text-right font-mono ${cellBorder}`}>
                  {!isService ? (
                    <>
                      <div className="font-bold text-slate-950">
                        $
                        {Number(
                          item.multipliedTotal ??
                            (item.multipliedAmount
                              ? item.multipliedAmount * item.quantity
                              : item.lineGlassTotal || 0)
                        ).toFixed(2)}
                      </div>
                      <div className="text-[6.5pt] text-slate-500">
                        $
                        {Number(
                          item.multipliedAmount ||
                            (item.multipliedTotal
                              ? item.multipliedTotal / item.quantity
                              : item.finalUnitPrice || 0)
                        ).toFixed(2)}
                        /ea
                      </div>
                    </>
                  ) : (
                    <span className="text-slate-400 font-mono">—</span>
                  )}
                </td>

                {/* Labour */}
                <td className={`py-1.5 px-2 text-right font-mono ${cellBorder}`}>
                  {isService ? (
                    <>
                      <div className="font-bold text-slate-900">
                        ${totalItemServiceLabour.toFixed(2)}
                      </div>
                      <div className="text-[6.5pt] text-slate-500">
                        ${unitServiceLabour.toFixed(2)}/ea
                      </div>
                    </>
                  ) : isInstallation ? (
                    <>
                      <div className="font-bold text-slate-900">
                        ${totalInstallLabour.toFixed(2)}
                      </div>
                      <div className="text-[6.5pt] text-slate-500">
                        ${unitInstallLabour.toFixed(2)}/ea
                      </div>
                    </>
                  ) : (
                    <span className="text-slate-400 font-mono">—</span>
                  )}
                </td>

                {/* Misc */}
                <td className="py-1.5 px-2 text-right font-mono">
                  {isService ? (
                    <span className="font-medium text-slate-700">
                      ${totalItemServiceMisc.toFixed(2)}
                    </span>
                  ) : isInstallation ? (
                    <span className="font-medium text-slate-700">
                      ${Number(item.totalMisc || 0).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-mono">—</span>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  if (isStandard) {
    return tableContent;
  }

  return (
    <div className="border border-slate-300 rounded overflow-hidden">
      {tableContent}
    </div>
  );
}

