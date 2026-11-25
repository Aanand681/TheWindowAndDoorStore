import { toast } from "sonner"
import { isWorkspaceDirtyOrUnsaved } from "@/lib/quote-drafts-storage"

export function validateAndOpenPrint(
  lineItems: any[],
  travel: any,
  totals: any,
  drafts: any,
  setIsPreviewOpen: (open: boolean) => void
): void {
  if (
    lineItems.length === 0 &&
    !(travel.isServiceOnly && (totals.totalSqft || 0) > 0) &&
    !(Array.isArray(totals.customMaterials) && totals.customMaterials.length > 0) &&
    !drafts.attachedWindowQuote &&
    !drafts.attachedDoorQuote
  ) {
    toast.error(
      "Add at least one line item, enter service sq ft, or attach a quote before previewing."
    )
    return
  }
  setIsPreviewOpen(true)
}

export function validateAndOpenSubmit(
  drafts: any,
  travel: any,
  totals: any,
  lineItems: any[],
  settings: any,
  user: any,
  review: any
): void {
  if (!drafts.quoteNumber.trim() || !drafts.customerName.trim()) {
    toast.error(
      "Please enter a Customer Name and Quote Number before submitting!"
    )
    return
  }
  if (
    lineItems.length === 0 &&
    !(travel.isServiceOnly && (totals.totalSqft || 0) > 0) &&
    !(Array.isArray(totals.customMaterials) && totals.customMaterials.length > 0)
  ) {
    toast.error(
      "Add at least one line item, custom material, or enter service sq ft before submitting!"
    )
    return
  }
  const otherReviewers = settings.staffList.filter(
    (s: any) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
  )
  if (
    otherReviewers.length > 0 &&
    (!settings.assignedReviewer ||
      settings.assignedReviewer.toLowerCase() ===
        user?.username?.toLowerCase() ||
      settings.assignedReviewer === "Admin")
  ) {
    settings.setAssignedReviewer(otherReviewers[0].username)
  }
  if (!settings.selectedOdooClerk && settings.clerkList.length > 0) {
    const defaultClerk =
      settings.clerkList.find((c: any) => c.department === "CLERK") ||
      settings.clerkList[0]
    if (defaultClerk) settings.setSelectedOdooClerk(defaultClerk.username)
  }
  review.setShowSubmitModal(true)
}

export function startNewSealedUnitQuote(
  builder: any,
  drafts: any,
  lineItems: any[],
  totals: any
): void {
  builder.handleCancelEdit()
  const isDirty = isWorkspaceDirtyOrUnsaved("sealed_unit", {
    quoteNumber: drafts.quoteNumber,
    customerName: drafts.customerName,
    itemCount: lineItems.length,
    grandTotal: totals.grandTotal,
    data: {
      lineItems,
      attachedWindowQuote: drafts.attachedWindowQuote,
      attachedDoorQuote: drafts.attachedDoorQuote,
    },
  })
  if (isDirty) {
    drafts.setShowResetModal(true)
  } else {
    drafts.handleResetWorkspace()
  }
}
