/**
 * Escape special regular-expression metacharacters so user or dynamic strings
 * are matched as literals instead of throwing syntax errors or triggering ReDoS.
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Build a case-insensitive exact-match RegExp for a literal string.
 */
export function exactCaseInsensitiveRegex(value: string): RegExp {
  return new RegExp(`^${escapeRegex(value)}$`, "i")
}

/**
 * Build a case-insensitive substring-match RegExp for a literal search term.
 */
export function containsCaseInsensitiveRegex(value: string): RegExp {
  return new RegExp(escapeRegex(value), "i")
}
