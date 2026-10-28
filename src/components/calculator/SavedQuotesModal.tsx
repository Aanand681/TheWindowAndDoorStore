'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderOpen,
  X,
  Search,
  Trash2,
  Calendar,
  Layers,
  Component,
  ArrowRight,
  User,
  Hash,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/promo-logic';
import {
  QuoteDraftItem,
  QuoteType,
  getSavedDrafts,
  deleteQuoteDraft,
  DRAFT_CHANGE_EVENT,
} from '@/lib/quote-drafts-storage';
import { toast } from 'sonner';

interface SavedQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: QuoteType | 'all';
  onLoadQuote: (draft: QuoteDraftItem) => void;
}

export function SavedQuotesModal({
  isOpen,
  onClose,
  defaultType = 'all',
  onLoadQuote,
}: SavedQuotesModalProps) {
  const [drafts, setDrafts] = useState<QuoteDraftItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<QuoteType | 'all'>(defaultType);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadDraftsFromStorage = React.useCallback(() => {
    setDrafts(getSavedDrafts());
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadDraftsFromStorage();
      setSelectedTab(defaultType);
      setSearchQuery('');
      setConfirmDeleteId(null);
    }
  }, [isOpen, defaultType, loadDraftsFromStorage]);

  useEffect(() => {
    function handleDraftChange() {
      loadDraftsFromStorage();
    }
    window.addEventListener(DRAFT_CHANGE_EVENT, handleDraftChange);
    return () => {
      window.removeEventListener(DRAFT_CHANGE_EVENT, handleDraftChange);
    };
  }, [loadDraftsFromStorage]);

  const filteredDrafts = useMemo(() => {
    return drafts.filter((d) => {
      // Type filter
      if (selectedTab !== 'all' && d.type !== selectedTab) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = d.customerName?.toLowerCase().includes(q);
      const numberMatch = d.quoteNumber?.toLowerCase().includes(q);
      const summaryMatch = d.summaryLabel?.toLowerCase().includes(q);
      return Boolean(nameMatch || numberMatch || summaryMatch);
    });
  }, [drafts, selectedTab, searchQuery]);

  const windowDraftsCount = useMemo(
    () => drafts.filter((d) => d.type === 'window').length,
    [drafts]
  );
  const sealedUnitDraftsCount = useMemo(
    () => drafts.filter((d) => d.type === 'sealed_unit').length,
    [drafts]
  );

  const handleDelete = (id: string, quoteNumber: string) => {
    deleteQuoteDraft(id);
    setConfirmDeleteId(null);
    loadDraftsFromStorage();
    toast.success(`Draft #${quoteNumber} removed from saved list`);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-card border border-border shadow-2xl rounded-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Saved Quotes &amp; Drafts</h2>
              <p className="text-xs text-muted-foreground">
                Fetch and restore previously saved quotes to continue working anytime.
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

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-border/60 bg-background/50 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setSelectedTab('all')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  selectedTab === 'all'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                All ({drafts.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('window')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                  selectedTab === 'window'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Component className="w-3.5 h-3.5" />
                <span>Windows ({windowDraftsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab('sealed_unit')}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                  selectedTab === 'sealed_unit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sealed Units ({sealedUnitDraftsCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer or quote #..."
                className="pl-8 h-8 text-xs bg-background shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Draft List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 min-h-[220px]">
          {filteredDrafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6 text-muted-foreground/60" />
              </div>
              <div className="text-sm font-semibold text-foreground">No saved quotes found</div>
              <p className="text-xs max-w-sm text-muted-foreground">
                {searchQuery
                  ? 'No drafts match your current search query.'
                  : 'Click "Save Quote" on any calculation to save drafts here for quick retrieval.'}
              </p>
            </div>
          ) : (
            filteredDrafts.map((draft) => {
              const isWindow = draft.type === 'window';
              const isConfirmingDelete = confirmDeleteId === draft.id;

              return (
                <div
                  key={draft.id}
                  className="group relative bg-card hover:bg-muted/30 border border-border/70 hover:border-primary/40 rounded-xl p-3.5 sm:p-4 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                >
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {isWindow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          <Component className="w-3 h-3" />
                          <span>Window Quote</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Layers className="w-3 h-3" />
                          <span>Sealed Unit Quote</span>
                        </span>
                      )}

                      <span className="font-mono text-xs font-bold text-foreground">
                        #{draft.quoteNumber}
                      </span>

                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-auto sm:ml-0">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(draft.updatedAt || draft.createdAt)}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="font-semibold text-sm text-foreground truncate">
                        {draft.customerName || 'Unnamed Customer'}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="truncate">{draft.summaryLabel}</span>
                      <span>•</span>
                      <span className="font-medium text-foreground">{draft.itemCount} items</span>
                    </div>
                  </div>

                  {/* Right: Financials & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:border-l sm:border-border/60 sm:pl-4 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        Total Amount
                      </div>
                      <div className="font-mono font-black text-base sm:text-lg text-primary">
                        ${draft.grandTotal ? draft.grandTotal.toFixed(2) : '0.00'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1 bg-destructive/10 p-1 rounded-lg border border-destructive/30">
                          <span className="text-[11px] font-semibold text-destructive px-1.5">Delete?</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(draft.id, draft.quoteNumber)}
                            className="h-7 px-2 text-xs font-bold cursor-pointer"
                          >
                            Yes
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-7 px-2 text-xs cursor-pointer"
                          >
                            No
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(draft.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Delete draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => {
                          onLoadQuote(draft);
                          onClose();
                        }}
                        className="h-8 px-3 text-xs font-bold gap-1.5 shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <span>Load Quote</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border/70 bg-muted/20 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {drafts.length} total saved {drafts.length === 1 ? 'quote' : 'quotes'}
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
export default SavedQuotesModal;
