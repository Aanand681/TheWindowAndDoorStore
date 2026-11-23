export function normalizeQuoteSummaryTotal(
  rawSummaryTotal: number,
  taxGrandTotal?: any
): number {
  const isCentsNeeded =
    rawSummaryTotal > 0 &&
    rawSummaryTotal < 100000 &&
    ((taxGrandTotal &&
      Math.abs(rawSummaryTotal - Number(taxGrandTotal)) < 0.01) ||
      rawSummaryTotal < 10000)

  return isCentsNeeded
    ? Math.round(rawSummaryTotal * 100)
    : Math.round(rawSummaryTotal)
}

export interface ValidationResult {
  isValid: boolean
  error?: string
  status?: number
}

export function validateQuoteCreateInput(
  body: any,
  currentUsername: string,
  session: any,
  preparerUser: any,
  reviewerUser: any
): ValidationResult {
  const { quoteNumber, customerName, quoteNotes, preparerNotes, windows, directApprove, assignedTo } = body

  if (!quoteNumber || typeof quoteNumber !== "string" || !quoteNumber.trim()) {
    return { isValid: false, error: "Quote Number is required", status: 400 }
  }

  if (quoteNumber.length > 60) {
    return { isValid: false, error: "Quote Number cannot exceed 60 characters", status: 400 }
  }

  if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
    return { isValid: false, error: "Customer Name is required", status: 400 }
  }

  if (customerName.length > 200) {
    return { isValid: false, error: "Customer Name cannot exceed 200 characters", status: 400 }
  }

  if (quoteNotes && typeof quoteNotes === "string" && quoteNotes.length > 10000) {
    return { isValid: false, error: "Quote Notes cannot exceed 10,000 characters", status: 400 }
  }

  if (preparerNotes && typeof preparerNotes === "string" && preparerNotes.length > 10000) {
    return { isValid: false, error: "Preparer Notes cannot exceed 10,000 characters", status: 400 }
  }

  if (windows && Array.isArray(windows) && windows.length > 200) {
    return { isValid: false, error: "A quote cannot contain more than 200 window items", status: 400 }
  }

  const isDirectApprove = Boolean(directApprove)
  const isUserAdmin =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "SUPERADMIN" ||
    preparerUser?.role === "ADMIN" ||
    preparerUser?.role === "SUPERADMIN"

  if (isDirectApprove && !isUserAdmin) {
    return { isValid: false, error: "Only administrators can directly approve quotes.", status: 403 }
  }

  if (!isDirectApprove) {
    const targetReviewer = reviewerUser?.username || assignedTo || ""
    if (
      !targetReviewer.trim() ||
      targetReviewer.toLowerCase() === currentUsername.toLowerCase()
    ) {
      return {
        isValid: false,
        error: "You cannot submit a quote for review to yourself. Please select another team member.",
        status: 400,
      }
    }
  }

  return { isValid: true }
}
