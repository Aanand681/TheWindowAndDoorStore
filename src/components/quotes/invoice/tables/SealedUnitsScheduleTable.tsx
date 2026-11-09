import React from 'react';
import type { QuoteTemplateType, InvoiceCalculationsResult } from '../types';
import { SealedUnitScheduleRow } from './SealedUnitScheduleRow';

export interface SealedUnitsScheduleTableProps {
  theme: QuoteTemplateType;
  calc: InvoiceCalculationsResult;
}

export function SealedUnitsScheduleTable({ theme, calc }: SealedUnitsScheduleTableProps) {
  const {
    isAttachedSUService: isService,
    attachedSealedUnit,
    effectiveSUTotals,
    effectiveSealedUnits,
    hasSealedUnits,
    suSummarySentence,
    isSUHost,
    h2Fs,
    microFs,
    bodyFs,
    thFs,
    rowPy,
  } = calc;

  const suMode =
    attachedSealedUnit?.sealedUnitMode ||
    attachedSealedUnit?.data?.sealedUnitMode ||
    (isService
      ? 'service_only'
      : attachedSealedUnit?.isInstallation || effectiveSUTotals.isInstallation
        ? 'installation'
        : 'supply_only');
  const isInstallation = !isService && suMode === 'installation';

  const effectiveSULineItems =
    effectiveSealedUnits.length > 0
      ? effectiveSealedUnits
      : isService && (effectiveSUTotals.totalSqft || 0) > 0
        ? [
            {
              id: 'su-service-1',
              widthIn: 'Custom Area',
              heightIn: '',
              paneType: 'dual',
              combinationName: 'On-Site Sealed Unit Service & Glazing',
              shapeDescription: 'On-Site Service',
              grillDescription: 'No Grills',
              quantity: 1,
              actualSqft: effectiveSUTotals.totalSqft || 0,
            },
          ]
        : [];

  if (!hasSealedUnits || effectiveSULineItems.length === 0) return null;

  const isModern = theme === 'modern';
  const isExecutive = theme === 'executive';
  const isCards = theme === 'cards';

  const minL = effectiveSUTotals.labourMinPerUnit ?? 120.0;
  const labourR =
    effectiveSUTotals.effectiveLabourRate || effectiveSUTotals.labourRatePerSqft || 14.4;
  const miscR = effectiveSUTotals.effectiveMiscRate || effectiveSUTotals.miscRatePerSqft || 2.4;

  return (
    <div
      className={
        isCards
          ? 'mb-4 border border-[#cbd5e1] rounded bg-white shadow-sm overflow-hidden'
          : 'mb-4'
      }
    >
      <div
        className={`flex items-center justify-between ${
          isCards
            ? 'p-2 bg-[#f8fafc] border-b border-[#cbd5e1]'
            : 'mb-1 pb-1 border-b-[1.5px] border-[#0f172a]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            style={{ fontSize: `${h2Fs}px` }}
            className="font-bold uppercase tracking-wider text-[#0f172a]"
          >
            {isService
              ? suSummarySentence
              : isInstallation
                ? 'Sealed Units & Installation'
                : 'Supply Only Sealed Units'}
          </span>
          {!isSUHost && attachedSealedUnit?.quoteNumber && (
            <span
              style={{ fontSize: `${microFs}px` }}
              className="px-1.5 py-0.5 rounded bg-muted text-[#334155] font-mono font-medium"
            >
              #{attachedSealedUnit.quoteNumber}
            </span>
          )}
        </div>
        <span style={{ fontSize: `${microFs}px` }} className="text-[#64748b] font-medium">
          {effectiveSULineItems.length} item{effectiveSULineItems.length > 1 ? 's' : ''}
        </span>
      </div>

      <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
        <thead>
          <tr
            className={
              isModern
                ? 'border-b-2 border-[#0f172a] text-[#0f172a]'
                : isExecutive
                  ? 'border-b-2 border-[#0f172a] text-[#0f172a]'
                  : 'border-b border-[#cbd5e1] bg-[#f1f5f9] text-[#0f172a]'
            }
            style={{ fontSize: `${thFs}px` }}
          >
            <th className="py-1 px-1.5 text-left font-bold w-[4%]">#</th>
            <th className="py-1 px-1.5 text-left font-bold w-[26%]">Glass Specs</th>
            <th className="py-1 px-1.5 text-left font-bold w-[22%]">Dimension</th>
            <th className="py-1 px-1.5 text-left font-bold w-[12%]">Grills</th>
            <th className="py-1 px-1.5 text-center font-bold w-[6%]">Qty</th>
            <th className="py-1 px-1.5 text-right font-mono font-bold w-[10%]">Base Price</th>
            <th className="py-1 px-1.5 text-right font-mono font-bold w-[10%]">Labour</th>
            <th className="py-1 px-1.5 text-right font-mono font-bold w-[10%]">Misc</th>
          </tr>
        </thead>
        <tbody style={{ fontSize: `${bodyFs}px` }}>
          {effectiveSULineItems.map((item: any, idx: number) => (
            <SealedUnitScheduleRow
              key={item.id || idx}
              item={item}
              idx={idx}
              isService={isService}
              isInstallation={isInstallation}
              labourR={labourR}
              minL={minL}
              miscR={miscR}
              rowPy={rowPy}
              microFs={microFs}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
