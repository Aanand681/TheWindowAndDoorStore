export interface ValidationResult {
  error?: string
  statusCode?: number
}

/**
 * Validates incoming quote update fields for bounds, types, and length constraints.
 */
export function validateQuoteUpdateFields(
  body: any,
  reviewerUsername?: string
): ValidationResult | null {
  if (body.customerName !== undefined) {
    if (typeof body.customerName !== "string" || !body.customerName.trim()) {
      return { error: "Customer Name cannot be empty", statusCode: 400 }
    }
    if (body.customerName.length > 200) {
      return {
        error: "Customer Name cannot exceed 200 characters",
        statusCode: 400,
      }
    }
  }

  if (body.quoteNumber !== undefined) {
    if (typeof body.quoteNumber !== "string" || !body.quoteNumber.trim()) {
      return { error: "Quote Number cannot be empty", statusCode: 400 }
    }
    if (body.quoteNumber.length > 60) {
      return {
        error: "Quote Number cannot exceed 60 characters",
        statusCode: 400,
      }
    }
  }

  if (
    body.quoteNotes !== undefined &&
    typeof body.quoteNotes === "string" &&
    body.quoteNotes.length > 10000
  ) {
    return {
      error: "Quote Notes cannot exceed 10,000 characters",
      statusCode: 400,
    }
  }

  if (
    body.reviewerNotes !== undefined &&
    typeof body.reviewerNotes === "string" &&
    body.reviewerNotes.length > 10000
  ) {
    return {
      error: "Reviewer Notes cannot exceed 10,000 characters",
      statusCode: 400,
    }
  }

  if (
    body.preparerNotes !== undefined &&
    typeof body.preparerNotes === "string" &&
    body.preparerNotes.length > 10000
  ) {
    return {
      error: "Preparer Notes cannot exceed 10,000 characters",
      statusCode: 400,
    }
  }

  if (
    body.windows !== undefined &&
    Array.isArray(body.windows) &&
    body.windows.length > 200
  ) {
    return {
      error: "A quote cannot contain more than 200 window items",
      statusCode: 400,
    }
  }

  if (body.assignedTo !== undefined) {
    if (
      body.assignedTo &&
      reviewerUsername &&
      body.assignedTo.trim().toLowerCase() ===
        reviewerUsername.trim().toLowerCase()
    ) {
      return {
        error: "You cannot assign or forward a quote for review to yourself.",
        statusCode: 400,
      }
    }
  }

  return null
}
