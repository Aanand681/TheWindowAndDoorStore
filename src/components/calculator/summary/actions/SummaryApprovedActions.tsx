'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Send, CheckCircle2, Edit3, ClipboardCheck, Printer } from 'lucide-react';

export interface SummaryApprovedActionsProps {
  reviewQuote: any;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  canEditApprovedQuote: boolean;
  reviewActionLoading: boolean;
  handleSaveQuotePrices: () => void;
  handleResubmitReturnedQuote: () => void;
  handleCancelEdits: () => void;
  handleExitReview: () => void;
  setOdooOrderNumberInput: (val: string) => void;
  setShowCompleteOdooModal: (val: boolean) => void;
  setIsPreviewOpen: (val: boolean) => void;
}

export function SummaryApprovedActions({
  reviewQuote,
  isEditMode,
  setIsEditMode,
  canEditApprovedQuote,
  reviewActionLoading,
  handleSaveQuotePrices,
  handleResubmitReturnedQuote,
  handleCancelEdits,
  handleExitReview,
  setOdooOrderNumberInput,
  setShowCompleteOdooModal,
  setIsPreviewOpen,
}: SummaryApprovedActionsProps) {
  return (
    <div className="space-y-2">
      {isEditMode ? (
        <>
          <Button
            variant="default"
            className="w-full h-11 text-sm shadow-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors"
            onClick={handleSaveQuotePrices}
            disabled={reviewActionLoading}
          >
            <Save className="w-4 h-4 mr-2" /> Save &amp; Keep Approved
          </Button>
          <Button
            variant="default"
            className="w-full h-11 text-sm shadow-md font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-colors"
            onClick={handleResubmitReturnedQuote}
            disabled={reviewActionLoading}
          >
            <Send className="w-4 h-4 mr-2" /> Resubmit for Review
          </Button>
          <Button
            variant="outline"
            className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted"
            onClick={handleCancelEdits}
            disabled={reviewActionLoading}
          >
            Cancel Edits
          </Button>
        </>
      ) : (
        <>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Quote Approved (View Only)
            </span>
            {canEditApprovedQuote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditMode(true)}
                className="h-7 text-xs font-bold text-primary hover:bg-primary/10"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            )}
          </div>
          {canEditApprovedQuote ? (
            <Button
              variant="outline"
              className="w-full h-10 text-xs font-bold border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
              onClick={() => setIsEditMode(true)}
            >
              <Edit3 className="w-4 h-4 mr-2" /> Edit Quote Details
            </Button>
          ) : (
            <>
              {reviewQuote.odooStatus === 'PENDING_ENTRY' && (
                <Button
                  variant="default"
                  className="w-full h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                  onClick={() => {
                    setOdooOrderNumberInput(reviewQuote.odooOrderNumber || '');
                    setShowCompleteOdooModal(true);
                  }}
                >
                  <ClipboardCheck className="w-4 h-4 mr-2" /> Mark Entered in Odoo
                </Button>
              )}
              <Button
                variant="default"
                className="w-full h-10 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Printer className="w-4 h-4 mr-2" /> Preview &amp; Print Quote
              </Button>
            </>
          )}
          <Button
            variant="outline"
            className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted"
            onClick={handleExitReview}
          >
            Exit Review Mode
          </Button>
        </>
      )}
    </div>
  );
}

