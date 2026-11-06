'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Search,
  X,
  Paperclip,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  DoorClosed,
  AppWindow,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getSavedDrafts,
  QuoteDraftItem,
  QuoteType,
  DRAFT_CHANGE_EVENT,
} from '@/lib/quote-drafts-storage';
import {
  calculateSealedUnitTotals,
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from '@/lib/sealed-units-logic';
import { formatWindowSummarySentence } from '@/hooks/useCalculatorWindows';
import { formatDoorSummarySentence } from '@/lib/doors/calculations';
import { toast } from 'sonner';

export interface AttachQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuoteType?: QuoteType;
  // Attached quotes
  attachedWindowQuote?: any | null;
  attachedSealedUnit?: any | null;
  attachedDoorQuote?: any | null;
  // Action callbacks
  onAttachWindow?: (data: any) => void;
  onDetachWindow?: () => void;
  onAttachSealedUnit?: (data: any) => void;
  onDetachSealedUnit?: () => void;
  onAttachDoor?: (data: any) => void;
  onDetachDoor?: () => void;
  // Legacy / fallback single-attachment callback support
  onAttach?: (data: any) => void;
  onDetach?: () => void;
}

export function AttachQuoteModal({
  isOpen,
  onClose,
  currentQuoteType = 'window',
  attachedWindowQuote,
  attachedSealedUnit,
  attachedDoorQuote,
  onAttachWindow,
  onDetachWindow,
  onAttachSealedUnit,
  onDetachSealedUnit,
  onAttachDoor,
  onDetachDoor,
  onAttach,
  onDetach,
}: AttachQuoteModalProps) {
  const [drafts, setDrafts] = useState<QuoteDraftItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'window' | 'sealed_unit' | 'door'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDrafts = () => {
    const all = getSavedDrafts();
    // Filter out drafts matching the current host type
    setDrafts(all.filter((d) => d.type !== currentQuoteType));
  };

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
      setSearchQuery('');
      setActiveTab('all');
    }
  }, [isOpen, currentQuoteType]);

  useEffect(() => {
    window.addEventListener(DRAFT_CHANGE_EVENT, loadDrafts);
    return () => window.removeEventListener(DRAFT_CHANGE_EVENT, loadDrafts);
  }, [currentQuoteType]);

  const filteredDrafts = useMemo(() => {
    let list = drafts;
    if (activeTab !== 'all') {
      list = list.filter((d) => d.type === activeTab);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (d) =>
        d.quoteNumber?.toLowerCase().includes(q) ||
        d.customerName?.toLowerCase().includes(q) ||
        d.summaryLabel?.toLowerCase().includes(q)
    );
  }, [drafts, activeTab, searchQuery]);

  const windowDraftsCount = useMemo(
    () => drafts.filter((d) => d.type === 'window').length,
    [drafts]
  );
  const sealedUnitCount = useMemo(
    () => drafts.filter((d) => d.type === 'sealed_unit').length,
    [drafts]
  );
  const doorCount = useMemo(
    () => drafts.filter((d) => d.type === 'door').length,
    [drafts]
  );

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  // Check if a specific draft is already attached
  const isDraftAttached = (draft: QuoteDraftItem) => {
    if (draft.type === 'window') {
      return attachedWindowQuote?.quoteNumber === draft.quoteNumber;
    }
    if (draft.type === 'sealed_unit') {
      return attachedSealedUnit?.quoteNumber === draft.quoteNumber;
    }
    if (draft.type === 'door') {
      return attachedDoorQuote?.quoteNumber === draft.quoteNumber;
    }
    return false;
  };

  const handleAttachItem = (draft: QuoteDraftItem) => {
    const rawData = (draft.data as any) || {};

    if (draft.type === 'door') {
      const lineItems = rawData.lineItems || [];
      const doorSentence = formatDoorSummarySentence(lineItems);
      const payload = {
        quoteNumber: draft.quoteNumber,
        customerName: draft.customerName,
        itemCount: draft.itemCount,
        type: 'door',
        lineItems,
        summaryLabel: doorSentence,
        summarySentence: doorSentence,
        totals: rawData.totals || {
          grandTotal: draft.grandTotal,
          subtotalPreTax: draft.subtotal,
          rawDoorBaseTotal: draft.subtotal,
          stormDoorTotal: 0,
          hardwareTotal: 0,
          materialsTotal: draft.subtotal,
          combinedLabourTotal: 0,
          miscTotal: 0,
          surchargeTotal: 0,
          discountTotal: 0,
          hstAmount: draft.grandTotal - draft.subtotal,
          depositAmount: Math.round(draft.grandTotal * 0.5 * 100) / 100,
        },
        isInstallation: rawData.mode === 'installation',
        globalUpcharges: rawData.globalUpcharges || [],
        hstRate: rawData.isFirstNation ? 8 : 13,
      };

      if (onAttachDoor) {
        onAttachDoor(payload);
      } else if (onAttach) {
        onAttach(payload);
      }
      toast.success(`Attached Door Quote #${draft.quoteNumber}!`);
    } else if (draft.type === 'sealed_unit') {
      const lineItems = rawData.lineItems || (draft as any).lineItems || [];
      const calculatedTotals =
        rawData.totals ||
        calculateSealedUnitTotals({
          lineItems,
          isInstallation: Boolean(rawData.isInstallation),
          travelFeeType: rawData.travelFeeType || 'none',
          customTravelFee: rawData.customTravelFee,
          showOutTownTravel: Boolean(rawData.showOutTownTravel),
          travelKm: rawData.travelKm,
          crewHours: rawData.crewHours,
          crewSize: rawData.crewSize || '2',
          hstRate: rawData.hstRate ?? 13,
        });

      const isService = rawData.sealedUnitMode === 'service_only';
      const summarySentence = isService
        ? getSealedUnitServiceSummaryLabel(lineItems, calculatedTotals.totalSqft)
        : formatSealedUnitSummarySentence(lineItems);

      const payload = {
        quoteNumber: draft.quoteNumber,
        customerName: draft.customerName,
        itemCount: draft.itemCount,
        type: 'sealed_unit',
        lineItems,
        summaryLabel: summarySentence,
        summarySentence,
        totals: calculatedTotals,
        isInstallation: Boolean(rawData.isInstallation),
        sealedUnitMode: rawData.sealedUnitMode,
        hstRate: rawData.hstRate ?? 13,
      };

      if (onAttachSealedUnit) {
        onAttachSealedUnit(payload);
      } else if (onAttach) {
        onAttach(payload);
      }
      toast.success(`Attached Sealed Unit Quote #${draft.quoteNumber}!`);
    } else if (draft.type === 'window') {
      const rawRate = Number(rawData.surchargeRate ?? 8);
      const decimalRate = rawRate > 1 ? rawRate / 100 : rawRate;
      const baseDollars = Number(rawData.effectiveBase ?? (rawData.quoteResult?.base ? (rawData.quoteResult.base / 100) : (rawData.subtotal || draft.subtotal || 0)));

      let surchargeDollars: number;
      if (rawData.effectiveSurcharge !== undefined && rawData.effectiveSurcharge !== null && Number(rawData.effectiveSurcharge) <= baseDollars) {
        surchargeDollars = Number(rawData.effectiveSurcharge);
      } else if (rawData.quoteResult?.surcharge && (rawData.quoteResult.surcharge / 100) <= baseDollars) {
        surchargeDollars = rawData.quoteResult.surcharge / 100;
      } else {
        surchargeDollars = Math.round(baseDollars * decimalRate * 100) / 100;
      }

      const labourDollars = rawData.effectiveLabour ?? (rawData.customLabour !== undefined ? rawData.customLabour : Number(rawData.taxTotals?.finalLabour ?? rawData.taxTotals?.labourTotal ?? 0));
      const miscDollars = rawData.effectiveMisc ?? (rawData.customMisc !== undefined ? rawData.customMisc : Number(rawData.taxTotals?.finalMisc ?? rawData.taxTotals?.miscTotal ?? 0));
      const jcDollars = rawData.effectiveJC ?? (rawData.customJC !== undefined ? rawData.customJC : Number(rawData.taxTotals?.finalJC ?? rawData.taxTotals?.jcTotal ?? 0));
      const promoDiscountDollars = (rawData.quoteResult?.promoDiscount ? (rawData.quoteResult.promoDiscount / 100) : 0) || (rawData.promoDiscount || 0);
      const promoName = rawData.quoteResult?.promoName || rawData.activePromoName || '';
      const hasJamb = Boolean(rawData.taxTotals?.selectedJamb && (Number(rawData.taxTotals.selectedJamb.total) > 0 || Number(rawData.taxTotals.selectedJamb.rate) > 0));
      const hasCasing = Boolean(rawData.taxTotals?.selectedCasing && (Number(rawData.taxTotals.selectedCasing.total) > 0 || Number(rawData.taxTotals.selectedCasing.rate) > 0));
      const jcLabel = (hasJamb && hasCasing) ? 'Jambs & Casing' : (hasJamb ? 'Jambs Only' : (hasCasing ? 'Casing Only' : 'Jambs & Casing'));

      const windowSentence = formatWindowSummarySentence(rawData.windows || []);
      const finalSentence = windowSentence !== '0 Windows' ? windowSentence : (draft.summaryLabel || 'Windows & Glazing');

      const payload = {
        quoteNumber: draft.quoteNumber,
        customerName: draft.customerName,
        itemCount: draft.itemCount,
        type: 'window',
        windows: rawData.windows || [],
        summaryLabel: finalSentence,
        summarySentence: finalSentence,
        jcLabel: jcDollars > 0 ? jcLabel : '',
        promoName: promoDiscountDollars > 0 ? promoName : '',
        totals: {
          subtotal: draft.subtotal,
          grandTotal: draft.grandTotal,
          base: baseDollars,
          surcharge: surchargeDollars,
          labour: labourDollars,
          misc: miscDollars,
          jc: jcDollars,
          promoDiscount: promoDiscountDollars,
        },
        taxTotals: rawData.taxTotals,
        quoteResult: rawData.quoteResult,
        surchargeRate: decimalRate,
        hstRate: rawData.hstRate ?? 13,
        isSupplyOnly: Boolean(rawData.isSupplyOnly),
      };

      if (onAttachWindow) {
        onAttachWindow(payload);
      } else if (onAttach) {
        onAttach(payload);
      }
      toast.success(`Attached Window Quote #${draft.quoteNumber}!`);
    }
  };

  if (!isOpen) return null;

  const hasAnyAttached = Boolean(attachedWindowQuote || attachedSealedUnit || attachedDoorQuote);

  const getHostLabel = () => {
    if (currentQuoteType === 'window') return 'Window Quote';
    if (currentQuoteType === 'sealed_unit') return 'Sealed Unit Quote';
    return 'Door Quote';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Attach Quotes to {getHostLabel()}</h2>
              <p className="text-xs text-muted-foreground">
                Combine window, sealed unit, or door quotes into this quotation and PDF.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Attachments Ledger / Badges */}
        {hasAnyAttached && (
          <div className="p-3 sm:px-5 bg-emerald-500/10 border-b border-emerald-500/30 flex flex-col gap-2 text-xs">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Currently Attached to this Quotation:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {attachedWindowQuote && (
                <div className="flex items-center gap-2 bg-card/80 border border-emerald-500/40 rounded-lg px-2.5 py-1 shadow-xs">
                  <AppWindow className="w-3.5 h-3.5 text-primary" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    Window #{attachedWindowQuote.quoteNumber}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    (${attachedWindowQuote.totals?.grandTotal ? Number(attachedWindowQuote.totals.grandTotal).toFixed(2) : '0.00'})
                  </span>
                  {(onDetachWindow || onDetach) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onDetachWindow) onDetachWindow();
                        else if (onDetach) onDetach();
                        toast.info('Detached Window Quote');
                      }}
                      className="text-destructive hover:bg-destructive/10 p-0.5 rounded cursor-pointer"
                      title="Detach Window Quote"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {attachedSealedUnit && (
                <div className="flex items-center gap-2 bg-card/80 border border-emerald-500/40 rounded-lg px-2.5 py-1 shadow-xs">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    Sealed Unit #{attachedSealedUnit.quoteNumber}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    (${attachedSealedUnit.totals?.grandTotal ? Number(attachedSealedUnit.totals.grandTotal).toFixed(2) : '0.00'})
                  </span>
                  {(onDetachSealedUnit || onDetach) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onDetachSealedUnit) onDetachSealedUnit();
                        else if (onDetach) onDetach();
                        toast.info('Detached Sealed Unit Quote');
                      }}
                      className="text-destructive hover:bg-destructive/10 p-0.5 rounded cursor-pointer"
                      title="Detach Sealed Unit"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              {attachedDoorQuote && (
                <div className="flex items-center gap-2 bg-card/80 border border-emerald-500/40 rounded-lg px-2.5 py-1 shadow-xs">
                  <DoorClosed className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    Door Quote #{attachedDoorQuote.quoteNumber}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    (${attachedDoorQuote.totals?.grandTotal ? Number(attachedDoorQuote.totals.grandTotal).toFixed(2) : '0.00'})
                  </span>
                  {(onDetachDoor || onDetach) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onDetachDoor) onDetachDoor();
                        else if (onDetach) onDetach();
                        toast.info('Detached Door Quote');
                      }}
                      className="text-destructive hover:bg-destructive/10 p-0.5 rounded cursor-pointer"
                      title="Detach Door Quote"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toolbar: Search & Filter Tabs */}
        <div className="p-3 sm:px-5 border-b border-border/60 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-card/60">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by quote #, customer, or description..."
              className="pl-9 h-9 text-xs bg-background"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg shrink-0">
            <Button
              type="button"
              variant={activeTab === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="h-7 text-xs px-2.5"
            >
              All ({drafts.length})
            </Button>

            {currentQuoteType !== 'window' && (
              <Button
                type="button"
                variant={activeTab === 'window' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('window')}
                className="h-7 text-xs px-2.5 gap-1"
              >
                <AppWindow className="w-3 h-3" />
                <span>Windows ({windowDraftsCount})</span>
              </Button>
            )}

            {currentQuoteType !== 'sealed_unit' && (
              <Button
                type="button"
                variant={activeTab === 'sealed_unit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('sealed_unit')}
                className="h-7 text-xs px-2.5 gap-1"
              >
                <Layers className="w-3 h-3" />
                <span>Sealed Units ({sealedUnitCount})</span>
              </Button>
            )}

            {currentQuoteType !== 'door' && (
              <Button
                type="button"
                variant={activeTab === 'door' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('door')}
                className="h-7 text-xs px-2.5 gap-1"
              >
                <DoorClosed className="w-3 h-3" />
                <span>Doors ({doorCount})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Drafts List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5">
          {filteredDrafts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
              <div className="w-12 h-12 rounded-full bg-muted/50 mx-auto flex items-center justify-center">
                <Paperclip className="w-5 h-5 opacity-40" />
              </div>
              <div className="font-semibold text-sm text-foreground">No saved quotes available to attach</div>
              <p className="max-w-md mx-auto">
                Save quotes in the Window, Sealed Unit, or Door calculators to attach them together here.
              </p>
            </div>
          ) : (
            filteredDrafts.map((draft) => {
              const isAttached = isDraftAttached(draft);
              const isDoor = draft.type === 'door';
              const isWindow = draft.type === 'window';
              const isSealedUnit = draft.type === 'sealed_unit';

              return (
                <div
                  key={draft.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isAttached
                      ? 'border-emerald-500/60 bg-emerald-500/5 shadow-xs'
                      : 'border-border/70 hover:border-border hover:bg-muted/30 bg-card'
                    }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">
                        #{draft.quoteNumber || 'Untitled'}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${isDoor
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                            : isSealedUnit
                              ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                              : 'bg-primary/10 text-primary border border-primary/30'
                          }`}
                      >
                        {isDoor ? (
                          <>
                            <DoorClosed className="w-3 h-3" /> Door Quote
                          </>
                        ) : isSealedUnit ? (
                          <>
                            <Layers className="w-3 h-3" /> Sealed Units
                          </>
                        ) : (
                          <>
                            <AppWindow className="w-3 h-3" /> Window Quote
                          </>
                        )}
                      </span>

                      {isAttached && (
                        <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Attached
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-foreground font-semibold flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        {draft.customerName || 'No customer name'}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(draft.updatedAt)}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground truncate max-w-md">
                      {draft.summaryLabel || `${draft.itemCount || 0} items`}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Total
                      </div>
                      <div className="font-mono font-black text-base text-foreground">
                        ${draft.grandTotal ? draft.grandTotal.toFixed(2) : '0.00'}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={isAttached ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleAttachItem(draft)}
                      className={`h-8 px-3 text-xs font-bold gap-1.5 cursor-pointer shadow-xs ${isAttached
                          ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-500/10'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        }`}
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{isAttached ? 'Re-attach / Update' : 'Attach Quote'}</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border/70 bg-muted/20 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {drafts.length} saved quotes available to attach
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-semibold cursor-pointer"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AttachQuoteModal;

