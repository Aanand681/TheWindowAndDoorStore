import { useState, useEffect, useCallback, useRef } from "react"
import type { QuotesSubTabType } from "@/components/quotes/tab/types"
import type { QuoteTemplateType } from "@/components/quotes/invoice/types"
import {
  filterAndSortQuotes,
  computeQuotesTabCounts,
} from "./quotes-tab-filter"
import { useQuotesTabActions } from "./useQuotesTabActions"
import { useQuotePreviewListeners } from "./useQuotePreviewListeners"

export interface UseQuotesTabStateParams {
  currentUser: any
  initialSubTab?: QuotesSubTabType
  initialPreviewQuoteId?: string
  onQuotesCountChange?: (count: number) => void
}

const VALID_SUB_TABS: QuotesSubTabType[] = [
  "review",
  "assigned",
  "odoo",
  "my",
  "all",
  "odoo_completed",
  "all_assigned",
  "returned",
]

export function useQuotesTabState({
  currentUser,
  initialSubTab,
  initialPreviewQuoteId,
  onQuotesCountChange,
}: UseQuotesTabStateParams) {
  const isSuperAdmin = currentUser?.role === "SUPERADMIN"
  const isAdmin = currentUser?.role === "ADMIN" || isSuperAdmin
  const effectivePerms =
    currentUser?.permissions || currentUser?.departmentPermissions || {}
  const canReview = Boolean(
    isAdmin || effectivePerms.canReviewQuote || effectivePerms.canApproveQuote
  )
  const canEditApproved = Boolean(
    isAdmin || effectivePerms.canEditApprovedQuote
  )
  const hasOdooAccess = Boolean(
    isAdmin ||
    effectivePerms.canAccessOdooQueue ||
    effectivePerms.canMarkOdooEntry ||
    currentUser?.department === "CLERK"
  )
  const isClerk = Boolean(
    currentUser?.department === "CLERK" ||
    (effectivePerms.canMarkOdooEntry && !canReview)
  )
  const isEmployee = !canReview && !isClerk

  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const defaultSubTab: QuotesSubTabType = canReview
    ? "review"
    : isClerk
      ? "odoo"
      : "my"
  const [activeTab, setActiveTab] = useState<QuotesSubTabType>(
    initialSubTab || defaultSubTab
  )
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [staffList, setStaffList] = useState<any[]>([])

  // Preview Modal State
  const [previewQuote, setPreviewQuote] = useState<any | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] =
    useState<QuoteTemplateType>("modern")
  const [previewFontSize, setPreviewFontSize] = useState(11.5)
  const [previewSpacing, setPreviewSpacing] = useState(1.0)
  const [previewNotes, setPreviewNotes] = useState("")

  const myUsername = currentUser?.username?.toLowerCase()

  const onQuotesCountChangeRef = useRef(onQuotesCountChange)
  useEffect(() => {
    onQuotesCountChangeRef.current = onQuotesCountChange
  })

  useEffect(() => {
    if (initialSubTab && VALID_SUB_TABS.includes(initialSubTab)) {
      setActiveTab(initialSubTab)
    } else if (typeof window !== "undefined") {
      const sub = new URLSearchParams(window.location.search).get("sub") as QuotesSubTabType
      if (sub && VALID_SUB_TABS.includes(sub)) setActiveTab(sub)
    }
  }, [initialSubTab])

  useEffect(() => {
    fetch("/api/users?assignees=true")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const eligible = data.filter(
            (d) =>
              d.role !== "SUPERADMIN" &&
              d.role !== "superadmin" &&
              !d.username?.toLowerCase().includes("superadmin")
          )
          setStaffList(eligible)
        }
      })
      .catch(() => {})
  }, [])

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/quotes?search=${encodeURIComponent(search)}&status=${statusFilter}&t=${Date.now()}`,
        { cache: "no-store" }
      )
      if (res.ok) {
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        setQuotes(list)

        let totalActionable = 0
        if (isSuperAdmin) {
          const rev = list.filter((q: any) => q.status === "PENDING_REVIEW").length
          const odoo = list.filter((q: any) => q.odooStatus === "PENDING_ENTRY" || (!q.odooStatus && Boolean(q.odooAssignedTo))).length
          totalActionable = rev + odoo
        } else if (canReview) {
          const rev = list.filter((q: any) => q.status === "PENDING_REVIEW" && ((q.assignedTo?.toLowerCase()?.trim() || "admin") === (myUsername || "admin"))).length
          const odoo = list.filter((q: any) => (q.odooStatus === "PENDING_ENTRY" || (!q.odooStatus && Boolean(q.odooAssignedTo))) && q.odooAssignedTo?.toLowerCase() === myUsername).length
          totalActionable = rev + odoo
        } else if (isClerk) {
          totalActionable = list.filter((q: any) => q.odooAssignedTo?.toLowerCase() === myUsername && q.odooStatus !== "COMPLETED").length
        } else {
          const assigned = list.filter((q: any) => q.status === "PENDING_REVIEW" && q.assignedTo?.toLowerCase()?.trim() === myUsername).length
          const returned = list.filter((q: any) => q.status === "RETURNED" && q.preparedBy?.toLowerCase()?.trim() === myUsername).length
          totalActionable = assigned + returned
        }

        if (onQuotesCountChangeRef.current)
          onQuotesCountChangeRef.current(totalActionable)
      }
    } catch (err) {
      console.error("Failed to fetch quotes:", err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, isSuperAdmin, canReview, isClerk, myUsername])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  useEffect(() => {
    const handleCountUpdate = () => fetchQuotes()
    const handleQuoteDeleted = (e: any) => {
      const deletedId = e.detail?.quoteId
      if (deletedId) setQuotes((prev) => prev.filter((q) => q._id !== deletedId))
      fetchQuotes()
    }
    const handlePopState = () => {
      const sub = new URLSearchParams(window.location.search).get("sub") as QuotesSubTabType
      if (sub && VALID_SUB_TABS.includes(sub)) setActiveTab(sub)
      fetchQuotes()
    }
    const handleFocus = () => fetchQuotes()

    window.addEventListener("quote-count-updated", handleCountUpdate)
    window.addEventListener("quote-deleted", handleQuoteDeleted)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("pageshow", handleFocus)
    window.addEventListener("popstate", handlePopState)
    return () => {
      window.removeEventListener("quote-count-updated", handleCountUpdate)
      window.removeEventListener("quote-deleted", handleQuoteDeleted)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("pageshow", handleFocus)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [fetchQuotes])

  const actions = useQuotesTabActions({
    quotes,
    setQuotes,
    fetchQuotes,
    currentUser,
  })

  const handlePreviewQuote = useCallback((quote: any) => {
    setPreviewTemplate("universal")
    setPreviewQuote(quote)
    setPreviewNotes(quote.quoteNotes || "")
    setIsPreviewOpen(true)
  }, [])

  useQuotePreviewListeners({
    quotes,
    currentUser,
    initialPreviewQuoteId,
    setActiveTab,
    handlePreviewQuote,
  })

  const sortedQuotes = filterAndSortQuotes({
    quotes,
    activeTab,
    statusFilter,
    search,
    canReview,
    isSuperAdmin,
    isClerk,
    hasOdooAccess,
    myUsername,
  })

  const handleTabChange = (newTab: QuotesSubTabType) => {
    setActiveTab(newTab)
    setStatusFilter("all")
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("sub", newTab)
      const current =
        typeof window.history.state === "object" && window.history.state !== null
          ? window.history.state
          : {}
      window.history.pushState({ ...current, sub: newTab }, "", url.toString())
    }
  }

  const counts = computeQuotesTabCounts({
    quotes,
    isSuperAdmin,
    hasOdooAccess,
    myUsername,
  })

  return {
    isSuperAdmin,
    isAdmin,
    canReview,
    canEditApproved,
    hasOdooAccess,
    isClerk,
    isEmployee,
    quotes,
    loading,
    activeTab,
    setActiveTab,
    handleTabChange,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    staffList,
    previewQuote,
    setPreviewQuote,
    isPreviewOpen,
    setIsPreviewOpen,
    previewTemplate,
    setPreviewTemplate,
    previewFontSize,
    setPreviewFontSize,
    previewSpacing,
    setPreviewSpacing,
    previewNotes,
    setPreviewNotes,
    handlePreviewQuote,
    fetchQuotes,
    sortedQuotes,
    ...actions,
    ...counts,
  }
}
