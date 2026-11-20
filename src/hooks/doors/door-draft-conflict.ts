import { QuoteDraftItem, clearActiveAutoSave } from "@/lib/quote-drafts-storage"
import { toast } from "sonner"
import {
  applyDoorDraftToWorkspace,
  DoorWorkspaceSetters,
} from "./door-draft-applier"

export interface DoorDraftConflictHandlersParams {
  pendingDraftToLoad: QuoteDraftItem | null
  setPendingDraftToLoad: (d: QuoteDraftItem | null) => void
  setShowConflictModal: (show: boolean) => void
  cleanUrlLoadDraftId: () => void
  setters: DoorWorkspaceSetters
  handleExplicitSaveDraft: () => Promise<QuoteDraftItem | null>
}

export function createDoorDraftConflictHandlers({
  pendingDraftToLoad,
  setPendingDraftToLoad,
  setShowConflictModal,
  cleanUrlLoadDraftId,
  setters,
  handleExplicitSaveDraft,
}: DoorDraftConflictHandlersParams) {
  const handleConflictSaveExistingAndLoad = async () => {
    if (!pendingDraftToLoad) return
    const saved = await handleExplicitSaveDraft()
    if (saved) {
      applyDoorDraftToWorkspace(pendingDraftToLoad, setters)
      clearActiveAutoSave("door")
      toast.success(`Loaded Door Quote #${pendingDraftToLoad.quoteNumber}`)
      setShowConflictModal(false)
      setPendingDraftToLoad(null)
      cleanUrlLoadDraftId()
    }
  }

  const handleConflictContinueWithNew = () => {
    if (!pendingDraftToLoad) return
    applyDoorDraftToWorkspace(pendingDraftToLoad, setters)
    clearActiveAutoSave("door")
    toast.success(`Loaded Door Quote #${pendingDraftToLoad.quoteNumber}`)
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
