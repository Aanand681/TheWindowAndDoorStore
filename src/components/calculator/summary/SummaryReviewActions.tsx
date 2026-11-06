'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Send,
  Save,
  Edit3,
  CheckCircle2,
  ClipboardCheck,
  Printer,
  Share2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface SummaryReviewActionsProps {
  user: any;
  reviewQuote: any;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  canEditApprovedQuote: boolean;
  canEditCurrentQuote: boolean;
  isReviewerOrAdmin: boolean;
  reviewActionLoading: boolean;
  staffList: any[];
  clerkList: any[];
  quoteNumber: string;
  customerName: string;
  assignedReviewer: string;
  setAssignedReviewer: (val: string) => void;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (val: string) => void;
  setShowSubmitModal: (val: boolean) => void;
  handleResubmitReturnedQuote: () => void;
  handleSaveQuotePrices: () => void;
  handleExitReview: () => void;
  handleCancelEdits: () => void;
  setOdooOrderNumberInput: (val: string) => void;
  setShowCompleteOdooModal: (val: boolean) => void;
  setIsPreviewOpen: (val: boolean) => void;
  handleApproveReviewQuote: () => void;
  setReassignTo: (val: string) => void;
  setReassignNotes: (val: string) => void;
  setShowReassignModal: (val: boolean) => void;
  handleReturnReviewQuote: () => void;
}

export function SummaryReviewActions({
  user,
  reviewQuote,
  isEditMode,
  setIsEditMode,
  canEditApprovedQuote,
  canEditCurrentQuote,
  isReviewerOrAdmin,
  reviewActionLoading,
  staffList,
  clerkList,
  quoteNumber,
  customerName,
  assignedReviewer,
  setAssignedReviewer,
  selectedOdooClerk,
  setSelectedOdooClerk,
  setShowSubmitModal,
  handleResubmitReturnedQuote,
  handleSaveQuotePrices,
  handleExitReview,
  handleCancelEdits,
  setOdooOrderNumberInput,
  setShowCompleteOdooModal,
  setIsPreviewOpen,
  handleApproveReviewQuote,
  setReassignTo,
  setReassignNotes,
  setShowReassignModal,
  handleReturnReviewQuote,
}: SummaryReviewActionsProps) {
  return (
    <div className="mt-4 flex flex-col gap-2.5 w-full">
      {!reviewQuote ? (
        <Button
          variant="default"
          className={cn(
            'w-full h-11 text-sm shadow-md font-bold text-white cursor-pointer transition-colors',
            user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-amber-600 hover:bg-amber-700'
          )}
          onClick={() => {
            if (!quoteNumber.trim() || !customerName.trim()) {
              toast.error('Please enter a Customer Name and Quote Number before submitting!');
              return;
            }
            const otherReviewers = staffList.filter(
              (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
            );
            if (
              otherReviewers.length > 0 &&
              (!assignedReviewer ||
                assignedReviewer.toLowerCase() === user?.username?.toLowerCase() ||
                assignedReviewer === 'Admin')
            ) {
              setAssignedReviewer(otherReviewers[0].username);
            }
            if (!selectedOdooClerk && clerkList.length > 0) {
              const defaultClerk = clerkList.find((c) => c.department === 'CLERK') || clerkList[0];
              if (defaultClerk) setSelectedOdooClerk(defaultClerk.username);
            }
            setShowSubmitModal(true);
          }}
        >
          {user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" /> Approve &amp; Assign / Submit
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" /> Submit for Review
            </>
          )}
        </Button>
      ) : (
        <>
          {/* Returned Quote: Employee can revise and resubmit */}
          {reviewQuote.status === 'RETURNED' && (
            <>
              <Button
                variant="default"
                className="w-full h-11 text-sm shadow-md font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-colors"
                onClick={handleResubmitReturnedQuote}
                disabled={reviewActionLoading}
              >
                <Send className="w-4 h-4 mr-2" />
                {reviewActionLoading ? 'Resubmitting...' : 'Resubmit for Review'}
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-500/40 cursor-pointer transition-colors"
                onClick={handleSaveQuotePrices}
                disabled={reviewActionLoading}
              >
                <Save className="w-4 h-4 mr-2" /> Save Revisions
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted"
                onClick={handleExitReview}
              >
                Exit Review Mode
              </Button>
            </>
          )}

          {/* Approved or Modified Quote */}
          {(reviewQuote.status === 'APPROVED' || reviewQuote.status === 'MODIFIED') && (
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
          )}

          {/* Pending Review Quote */}
          {reviewQuote.status === 'PENDING_REVIEW' && (
            <>
              {isReviewerOrAdmin ? (
                <>
                  <Button
                    variant="default"
                    className="w-full h-11 text-sm shadow-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors"
                    onClick={handleApproveReviewQuote}
                    disabled={reviewActionLoading}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {reviewActionLoading ? 'Approving...' : 'Approve & Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const other = staffList.find(
                        (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
                      );
                      setReassignTo(other ? other.username : '');
                      setReassignNotes('');
                      setShowReassignModal(true);
                    }}
                    disabled={reviewActionLoading}
                    className="w-full h-10 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 cursor-pointer shadow-sm"
                  >
                    <Share2 className="w-4 h-4 mr-1.5" />
                    Forward / Reassign Quote
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-500/40 cursor-pointer transition-colors"
                    onClick={handleSaveQuotePrices}
                    disabled={reviewActionLoading}
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Updated Prices (No Status Change)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
                    onClick={handleReturnReviewQuote}
                    disabled={reviewActionLoading}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" /> Return with Note
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  {isEditMode ? (
                    <>
                      <Button
                        variant="default"
                        className="w-full h-11 text-sm shadow-md font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-colors"
                        onClick={handleSaveQuotePrices}
                        disabled={reviewActionLoading}
                      >
                        <Save className="w-4 h-4 mr-2" /> Save Revisions
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted"
                        onClick={handleCancelEdits}
                      >
                        Cancel Edits
                      </Button>
                    </>
                  ) : (
                    <>
                      {canEditCurrentQuote && (
                        <Button
                          variant="outline"
                          className="w-full h-10 text-xs font-bold border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
                          onClick={() => setIsEditMode(true)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" /> Edit Quote Details
                        </Button>
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
              )}
            </>
          )}
        </>
      )}

      {/* Standardized Preview & Print Quote Button */}
      <Button
        type="button"
        onClick={() => setIsPreviewOpen(true)}
        className="w-full h-10 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold gap-2 shadow-sm text-xs sm:text-sm cursor-pointer"
      >
        <Printer className="w-4 h-4" />
        <span>Preview &amp; Print Quote</span>
      </Button>
    </div>
  );
}

