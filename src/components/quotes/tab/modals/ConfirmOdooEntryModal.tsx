'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckSquare } from 'lucide-react';

interface ConfirmOdooEntryModalProps {
  odooModalQuote: any;
  setOdooModalQuote: (val: any) => void;
  odooOrderNum: string;
  setOdooOrderNum: (val: string) => void;
  markingOdoo: boolean;
  handleConfirmOdooEntry: () => void;
}

export function ConfirmOdooEntryModal({
  odooModalQuote,
  setOdooModalQuote,
  odooOrderNum,
  setOdooOrderNum,
  markingOdoo,
  handleConfirmOdooEntry,
}: ConfirmOdooEntryModalProps) {
  if (!odooModalQuote) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Confirm Odoo Entry &bull; Quote #{odooModalQuote.quoteNumber}
            </h3>
            <p className="text-xs text-muted-foreground">
              Customer: <strong>{odooModalQuote.customerName}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="odooOrderRef"
            className="text-xs font-semibold flex items-center justify-between"
          >
            <span>Odoo Sales Order #</span>
            <span className="text-[10px] text-destructive font-semibold">
              * Required &amp; Unique
            </span>
          </Label>
          <Input
            id="odooOrderRef"
            placeholder="e.g. SO-10492"
            value={odooOrderNum}
            onChange={(e) => setOdooOrderNum(e.target.value)}
            className="text-xs font-mono"
            required
          />
          <p className="text-[11px] text-muted-foreground">
            Confirm that you have entered all order specifications into the Odoo software and
            attached the printed quote to the physical shop folder.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOdooModalQuote(null);
              setOdooOrderNum('');
            }}
            disabled={markingOdoo}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmOdooEntry}
            disabled={markingOdoo || !odooOrderNum.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
          >
            {markingOdoo ? 'Confirming...' : 'Confirm Odoo Entry'}
          </Button>
        </div>
      </div>
    </div>
  );
}

