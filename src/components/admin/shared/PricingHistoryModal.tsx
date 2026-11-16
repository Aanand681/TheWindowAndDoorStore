"use client"

import React, { useState, useEffect } from "react"
import { History, RotateCcw, X, Clock, User, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PricingCategory } from "@/models/PricingHistory"

interface PricingHistoryItem {
  _id: string
  version: number
  category: PricingCategory
  snapshot: Record<string, any>
  savedBy: string
  notes?: string
  createdAt: string
}

interface PricingHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: PricingCategory
  title: string
  onRestoreVersion: (snapshot: Record<string, any>, version: number) => void
}

export function PricingHistoryModal({
  isOpen,
  onClose,
  category,
  title,
  onRestoreVersion,
}: PricingHistoryModalProps) {
  const [history, setHistory] = useState<PricingHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [restoredVersion, setRestoredVersion] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    fetch(`/api/pricing-history?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.history)) {
          setHistory(data.history)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load pricing history:", err)
        setLoading(false)
      })
  }, [isOpen, category])

  if (!isOpen) return null

  const handleRestore = (item: PricingHistoryItem) => {
    const formattedDate = new Date(item.createdAt).toLocaleString()
    const ok = confirm(
      `Restore pricing configuration to Version ${item.version} (saved on ${formattedDate} by ${item.savedBy})?\n\nThis will populate the form with these historical rates so you can review and click "Save Settings" to persist.`
    )
    if (!ok) return

    onRestoreVersion(item.snapshot, item.version)
    setRestoredVersion(item.version)
    setTimeout(() => {
      onClose()
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col animate-in rounded-xl border border-border bg-card shadow-2xl duration-200 zoom-in-95 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <History className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold">{title} History</h3>
              <p className="text-xs text-muted-foreground">
                Time-travel and restore previous pricing configurations saved to the database.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <p className="text-xs">Loading revision snapshots...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-muted-foreground">
              <Clock className="mx-auto h-8 w-8 opacity-40 mb-2" />
              <p className="text-sm font-medium">No previous versions recorded yet</p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                Snapshots are automatically created each time you click &quot;Save Settings&quot;.
              </p>
            </div>
          ) : (
            history.map((item, idx) => {
              const date = new Date(item.createdAt)
              const dateStr = date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              const timeStr = date.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })
              const isLatest = idx === 0
              const isRestored = restoredVersion === item.version

              return (
                <div
                  key={item._id}
                  className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                    isLatest
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/60 bg-muted/20 hover:border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                        isLatest
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      v{item.version}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {dateStr} at {timeStr}
                        </span>
                        {isLatest && (
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Current Live
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.savedBy || "Admin"}
                        </span>
                        {item.notes && (
                          <span className="text-muted-foreground/80">
                            • {item.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isRestored ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Restored
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant={isLatest ? "outline" : "default"}
                        onClick={() => handleRestore(item)}
                        className="cursor-pointer gap-1.5 text-xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Restore</span>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 px-5 py-3 text-xs text-muted-foreground">
          <span>{history.length} saved version{history.length === 1 ? "" : "s"} found</span>
          <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

