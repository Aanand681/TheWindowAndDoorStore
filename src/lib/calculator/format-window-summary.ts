export function formatWindowSummarySentence(windows: any[]): string {
  if (!Array.isArray(windows) || windows.length === 0) return "0 Windows"

  let dW = 0 // dual white
  let tW = 0 // triple white
  let dP = 0 // dual painted
  let tP = 0 // triple painted

  windows.forEach((w) => {
    const q = Math.max(1, Number(w.qty) || 1)
    const isTriple =
      Number(w.triple) > 0 ||
      (typeof w.triple === "string" &&
        w.triple.trim() !== "" &&
        Number(w.triple) > 0)
    const isPainted = w.color && String(w.color).toLowerCase() === "painted"

    if (isPainted) {
      if (isTriple) tP += q
      else dP += q
    } else {
      if (isTriple) tW += q
      else dW += q
    }
  })

  const totalQty = dW + tW + dP + tP
  if (totalQty === 0) return "0 Windows"

  let paintedPart = ""
  if (dP > 0 && tP > 0) {
    paintedPart = `${dP} dual & ${tP} triple pane painted`
  } else if (dP > 0) {
    paintedPart = `${dP} dual pane painted`
  } else if (tP > 0) {
    paintedPart = `${tP} triple pane painted`
  }

  let whitePart = ""
  if (dW > 0 && tW > 0) {
    whitePart = `${dW} dual & ${tW} triple pane white`
  } else if (dW > 0) {
    whitePart = `${dW} dual pane white`
  } else if (tW > 0) {
    whitePart = `${tW} triple pane white`
  }

  const plural = totalQty > 1 ? "windows" : "window"

  if (paintedPart && whitePart) {
    const separator =
      paintedPart.includes("&") || whitePart.includes("&") ? ", " : " and "
    return `${paintedPart}${separator}${whitePart} ${plural}`
  } else if (paintedPart) {
    return `${paintedPart} ${plural}`
  } else if (whitePart) {
    return `${whitePart} ${plural}`
  }

  return `${totalQty} ${plural}`
}

