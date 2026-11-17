import Department from "@/models/Department"

export interface QuoteSecurityCheckResult {
  allowed: boolean
  error?: string
  statusCode?: number
  canEditApprovedQuote?: boolean
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
  if (existingQuote.status === "PENDING_REVIEW") {
    const currentUser = (
      session?.user?.username ||
      session?.user?.name ||
      ""
    ).toLowerCase()
    const assigned = existingQuote.assignedTo?.toLowerCase()?.trim()
    const preparer = existingQuote.preparedBy?.toLowerCase()?.trim()

    if (assigned && currentUser) {
      const isAssigned =
        assigned === currentUser ||
        (currentUser === "admin" && assigned === "admin")
      const isPreparer = preparer ? preparer === currentUser : false

      if (!isAssigned && !isPreparer) {
        return {
          allowed: false,
          error: `Quote #${existingQuote.quoteNumber || ""} is assigned to @${existingQuote.assignedTo} and can only be reviewed or modified by them.`,
          statusCode: 403,
        }
      }
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
