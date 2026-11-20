"use client"

import { useAttachedQuotesAutoSync } from "@/hooks/calculator/attach/useAttachedQuotesAutoSync"
import {
  buildWindowAttachPayload,
  buildDoorAttachPayload,
} from "@/components/calculator/attach/attach-payload-builders"

export interface UseSealedUnitsAttachedSyncProps {
  attachedWindowQuote: any | null
  setAttachedWindowQuote: (q: any) => void
  attachedDoorQuote: any | null
  setAttachedDoorQuote: (d: any) => void
  enabled?: boolean
}

/**
 * Automatically syncs child Window and Door attached quotes in the
 * Sealed Unit Calculator whenever those drafts are updated in another tab/calculator.
 */
export function useSealedUnitsAttachedSync({
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedDoorQuote,
  setAttachedDoorQuote,
  enabled = true,
}: UseSealedUnitsAttachedSyncProps) {
  useAttachedQuotesAutoSync(
    [
      {
        type: "window",
        attachedQuote: attachedWindowQuote,
        setAttachedQuote: setAttachedWindowQuote,
        typeLabel: "Window",
        buildPayload: buildWindowAttachPayload,
      },
      {
        type: "door",
        attachedQuote: attachedDoorQuote,
        setAttachedQuote: setAttachedDoorQuote,
        typeLabel: "Door",
        buildPayload: buildDoorAttachPayload,
      },
    ],
    { enabled }
  )
}
