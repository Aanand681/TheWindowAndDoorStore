'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ClipboardCheck } from 'lucide-react';

interface QuickReviewModalProps {
  selectedQuoteForReview: any;
  setSelectedQuoteForReview: (val: any) => void;
  reviewerNotes: string;
  setReviewerNotes: (val: string) => void;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (val: string) => void;
  reviewingAction: boolean;
  handleQuickApprove: (quote: any, newStatus: 'APPROVED' | 'RETURNED') => void;
  staffList: any[];
}

export function QuickReviewModal({
  selectedQuoteForReview,
  setSelectedQuoteForReview,
  reviewerNotes,
  setReviewerNotes,
  selectedOdooClerk,
  setSelectedOdooClerk,
  reviewingAction,
  handleQuickApprove,
  staffList,
}: QuickReviewModalProps) {
  if (!selectedQuoteForReview) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Quick Review: Quote #{selectedQuoteForReview.quoteNumber}
            </h3>
            <p className="text-xs text-muted-foreground">
              Customer: <strong>{selectedQuoteForReview.customerName}</strong> &bull; Prepared
              by: <strong>{selectedQuoteForReview.preparedBy}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quickNotes" className="text-xs font-semibold">
            Reviewer Instructions / Notes
          </Label>
          <textarea
            id="quickNotes"
            rows={3}
            placeholder="Optional notes or instructions for the preparer..."
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            className="w-full text-xs bg-background border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary font-sans"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="quickOdooAssignee"
            className="text-xs font-semibold flex items-center justify-between text-foreground"
          >
            <span className="flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Assign for Odoo Entry &amp; Physical Filing</span>
            </span>
            <span className="text-[10px] text-destructive font-semibold">* Required</span>
          </Label>
          <select
            id="quickOdooAssignee"
            value={selectedOdooClerk}
            onChange={(e) => setSelectedOdooClerk(e.target.value)}
            className="w-full text-xs bg-background border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">-- Select Odoo Clerk (Required) --</option>
            {staffList.map((s: any) => {
              const displayName =
                s.name ||
                (s.username
                  ? s.username.charAt(0).toUpperCase() + s.username.slice(1)
                  : 'Staff');
              return (
                <option key={s._id || s.username} value={s.username}>
                  {displayName}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedQuoteForReview(null);
              setSelectedOdooClerk('');
            }}
            disabled={reviewingAction}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickApprove(selectedQuoteForReview, 'RETURNED')}
            disabled={reviewingAction}
            className="text-destructive hover:bg-destructive/10 border-destructive/30 font-semibold cursor-pointer"
          >
            Return with Note
          </Button>
          <Button
            size="sm"
            onClick={() => handleQuickApprove(selectedQuoteForReview, 'APPROVED')}
            disabled={reviewingAction || !selectedOdooClerk}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
          >
            {reviewingAction ? 'Saving...' : 'Approve Quote'}
          </Button>
        </div>
      </div>
    </div>
  );
}

