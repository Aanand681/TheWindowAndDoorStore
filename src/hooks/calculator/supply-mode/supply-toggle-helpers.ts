"use client"

import {
  readSessionSupplyState,
  readSessionInstallState,
} from "./supply-session-storage"

export function hasSupplyLooseJC(taxTotals: any): boolean {
  if (!taxTotals?.isSupplyOnly) return true
  return Boolean(
    (taxTotals?.selectedJamb &&
      taxTotals.selectedJamb.id !== "none" &&
      Number(taxTotals.selectedJamb.total || taxTotals.selectedJamb.rate || 0) >
        0) ||
    (taxTotals?.selectedCasing &&
      taxTotals.selectedCasing.id !== "none" &&
      Number(
        taxTotals.selectedCasing.total || taxTotals.selectedCasing.rate || 0
      ) > 0) ||
    (taxTotals?.jcLabourCents && taxTotals.jcLabourCents > 0)
  )
}

export function buildDefaultSupplyTaxState(
  current: any,
  targetJambId: string,
  targetCasingId: string
) {
  return {
    ...current,
    isSupplyOnly: true,
    isServiceOnly: false,
    standardLabourCents: 0,
    miscLabourCents: 0,
    finalLabour: 0,
    finalMisc: 0,
    jc: 0,
    finalJC: 0,
    jcLabourCents: 0,
    selectedJamb: null,
    selectedCasing: null,
    jambId: targetJambId,
    casingId: targetCasingId,
    jambRate: 0,
    casingRate: 0,
    jambTot: 0,
    casingTot: 0,
  }
}

export function buildInstallTaxState(
  current: any,
  snapshot: any,
  defaultJamb: string,
  defaultCasing: string
) {
  if (snapshot) {
    return {
      ...snapshot,
      isSupplyOnly: false,
      isServiceOnly: false,
      jambId: snapshot.jambId || defaultJamb,
      casingId: snapshot.casingId || defaultCasing,
    }
  }

  return {
    ...current,
    isSupplyOnly: false,
    isServiceOnly: false,
    jambId: defaultJamb,
    casingId: defaultCasing,
    standardLabourCents: current.standardLabourCents ?? 0,
    miscLabourCents: current.miscLabourCents ?? 0,
    finalLabour: current.finalLabour ?? 0,
    finalMisc: current.finalMisc ?? 0,
    jc: current.jc ?? 0,
    finalJC: current.finalJC ?? 0,
    jcLabourCents: current.jcLabourCents ?? 0,
    selectedJamb: current.selectedJamb ?? null,
    selectedCasing: current.selectedCasing ?? null,
    jambRate: current.jambRate ?? 0,
    casingRate: current.casingRate ?? 0,
    jambTot: current.jambTot ?? 0,
    casingTot: current.casingTot ?? 0,
  }
}

export function swapCustomPricesForSupply(
  refs: any,
  currentCustomJC?: string,
  currentCustomLabour?: string,
  currentCustomMisc?: string,
  currentTaxTotals?: any,
  setCustomJC?: (val: string) => void,
  setCustomLabour?: (val: string) => void,
  setCustomMisc?: (val: string) => void
) {
  refs.lastInstallCustomJCRef.current = currentCustomJC || ""
  if (currentCustomLabour)
    refs.lastInstallCustomLabourRef.current = currentCustomLabour
  if (currentCustomMisc)
    refs.lastInstallCustomMiscRef.current = currentCustomMisc

  const snap = refs.lastInstallSnapshotRef.current || currentTaxTotals || {}
  const jc =
    currentCustomJC !== "" && currentCustomJC !== undefined
      ? Math.round(parseFloat(currentCustomJC) * 100) / 100
      : Number(
          snap.finalJC ??
            (snap.jcLabourCents ? snap.jcLabourCents / 100 : (snap.jc ?? 0))
        )
  const labour =
    currentCustomLabour !== "" && currentCustomLabour !== undefined
      ? Math.round(parseFloat(currentCustomLabour) * 100) / 100
      : Number(
          snap.finalLabour ??
            (snap.standardLabourCents
              ? snap.standardLabourCents / 100
              : (snap.labourWindows ?? 0))
        )
  const misc =
    currentCustomMisc !== "" && currentCustomMisc !== undefined
      ? Math.round(parseFloat(currentCustomMisc) * 100) / 100
      : Number(
          snap.finalMisc ??
            (snap.miscLabourCents ? snap.miscLabourCents / 100 : 0)
        )

  if (jc > 0) refs.lastInstallJCAmountRef.current = jc
  if (labour > 0) refs.lastInstallLabourAmountRef.current = labour
  if (misc > 0) refs.lastInstallMiscAmountRef.current = misc

  if (refs.syncInstallToSession) refs.syncInstallToSession()

  const targetSupplyJC = refs.lastSupplyCustomJCRef.current || ""
  if (setCustomJC) setCustomJC(targetSupplyJC)
  if (setCustomLabour) setCustomLabour("")
  if (setCustomMisc) setCustomMisc("")
}

export function swapCustomPricesForInstall(
  refs: any,
  currentCustomJC?: string,
  setCustomJC?: (val: string) => void,
  setCustomLabour?: (val: string) => void,
  setCustomMisc?: (val: string) => void
) {
  refs.lastSupplyCustomJCRef.current = currentCustomJC || ""
  if (refs.syncSupplyToSession) refs.syncSupplyToSession()

  const targetInstallJC = refs.lastInstallCustomJCRef.current || ""
  const targetInstallLabour = refs.lastInstallCustomLabourRef.current || ""
  const targetInstallMisc = refs.lastInstallCustomMiscRef.current || ""

  if (setCustomJC) setCustomJC(targetInstallJC)
  if (setCustomLabour) setCustomLabour(targetInstallLabour)
  if (setCustomMisc) setCustomMisc(targetInstallMisc)
}

export function syncTaxTotalsToSupplyRefs(
  taxTotals: any,
  refs: any,
  setAttachedUpgrade: (upgrade: any) => void
) {
  if (!taxTotals?.isSupplyOnly) return
  if (taxTotals.selectedJamb) {
    const jId = taxTotals.selectedJamb.id || "none"
    if (refs.supplyJambId !== jId) {
      refs.lastSupplyJambIdRef.current = jId
      refs.setSupplyJambIdState(jId)
    }
    if (taxTotals.selectedJamb.id === "custom") {
      const jName = taxTotals.selectedJamb.name || ""
      const jRate = String(taxTotals.selectedJamb.rate || "")
      if (refs.supplyJambName !== jName) {
        refs.lastSupplyJambNameRef.current = jName
        refs.setSupplyJambNameState(jName)
      }
      if (refs.supplyJambRate !== jRate) {
        refs.lastSupplyJambRateRef.current = jRate
        refs.setSupplyJambRateState(jRate)
      }
    }
  }
  if (taxTotals.selectedCasing) {
    const cId = taxTotals.selectedCasing.id || "none"
    if (refs.supplyCasingId !== cId) {
      refs.lastSupplyCasingIdRef.current = cId
      refs.setSupplyCasingIdState(cId)
    }
    if (taxTotals.selectedCasing.id === "custom") {
      const cName = taxTotals.selectedCasing.name || ""
      const cRate = String(taxTotals.selectedCasing.rate || "")
      if (refs.supplyCasingName !== cName) {
        refs.lastSupplyCasingNameRef.current = cName
        refs.setSupplyCasingNameState(cName)
      }
      if (refs.supplyCasingRate !== cRate) {
        refs.lastSupplyCasingRateRef.current = cRate
        refs.setSupplyCasingRateState(cRate)
      }
    }
  }
  if (taxTotals.attachedUpgrade && setAttachedUpgrade) {
    setAttachedUpgrade(taxTotals.attachedUpgrade)
  }
}
