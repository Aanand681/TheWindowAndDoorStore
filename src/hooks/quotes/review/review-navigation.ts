/**
 * Universal browser navigation helper for exiting review mode across Window, Door, and Sealed Unit calculators.
 * Prefers popping browser history if the user arrived from within the app,
 * otherwise falls back to /quotes with the proper subtab query param.
 */
export function navigateExitReview(originSubTab?: string | null) {
  if (typeof window === "undefined") return

  const sub = originSubTab || new URLSearchParams(window.location.search).get("sub")
  if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
    window.history.back()
    return
  }
  window.location.href = sub ? `/quotes?sub=${sub}` : "/quotes"
}
