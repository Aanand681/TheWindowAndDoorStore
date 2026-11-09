'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Check, Loader2 } from 'lucide-react';

interface PromoOrderAlertProps {
  savingOrder: boolean;
  onSaveOrder: () => void;
  onDiscardChanges: () => void;
}

export function PromoOrderAlert({
  savingOrder,
  onSaveOrder,
  onDiscardChanges,
}: PromoOrderAlertProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 mb-6 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 shadow-md gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 shrink-0">
          <Save className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-sm text-foreground">You have rearranged the promo sequence!</div>
          <div className="text-xs text-muted-foreground">
            Click &quot;Save Order&quot; to permanently store this order and update the promo calculator.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" onClick={onDiscardChanges} disabled={savingOrder}>
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Discard
        </Button>
        <Button
          size="sm"
          onClick={onSaveOrder}
          disabled={savingOrder}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
        >
          {savingOrder ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" /> Save Order
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

