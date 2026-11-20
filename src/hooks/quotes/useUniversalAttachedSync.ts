"use client"

import { useAttachedQuotesAutoSync, AttachedQuoteSyncConfig } from "@/hooks/calculator/attach/useAttachedQuotesAutoSync"
import {
  buildDoorAttachPayload,
  buildWindowAttachPayload,
  buildSealedUnitAttachPayload,
} from "@/components/calculator/attach/attach-payload-builders"

export interface UseUniversalAttachedSyncProps {
  hostType: "window" | "door" | "sealed_unit"
  attachedWindowQuote?: any | null
  setAttachedWindowQuote?: (q: any) => void
  attachedDoorQuote?: any | null
  setAttachedDoorQuote?: (d: any) => void
  attachedSealedUnit?: any | null
  setAttachedSealedUnit?: (u: any) => void
  enabled?: boolean
}

/**
 * Universal reactive auto-sync hook across Window, Door, and Sealed Unit quoting engines.
 * Detects edits made to child attached quotes across other tabs/workspaces and syncs them instantly.
 */
export function useUniversalAttachedSync({
  hostType,
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedDoorQuote,
  setAttachedDoorQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  enabled = true,
}: UseUniversalAttachedSyncProps) {
  const configs: AttachedQuoteSyncConfig[] = []

  if (hostType !== "window" && attachedWindowQuote !== undefined && setAttachedWindowQuote) {
    configs.push({
      type: "window",
      attachedQuote: attachedWindowQuote,
      setAttachedQuote: setAttachedWindowQuote,
      typeLabel: "Window",
      buildPayload: buildWindowAttachPayload,
    })
  }

  if (hostType !== "door" && attachedDoorQuote !== undefined && setAttachedDoorQuote) {
    configs.push({
      type: "door",
      attachedQuote: attachedDoorQuote,
      setAttachedQuote: setAttachedDoorQuote,
      typeLabel: "Door",
      buildPayload: buildDoorAttachPayload,
    })
  }

  if (hostType !== "sealed_unit" && attachedSealedUnit !== undefined && setAttachedSealedUnit) {
    configs.push({
      type: "sealed_unit",
      attachedQuote: attachedSealedUnit,
      setAttachedQuote: setAttachedSealedUnit,
      typeLabel: "Sealed Unit",
      buildPayload: buildSealedUnitAttachPayload,
    })
  }

  useAttachedQuotesAutoSync(configs, { enabled })
}
