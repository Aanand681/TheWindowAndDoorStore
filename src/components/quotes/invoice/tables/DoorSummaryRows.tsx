import React from 'react';
import { formatMoney } from '@/lib/promo-logic';
import { formatDoorItemHeading } from '@/lib/doors/calculations';

export interface DoorSummaryRowsProps {
  hasDoors: boolean;
  effectiveDoors: any[];
  doorMaterialsCents: number;
  doorSummarySentence: string;
  effectiveDoorTotals: any;
  textColor: string;
  py: number;
}

export function DoorSummaryRows({
  hasDoors,
  effectiveDoors,
  doorMaterialsCents,
  doorSummarySentence,
  effectiveDoorTotals,
  textColor,
  py,
}: DoorSummaryRowsProps) {
  if (!hasDoors) return null;

  return (
    <>
      {effectiveDoors.length > 0 ? (
        effectiveDoors.map((dItem: any, dIdx: number) => {
          const q = Number(dItem.quantity) || 1;
          const heading = formatDoorItemHeading(dItem);
          const itemBaseCents = Math.round((dItem.inksterBasePrice || 0) * q * 100);
          return (
            <tr key={dItem.id || dIdx} className="border-b border-[#e2e8f0]">
              <td
                style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
                className={`${textColor} font-medium`}
              >
                {heading}
              </td>
              <td
                style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
                className={`text-right font-mono font-bold ${textColor}`}
              >
                {formatMoney(itemBaseCents)}
              </td>
            </tr>
          );
        })
      ) : doorMaterialsCents > 0 ? (
        <tr className="border-b border-[#e2e8f0]">
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`${textColor} font-medium capitalize`}
          >
            {doorSummarySentence}
          </td>
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`text-right font-mono font-bold ${textColor}`}
          >
            {formatMoney(doorMaterialsCents)}
          </td>
        </tr>
      ) : null}

      {/* Door Hardware if any */}
      {Boolean((effectiveDoorTotals?.hardwareTotal || 0) > 0) && (
        <tr className="border-b border-[#e2e8f0]">
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`${textColor} font-medium`}
          >
            Door Lockset &amp; Hardware
          </td>
          <td
            style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}
            className={`text-right font-mono font-bold ${textColor}`}
          >
            {formatMoney(Math.round(Number(effectiveDoorTotals.hardwareTotal) * 100))}
          </td>
        </tr>
      )}
    </>
  );
}

