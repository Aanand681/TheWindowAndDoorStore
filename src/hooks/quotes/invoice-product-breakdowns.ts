import { toCents } from '@/lib/promo-logic';

export function getWindowBreakdown(
  effectiveWindows: any[],
  winMaterialsCents: number
): {
  windowSummarySentence: string;
  totalWindowBaseCents: number;
} {
  let dW = 0;
  let tW = 0;
  let dP = 0;
  let tP = 0;
  let totalBaseCentsCalculated = 0;

  if (Array.isArray(effectiveWindows) && effectiveWindows.length > 0) {
    effectiveWindows.forEach((w) => {
      const q = Math.max(1, Number(w.qty) || 1);
      const itemBase = toCents(w.base);
      const isTriple = Number(w.triple) > 0 || toCents(w.triple) > 0;
      const isPainted = w.color && w.color.toLowerCase() === 'painted';

      if (isPainted) {
        if (isTriple) tP += q;
        else dP += q;
      } else {
        if (isTriple) tW += q;
        else dW += q;
      }
      totalBaseCentsCalculated += itemBase;
    });
  }

  const totalQty = dW + tW + dP + tP;
  let paintedPart = '';
  if (dP > 0 && tP > 0) {
    paintedPart = `${dP} dual & ${tP} triple pane painted`;
  } else if (dP > 0) {
    paintedPart = `${dP} dual pane painted`;
  } else if (tP > 0) {
    paintedPart = `${tP} triple pane painted`;
  }

  let whitePart = '';
  if (dW > 0 && tW > 0) {
    whitePart = `${dW} dual & ${tW} triple pane white`;
  } else if (dW > 0) {
    whitePart = `${dW} dual pane white`;
  } else if (tW > 0) {
    whitePart = `${tW} triple pane white`;
  }

  const plural = totalQty > 1 ? 'windows' : 'window';
  let windowSummarySentence = '';
  if (paintedPart && whitePart) {
    const separator = paintedPart.includes('&') || whitePart.includes('&') ? ', ' : ' and ';
    windowSummarySentence = `${paintedPart}${separator}${whitePart} ${plural}`;
  } else if (paintedPart) {
    windowSummarySentence = `${paintedPart} ${plural}`;
  } else if (whitePart) {
    windowSummarySentence = `${whitePart} ${plural}`;
  } else {
    windowSummarySentence = 'Base price of windows';
  }

  const totalWindowBaseCents =
    totalBaseCentsCalculated > 0
      ? totalBaseCentsCalculated
      : winMaterialsCents > 0
        ? winMaterialsCents
        : 0;

  return { windowSummarySentence, totalWindowBaseCents };
}

export function getInvoiceSubtitle({
  hasWindows,
  hasDoors,
  hasSealedUnits,
  isSupplyOnly,
  isAttachedSUService,
}: {
  hasWindows: boolean;
  hasDoors: boolean;
  hasSealedUnits: boolean;
  isSupplyOnly: boolean;
  isAttachedSUService: boolean;
}): string {
  if (hasWindows && hasDoors && hasSealedUnits) {
    return isSupplyOnly
      ? 'Supply Only Windows, Doors & Sealed Units Quotation'
      : 'Comprehensive Window, Door & Sealed Unit Proposal';
  }
  if (hasWindows && hasDoors) {
    return isSupplyOnly
      ? 'Supply Only Windows & Doors Quotation'
      : 'Window & Door Architectural Proposal';
  }
  if (hasWindows && hasSealedUnits) {
    return isSupplyOnly
      ? 'Supply Only Windows & Sealed Units Quotation'
      : 'Window & Sealed Unit Quotation';
  }
  if (hasDoors && hasSealedUnits) {
    return isSupplyOnly
      ? 'Supply Only Doors & Sealed Units Quotation'
      : 'Door & Sealed Unit Quotation';
  }
  if (hasDoors) {
    return isSupplyOnly ? 'Supply Only Door Quotation' : 'Custom Door Systems Proposal';
  }
  if (hasSealedUnits) {
    return isSupplyOnly
      ? 'Supply Only Sealed Unit Quotation'
      : isAttachedSUService
        ? 'Sealed Unit Service & Glazing Proposal'
        : 'Sealed Glass Unit Proposal';
  }
  return isSupplyOnly ? 'Supply Only Window Quotation' : 'Window & Labour Quote';
}

