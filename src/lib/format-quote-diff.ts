/**
 * Pure TypeScript helper to parse human-readable quote diff bullet points * into structured visual items (icons, types, and delta pills).
 */

export interface ParsedDiffItem {
  raw: string
  type: "added" | "updated" | "removed" | "info"
  text: string
  delta?: string
}

export function parseDiffItem(raw: string): ParsedDiffItem {
  if (!raw) {
    return { raw: "", type: "info", text: "" }
  }

  const trimmed = raw.trim()

  // Match delta in parentheses like (+$100.00) or (+$120.00) or (-$50.00)
  const deltaMatch = trimmed.match(/\(([+-]?\$[\d,]+(?:\.\d{2})?)\)/)
  const delta = deltaMatch ? deltaMatch[1] : undefined

  // Clean text by stripping redundant trailing delta from text if extracted
  let text = trimmed
  if (deltaMatch && trimmed.endsWith(deltaMatch[0])) {
    text = trimmed.substring(0, trimmed.lastIndexOf(deltaMatch[0])).trim()
  }

  const lower = trimmed.toLowerCase()

  if (lower.startsWith("added") || lower.includes("added add-on")) {
    return {
      raw: trimmed,
      type: "added",
      text,
      delta: delta || (trimmed.match(/\+\$[\d,]+(?:\.\d{2})?/)?.[0]),
    }
  }

  if (lower.startsWith("removed") || lower.includes("removed add-on")) {
    return {
      raw: trimmed,
      type: "removed",
      text: trimmed,
      delta: undefined,
    }
  }

  if (
    lower.includes("updated from") ||
    lower.includes("adjusted from") ||
    lower.includes("changed to") ||
    lower.includes("override set to") ||
    lower.includes("override updated")
  ) {
    return {
      raw: trimmed,
      type: "updated",
      text,
      delta,
    }
  }

  return {
    raw: trimmed,
    type: "info",
    text: trimmed,
    delta,
  }
}

import { normalizeDiffTotalCents } from "./quote-diff-helpers"

/**
 * Computes net financial impact string (e.g. "+$220.00" or "-$150.00")
 * between initial quote snapshot and current quote total.
 */
export function calculateNetDiffDelta(quote: any): string | null {
  if (!quote) return null

  const curTotal = Number(quote.quoteSummaryTotal ?? 0)
  let origTotal = Number(quote.initialSnapshot?.quoteSummaryTotal ?? 0)
  origTotal = normalizeDiffTotalCents(origTotal, curTotal)

  if (curTotal > 0 && origTotal > 0 && Math.abs(curTotal - origTotal) >= 1) {
    const diff = (curTotal - origTotal) / 100
    const sign = diff > 0 ? "+" : "-"
    return `${sign}$${Math.abs(diff).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  // Fallback: Check if reviewChanges contains a line like "Quote Total updated ... (+$220.00)"
  if (Array.isArray(quote.reviewChanges)) {
    for (const change of quote.reviewChanges) {
      const match = change.match(/\(([+-]\$[\d,]+(?:\.\d{2})?)\)/)
      if (match && change.toLowerCase().includes("quote total updated")) {
        return match[1]
      }
    }
  }

  return null
}

