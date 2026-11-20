"use client"

import { useUniversalAttachedSync } from "@/hooks/quotes/useUniversalAttachedSync"

export interface UseWindowAttachedSyncProps {
  attachedDoorQuote: any | null
  setAttachedDoorQuote: (d: any) => void
  attachedSealedUnit: any | null
  setAttachedSealedUnit: (u: any) => void
  enabled?: boolean
}

export function useWindowAttachedSync({
  attachedDoorQuote,
  setAttachedDoorQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  enabled = true,
}: UseWindowAttachedSyncProps) {
  useUniversalAttachedSync({
    hostType: "window",
    attachedDoorQuote,
    setAttachedDoorQuote,
    attachedSealedUnit,
    setAttachedSealedUnit,
    enabled,
  })
}
