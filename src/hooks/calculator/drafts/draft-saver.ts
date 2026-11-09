'use client';

import { toast } from 'sonner';
import { saveQuoteDraft, QuoteDraftItem } from '@/lib/quote-drafts-storage';
import { formatWindowSummarySentence } from '@/hooks/useCalculatorWindows';
import { computeCombinedQuoteFinancials } from '@/lib/calculator/pricing-engine';
import { UseCalculatorDraftsWorkspace, UseCalculatorDraftsFinancials } from './types';

export function executeSaveDraft(p: {
  workspace: UseCalculatorDraftsWorkspace;
  financials: UseCalculatorDraftsFinancials;
  loadedDraftId: string | null;
  setLoadedDraftId: (id: string) => void;
}): QuoteDraftItem | null {
  const { workspace, financials, loadedDraftId, setLoadedDraftId } = p;

  const validWindows = workspace.windows.filter(
    (w) =>
      (w.base && parseFloat(String(w.base)) > 0) ||
      (w.w && parseFloat(String(w.w)) > 0) ||
      (w.h && parseFloat(String(w.h)) > 0)
  );
  const hasValidAttachedQuote = Boolean(
    (workspace.attachedSealedUnit &&
      ((workspace.attachedSealedUnit.itemCount || 0) > 0 ||
        (workspace.attachedSealedUnit.totals?.grandTotal || 0) > 0)) ||
    (workspace.attachedDoorQuote &&
      ((workspace.attachedDoorQuote.itemCount || 0) > 0 ||
        (workspace.attachedDoorQuote.totals?.grandTotal || 0) > 0))
  );

  if (validWindows.length === 0 && !hasValidAttachedQuote) {
    toast.error('Please enter window sizes or pricing before saving a draft.');
    return null;
  }

  const effectiveQuoteNumber =
    workspace.quoteNumber.trim() || Math.floor(100000 + Math.random() * 900000).toString();
  if (!workspace.quoteNumber.trim()) {
    workspace.setQuoteNumber(effectiveQuoteNumber);
  }

  const summaryTypeDesc = formatWindowSummarySentence(workspace.windows);

  const calcFinancials = computeCombinedQuoteFinancials({
    quoteResult: financials.quoteResult,
    afterDiscount: financials.afterDiscount,
    total: financials.total,
    attachedSealedUnit: workspace.attachedSealedUnit,
    attachedDoorQuote: workspace.attachedDoorQuote,
    effectiveJC: financials.effectiveJC,
    effectiveMisc: financials.effectiveMisc,
    effectiveLabour: financials.effectiveLabour,
    hstRate: workspace.hstRate,
  });

  const savedDraft = saveQuoteDraft({
    id: loadedDraftId || undefined,
    type: 'window',
    quoteNumber: effectiveQuoteNumber,
    customerName: workspace.customerName.trim() || 'Unnamed Customer',
    itemCount: workspace.windows.length,
    subtotal: calcFinancials.subtotalDollars,
    grandTotal: calcFinancials.grandTotalDollars,
    summaryLabel: summaryTypeDesc,
    data: {
      quoteNumber: effectiveQuoteNumber,
      customerName: workspace.customerName,
      itemCount: workspace.windows.length,
      subtotal: calcFinancials.subtotalDollars,
      grandTotal: calcFinancials.grandTotalDollars,
      quoteNotes: workspace.quoteNotes,
      surchargeRate: workspace.surchargeRate,
      windows: workspace.windows,
      activePromoId: workspace.activePromoId,
      isSupplyOnly: workspace.isSupplyOnly,
      supplyJambId: workspace.supplyJambId,
      supplyJambRate: workspace.supplyJambRate,
      supplyCasingId: workspace.supplyCasingId,
      supplyCasingRate: workspace.supplyCasingRate,
      customJC: workspace.customJC,
      customMisc: workspace.customMisc,
      customLabour: workspace.customLabour,
      includeJCInPromo: workspace.includeJCInPromo,
      includeMiscInPromo: workspace.includeMiscInPromo,
      includeLabourInPromo: workspace.includeLabourInPromo,
      hstRate: workspace.hstRate,
      attachedUpgrade: workspace.attachedUpgrade,
      attachedSealedUnit: workspace.attachedSealedUnit,
      attachedDoorQuote: workspace.attachedDoorQuote,
      wantsUpgrade: workspace.wantsUpgrade,
      taxTotals: workspace.taxTotals || undefined,
    },
  });

  setLoadedDraftId(savedDraft.id);
  toast.success(`Window Quote #${effectiveQuoteNumber} saved!`);
  return savedDraft;
}
