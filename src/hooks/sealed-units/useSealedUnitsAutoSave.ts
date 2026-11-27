"use client"

import { useEffect, useRef, useCallback } from "react"
import {
  getActiveAutoSave,
  clearActiveAutoSave,
  getSavedDrafts,
  isAutoSaveAlreadySaved,
  isDraftMeaningful,
  QuoteDraftItem,
} from "@/lib/quote-drafts-storage"
import {
  SealedUnitLineItem,
  getSealedUnitServiceSummaryLabel,
} from "@/lib/sealed-units-logic"
import { SealedUnitTotals } from "@/components/sealed-units/types"
import { computeEffectiveSealedUnitGrandTotal } from "@/lib/sealed-units/totals-calculator"
import {
  serializeSealedUnitSnapshot,
  applyDraftDataToWorkspace,
  createDraftSavePayload,
  SealedUnitSnapshotParams,
  WorkspaceSetters,
} from "./sealed-units-storage-helpers"
import {
  useSessionOptionsHash,
  useUniversalAutoSave,
} from "@/hooks/shared/useUniversalAutoSave"

interface UseSealedUnitsAutoSaveProps {
  currentSnapshotParams: SealedUnitSnapshotParams
  quoteNotes: string
  totals: SealedUnitTotals
  lineItems: SealedUnitLineItem[]
  isServiceOnly: boolean
  serviceSqftInput: string
  attachedWindowQuote: any
  attachedDoorQuote: any
  setters: WorkspaceSetters
  loadDraftIntoWorkspace: (draft: any) => void
  onConflictDetected?: (draft: QuoteDraftItem) => void
}

export function useSealedUnitsAutoSave({
  currentSnapshotParams,
  quoteNotes,
  totals,
  lineItems,
  isServiceOnly,
  serviceSqftInput,
  attachedWindowQuote,
  attachedDoorQuote,
  setters,
  loadDraftIntoWorkspace,
  onConflictDetected,
}: UseSealedUnitsAutoSaveProps) {
  const optionsHash = useSessionOptionsHash("sealed_unit")
  const initialLoadDone = useRef(false)

  const hasContent =
    lineItems.length > 0 ||
    (isServiceOnly &&
      (serviceSqftInput.trim() !== "" || (totals.totalSqft || 0) > 0)) ||
    (Array.isArray((currentSnapshotParams as any)?.customMaterials) &&
      (currentSnapshotParams as any).customMaterials.length > 0) ||
    Boolean(attachedWindowQuote) ||
    Boolean(attachedDoorQuote)

  const currentSnapshot = serializeSealedUnitSnapshot({
    ...currentSnapshotParams,
    optionsHash,
  })

  const buildPayload = useCallback(() => {
    const summaryLabel = isServiceOnly
      ? getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)
      : `${lineItems.length} Sealed Units`

    const payloadData = createDraftSavePayload({
      ...currentSnapshotParams,
      quoteNotes,
      totals,
    })

    const effectiveTotals = computeEffectiveSealedUnitGrandTotal({
      totals,
      sealedUnitMode: currentSnapshotParams.sealedUnitMode,
      isInstallation: currentSnapshotParams.isInstallation,
      isServiceOnly,
      loyaltyDiscount: currentSnapshotParams.loyaltyDiscount,
      loyaltyDiscountLabel: currentSnapshotParams.loyaltyDiscountLabel,
      hstRate: currentSnapshotParams.hstRate,
      attachedWindowQuote,
      attachedDoorQuote,
    })

    return {
      type: "sealed_unit" as const,
      quoteNumber: currentSnapshotParams.quoteNumber || "Draft",
      customerName: currentSnapshotParams.customerName || "",
      itemCount: isServiceOnly
        ? (totals.totalSqft || 0) > 0
          ? 1
          : 0
        : lineItems.length,
      grandTotal: effectiveTotals.grandTotal || 0,
      summaryLabel,
      data: payloadData,
    }
  }, [
    isServiceOnly,
    lineItems,
    totals,
    currentSnapshotParams,
    quoteNotes,
    attachedWindowQuote,
    attachedDoorQuote,
  ])

  const {
    lastSavedAt,
    setLastSavedAt,
    clearAutoSaveTimer,
    markFingerprintSaved,
  } = useUniversalAutoSave({
    quoteType: "sealed_unit",
    enabled: true,
    enabledRef: initialLoadDone,
    hasContent,
    fingerprint: currentSnapshot,
    buildPayload,
    debounceMs: 1200,
  })

  const restoreAutoSaveIntoWorkspace = useCallback(
    (recovered: any) => {
      const d = recovered.data as any
      if (!d) return

      applyDraftDataToWorkspace(d, setters)
      if (recovered.timestamp) {
        setLastSavedAt(
          new Date(recovered.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        )
      }
    },
    [setters, setLastSavedAt]
  )

  const mountCallbacksRef = useRef({
    restoreAutoSaveIntoWorkspace,
    loadDraftIntoWorkspace,
    onConflictDetected,
  })
  useEffect(() => {
    mountCallbacksRef.current = {
      restoreAutoSaveIntoWorkspace,
      loadDraftIntoWorkspace,
      onConflictDetected,
    }
  })

  // Check URL query param and auto-save strictly once on mount
  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const draftId = urlParams.get("loadDraftId")
      if (draftId) {
        const allDrafts = getSavedDrafts()
        const match = allDrafts.find((d) => d.id === draftId)
        if (match && match.type === "sealed_unit") {
          const recovered = getActiveAutoSave("sealed_unit")
          const isUnsaved =
            recovered &&
            !isAutoSaveAlreadySaved("sealed_unit", recovered) &&
            isDraftMeaningful("sealed_unit", recovered)

          if (isUnsaved) {
            mountCallbacksRef.current.restoreAutoSaveIntoWorkspace(recovered)
            mountCallbacksRef.current.onConflictDetected?.(match)
          } else {
            mountCallbacksRef.current.loadDraftIntoWorkspace(match)
            const url = new URL(window.location.href)
            url.searchParams.delete("loadDraftId")
            window.history.replaceState({}, "", url.toString())
          }
          return
        }
      }
    }

    const recovered = getActiveAutoSave("sealed_unit")
    if (
      recovered &&
      recovered.data &&
      (recovered.itemCount > 0 || recovered.customerName)
    ) {
      mountCallbacksRef.current.restoreAutoSaveIntoWorkspace(recovered)
    }
  }, [])

  const clearTimerAndSaveSnapshot = useCallback(
    (snapshotString: string) => {
      clearAutoSaveTimer()
      clearActiveAutoSave("sealed_unit")
      markFingerprintSaved(snapshotString)
    },
    [clearAutoSaveTimer, markFingerprintSaved]
  )

  return {
    lastSavedAt,
    setLastSavedAt,
    clearTimerAndSaveSnapshot,
  }
}
