export interface QuotePdfFileNameParams {
  customerName?: string | null
  quoteNumbers?: Array<string | null | undefined>
  withExtension?: boolean
}

/**
 * Strips characters invalid in macOS/Windows/Linux download file names.
 */
export function sanitizePdfFileNamePart(str: string): string {
  return str.replace(/[/\\?%*:|"<>]/g, "").trim()
}

/**
 * Normalizes a quote number with a single leading '#' when non-empty.
 */
export function formatHashQuoteNumber(raw?: string | null): string {
  if (!raw) return ""
  const clean = sanitizePdfFileNamePart(String(raw)).replace(/^#+/, "").trim()
  return clean ? `#${clean}` : ""
}

/**
 * Generates consistent download/print file names:
 * - 1 quote:  "Full Name #83546.pdf"
 * - 2 quotes: "Full Name #q1 & #q2.pdf"
 * - 3 quotes: "Full Name #q1 & #q2 for #q3.pdf"
 */
export function buildStandardQuotePdfFileName({
  customerName,
  quoteNumbers = [],
  withExtension = true,
}: QuotePdfFileNameParams): string {
  const cleanName = sanitizePdfFileNamePart(customerName || "Customer") || "Customer"

  const uniqueFormatted: string[] = []
  const seen = new Set<string>()
  for (const num of quoteNumbers) {
    const formatted = formatHashQuoteNumber(num)
    if (formatted && !seen.has(formatted)) {
      seen.add(formatted)
      uniqueFormatted.push(formatted)
    }
  }

  let base = cleanName
  if (uniqueFormatted.length === 1) {
    base = `${cleanName} ${uniqueFormatted[0]}`
  } else if (uniqueFormatted.length === 2) {
    base = `${cleanName} ${uniqueFormatted[0]} & ${uniqueFormatted[1]}`
  } else if (uniqueFormatted.length >= 3) {
    base = `${cleanName} ${uniqueFormatted.slice(0, -1).join(" & ")} for ${uniqueFormatted[uniqueFormatted.length - 1]}`
  }

  return withExtension ? `${base}.pdf` : base
}

/**
 * Collects active quote numbers in visual priority order across host and attached quotes.
 */
export function collectInvoiceQuoteNumbers(p: {
  quoteNumber?: string | null
  attachedWindowQuote?: { quoteNumber?: string | null } | null
  attachedDoorQuote?: { quoteNumber?: string | null } | null
  attachedSealedUnit?: { quoteNumber?: string | null } | null
}): string[] {
  const nums: string[] = []
  if (p.quoteNumber) nums.push(p.quoteNumber)
  if (p.attachedWindowQuote?.quoteNumber) nums.push(p.attachedWindowQuote.quoteNumber)
  if (p.attachedDoorQuote?.quoteNumber) nums.push(p.attachedDoorQuote.quoteNumber)
  if (p.attachedSealedUnit?.quoteNumber) nums.push(p.attachedSealedUnit.quoteNumber)
  return nums
}

/**
 * Temporarily sets document.title to the formatted quote filename so Save-as-PDF
 * uses "Full Name #quote..." cleanly, then triggers window.print() directly.
 */
export function triggerDirectQuotePrint(params: {
  customerName?: string | null
  quoteNumber?: string | null
  attachedWindowQuote?: { quoteNumber?: string | null } | null
  attachedDoorQuote?: { quoteNumber?: string | null } | null
  attachedSealedUnit?: { quoteNumber?: string | null } | null
}): void {
  if (typeof window === "undefined") return
  const quoteNumbers = collectInvoiceQuoteNumbers(params)
  const cleanTitle = buildStandardQuotePdfFileName({
    customerName: params.customerName,
    quoteNumbers,
    withExtension: false,
  })
  const previousTitle = document.title
  document.title = cleanTitle

  let restored = false
  const restore = () => {
    if (restored) return
    restored = true
    document.title = previousTitle
    window.removeEventListener("afterprint", restore)
  }

  window.addEventListener("afterprint", restore)
  window.print()
  // Fallback in case browser cancels or doesn't emit afterprint synchronously
  window.setTimeout(restore, 1500)
}
