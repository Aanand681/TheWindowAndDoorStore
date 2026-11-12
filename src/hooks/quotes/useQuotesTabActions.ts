import { useState } from "react"
import { toast } from "sonner"

export interface UseQuotesTabActionsParams {
  quotes: any[]
  setQuotes: React.Dispatch<React.SetStateAction<any[]>>
  fetchQuotes: () => Promise<void>
  currentUser: any
}

export function useQuotesTabActions({
  quotes,
  setQuotes,
  fetchQuotes,
  currentUser,
}: UseQuotesTabActionsParams) {
  const [selectedOdooClerk, setSelectedOdooClerk] = useState<string>("")
  const [odooModalQuote, setOdooModalQuote] = useState<any | null>(null)
  const [odooOrderNum, setOdooOrderNum] = useState<string>("")
  const [markingOdoo, setMarkingOdoo] = useState<boolean>(false)

  const [storageStats, setStorageStats] = useState<any | null>(null)
  const [showFlushModal, setShowFlushModal] = useState(false)
  const [flushing, setFlushing] = useState(false)

  const [quoteToDelete, setQuoteToDelete] = useState<{
    id: string
    quoteNumber: string
  } | null>(null)
  const [isDeletingQuote, setIsDeletingQuote] = useState(false)

  const [selectedQuoteForReview, setSelectedQuoteForReview] = useState<
    any | null
  >(null)
  const [reviewerNotes, setReviewerNotes] = useState("")
  const [reviewingAction, setReviewingAction] = useState(false)

  const fetchStorageStats = async () => {
    try {
      const res = await fetch("/api/quotes/flush")
      if (res.ok) {
        const data = await res.json()
        setStorageStats(data)
      }
    } catch (err) {
      console.error("Failed to fetch storage stats:", err)
    }
  }

  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: !currentStarred }),
      })
      if (res.ok) {
        setQuotes(
          quotes.map((q) =>
            q._id === id ? { ...q, isStarred: !currentStarred } : q
          )
        )
        toast.success(
          !currentStarred
            ? "Quote starred (will be kept permanently)"
            : "Quote unstarred"
        )
      }
    } catch {
      toast.error("Failed to update star")
    }
  }

  const promptDeleteQuote = (id: string, quoteNum: string) => {
    setQuoteToDelete({ id, quoteNumber: quoteNum })
  }

  const confirmDeleteQuote = async () => {
    if (!quoteToDelete) return
    setIsDeletingQuote(true)
    try {
      const res = await fetch(`/api/quotes/${quoteToDelete.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setQuotes(quotes.filter((q) => q._id !== quoteToDelete.id))
        toast.success(`Quote #${quoteToDelete.quoteNumber} deleted`)
        setQuoteToDelete(null)
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete")
      }
    } catch {
      toast.error("Failed to delete quote")
    } finally {
      setIsDeletingQuote(false)
    }
  }

  const handleQuickApprove = async (
    quote: any,
    newStatus: "APPROVED" | "RETURNED"
  ) => {
    if (newStatus === "APPROVED" && !selectedOdooClerk) {
      toast.error("Please select an Odoo clerk before approving the quote.")
      return
    }
    setReviewingAction(true)
    try {
      const payload: any = {
        status: newStatus,
        reviewerNotes,
      }
      if (newStatus === "APPROVED" && selectedOdooClerk) {
        payload.odooAssignedTo = selectedOdooClerk
      }
      const res = await fetch(`/api/quotes/${quote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(
          newStatus === "APPROVED"
            ? `Quote #${quote.quoteNumber} approved & assigned to ${selectedOdooClerk} for Odoo entry!`
            : `Quote #${quote.quoteNumber} returned with notes`
        )
        setSelectedQuoteForReview(null)
        setReviewerNotes("")
        setSelectedOdooClerk("")
        fetchQuotes()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to review")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update quote review status")
    } finally {
      setReviewingAction(false)
    }
  }

  const handleConfirmOdooEntry = async () => {
    if (!odooModalQuote) return
    const orderNumber = odooOrderNum.trim()
    if (!orderNumber) {
      toast.error("Please enter the Odoo Sales Order # before confirming.")
      return
    }
    setMarkingOdoo(true)
    try {
      const res = await fetch(`/api/quotes/${odooModalQuote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          odooStatus: "COMPLETED",
          odooOrderNumber: orderNumber,
          odooCompletedBy: currentUser?.username || "Clerk",
        }),
      })
      if (res.ok) {
        toast.success(
          `Quote #${odooModalQuote.quoteNumber} confirmed entered in Odoo with Order #${orderNumber}!`
        )
        setOdooModalQuote(null)
        setOdooOrderNum("")
        fetchQuotes()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update Odoo status")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update Odoo status")
    } finally {
      setMarkingOdoo(false)
    }
  }

  const handleFlushStorage = async () => {
    setFlushing(true)
    try {
      const res = await fetch("/api/quotes/flush", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        toast.success(
          `Storage cleanup complete. Removed ${data.deletedCount} old quotes.`
        )
        setShowFlushModal(false)
        fetchQuotes()
      } else {
        toast.error(data.error || "Cleanup failed")
      }
    } catch {
      toast.error("Failed to execute storage flush")
    } finally {
      setFlushing(false)
    }
  }

  return {
    selectedOdooClerk,
    setSelectedOdooClerk,
    odooModalQuote,
    setOdooModalQuote,
    odooOrderNum,
    setOdooOrderNum,
    markingOdoo,
    storageStats,
    showFlushModal,
    setShowFlushModal,
    flushing,
    quoteToDelete,
    setQuoteToDelete,
    isDeletingQuote,
    selectedQuoteForReview,
    setSelectedQuoteForReview,
    reviewerNotes,
    setReviewerNotes,
    reviewingAction,
    fetchStorageStats,
    handleToggleStar,
    promptDeleteQuote,
    confirmDeleteQuote,
    handleQuickApprove,
    handleConfirmOdooEntry,
    handleFlushStorage,
  }
}
