import { describe, it, expect } from "vitest"
import { formatReviewerName } from "../format-reviewer"
import { parseDiffItem, calculateNetDiffDelta } from "../format-quote-diff"

describe("formatReviewerName", () => {
  it("strictly masks cheeku to Admin", () => {
    expect(formatReviewerName("cheeku")).toBe("Admin")
    expect(formatReviewerName("CHEEKU")).toBe("Admin")
    expect(formatReviewerName("cheeku", "SUPERADMIN")).toBe("Admin")
    expect(formatReviewerName("john", "SUPERADMIN")).toBe("Admin")
  })

  it("formats usernames cleanly without parenthesized roles", () => {
    expect(formatReviewerName("jessica")).toBe("Jessica")
    expect(formatReviewerName("kyle")).toBe("Kyle")
    expect(formatReviewerName("Jessica (Admin)")).toBe("Jessica")
    expect(formatReviewerName("Kyle (Reviewer)")).toBe("Kyle")
  })

  it("handles null or undefined gracefully by returning Admin", () => {
    expect(formatReviewerName(undefined)).toBe("Admin")
    expect(formatReviewerName("")).toBe("Admin")
  })
})

describe("format-quote-diff", () => {
  it("parses added items with icons and deltas", () => {
    const parsed = parseDiffItem(
      'Added Add-on: "Basement windows $100.00 extra" (Qty: 1 (+$100.00))'
    )
    expect(parsed.type).toBe("added")
    expect(parsed.delta).toBe("+$100.00")
    expect(parsed.text).toContain("Basement windows")
  })

  it("parses removed items", () => {
    const parsed = parseDiffItem('Removed Add-on: "Scaffolding set up 1 section"')
    expect(parsed.type).toBe("removed")
    expect(parsed.delta).toBeUndefined()
  })

  it("parses updated price items", () => {
    const parsed = parseDiffItem(
      "Custom Labour updated from $350.00 to $450.00"
    )
    expect(parsed.type).toBe("updated")
  })

  it("calculates net financial difference between quote totals", () => {
    const quote = {
      quoteSummaryTotal: 442000,
      initialSnapshot: {
        quoteSummaryTotal: 420000,
      },
    }
    expect(calculateNetDiffDelta(quote)).toBe("+$220.00")

    const decreasedQuote = {
      quoteSummaryTotal: 400000,
      initialSnapshot: {
        quoteSummaryTotal: 420000,
      },
    }
    expect(calculateNetDiffDelta(decreasedQuote)).toBe("-$200.00")
  })
})

