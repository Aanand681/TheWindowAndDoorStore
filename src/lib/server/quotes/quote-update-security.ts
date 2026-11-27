import Department from "@/models/Department"

export interface QuoteSecurityCheckResult {
  allowed: boolean
  error?: string
  statusCode?: number
  canEditApprovedQuote?: boolean
}

function getNormalizedUsername(session: any): string {
  return (session?.user?.username || session?.user?.name || "")
    .trim()
    .toLowerCase()
}

function checkPendingReviewIsolation(
  session: any,
  existingQuote: any,
  actionDescription: string
): { allowed: true; isAssigned: boolean; isPreparer: boolean } | { allowed: false; error: string } {
  const currentUser = getNormalizedUsername(session)
  const assigned = existingQuote.assignedTo?.trim().toLowerCase() || ""
  const preparer = existingQuote.preparedBy?.trim().toLowerCase() || ""

  const isAssigned =
    Boolean(assigned && currentUser) &&
    (assigned === currentUser || (currentUser === "admin" && assigned === "admin"))
  const isPreparer = Boolean(preparer && currentUser && preparer === currentUser)

  if (existingQuote.status === "PENDING_REVIEW" && assigned && currentUser) {
    if (!isAssigned && !isPreparer) {
      return {
        allowed: false,
        error: `Quote #${existingQuote.quoteNumber || ""} is assigned to @${existingQuote.assignedTo} and can only be ${actionDescription} by them.`,
      }
    }
  }

  return { allowed: true, isAssigned, isPreparer }
}

/**
 * Authorize star/unstar toggles while enforcing PENDING_REVIEW reviewer isolation
 * and ownership/assignment boundaries.
 */
export function canToggleQuoteStar(
  session: any,
  existingQuote: any
): { allowed: true } | { allowed: false; error: string } {
  const reviewCheck = checkPendingReviewIsolation(
    session,
    existingQuote,
    "reviewed or modified"
  )
  if (!reviewCheck.allowed) return reviewCheck

  const role = session?.user?.role
  const currentUser = getNormalizedUsername(session)
  const odooAssignee = existingQuote.odooAssignedTo?.trim().toLowerCase() || ""
  const isAdmin = role === "SUPERADMIN" || role === "ADMIN"
  const isOdooAssignee = Boolean(
    odooAssignee && currentUser && odooAssignee === currentUser
  )

  if (
    !isAdmin &&
    !reviewCheck.isPreparer &&
    !reviewCheck.isAssigned &&
    !isOdooAssignee
  ) {
    return {
      allowed: false,
      error: "You do not have permission to star or unstar this quote.",
    }
  }

  return { allowed: true }
}

export async function checkQuoteUpdateSecurity(p: {
  session: any
  existingQuote: any
  body: any
}): Promise<QuoteSecurityCheckResult> {
  const { session, existingQuote, body } = p
  const userRole = session.user.role
  const userDept = session.user.department

  let deptDoc: any = null
  if (userDept) {
    deptDoc = await Department.findOne({ code: userDept })
  }
  const deptPerms = deptDoc?.permissions || {}

  const canEditApprovedQuote =
    userRole === "SUPERADMIN" ||
    userRole === "ADMIN" ||
    deptPerms.canEditApprovedQuote === true

  const canApprove =
    userRole === "SUPERADMIN" ||
    userRole === "ADMIN" ||
    deptPerms.canApproveQuote === true

  // Strict approval restriction: Only admins can perform final quote approval
  if (body.status === "APPROVED" && !canApprove) {
    return {
      allowed: false,
      error:
        "Only administrators can approve quotes. Please forward this quote to an administrator for approval.",
      statusCode: 403,
    }
  }

  // Strict Reviewer Isolation on updates:
  // If a quote in PENDING_REVIEW is assigned to a specific admin/reviewer,
  // only that assigned reviewer or the preparer who created it can update or approve it.
  const reviewCheck = checkPendingReviewIsolation(
    session,
    existingQuote,
    "reviewed or modified"
  )
  if (!reviewCheck.allowed) {
    return {
      allowed: false,
      error: reviewCheck.error,
      statusCode: 403,
    }
  }

  // Once a quote is confirmed in Odoo, it is permanently locked for EVERYONE (including admin)
  const isAlreadyOdooCompleted =
    existingQuote.odooStatus === "COMPLETED" ||
    Boolean(existingQuote.odooOrderNumber)
  if (isAlreadyOdooCompleted) {
    const isSpecOrPriceEdit = [
      "windows",
      "taxTotals",
      "quoteResult",
      "surchargeRate",
      "activePromoId",
      "reviewChanges",
      "status",
      "reviewerNotes",
      "customerName",
      "quoteNumber",
    ].some((key) => key in body)
    if (isSpecOrPriceEdit) {
      return {
        allowed: false,
        error:
          "This quote has been entered into Odoo and is locked. Modifications are prohibited.",
        statusCode: 403,
      }
    }
  }

  // Once a quote is approved or modified, block everyone without permission from editing details
  const isApprovedOrModified =
    existingQuote.status === "APPROVED" || existingQuote.status === "MODIFIED"
  if (isApprovedOrModified && !canEditApprovedQuote) {
    const isOnlyOdooUpdate = Object.keys(body).every((key) =>
      [
        "odooStatus",
        "odooOrderNumber",
        "odooCompletedAt",
        "odooCompletedBy",
      ].includes(key)
    )
    if (!isOnlyOdooUpdate) {
      return {
        allowed: false,
        error:
          "Once a quote is approved, only authorized administrators/reviewers can edit quote specifications.",
        statusCode: 403,
      }
    }
  }

  return { allowed: true, canEditApprovedQuote }
}
