'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FolderOpen, X, FileCheck2 } from 'lucide-react';
import {
  QuoteDraftItem,
  QuoteType,
  getSavedDrafts,
  deleteQuoteDraft,
  clearAllQuoteDrafts,
  DRAFT_CHANGE_EVENT,
} from '@/lib/quote-drafts-storage';
import { toast } from 'sonner';
import {
  SavedQuoteItemCard,
  SavedQuotesFilterBar,
  SavedQuotesModalFooter,
} from './saved-quotes';

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
  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = useState(false);

  const loadDraftsFromStorage = useCallback(() => {
    setDrafts(getSavedDrafts());
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadDraftsFromStorage();
      setSelectedTab(defaultType);
      setSearchQuery('');
      setConfirmDeleteId(null);
      setIsConfirmingDeleteAll(false);
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
      if (selectedTab !== 'all' && d.type !== selectedTab) return false;
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
  const doorDraftsCount = useMemo(
    () => drafts.filter((d) => d.type === 'door').length,
    [drafts]
  );

  const handleDelete = (id: string, quoteNumber: string) => {
    deleteQuoteDraft(id);
    setConfirmDeleteId(null);
    loadDraftsFromStorage();
    toast.success(`Draft #${quoteNumber} removed from saved list`);
  };

  const handleDeleteAll = () => {
    clearAllQuoteDrafts(selectedTab);
    setIsConfirmingDeleteAll(false);
    loadDraftsFromStorage();
    toast.success(
      selectedTab === 'all'
        ? 'All saved quotes deleted'
        : selectedTab === 'window'
        ? 'All window quotes deleted'
        : 'All sealed unit quotes deleted'
    );
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
        <SavedQuotesFilterBar
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalDraftsCount={drafts.length}
          windowDraftsCount={windowDraftsCount}
          sealedUnitDraftsCount={sealedUnitDraftsCount}
          doorDraftsCount={doorDraftsCount}
        />

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
            filteredDrafts.map((draft) => (
              <SavedQuoteItemCard
                key={draft.id}
                draft={draft}
                confirmDeleteId={confirmDeleteId}
                setConfirmDeleteId={setConfirmDeleteId}
                onDelete={handleDelete}
                onLoadQuote={onLoadQuote}
                onClose={onClose}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <SavedQuotesModalFooter
          totalDraftsCount={drafts.length}
          selectedTab={selectedTab}
          isConfirmingDeleteAll={isConfirmingDeleteAll}
          setIsConfirmingDeleteAll={setIsConfirmingDeleteAll}
          handleDeleteAll={handleDeleteAll}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

export default SavedQuotesModal;
