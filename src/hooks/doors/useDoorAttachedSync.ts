"use client"

import { useUniversalAttachedSync } from "@/hooks/quotes/useUniversalAttachedSync"

export interface UseDoorAttachedSyncProps {
  attachedWindowQuote: any | null
  setAttachedWindowQuote: (q: any) => void
  attachedSealedUnit: any | null
  setAttachedSealedUnit: (u: any) => void
  enabled?: boolean
}

export function useDoorAttachedSync({
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  enabled = true,
}: UseDoorAttachedSyncProps) {
  useUniversalAttachedSync({
    hostType: "door",
    attachedWindowQuote,
    setAttachedWindowQuote,
    attachedSealedUnit,
    setAttachedSealedUnit,
    enabled,
  })
}
