'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, Trash2 } from 'lucide-react';

interface StorageFlushModalProps {
  showFlushModal: boolean;
  setShowFlushModal: (val: boolean) => void;
  storageStats: any;
  flushing: boolean;
  handleFlushStorage: () => void;
}

export function StorageFlushModal({
  showFlushModal,
  setShowFlushModal,
  storageStats,
  flushing,
  handleFlushStorage,
}: StorageFlushModalProps) {
  if (!showFlushModal || !storageStats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Storage &amp; Auto-Flush Manager</h3>
            <p className="text-xs text-muted-foreground">
              Automatic retention policies protect database limits.
            </p>
          </div>
        </div>

        <div className="space-y-3 bg-muted/30 p-3.5 rounded-xl border border-border text-xs">
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground">Total Quotes Saved:</span>
            <span className="font-bold font-mono">{storageStats.totalQuotes}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground">Starred / Protected Quotes:</span>
            <span className="font-bold font-mono text-amber-500">
              {storageStats.starredQuotes}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground">Quotes Pending Review:</span>
            <span className="font-bold font-mono text-primary">
              {storageStats.pendingQuotes}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground">Retention Policy:</span>
            <span className="font-bold font-mono">{storageStats.retentionDays} Days</span>
          </div>
          <div className="flex justify-between items-center py-1 text-destructive">
            <span>Eligible for Flush Right Now:</span>
            <span className="font-bold font-mono">{storageStats.eligibleForFlush}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            • <strong>Starred quotes</strong> are never deleted automatically.
          </p>
          <p>
            • <strong>Pending review quotes</strong> are protected from cleanup.
          </p>
          <p>
            • The system automatically runs a cleanup check when new quotes are submitted.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFlushModal(false)}
            disabled={flushing}
            className="cursor-pointer"
          >
            Close
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleFlushStorage}
            disabled={flushing || storageStats.eligibleForFlush === 0}
            className="gap-1.5 font-bold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>
              {flushing
                ? 'Cleaning...'
                : `Flush ${storageStats.eligibleForFlush} Old Quotes`}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

