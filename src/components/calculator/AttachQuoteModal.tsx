'use client';

import React from 'react';
import { Paperclip, Search, X, AppWindow, Layers, DoorClosed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QuoteType } from '@/lib/quote-drafts-storage';
import { useAttachQuoteDrafts } from './attach/useAttachQuoteDrafts';
import { AttachedQuotesPills } from './attach/AttachedQuotesPills';
import { AttachQuoteDraftCard } from './attach/AttachQuoteDraftCard';

export interface AttachQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuoteType?: QuoteType;
  attachedWindowQuote?: any | null;
  attachedSealedUnit?: any | null;
  attachedDoorQuote?: any | null;
  onAttachWindow?: (data: any) => void;
  onDetachWindow?: () => void;
  onAttachSealedUnit?: (data: any) => void;
  onDetachSealedUnit?: () => void;
  onAttachDoor?: (data: any) => void;
  onDetachDoor?: () => void;
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
  const {
    drafts,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredDrafts,
    windowDraftsCount,
    sealedUnitCount,
    doorCount,
    isDraftAttached,
    handleAttachItem,
  } = useAttachQuoteDrafts({
    isOpen,
    currentQuoteType,
    attachedWindowQuote,
    attachedSealedUnit,
    attachedDoorQuote,
    onAttachWindow,
    onAttachSealedUnit,
    onAttachDoor,
    onAttach,
  });

  if (!isOpen) return null;

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
        <AttachedQuotesPills
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
          attachedDoorQuote={attachedDoorQuote}
          onDetachWindow={onDetachWindow}
          onDetachSealedUnit={onDetachSealedUnit}
          onDetachDoor={onDetachDoor}
          onDetach={onDetach}
        />

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
              <div className="font-semibold text-sm text-foreground">
                No saved quotes available to attach
              </div>
              <p className="max-w-md mx-auto">
                Save quotes in the Window, Sealed Unit, or Door calculators to attach them together
                here.
              </p>
            </div>
          ) : (
            filteredDrafts.map((draft) => (
              <AttachQuoteDraftCard
                key={draft.id}
                draft={draft}
                isAttached={isDraftAttached(draft)}
                onAttachItem={handleAttachItem}
              />
            ))
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
