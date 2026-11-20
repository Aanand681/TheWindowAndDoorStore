"use client"

import { useUniversalAttachedSync } from "@/hooks/quotes/useUniversalAttachedSync"

export interface UseSealedUnitsAttachedSyncProps {
  attachedWindowQuote: any | null
  setAttachedWindowQuote: (q: any) => void
  attachedDoorQuote: any | null
  setAttachedDoorQuote: (d: any) => void
  enabled?: boolean
}

export function useSealedUnitsAttachedSync({
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedDoorQuote,
  setAttachedDoorQuote,
  enabled = true,
}: UseSealedUnitsAttachedSyncProps) {
  useUniversalAttachedSync({
    hostType: "sealed_unit",
    attachedWindowQuote,
    setAttachedWindowQuote,
    attachedDoorQuote,
    setAttachedDoorQuote,
    enabled,
  })
}
