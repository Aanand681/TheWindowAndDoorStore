'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, ClipboardCheck, CheckSquare } from 'lucide-react';

export interface OdooActionModalsProps {
  showApproveOdooModal: boolean;
  setShowApproveOdooModal: (val: boolean) => void;
  showCompleteOdooModal: boolean;
  setShowCompleteOdooModal: (val: boolean) => void;
  reviewQuote: any;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (val: string) => void;
  odooOrderNumberInput: string;
  setOdooOrderNumberInput: (val: string) => void;
  reviewActionLoading: boolean;
  clerkList: any[];
  staffList: any[];
  confirmApproveReviewQuote: () => void;
  handleCompleteOdooEntry: () => void;
}

export function OdooActionModals({
  showApproveOdooModal,
  setShowApproveOdooModal,
  showCompleteOdooModal,
  setShowCompleteOdooModal,
  reviewQuote,
  selectedOdooClerk,
  setSelectedOdooClerk,
  odooOrderNumberInput,
  setOdooOrderNumberInput,
  reviewActionLoading,
  clerkList,
  staffList,
  confirmApproveReviewQuote,
  handleCompleteOdooEntry,
}: OdooActionModalsProps) {
  if (!reviewQuote) return null;

  return (
    <>
      {/* Approve Quote & Optional Odoo Assignment Modal */}
      {showApproveOdooModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Approve Quote #{reviewQuote.quoteNumber}</h3>
                <p className="text-xs text-muted-foreground">
                  Customer: <strong className="text-foreground">{reviewQuote.customerName}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Approve this quote and assign an employee to enter the order into Odoo software and prepare the physical file.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="odooAssigneeSelect" className="text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Assign for Odoo Entry (Required)</span>
                  </span>
                  <span className="text-[10px] text-destructive font-semibold">* Required</span>
                </Label>
                <select
                  id="odooAssigneeSelect"
                  value={selectedOdooClerk}
                  onChange={e => setSelectedOdooClerk(e.target.value)}
                  className="w-full text-sm bg-background border border-input rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  <option value="">-- Select Odoo Clerk (Required) --</option>
                  {(clerkList.length > 0 ? clerkList : staffList).map((member: any) => (
                    <option key={member._id || member.username} value={member.username}>
                      {member.name ? `${member.name} (${member.username})` : member.username} {member.department ? `(${member.department})` : (member.role ? `• ${member.role}` : '')}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  The assigned clerk will receive an instant notification and view-only access to preview and print the quote.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowApproveOdooModal(false)}
                disabled={reviewActionLoading}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={confirmApproveReviewQuote}
                disabled={reviewActionLoading || !selectedOdooClerk}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {reviewActionLoading ? 'Approving...' : `Approve & Assign to ${selectedOdooClerk || 'Clerk'}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Odoo Entry Modal */}
      {showCompleteOdooModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Mark Entered in Odoo</h3>
                <p className="text-xs text-muted-foreground">
                  Quote #{reviewQuote.quoteNumber} • {reviewQuote.customerName}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Confirm that this quote has been entered into Odoo. This will notify the review team and mark the order file as processed.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="odooOrderNumInput" className="text-xs font-semibold flex items-center justify-between">
                  <span>Odoo Sales Order #</span>
                  <span className="text-[10px] text-destructive font-semibold">* Required &amp; Unique</span>
                </Label>
                <Input
                  id="odooOrderNumInput"
                  placeholder="e.g. SO-10492 or PO-9912"
                  value={odooOrderNumberInput}
                  onChange={e => setOdooOrderNumberInput(e.target.value)}
                  className="bg-background font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCompleteOdooModal(false)}
                disabled={reviewActionLoading}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleCompleteOdooEntry}
                disabled={reviewActionLoading || !odooOrderNumberInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {reviewActionLoading ? 'Saving...' : 'Confirm Odoo Entry'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OdooActionModals;
