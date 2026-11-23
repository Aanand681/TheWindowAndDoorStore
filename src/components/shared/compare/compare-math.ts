export interface CalculateCompareOptionsParams {
  currentMode: "supply" | "install"
  currentSubtotal?: number
  baseAmount: number
  attachedAmount?: number
  surchargeAmount?: number
  discountAmount?: number
  // Pure dollar amounts
  supplyHardware?: number
  installHardware?: number
  opt1JC?: number
  opt2JC?: number
  labourAmount?: number
  miscAmount?: number
  // Optional backward-compatibility cents fields
  supplyHardwareCents?: number
  installHardwareCents?: number
  opt1JCCents?: number
  opt2JCCents?: number
  labourCents?: number
  miscCents?: number
  hstRate: number
}

export function computeTaxDollars(subtotal: number, hstRate: number): number {
  if (hstRate === 13) return Math.round(subtotal * 0.13 * 100) / 100
  if (hstRate === 8 || hstRate === 5) return Math.round(subtotal * 0.05 * 100) / 100
  if (hstRate === 0) return 0
  return Math.round(subtotal * (hstRate / 100) * 100) / 100
}

export function computeTaxCents(subCents: number, hstRate: number): number {
  if (hstRate === 13) return Math.round(subCents * 0.13)
  if (hstRate === 8 || hstRate === 5) return Math.round(subCents * 0.05)
  if (hstRate === 0) return 0
  return Math.round((subCents * hstRate) / 100)
}

export function calculateCompareTotals(p: CalculateCompareOptionsParams) {
  const opt1JC = p.opt1JC ?? (p.opt1JCCents !== undefined ? p.opt1JCCents / 100 : 0)
  const opt2JC = p.opt2JC ?? (p.opt2JCCents !== undefined ? p.opt2JCCents / 100 : 0)
  const supplyHardware = p.supplyHardware ?? (p.supplyHardwareCents !== undefined ? p.supplyHardwareCents / 100 : 0)
  const installHardware = p.installHardware ?? (p.installHardwareCents !== undefined ? p.installHardwareCents / 100 : 0)
  const labourAmount = p.labourAmount ?? (p.labourCents !== undefined ? p.labourCents / 100 : 0)
  const miscAmount = p.miscAmount ?? (p.miscCents !== undefined ? p.miscCents / 100 : 0)
  const attachedAmount = p.attachedAmount ?? 0
  const surchargeAmount = p.surchargeAmount ?? 0
  const discountAmount = p.discountAmount ?? 0

  const jcDiff = Math.max(0, opt2JC - opt1JC)
  const hardwareDelta = Math.max(0, installHardware - supplyHardware)
  const totalInstallAdd = Math.round((labourAmount + miscAmount + jcDiff + hardwareDelta) * 100) / 100

  let supplySubtotal = 0
  let installSubtotal = 0

  if (p.currentSubtotal !== undefined && p.currentSubtotal > 0) {
    if (p.currentMode === "install") {
      installSubtotal = p.currentSubtotal
      supplySubtotal = Math.max(0, Math.round((installSubtotal - totalInstallAdd) * 100) / 100)
    } else {
      supplySubtotal = p.currentSubtotal
      installSubtotal = Math.round((supplySubtotal + totalInstallAdd) * 100) / 100
    }
  } else {
    supplySubtotal = Math.max(
      0,
      Math.round(
        (p.baseAmount + opt1JC + attachedAmount + surchargeAmount + supplyHardware - discountAmount) * 100
      ) / 100
    )
    installSubtotal = Math.max(
      0,
      Math.round(
        (p.baseAmount + opt2JC + attachedAmount + surchargeAmount + installHardware - discountAmount + labourAmount + miscAmount) * 100
      ) / 100
    )
  }

  const supplyHst = computeTaxDollars(supplySubtotal, p.hstRate)
  const supplyTotal = Math.round((supplySubtotal + supplyHst) * 100) / 100
  const supplyFirstPayment = Math.round(supplyTotal * 0.5 * 100) / 100
  const supplySecondPayment = Math.round((supplyTotal - supplyFirstPayment) * 100) / 100

  const installHst = computeTaxDollars(installSubtotal, p.hstRate)
  const installTotal = Math.round((installSubtotal + installHst) * 100) / 100
  const installFirstPayment = Math.round(installTotal * 0.5 * 100) / 100
  const installSecondPayment = Math.round((installTotal - installFirstPayment) * 100) / 100

  const extraSubtotal = Math.max(0, Math.round((installSubtotal - supplySubtotal) * 100) / 100)
  const extraTotal = Math.max(0, Math.round((installTotal - supplyTotal) * 100) / 100)

  return {
    supplySubtotal,
    supplyHst,
    supplyTotal,
    supplyFirstPayment,
    supplySecondPayment,

    installSubtotal,
    installHst,
    installTotal,
    installFirstPayment,
    installSecondPayment,

    extraPriceSubtotal: extraSubtotal,
    extraPriceTotalWithTax: extraTotal,
    extraSubtotal,
    extraTotal,
    // Backward compatibility for cents
    extraSubtotalCents: Math.round(extraSubtotal * 100),
    extraTotalCents: Math.round(extraTotal * 100),
  }
}

