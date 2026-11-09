'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface DeleteRegionDialogProps {
  region: any | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteRegionDialog({
  region,
  onClose,
  onConfirm,
}: DeleteRegionDialogProps) {
  if (!region) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-destructive/30 shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Delete Region</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">{region.name}</strong>?
              Existing saved quotes will keep their historical totals, but this region will no longer appear for new quotes.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onConfirm(region._id)}
            className="font-semibold cursor-pointer"
          >
            Delete Region
          </Button>
        </div>
      </div>
    </div>
  );
}

