/**
 * Pure helper to format reviewer, editor, and preparer display names cleanly.
 * Strictly masks superadmin 'cheeku' so the identity is never exposed to employees/clients,
 * always rendering as 'Admin'.
 * Strips any parenthesized role suffixes like '(Admin)' or '(Reviewer)'.
 */
export function formatReviewerName(name?: string, role?: string): string {
  if (!name) return "Admin"
  const trimmed = name.trim()
  if (
    trimmed.toLowerCase() === "cheeku" ||
    role === "SUPERADMIN" ||
    trimmed.toLowerCase() === "superadmin"
  ) {
    return "Admin"
  }

  // Strip any parenthesized roles e.g. "Jessica (Admin)" -> "Jessica"
  const clean = trimmed.replace(/\s*\([^)]*\)/g, "").trim()
  if (!clean || clean.toLowerCase() === "cheeku") {
    return "Admin"
  }

  // Clean title casing for usernames (e.g. "kyle" -> "Kyle", "jessica" -> "Jessica")
  return clean.charAt(0).toUpperCase() + clean.slice(1)
}

