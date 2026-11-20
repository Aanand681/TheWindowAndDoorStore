"use client"

import { useAttachedQuotesAutoSync } from "@/hooks/calculator/attach/useAttachedQuotesAutoSync"
import {
  buildWindowAttachPayload,
  buildSealedUnitAttachPayload,
} from "@/components/calculator/attach/attach-payload-builders"

export interface UseDoorAttachedSyncProps {
  attachedWindowQuote: any | null
  setAttachedWindowQuote: (q: any) => void
  attachedSealedUnit: any | null
  setAttachedSealedUnit: (u: any) => void
  enabled?: boolean
}

/**
 * Automatically syncs child Window and Sealed Unit attached quotes in the
 * Door Calculator whenever those drafts are updated in another tab/calculator.
 */
export function useDoorAttachedSync({
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  enabled = true,
}: UseDoorAttachedSyncProps) {
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
        type: "sealed_unit",
        attachedQuote: attachedSealedUnit,
        setAttachedQuote: setAttachedSealedUnit,
        typeLabel: "Sealed Unit",
        buildPayload: buildSealedUnitAttachPayload,
      },
    ],
    { enabled }
  )
}
