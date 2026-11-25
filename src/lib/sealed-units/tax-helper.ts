export interface SealedUnitTaxParams {
  hstRate: number
  subtotalPreTax: number
  isServiceOnly: boolean
  isInstallation: boolean
  glassSupplyTotal: number
  customMaterialsTotal: number
  combinedLabourTotal: number
  miscTotal: number
  extraLabourAmount: number
  loyaltyDiscountAmount: number
}

export interface SealedUnitTaxResult {
  hstAmount: number
  hstBase: number
  materialExemption: number
}

/**
 * Computes Ontario 0%, 13% HST, or 8% First Nation POS Material Exemption tax
 * for Sealed Units after applying any Loyalty / Custom discount.
 */
export function computeSealedUnitTax(p: SealedUnitTaxParams): SealedUnitTaxResult {
  const {
    hstRate,
    subtotalPreTax,
    isServiceOnly,
    isInstallation,
    glassSupplyTotal,
    customMaterialsTotal,
    combinedLabourTotal,
    miscTotal,
    extraLabourAmount,
    loyaltyDiscountAmount,
  } = p

  if (hstRate === 0) {
    return { hstAmount: 0, hstBase: 0, materialExemption: 0 }
  }

  if (hstRate === 13) {
    const hstBase = Math.round(subtotalPreTax * 0.13 * 100) / 100
    return { hstAmount: hstBase, hstBase, materialExemption: 0 }
  }

  if (hstRate === 8) {
    const rawMaterials = (isServiceOnly ? 0 : glassSupplyTotal) + customMaterialsTotal
    const rawServices =
      isInstallation || isServiceOnly
        ? combinedLabourTotal + miscTotal
        : extraLabourAmount > 0
          ? combinedLabourTotal
          : 0
    const discountOnMaterials = Math.min(rawMaterials, loyaltyDiscountAmount)
    const discountOnServices = Math.max(0, loyaltyDiscountAmount - rawMaterials)
    const materialAmount = Math.max(0, rawMaterials - discountOnMaterials)
    const serviceAmount = Math.max(0, rawServices - discountOnServices)

    const materialTax = Math.round(materialAmount * 0.05 * 100) / 100
    const serviceTax = Math.round(serviceAmount * 0.13 * 100) / 100
    const hstBase = Math.round(subtotalPreTax * 0.13 * 100) / 100
    const materialExemption = Math.round(materialAmount * 0.08 * 100) / 100
    return {
      hstAmount: Math.round((materialTax + serviceTax) * 100) / 100,
      hstBase,
      materialExemption,
    }
  }

  return { hstAmount: 0, hstBase: 0, materialExemption: 0 }
}
