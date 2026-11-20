import { useCallback } from "react"
import { toast } from "sonner"
import { QuoteDraftItem, clearActiveAutoSave } from "@/lib/quote-drafts-storage"
import { applyDraftDataToWorkspace, WorkspaceSetters } from "./sealed-units-storage-helpers"

export interface SealedUnitsConflictParams {
  pendingDraftToLoad: QuoteDraftItem | null
  setPendingDraftToLoad: (d: QuoteDraftItem | null) => void
  setShowConflictModal: (v: boolean) => void
  handleSaveDraft: () => Promise<any>
  setters: WorkspaceSetters
  cleanUrlLoadDraftId: () => void
}

export function createSealedUnitsConflictHandlers({
  pendingDraftToLoad,
  setPendingDraftToLoad,
  setShowConflictModal,
  handleSaveDraft,
  setters,
  cleanUrlLoadDraftId,
}: SealedUnitsConflictParams) {
  const handleConflictSaveExistingAndLoad = async () => {
    if (!pendingDraftToLoad) return
    const saved = await handleSaveDraft()
    if (saved) {
      applyDraftDataToWorkspace(pendingDraftToLoad.data, setters)
      clearActiveAutoSave("sealed_unit")
      toast.success(`Loaded Sealed Unit Quote #${pendingDraftToLoad.quoteNumber}`)
      setShowConflictModal(false)
      setPendingDraftToLoad(null)
      cleanUrlLoadDraftId()
    }
  }

  const handleConflictContinueWithNew = () => {
    if (!pendingDraftToLoad) return
    applyDraftDataToWorkspace(pendingDraftToLoad.data, setters)
    clearActiveAutoSave("sealed_unit")
    toast.success(`Loaded Sealed Unit Quote #${pendingDraftToLoad.quoteNumber}`)
    setShowConflictModal(false)
    setPendingDraftToLoad(null)
    cleanUrlLoadDraftId()
  }

  const handleConflictCancel = () => {
    setShowConflictModal(false)
    setPendingDraftToLoad(null)
    cleanUrlLoadDraftId()
  }

  return {
    handleConflictSaveExistingAndLoad,
    handleConflictContinueWithNew,
    handleConflictCancel,
  }
}
