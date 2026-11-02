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
  Plus,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getSavedDrafts,
  QuoteDraftItem,
  DRAFT_CHANGE_EVENT,
} from '@/lib/quote-drafts-storage';
import { calculateSealedUnitTotals } from '@/lib/sealed-units-logic';
import { toast } from 'sonner';

export interface AttachSealedUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachedSealedUnit: any | null;
  onAttach: (sealedUnitData: any) => void;
  onDetach: () => void;
}

export function AttachSealedUnitModal({
  isOpen,
  onClose,
  attachedSealedUnit,
  onAttach,
  onDetach,
}: AttachSealedUnitModalProps) {
  const [drafts, setDrafts] = useState<QuoteDraftItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadDrafts = () => {
    const all = getSavedDrafts();
    setDrafts(all.filter((d) => d.type === 'sealed_unit'));
  };

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener(DRAFT_CHANGE_EVENT, loadDrafts);
    return () => window.removeEventListener(DRAFT_CHANGE_EVENT, loadDrafts);
  }, []);

  const filteredDrafts = useMemo(() => {
    if (!searchQuery.trim()) return drafts;
    const q = searchQuery.toLowerCase().trim();
    return drafts.filter(
      (d) =>
        d.quoteNumber?.toLowerCase().includes(q) ||
        d.customerName?.toLowerCase().includes(q) ||
        d.summaryLabel?.toLowerCase().includes(q)
    );
  }, [drafts, searchQuery]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Attach Sealed Units to Window Quote</h2>
              <p className="text-xs text-muted-foreground">
                Select a saved sealed unit quote to combine into this quotation and PDF.
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

        {/* Current Attachment Banner (if attached) */}
        {attachedSealedUnit && (
          <div className="p-3 sm:px-5 bg-emerald-500/10 border-b border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-semibold text-foreground mr-1">Currently Attached:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  #{attachedSealedUnit.quoteNumber}
                </span>
                <span className="text-muted-foreground ml-1">
                  ({attachedSealedUnit.itemCount || (attachedSealedUnit.lineItems && attachedSealedUnit.lineItems.length) || 0} items · ${attachedSealedUnit.totals?.grandTotal ? attachedSealedUnit.totals.grandTotal.toFixed(2) : '0.00'})
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onDetach();
                toast.success('Detached sealed units from quote');
              }}
              className="h-7 px-2.5 text-xs font-semibold text-destructive border-destructive/40 hover:bg-destructive/10 cursor-pointer gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Attachment</span>
            </Button>
          </div>
        )}

        {/* Search Toolbar */}
        <div className="p-3 sm:px-5 border-b border-border/50 bg-background flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sealed unit quotes by customer name or quote #..."
              className="pl-9 h-9 text-xs sm:text-sm bg-muted/40"
            />
          </div>
          <a
            href="/sealed-units"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold rounded-lg border border-border/80 bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>New Sealed Unit</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground ml-0.5" />
          </a>
        </div>

        {/* Quotes List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5">
          {filteredDrafts.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Layers className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No Sealed Unit Quotes Found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No saved sealed units match "${searchQuery}".`
                  : 'You have not saved any sealed unit quotes yet. Open the Sealed Unit Calculator to create and save one first.'}
              </p>
              <a
                href="/sealed-units"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <span>Open Sealed Unit Calculator</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            filteredDrafts.map((draft) => {
              const isCurrent = attachedSealedUnit?.quoteNumber === draft.quoteNumber;
              return (
                <div
                  key={draft.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30'
                      : 'bg-card hover:bg-muted/30 border-border/80 hover:border-border'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">
                        #{draft.quoteNumber}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(draft.updatedAt || draft.createdAt)}</span>
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                          Currently Attached
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-semibold text-foreground truncate">
                        {draft.customerName || 'Unnamed Customer'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {draft.summaryLabel} • {draft.itemCount} units
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:border-l sm:border-border/60 sm:pl-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Amount
                      </div>
                      <div className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                        ${draft.grandTotal ? draft.grandTotal.toFixed(2) : '0.00'}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant={isCurrent ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => {
                        const rawData = (draft.data as any) || {};
                        const lineItems = rawData.lineItems || (draft as any).lineItems || [];
                        const calculatedTotals = rawData.totals || calculateSealedUnitTotals({
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

                        const payload = {
                          quoteNumber: draft.quoteNumber,
                          customerName: draft.customerName,
                          itemCount: draft.itemCount,
                          lineItems,
                          totals: calculatedTotals,
                          isInstallation: Boolean(rawData.isInstallation),
                          hstRate: rawData.hstRate ?? 13,
                        };

                        onAttach(payload);
                        toast.success(`Attached Sealed Unit #${draft.quoteNumber} to quote!`);
                        onClose();
                      }}
                      className={`h-8 px-3 text-xs font-bold gap-1.5 cursor-pointer shadow-xs ${
                        isCurrent
                          ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-500/10'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{isCurrent ? 'Re-attach / Update' : 'Attach Quote'}</span>
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
            {drafts.length} saved sealed unit {drafts.length === 1 ? 'quote' : 'quotes'}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-semibold cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AttachSealedUnitModal;
