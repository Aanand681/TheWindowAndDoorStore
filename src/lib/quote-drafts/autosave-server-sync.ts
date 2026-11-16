"use client"

import { QuoteType } from "./types"

export interface AutoSaveFlushPayload {
  type: QuoteType
  quoteNumber: string
  customerName: string
  itemCount: number
  grandTotal: number
  summaryLabel?: string
  data: Record<string, unknown>
}

/**
 * Flush an active auto-save draft to the MongoDB database (/api/drafts).
 * Uses fetch with keepalive: true so modern browsers guarantee completion
 * even during tab switches or page unloads.
 */
export function flushAutoSaveDraftToServer(payload: AutoSaveFlushPayload): void {
  if (typeof window === "undefined") return
  if (!payload.quoteNumber?.trim() && !payload.customerName?.trim()) return

  try {
    fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: payload.type,
        quoteNumber: payload.quoteNumber || "Draft",
        customerName: payload.customerName || "Unnamed Customer",
        itemCount: payload.itemCount || 0,
        grandTotal: payload.grandTotal || 0,
        summaryLabel: payload.summaryLabel || "",
        data: payload.data || {},
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Keepalive fetch failure safeguard
  }
}

