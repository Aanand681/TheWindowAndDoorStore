"use client"

import { useMemo } from "react"
import {
  QuoteDraftItem,
  isWorkspaceDirtyOrUnsaved,
} from "@/lib/quote-drafts-storage"
import { toast } from "sonner"
import {
  applyDoorDraftToWorkspace,
  resetDoorWorkspace,
  DoorWorkspaceSetters,
} from "./door-draft-applier"
import { executeSaveDoorDraft } from "./door-draft-saver"
import { UseDoorDraftsProps } from "./door-draft-types"
import { useUniversalWorkspaceDrafts } from "@/hooks/shared/useUniversalWorkspaceDrafts"

export function useDoorDrafts({
  customerName,
  setCustomerName,
  quoteNumber,
  setQuoteNumber,
  mode,
  setMode,
  lineItems,
  setLineItems,
  setEditingItem,
  globalUpcharges,
  setGlobalUpcharges,
  selectedRegionId,
  setSelectedRegionId,
  travelFeeType,
  setTravelFeeType,
  customTravelFee,
  setCustomTravelFee,
  showOutTownTravel,
  setShowOutTownTravel,
  travelKm,
  setTravelKm,
  crewHours,
  setCrewHours,
  crewSize,
  setCrewSize,
  quoteNotes,
  setQuoteNotes,
  isFirstNation,
  setIsFirstNation,
  customLabour,
  setCustomLabour,
  customMisc,
  setCustomMisc,
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  totals,
  setLastSavedAt,
}: UseDoorDraftsProps) {
  const setters: DoorWorkspaceSetters = useMemo(
    () => ({
      setCustomerName,
      setQuoteNumber,
      setMode,
      setLineItems,
      setGlobalUpcharges,
      setSelectedRegionId,
      setTravelFeeType,
      setCustomTravelFee,
      setShowOutTownTravel,
      setTravelKm,
      setCrewHours,
      setCrewSize,
      setQuoteNotes,
      setIsFirstNation,
      setCustomLabour,
      setCustomMisc,
      setAttachedWindowQuote,
      setAttachedSealedUnit,
    }),
    [
      setCustomerName,
      setQuoteNumber,
      setMode,
      setLineItems,
      setGlobalUpcharges,
      setSelectedRegionId,
      setTravelFeeType,
      setCustomTravelFee,
      setShowOutTownTravel,
      setTravelKm,
      setCrewHours,
      setCrewSize,
      setQuoteNotes,
      setIsFirstNation,
      setCustomLabour,
      setCustomMisc,
      setAttachedWindowQuote,
      setAttachedSealedUnit,
    ]
  )

  const isCurrentWorkspaceDirty = () => {
    return isWorkspaceDirtyOrUnsaved("door", {
      quoteNumber,
      customerName,
      itemCount: lineItems.length,
      grandTotal: totals.grandTotal,
      data: {
        lineItems,
        attachedWindowQuote,
        attachedSealedUnit,
      },
    })
  }

  const handleExplicitSaveDraft = async (): Promise<QuoteDraftItem | null> => {
    const saved = await executeSaveDoorDraft({
      customerName,
      quoteNumber,
      lineItems,
      attachedWindowQuote,
      attachedSealedUnit,
      totals,
      mode,
      globalUpcharges,
      selectedRegionId,
      travelFeeType,
      customTravelFee,
      showOutTownTravel,
      travelKm,
      crewHours,
      crewSize,
      isFirstNation,
      customLabour,
      customMisc,
      quoteNotes,
    })

    if (saved) {
      universalDrafts.updateSavedCount()
      const nowStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      setLastSavedAt(nowStr)
      toast.success(
        `Door quote draft #${quoteNumber} saved directly to database!`
      )
    }
    return saved
  }

  const universalDrafts = useUniversalWorkspaceDrafts({
    quoteType: "door",
    quoteTypeLabel: "Door",
    isCurrentWorkspaceDirty,
    applyDraftToWorkspace: (draft) => applyDoorDraftToWorkspace(draft, setters),
    handleSaveDraft: handleExplicitSaveDraft,
  })

  const handleConfirmReset = () => {
    resetDoorWorkspace({
      setters,
      setEditingItem,
      setLastSavedAt,
      setShowResetModal: universalDrafts.setShowResetModal,
    })
    toast.info("Quote reset to a blank workspace")
  }

  return {
    ...universalDrafts,
    handleExplicitSaveDraft,
    handleConfirmReset,
  }
}
