"use client"

import { UIWindowItem } from "@/hooks/useCalculatorWindows"

export interface CalculatorSnapshotA {
  windows: UIWindowItem[]
  surchargeRate: number
  isSupplyOnly: boolean
  supplyJambId: string
  supplyJambName: string
  supplyJambRate: string
  supplyCasingId: string
  supplyCasingName: string
  supplyCasingRate: string
  taxTotals: any
  customJC: string
  customMisc: string
  customLabour: string
  activePromoId: string
  hstRate: number
  customerName: string
  quoteNumber: string
  quoteResult: any
  afterDiscount: number
  total: number
  firstPayment: number
  secondPayment: number
}

export interface ComparisonOverrides {
  jambId?: string
  jambRate?: string
  casingId?: string
  casingRate?: string
  extraLabour?: string
}

export function captureCalculatorSnapshot(params: {
  windows: UIWindowItem[]
  surchargeRate: number
  isSupplyOnly: boolean
  supplyJambId: string
  supplyJambName: string
  supplyJambRate: string
  supplyCasingId: string
  supplyCasingName: string
  supplyCasingRate: string
  taxTotals: any
  customJC: string
  customMisc: string
  customLabour: string
  activePromoId: string
  hstRate: number
  customerName: string
  quoteNumber: string
  quoteResult: any
  afterDiscount: number
  total: number
  firstPayment: number
  secondPayment: number
}): CalculatorSnapshotA {
  const {
    isSupplyOnly,
    supplyJambId,
    supplyJambName,
    supplyJambRate,
    supplyCasingId,
    supplyCasingName,
    supplyCasingRate,
    taxTotals,
    windows,
    surchargeRate,
    customJC,
    customMisc,
    customLabour,
    activePromoId,
    hstRate,
    customerName,
    quoteNumber,
    quoteResult,
    afterDiscount,
    total,
    firstPayment,
    secondPayment,
  } = params

  const activeJId = isSupplyOnly
    ? supplyJambId
    : taxTotals?.selectedJamb?.id || taxTotals?.jambId || "none"
  const activeJName = isSupplyOnly
    ? supplyJambName
    : taxTotals?.selectedJamb?.name || taxTotals?.jambName || ""
  const activeJRate = isSupplyOnly
    ? supplyJambRate
    : String(taxTotals?.selectedJamb?.rate || taxTotals?.jambRate || "")
  const activeCId = isSupplyOnly
    ? supplyCasingId
    : taxTotals?.selectedCasing?.id || taxTotals?.casingId || "none"
  const activeCName = isSupplyOnly
    ? supplyCasingName
    : taxTotals?.selectedCasing?.name || taxTotals?.casingName || ""
  const activeCRate = isSupplyOnly
    ? supplyCasingRate
    : String(taxTotals?.selectedCasing?.rate || taxTotals?.casingRate || "")

  return {
    windows: [...windows],
    surchargeRate,
    isSupplyOnly,
    supplyJambId: activeJId,
    supplyJambName: activeJName,
    supplyJambRate: activeJRate,
    supplyCasingId: activeCId,
    supplyCasingName: activeCName,
    supplyCasingRate: activeCRate,
    taxTotals: taxTotals ? JSON.parse(JSON.stringify(taxTotals)) : null,
    customJC,
    customMisc,
    customLabour,
    activePromoId,
    hstRate,
    customerName,
    quoteNumber,
    quoteResult,
    afterDiscount,
    total,
    firstPayment,
    secondPayment,
  }
}

export function restoreCalculatorSnapshot(
  snapshot: CalculatorSnapshotA,
  setters: {
    setWindows: (windows: UIWindowItem[]) => void
    setSurchargeRate: (rate: number) => void
    setIsSupplyOnly: (val: boolean) => void
    setSupplyJambId: (val: string) => void
    setSupplyJambName: (val: string) => void
    setSupplyJambRate: (val: string) => void
    setSupplyCasingId: (val: string) => void
    setSupplyCasingName: (val: string) => void
    setSupplyCasingRate: (val: string) => void
    setTaxTotals: (val: any) => void
    setCustomJC: (val: string) => void
    setCustomMisc: (val: string) => void
    setCustomLabour: (val: string) => void
    setActivePromoId: (id: string) => void
    setHstRate: (rate: number) => void
    setCustomerName: (name: string) => void
    setQuoteNumber: (num: string) => void
  }
) {
  setters.setWindows(snapshot.windows)
  setters.setSurchargeRate(snapshot.surchargeRate)
  setters.setIsSupplyOnly(snapshot.isSupplyOnly)
  setters.setSupplyJambId(snapshot.supplyJambId)
  setters.setSupplyJambName(snapshot.supplyJambName)
  setters.setSupplyJambRate(snapshot.supplyJambRate)
  setters.setSupplyCasingId(snapshot.supplyCasingId)
  setters.setSupplyCasingName(snapshot.supplyCasingName)
  setters.setSupplyCasingRate(snapshot.supplyCasingRate)
  setters.setTaxTotals(snapshot.taxTotals)
  setters.setCustomJC(snapshot.customJC)
  setters.setCustomMisc(snapshot.customMisc)
  setters.setCustomLabour(snapshot.customLabour)
  setters.setActivePromoId(snapshot.activePromoId)
  setters.setHstRate(snapshot.hstRate)
  setters.setCustomerName(snapshot.customerName)
  setters.setQuoteNumber(snapshot.quoteNumber)
}

export function applyComparisonOverrides(
  overrides: ComparisonOverrides,
  customLabour: string,
  setters: {
    setSupplyJambId: (val: string) => void
    setSupplyJambRate: (val: string) => void
    setSupplyCasingId: (val: string) => void
    setSupplyCasingRate: (val: string) => void
    setCustomLabour: (val: string) => void
  }
) {
  if (overrides.jambId && overrides.jambId !== "inherit") {
    setters.setSupplyJambId(overrides.jambId)
    if (overrides.jambRate) setters.setSupplyJambRate(overrides.jambRate)
  }
  if (overrides.casingId && overrides.casingId !== "inherit") {
    setters.setSupplyCasingId(overrides.casingId)
    if (overrides.casingRate) setters.setSupplyCasingRate(overrides.casingRate)
  }
  if (overrides.extraLabour && Number(overrides.extraLabour) > 0) {
    setters.setCustomLabour(
      String(Number(customLabour || 0) + Number(overrides.extraLabour))
    )
  }
}
