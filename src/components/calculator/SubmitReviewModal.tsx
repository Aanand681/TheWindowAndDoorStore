'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Send, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/promo-logic';

export interface SubmitReviewStaffItem {
  _id?: string;
  username: string;
  department?: string;
}

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { role?: string; username?: string } | null;
  adminSubmitMode: 'direct_approve' | 'submit_review';
  setAdminSubmitMode: (mode: 'direct_approve' | 'submit_review') => void;
  quoteNumber: string;
  customerName: string;
  windowsCount: number;
  total: number;
  staffList: SubmitReviewStaffItem[];
  clerkList: SubmitReviewStaffItem[];
  assignedReviewer: string;
  setAssignedReviewer: (reviewer: string) => void;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (clerk: string) => void;
  preparerNotes: string;
  setPreparerNotes: (notes: string) => void;
  submittingQuote: boolean;
  onSubmit: () => Promise<void> | void;
}

export function SubmitReviewModal({
  isOpen,
  onClose,
  user,
  adminSubmitMode,
  setAdminSubmitMode,
  quoteNumber,
  customerName,
  windowsCount,
  total,
  staffList,
  clerkList,
  assignedReviewer,
  setAssignedReviewer,
  selectedOdooClerk,
  setSelectedOdooClerk,
  preparerNotes,
  setPreparerNotes,
  submittingQuote,
  onSubmit,
}: SubmitReviewModalProps) {
  if (!isOpen) return null;

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const eligibleReviewers = staffList.filter(
    s => s.username?.toLowerCase() !== user?.username?.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "p-2.5 rounded-xl",
            isAdmin && adminSubmitMode === 'direct_approve'
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/20 text-amber-500"
          )}>
            {isAdmin && adminSubmitMode === 'direct_approve' ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {isAdmin ? 'Admin Quote Processing' : 'Send to Review Queue'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAdmin
                ? (adminSubmitMode === 'direct_approve'
                    ? 'Directly approve quote and assign to Odoo clerk for order entry.'
                    : 'Submit this quote to another admin or manager for price check.')
                : 'Submit this quote to team reviewer for price check.'}
            </p>
          </div>
        </div>

        {/* Admin Workflow Mode Selector */}
        {isAdmin && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/60 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setAdminSubmitMode('direct_approve')}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                adminSubmitMode === 'direct_approve'
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Direct Approve (Odoo)
            </button>
            <button
              type="button"
              onClick={() => {
                setAdminSubmitMode('submit_review');
                if (eligibleReviewers.length > 0 && (!assignedReviewer || assignedReviewer.toLowerCase() === user?.username?.toLowerCase())) {
                  setAssignedReviewer(eligibleReviewers[0].username);
                }
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                adminSubmitMode === 'submit_review'
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Send className="w-3.5 h-3.5" /> Submit to Other Admin
            </button>
          </div>
        )}

        <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quote Number:</span>
            <span className="font-mono font-bold">#{quoteNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer Name:</span>
            <span className="font-bold">{customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items:</span>
            <span>{windowsCount} windows</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-border/60">
            <span className="text-muted-foreground">Quote Total (incl. tax):</span>
            <span className="font-mono font-bold text-primary text-sm">{formatMoney(total)}</span>
          </div>
        </div>

        {/* Direct Approve Mode: Select Odoo Clerk */}
        {isAdmin && adminSubmitMode === 'direct_approve' ? (
          <div className="space-y-1.5">
            <Label htmlFor="odooClerkSelect" className="text-xs font-semibold flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Assign Odoo Clerk (Order Processing)
            </Label>
            <select
              id="odooClerkSelect"
              value={selectedOdooClerk}
              onChange={e => setSelectedOdooClerk(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
            >
              {clerkList.length > 0 ? (
                clerkList.map(c => (
                  <option key={c._id || c.username} value={c.username}>
                    {c.username} {c.department ? `(${c.department})` : ''}
                  </option>
                ))
              ) : (
                <option value="">No clerks available</option>
              )}
            </select>
            <p className="text-[11px] text-muted-foreground">
              The quote will be marked as Approved immediately and forwarded directly to this clerk's Odoo queue.
            </p>
          </div>
        ) : (
          /* Review Mode: Select Reviewer */
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="reviewerSelect" className="text-xs font-semibold">
                {isAdmin
                  ? 'Select Another Admin / Manager'
                  : 'Assign Team Member / Reviewer'}
              </Label>
              {isAdmin && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Self excluded</span>
              )}
            </div>
            {eligibleReviewers.length > 0 ? (
              <select
                id="reviewerSelect"
                value={assignedReviewer}
                onChange={e => setAssignedReviewer(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              >
                {eligibleReviewers.map(s => (
                  <option key={s._id || s.username} value={s.username}>
                    {s.username} {s.department ? `(${s.department})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs">
                No other reviewers available in the system.
              </div>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="preparerNotes" className="text-xs">
            {isAdmin && adminSubmitMode === 'direct_approve'
              ? `Notes for ${selectedOdooClerk || 'Clerk'} (Optional)`
              : `Notes for ${assignedReviewer || 'Reviewer'} (Optional)`}
          </Label>
          <textarea
            id="preparerNotes"
            rows={2}
            placeholder={
              isAdmin && adminSubmitMode === 'direct_approve'
                ? "e.g. Please process ASAP, customer confirmed colours and sizes..."
                : "e.g. Please verify travel setup fee or check if scaffolding labour is needed..."
            }
            value={preparerNotes}
            onChange={e => setPreparerNotes(e.target.value)}
            className="w-full text-sm bg-background border border-input rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            disabled={submittingQuote}
          >
            Cancel
          </Button>
          {isAdmin && adminSubmitMode === 'direct_approve' ? (
            <Button 
              size="sm" 
              onClick={onSubmit}
              disabled={submittingQuote || !selectedOdooClerk}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {submittingQuote ? 'Approving...' : `Approve & Forward to ${selectedOdooClerk || 'Clerk'}`}
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={onSubmit}
              disabled={submittingQuote || !assignedReviewer || eligibleReviewers.length === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              {submittingQuote ? 'Submitting...' : `Submit to ${assignedReviewer || 'Reviewer'}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
