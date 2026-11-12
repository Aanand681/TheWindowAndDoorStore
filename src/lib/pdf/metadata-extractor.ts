export function extractPdfMetadata(items: any[]): {
  quoteNumber: string
  customerName: string
} {
  let quoteNumber = ""
  let customerName = ""

  // 1. MUST strictly only examine Page 1 (page === 0)
  const page1Items = (items || [])
    .filter((it) => it.page === 0 && it.str && it.str.trim())
    .map((it) => ({ ...it, str: it.str.trim() }))

  if (!page1Items.length) return { quoteNumber: "", customerName: "" }

  // Sort page 1 items top-to-bottom, left-to-right
  page1Items.sort((a, b) => a.y - b.y || a.x - b.x)

  // --- STRATEGY 1: TABLE HEADING (ORDER / CUSTOMER REF) ON PAGE 1 ---
  const custRefHeader = page1Items.find((it) => /CUSTOMER\s*REF/i.test(it.str))
  if (custRefHeader) {
    const headerY = custRefHeader.y

    // Get all column headers on the same row as CUSTOMER REF (within 6 units vertical tolerance)
    const rowHeaders = page1Items.filter((it) => Math.abs(it.y - headerY) <= 6)

    // Find the ORDER or QUOTE column header on this table row
    const orderHeader = rowHeaders.find((it) =>
      /^(ORDER|QUOTE|ORDER\s*#|QUOTE\s*#)$/i.test(it.str)
    )

    // Find adjacent header to the right of CUSTOMER REF (e.g. TERMS) to establish column boundary
    const rightHeader = rowHeaders.find((it) => it.x > custRefHeader.x + 10)
    const custMaxX = rightHeader ? rightHeader.x - 5 : custRefHeader.x + 220
    const custMinX = custRefHeader.x - 30

    // Next table section row below (e.g. ITEM / NO / DESCRIPTION / QTY)
    const nextRow = page1Items.find(
      (it) => it.y > headerY + 18 && /^(ITEM|NO|DESCRIPTION|QTY)$/i.test(it.str)
    )
    const maxY = nextRow ? nextRow.y : headerY + 30

    // Collect all customer name text items under CUSTOMER REF
    const nameItems = page1Items.filter(
      (it) =>
        it.y > headerY + 3 &&
        it.y < maxY &&
        it.x >= custMinX &&
        it.x <= custMaxX &&
        /[a-zA-Z]/.test(it.str)
    )

    if (nameItems.length > 0) {
      nameItems.sort((a, b) => a.y - b.y || a.x - b.x)
      customerName = nameItems
        .map((it) => it.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    }

    // Look for quote/order number directly under the ORDER column
    if (orderHeader) {
      const dateHeader = rowHeaders.find(
        (it) => it.x > orderHeader.x && /DATE/i.test(it.str)
      )
      const orderMaxX = dateHeader ? dateHeader.x - 5 : orderHeader.x + 60
      const orderMinX = orderHeader.x - 20

      const orderItems = page1Items.filter(
        (it) =>
          it.y > headerY + 3 &&
          it.y < maxY &&
          it.x >= orderMinX &&
          it.x <= orderMaxX &&
          /^\d+$/.test(it.str)
      )

      if (orderItems.length > 0) {
        orderItems.sort((a, b) => a.y - b.y)
        quoteNumber = orderItems[0].str
      }
    }
  }

  // --- STRATEGY 2: TOP HEADER LABELS ON PAGE 1 (QUOTE: <num>, # <num>) ---
  if (!quoteNumber) {
    for (let i = 0; i < page1Items.length; i++) {
      const it = page1Items[i]
      if (/^QUOTE\s*:?$/i.test(it.str) || /^ORDER\s*:?$/i.test(it.str)) {
        const numMatch = page1Items.find(
          (next) =>
            Math.abs(next.y - it.y) <= 8 &&
            next.x > it.x &&
            next.x < it.x + 80 &&
            /^\d{4,8}$/.test(next.str)
        )
        if (numMatch) {
          quoteNumber = numMatch.str
          break
        }
      } else if (
        it.str === "#" &&
        page1Items[i + 1] &&
        /^\d{4,8}$/.test(page1Items[i + 1].str)
      ) {
        quoteNumber = page1Items[i + 1].str
        break
      }
    }
  }

  // --- STRATEGY 3: TOP HEADER CUSTOMER LABELS (QUOTE NAME:, QUOTE CONTACT:) ---
  if (!customerName) {
    for (let i = 0; i < page1Items.length; i++) {
      const it = page1Items[i]
      if (/^(QUOTE\s*NAME|QUOTE\s*CONTACT|CUSTOMER|NAME):?$/i.test(it.str)) {
        const rightItems = page1Items.filter(
          (next) =>
            Math.abs(next.y - it.y) <= 6 &&
            next.x > it.x &&
            next.x < it.x + 200 &&
            /[a-zA-Z]/.test(next.str)
        )
        if (rightItems.length > 0) {
          rightItems.sort((a, b) => a.x - b.x)
          customerName = rightItems
            .map((n) => n.str)
            .join(" ")
            .trim()
          break
        }
      }
    }
  }

  // Fallback: look for "Ref:" or "Reference:"
  if (!customerName) {
    for (let i = 0; i < page1Items.length; i++) {
      const it = page1Items[i]
      if (/^(REF|REFERENCE):?$/i.test(it.str)) {
        const rightItems = page1Items.filter(
          (next) =>
            Math.abs(next.y - it.y) <= 6 &&
            next.x > it.x &&
            next.x < it.x + 200 &&
            /[a-zA-Z]/.test(next.str)
        )
        if (rightItems.length > 0) {
          rightItems.sort((a, b) => a.x - b.x)
          customerName = rightItems
            .map((n) => n.str)
            .join(" ")
            .trim()
          break
        }
      }
    }
  }

  return { quoteNumber, customerName }
}
