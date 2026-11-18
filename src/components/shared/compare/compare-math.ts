export interface CalculateCompareOptionsParams {
  currentMode: "supply" | "install"
  currentSubtotal?: number
  baseAmount: number
  attachedAmount: number
  surchargeAmount: number
  discountAmount: number
  supplyHardwareCents: number
  installHardwareCents: number
  opt1JCCents: number
  opt2JCCents: number
  labourCents: number
  miscCents: number
  hstRate: number
}

export function computeTaxCents(subCents: number, hstRate: number): number {
  if (hstRate === 13) return Math.round(subCents * 0.13)
  if (hstRate === 8 || hstRate === 5) return Math.round(subCents * 0.05)
  if (hstRate === 0) return 0
  return Math.round((subCents * hstRate) / 100)
}

export function calculateCompareTotals(p: CalculateCompareOptionsParams) {
  const jcDiffCents = Math.max(0, p.opt2JCCents - p.opt1JCCents)
  const hardwareDeltaCents = Math.max(
    0,
    p.installHardwareCents - p.supplyHardwareCents
  )
  const totalInstallAddCents =
    p.labourCents + p.miscCents + jcDiffCents + hardwareDeltaCents

  let supplySubtotalCents = 0
  let installSubtotalCents = 0

  if (p.currentSubtotal !== undefined && p.currentSubtotal > 0) {
    const curCents = Math.round(p.currentSubtotal * 100)
    if (p.currentMode === "install") {
      installSubtotalCents = curCents
      supplySubtotalCents = Math.max(
        0,
        installSubtotalCents - totalInstallAddCents
      )
    } else {
      supplySubtotalCents = curCents
      installSubtotalCents = supplySubtotalCents + totalInstallAddCents
    }
  } else {
    const baseCents = Math.round(p.baseAmount * 100)
    const attachedCents = Math.round(p.attachedAmount * 100)
    const surchargeCents = Math.round(p.surchargeAmount * 100)
    const discountCents = Math.round(p.discountAmount * 100)

    supplySubtotalCents = Math.max(
      0,
      baseCents +
        p.opt1JCCents +
        attachedCents +
        surchargeCents +
        p.supplyHardwareCents -
        discountCents
    )

    installSubtotalCents = Math.max(
      0,
      baseCents +
        p.opt2JCCents +
        attachedCents +
        surchargeCents +
        p.installHardwareCents -
        discountCents +
        p.labourCents +
        p.miscCents
    )
  }

  const supplyHstCents = computeTaxCents(supplySubtotalCents, p.hstRate)
  const supplyTotalCents = supplySubtotalCents + supplyHstCents
  const supplyFirstPaymentCents = Math.floor(supplyTotalCents / 2)
  const supplySecondPaymentCents = supplyTotalCents - supplyFirstPaymentCents

  const installHstCents = computeTaxCents(installSubtotalCents, p.hstRate)
  const installTotalCents = installSubtotalCents + installHstCents
  const installFirstPaymentCents = Math.floor(installTotalCents / 2)
  const installSecondPaymentCents = installTotalCents - installFirstPaymentCents

  const extraSubtotalCents = Math.max(
    0,
    installSubtotalCents - supplySubtotalCents
  )
  const extraTotalCents = Math.max(
    0,
    installTotalCents - supplyTotalCents
  )

  return {
    supplySubtotal: supplySubtotalCents / 100,
    supplyHst: supplyHstCents / 100,
    supplyTotal: supplyTotalCents / 100,
    supplyFirstPayment: supplyFirstPaymentCents / 100,
    supplySecondPayment: supplySecondPaymentCents / 100,

    installSubtotal: installSubtotalCents / 100,
    installHst: installHstCents / 100,
    installTotal: installTotalCents / 100,
    installFirstPayment: installFirstPaymentCents / 100,
    installSecondPayment: installSecondPaymentCents / 100,

    extraSubtotalCents,
    extraPriceSubtotal: extraSubtotalCents / 100,
    extraPriceTotalWithTax: extraTotalCents / 100,
  }
}

