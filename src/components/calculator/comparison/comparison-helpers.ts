import { UIWindowItem } from "@/hooks/useCalculatorWindows"
import { toCents } from "@/lib/promo-logic"

export const UPGRADE_PRESETS = [
  "Triple Pane Upgrade",
  "Triple Pane (Solar Shield)",
  "Triple Pane (Solar Gain / Tempered)",
  "Brick Mould Upgrade",
]

export function getWindowsSummarySentence(windows: UIWindowItem[]): string {
  let dW = 0
  let tW = 0
  let dP = 0
  let tP = 0

  windows.forEach((w) => {
    const q = Math.max(1, Number(w.qty) || 1)
    const isTriple = Number(w.triple) > 0 || toCents(w.triple) > 0
    const isPainted = w.color && w.color.toLowerCase() === "painted"
    if (isPainted) {
      if (isTriple) tP += q
      else dP += q
    } else {
      if (isTriple) tW += q
      else dW += q
    }
  })

  const totalQty = dW + tW + dP + tP
  if (totalQty === 0) return "0 windows"

  const parts: string[] = []
  if (dW > 0 && tW > 0) parts.push(`${dW} dual & ${tW} triple pane white`)
  else if (dW > 0) parts.push(`${dW} dual pane white`)
  else if (tW > 0) parts.push(`${tW} triple pane white`)

  if (dP > 0 && tP > 0) parts.push(`${dP} dual & ${tP} triple pane painted`)
  else if (dP > 0) parts.push(`${dP} dual pane painted`)
  else if (tP > 0) parts.push(`${tP} triple pane painted`)

  return `${totalQty} window${totalQty === 1 ? "" : "s"} (${parts.join(", ")})`
}
