"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  saveActiveAutoSave,
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
import {
  serializeSealedUnitSnapshot,
  applyDraftDataToWorkspace,
  createDraftSavePayload,
  SealedUnitSnapshotParams,
  WorkspaceSetters,
} from "./sealed-units-storage-helpers"

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
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const lastSavedSnapshotRef = useRef<string>("")
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentPayloadRef = useRef<any>(null)
  const initialLoadDone = useRef(false)

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
    [setters]
  )

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
            restoreAutoSaveIntoWorkspace(recovered)
            onConflictDetected?.(match)
          } else {
            loadDraftIntoWorkspace(match)
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
      restoreAutoSaveIntoWorkspace(recovered)
    }
  }, [])

  // Debounced auto-save effect
  useEffect(() => {
    if (!initialLoadDone.current) return

    const hasMeaningfulContent =
      lineItems.length > 0 ||
      (isServiceOnly &&
        (serviceSqftInput.trim() !== "" || (totals.totalSqft || 0) > 0)) ||
      Boolean(attachedWindowQuote) ||
      Boolean(attachedDoorQuote)

    if (!hasMeaningfulContent) {
      clearActiveAutoSave("sealed_unit")
      return
    }

    const currentSnapshot = serializeSealedUnitSnapshot(currentSnapshotParams)
    if (currentSnapshot === lastSavedSnapshotRef.current) {
      return
    }

    const summaryLabel = isServiceOnly
      ? getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)
      : `${lineItems.length} Sealed Units`

    const payloadData = createDraftSavePayload({
      ...currentSnapshotParams,
      quoteNotes,
      totals,
    })

    const fullPayload = {
      type: "sealed_unit" as const,
      quoteNumber: currentSnapshotParams.quoteNumber || "Draft",
      customerName: currentSnapshotParams.customerName || "",
      itemCount: isServiceOnly
        ? (totals.totalSqft || 0) > 0
          ? 1
          : 0
        : lineItems.length,
      grandTotal: totals.grandTotal || 0,
      summaryLabel,
      data: payloadData,
    }
    currentPayloadRef.current = fullPayload

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveActiveAutoSave("sealed_unit", fullPayload)
      lastSavedSnapshotRef.current = currentSnapshot
      setLastSavedAt(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    }, 1200)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [
    lineItems,
    isServiceOnly,
    serviceSqftInput,
    totals,
    attachedWindowQuote,
    attachedDoorQuote,
    currentSnapshotParams,
    quoteNotes,
  ])

  const clearTimerAndSaveSnapshot = (snapshotString: string) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }
    clearActiveAutoSave("sealed_unit")
    lastSavedSnapshotRef.current = snapshotString
  }

  return {
    lastSavedAt,
    setLastSavedAt,
    clearTimerAndSaveSnapshot,
  }
}
