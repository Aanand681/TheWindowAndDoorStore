import type { QuotesSubTabType } from "@/components/quotes/tab/types"

export interface QuotesFilterParams {
  quotes: any[]
  activeTab: QuotesSubTabType
  statusFilter: string
  search: string
  canReview: boolean
  isSuperAdmin: boolean
  isClerk: boolean
  hasOdooAccess: boolean
  myUsername?: string
}

export function filterAndSortQuotes({
  quotes,
  activeTab,
  statusFilter,
  search,
  canReview,
  isSuperAdmin,
  isClerk,
  hasOdooAccess,
  myUsername,
}: QuotesFilterParams): any[] {
  const displayedQuotes = quotes.filter((quote) => {
    const prep = quote.preparedBy?.toLowerCase()
    const clerk = quote.odooAssignedTo?.toLowerCase()
    const completedBy = quote.odooCompletedBy?.toLowerCase()

    if (canReview) {
      if (activeTab === "review") {
        if (quote.status !== "PENDING_REVIEW") return false
        const assigned = quote.assignedTo?.toLowerCase()?.trim()
        if (!isSuperAdmin) {
          if (assigned) {
            if (assigned !== myUsername) return false
          } else {
            if (myUsername !== "admin") return false
          }
        }
      } else if (activeTab === "odoo") {
        if (
          !Boolean(
            quote.odooAssignedTo ||
            quote.odooStatus === "PENDING_ENTRY" ||
            quote.odooStatus === "COMPLETED"
          )
        )
          return false
      }
    } else if (isClerk) {
      if (activeTab === "odoo") {
        if (clerk !== myUsername || quote.odooStatus === "COMPLETED")
          return false
      } else if (activeTab === "odoo_completed") {
        if (!(
          (clerk === myUsername || completedBy === myUsername) &&
          quote.odooStatus === "COMPLETED"
        ))
          return false
      } else if (activeTab === "all_assigned") {
        if (clerk !== myUsername) return false
      }
    } else {
      if (activeTab === "odoo" && hasOdooAccess) {
        const isAssignedToMe = clerk === myUsername
        const isPendingEntry =
          quote.odooStatus === "PENDING_ENTRY" ||
          (!quote.odooStatus && Boolean(quote.odooAssignedTo))
        if (quote.odooAssignedTo && !isAssignedToMe) return false
        if (!isPendingEntry) return false
      } else {
        if (prep !== myUsername) return false

        if (activeTab === "review") {
          if (quote.status !== "PENDING_REVIEW") return false
        } else if (activeTab === "odoo_completed") {
          if (quote.odooStatus !== "COMPLETED") return false
        }
      }
    }

    if (statusFilter !== "all") {
      if (statusFilter === "ODOO_PENDING") {
        const isPending =
          quote.odooStatus === "PENDING_ENTRY" ||
          (!quote.odooStatus && Boolean(quote.odooAssignedTo))
        if (!isPending) return false
      } else if (statusFilter === "ODOO_COMPLETED") {
        if (quote.odooStatus !== "COMPLETED") return false
      } else {
        if (quote.status !== statusFilter) return false
      }
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      const matchQuoteNum = quote.quoteNumber
        ?.toString()
        .toLowerCase()
        .includes(q)
      const matchOdooNum = quote.odooOrderNumber?.toLowerCase().includes(q)
      const matchCustomer = quote.customerName?.toLowerCase().includes(q)
      const matchPreparer = quote.preparedBy?.toLowerCase().includes(q)
      const matchOdooClerk = quote.odooAssignedTo?.toLowerCase().includes(q)
      if (
        !matchQuoteNum &&
        !matchOdooNum &&
        !matchCustomer &&
        !matchPreparer &&
        !matchOdooClerk
      ) {
        return false
      }
    }

    return true
  })

  return [...displayedQuotes].sort((a, b) => {
    if (activeTab === "odoo") {
      const aPending =
        a.odooStatus === "PENDING_ENTRY" ||
        (!a.odooStatus && Boolean(a.odooAssignedTo))
          ? 1
          : 0
      const bPending =
        b.odooStatus === "PENDING_ENTRY" ||
        (!b.odooStatus && Boolean(b.odooAssignedTo))
          ? 1
          : 0
      if (aPending !== bPending) {
        return bPending - aPending
      }
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function computeQuotesTabCounts({
  quotes,
  isSuperAdmin,
  hasOdooAccess,
  myUsername,
}: {
  quotes: any[]
  isSuperAdmin: boolean
  hasOdooAccess: boolean
  myUsername?: string
}) {
  const adminPendingCount = quotes.filter((q) => {
    if (q.status !== "PENDING_REVIEW") return false
    if (isSuperAdmin) return true
    const assigned = q.assignedTo?.toLowerCase()?.trim()
    if (assigned) return assigned === myUsername
    return myUsername === "admin"
  }).length

  const adminOdooCount = quotes.filter(
    (q) =>
      q.odooStatus === "PENDING_ENTRY" ||
      (!q.odooStatus && Boolean(q.odooAssignedTo))
  ).length
  const adminArchiveCount = quotes.length

  const employeeInReviewCount = quotes.filter(
    (q) =>
      q.preparedBy?.toLowerCase() === myUsername &&
      q.status === "PENDING_REVIEW"
  ).length
  const employeeOdooDoneCount = quotes.filter(
    (q) =>
      q.preparedBy?.toLowerCase() === myUsername && q.odooStatus === "COMPLETED"
  ).length
  const employeeHistoryCount = quotes.filter(
    (q) => q.preparedBy?.toLowerCase() === myUsername
  ).length

  const clerkPendingCount = quotes.filter((q) => {
    const isAssigned = q.odooAssignedTo?.toLowerCase() === myUsername
    const isPending =
      q.odooStatus === "PENDING_ENTRY" ||
      (!q.odooStatus && Boolean(q.odooAssignedTo))
    return (
      (isAssigned || (!q.odooAssignedTo && hasOdooAccess)) &&
      isPending &&
      q.odooStatus !== "COMPLETED"
    )
  }).length

  const clerkCompletedCount = quotes.filter(
    (q) =>
      (q.odooCompletedBy?.toLowerCase() === myUsername ||
        q.odooAssignedTo?.toLowerCase() === myUsername) &&
      q.odooStatus === "COMPLETED"
  ).length

  const clerkTotalAssignedCount = quotes.filter(
    (q) => q.odooAssignedTo?.toLowerCase() === myUsername
  ).length

  return {
    adminPendingCount,
    adminOdooCount,
    adminArchiveCount,
    employeeInReviewCount,
    employeeOdooDoneCount,
    employeeHistoryCount,
    clerkPendingCount,
    clerkCompletedCount,
    clerkTotalAssignedCount,
  }
}
