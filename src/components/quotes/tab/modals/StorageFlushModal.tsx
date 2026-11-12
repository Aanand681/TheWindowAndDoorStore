"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Database, Trash2 } from "lucide-react"

interface StorageFlushModalProps {
  showFlushModal: boolean
  setShowFlushModal: (val: boolean) => void
  storageStats: any
  flushing: boolean
  handleFlushStorage: () => void
}

export function StorageFlushModal({
  showFlushModal,
  setShowFlushModal,
  storageStats,
  flushing,
  handleFlushStorage,
}: StorageFlushModalProps) {
  if (!showFlushModal || !storageStats) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-sm duration-200 fade-in">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-primary/20 p-2.5 text-primary">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              Storage &amp; Auto-Flush Manager
            </h3>
            <p className="text-xs text-muted-foreground">
              Automatic retention policies protect database limits.
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3.5 text-xs">
          <div className="flex items-center justify-between border-b border-border/50 py-1">
            <span className="text-muted-foreground">Total Quotes Saved:</span>
            <span className="font-mono font-bold">
              {storageStats.totalQuotes}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 py-1">
            <span className="text-muted-foreground">
              Starred / Protected Quotes:
            </span>
            <span className="font-mono font-bold text-amber-500">
              {storageStats.starredQuotes}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 py-1">
            <span className="text-muted-foreground">
              Quotes Pending Review:
            </span>
            <span className="font-mono font-bold text-primary">
              {storageStats.pendingQuotes}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border/50 py-1">
            <span className="text-muted-foreground">Retention Policy:</span>
            <span className="font-mono font-bold">
              {storageStats.retentionDays} Days
            </span>
          </div>
          <div className="flex items-center justify-between py-1 text-destructive">
            <span>Eligible for Flush Right Now:</span>
            <span className="font-mono font-bold">
              {storageStats.eligibleForFlush}
            </span>
          </div>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            • <strong>Starred quotes</strong> are never deleted automatically.
          </p>
          <p>
            • <strong>Pending review quotes</strong> are protected from cleanup.
          </p>
          <p>
            • The system automatically runs a cleanup check when new quotes are
            submitted.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
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
            className="cursor-pointer gap-1.5 font-bold"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>
              {flushing
                ? "Cleaning..."
                : `Flush ${storageStats.eligibleForFlush} Old Quotes`}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
