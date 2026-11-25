export interface PdfRowItem {
  page: number
  pageHeight?: number
  y: number
  no: string
  qty: number | null
  label: string
  list: number | null
  total: number | null
  size: string
}

function isPrintFooterRow(row: PdfRowItem): boolean {
  const combined = [row.no, row.label, row.size]
    .filter(Boolean)
    .join(" ")
    .trim()
  return (
    /\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}/i.test(combined) ||
    /(?:^|\s)\d+\s+of\s+\d+(?:\s|$)/i.test(combined)
  )
}

function shouldKeepBottomRow(row: PdfRowItem): boolean {
  if (isPrintFooterRow(row)) return false

  const pageHeight = row.pageHeight || 792
  const footerStart = pageHeight - 34 // ~758 on Letter (prints timestamp / X of Y below)
  const hardBottom = pageHeight - 16 // Never match bottom margin print line

  const isLineItemTotal = /^LINE\s*ITEM\s*(TOTAL|SUBTOTAL)/i.test(row.label)
  if (isLineItemTotal && row.y < hardBottom) return true
  if (row.y >= footerStart) return false
  if (row.y < 740) return true

  // Between 740 and footerStart (dense pages like 2-window sheets):
  // keep priced rows, headers with qty, or wrapped dimensions; drop stray bare tokens.
  const hasPrice = row.list !== null || row.total !== null
  const hasStructuredSize = /^(FR|BM)\s*:/i.test(row.size)
  return hasPrice || row.qty !== null || hasStructuredSize
}

function clusterItemsIntoRow(rowItems: any[]): PdfRowItem {
  const sorted = [...rowItems].sort((a: any, b: any) => a.x - b.x)
  const money = (s: string) => Number(s.replace(/[$,]/g, ""))
  const out: PdfRowItem = {
    page: sorted[0].page,
    pageHeight: sorted[0].pageHeight,
    y: sorted[0].y,
    no: "",
    qty: null,
    label: "",
    list: null,
    total: null,
    size: "",
  }
  const labelParts: string[] = []
  const sizeParts: string[] = []

  for (const it of sorted) {
    const s = String(it.str).trim()
    if (
      it.x < 50 &&
      !out.no &&
      !labelParts.length &&
      /^\d+(?:\.\d+)?$/.test(s)
    ) {
      out.no = s
      continue
    }
    if (it.x >= 250 && it.x < 285 && /^\d+$/.test(s)) {
      out.qty = Number(s)
      continue
    }
    if (it.x >= 370 && /^\$[\d,]+\.\d{2}$/.test(s)) {
      if (it.x < 445) out.list = money(s)
      else out.total = money(s)
      continue
    }
    if (it.x >= 250 && it.x <= 390 && !/^\$/.test(s)) {
      sizeParts.push(s)
      continue
    }
    if (it.x < 250 || /LINE|ITEM|TOTAL/i.test(s)) labelParts.push(s)
  }

  out.label = labelParts.join(" ").replace(/\s+/g, " ").trim()
  out.size = sizeParts.join(" ").replace(/\s+/g, " ").trim()
  return out
}

/**
 * Clusters raw PDF.js text items by page/Y/X into table rows while keeping
 * dense-page content rows above the print footer intact.
 */
export function pdfItemsToRows(items: any[]): PdfRowItem[] {
  const sorted = [...items].sort(
    (a, b) => a.page - b.page || a.y - b.y || a.x - b.x
  )
  const grouped: any[][] = []
  let cur: { page: number; y: number; items: any[] } | null = null

  for (const it of sorted) {
    if (!String(it.str).trim()) continue
    if (!cur || cur.page !== it.page || Math.abs(it.y - cur.y) > 3) {
      cur = { page: it.page, y: it.y, items: [] }
      grouped.push(cur.items)
    }
    cur.items.push(it)
  }

  return grouped.map(clusterItemsIntoRow).filter(shouldKeepBottomRow)
}
