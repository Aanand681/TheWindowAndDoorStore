"use client"

import { useAttachedQuotesAutoSync } from "./useAttachedQuotesAutoSync"
import {
  buildDoorAttachPayload,
  buildSealedUnitAttachPayload,
} from "@/components/calculator/attach/attach-payload-builders"

export interface UseWindowAttachedSyncProps {
  attachedDoorQuote: any | null
  setAttachedDoorQuote: (d: any) => void
  attachedSealedUnit: any | null
  setAttachedSealedUnit: (u: any) => void
  enabled?: boolean
}

/**
 * Automatically syncs child Door and Sealed Unit attached quotes in the
 * Window Calculator whenever those drafts are updated in another tab/calculator.
 */
export function useWindowAttachedSync({
  attachedDoorQuote,
  setAttachedDoorQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  enabled = true,
}: UseWindowAttachedSyncProps) {
  useAttachedQuotesAutoSync(
    [
      {
        type: "door",
        attachedQuote: attachedDoorQuote,
        setAttachedQuote: setAttachedDoorQuote,
        typeLabel: "Door",
        buildPayload: buildDoorAttachPayload,
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
