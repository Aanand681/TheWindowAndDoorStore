"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import {
  QuoteDraftItem,
  QuoteType,
  getSavedDrafts,
  syncRemoteDrafts,
  DRAFT_CHANGE_EVENT,
} from "@/lib/quote-drafts-storage"

export interface AttachedQuoteSyncConfig {
  type: QuoteType
  attachedQuote: any | null
  setAttachedQuote: (val: any) => void
  typeLabel: string
  buildPayload: (draft: QuoteDraftItem) => any
}

export interface AttachedQuotesAutoSyncOptions {
  enabled?: boolean
}

export function useAttachedQuotesAutoSync(
  configs: AttachedQuoteSyncConfig[],
  options: AttachedQuotesAutoSyncOptions = {}
) {
  const { enabled = true } = options
  const configsRef = useRef(configs)
  configsRef.current = configs

  useEffect(() => {
    if (!enabled) return

    function checkAndSyncAttachedQuotes() {
      const activeConfigs = configsRef.current
      const drafts = getSavedDrafts()

      for (const config of activeConfigs) {
        const {
          type,
          attachedQuote,
          setAttachedQuote,
          typeLabel,
          buildPayload,
        } = config
        if (!attachedQuote || !attachedQuote.quoteNumber) continue

        const qNum = attachedQuote.quoteNumber.trim().toLowerCase()
        const matchingDraft = drafts.find(
          (d) =>
            d.type === type &&
            (d.id === attachedQuote.draftId ||
              d.id === attachedQuote.id ||
              (d.quoteNumber && d.quoteNumber.trim().toLowerCase() === qNum))
        )

        if (!matchingDraft) continue

        const currentTotal = Number(
          attachedQuote.totals?.grandTotal ??
            attachedQuote.taxTotals?.grandTotal ??
            attachedQuote.grandTotal ??
            0
        )
        const draftTotal = Number(matchingDraft.grandTotal ?? 0)

        const isTimeNewer = Boolean(
          matchingDraft.updatedAt &&
            matchingDraft.updatedAt !== attachedQuote.updatedAt
        )

        const isTotalChanged = Math.abs(currentTotal - draftTotal) >= 0.01

        const isItemCountChanged = Boolean(
          matchingDraft.itemCount !== undefined &&
            attachedQuote.itemCount !== undefined &&
            matchingDraft.itemCount !== attachedQuote.itemCount
        )

        if (isTimeNewer || isTotalChanged || isItemCountChanged) {
          const freshPayload = buildPayload(matchingDraft)
          setAttachedQuote(freshPayload)
          toast.info(
            `Updated attached ${typeLabel} Quote #${matchingDraft.quoteNumber} with latest changes.`,
            { id: `attached-sync-${type}-${matchingDraft.quoteNumber}` }
          )
        }
      }
    }

    // 1. Initial check on mount/activation
    checkAndSyncAttachedQuotes()

    // 2. Listen for in-app draft save events
    window.addEventListener(DRAFT_CHANGE_EVENT, checkAndSyncAttachedQuotes)

    // 3. Listen for window focus (when switching back from another tab/window)
    const handleFocus = async () => {
      try {
        await syncRemoteDrafts()
      } catch {
        // Silently catch network errors
      }
      checkAndSyncAttachedQuotes()
    }
    window.addEventListener("focus", handleFocus)

    // 4. Listen for cross-tab storage changes
    window.addEventListener("storage", checkAndSyncAttachedQuotes)

    return () => {
      window.removeEventListener(DRAFT_CHANGE_EVENT, checkAndSyncAttachedQuotes)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("storage", checkAndSyncAttachedQuotes)
    }
  }, [enabled])
}
