import { useState, useEffect, useCallback } from "react"
import {
  buildDefaultSupplyTaxState,
  buildInstallTaxState,
  swapCustomPricesForSupply,
  swapCustomPricesForInstall,
  syncTaxTotalsToSupplyRefs,
} from "./supply-mode/supply-toggle-helpers"
import { useSupplyStateRefs } from "./supply-mode/useSupplyStateRefs"

export interface UseCalculatorSupplyModeProps {
  taxTotals: any
  setTaxTotals: React.Dispatch<React.SetStateAction<any>>
  setCustomJC: (val: string) => void
  setHstRate: (rate: number) => void
  setAttachedUpgrade: (upgrade: any) => void
  customJC?: string
  setCustomLabour?: (val: string) => void
  customLabour?: string
  setCustomMisc?: (val: string) => void
  customMisc?: string
}

export function useCalculatorSupplyMode({
  taxTotals,
  setTaxTotals,
  setCustomJC,
  setHstRate,
  setAttachedUpgrade,
  customJC = "",
  setCustomLabour,
  customLabour = "",
  setCustomMisc,
  customMisc = "",
}: UseCalculatorSupplyModeProps) {
  const [isSupplyOnly, setIsSupplyOnly] = useState<boolean>(false)
  const [isServiceOnly, setIsServiceOnly] = useState<boolean>(false)

  const refs = useSupplyStateRefs()
  const {
    supplyJambId,
    setSupplyJambId,
    setSupplyJambIdState,
    supplyJambName,
    setSupplyJambName,
    setSupplyJambNameState,
    supplyJambRate,
    setSupplyJambRate,
    setSupplyJambRateState,
    supplyCasingId,
    setSupplyCasingId,
    setSupplyCasingIdState,
    supplyCasingName,
    setSupplyCasingName,
    setSupplyCasingNameState,
    supplyCasingRate,
    setSupplyCasingRate,
    setSupplyCasingRateState,
    lastInstallJambRef,
    lastInstallCasingRef,
    lastInstallSnapshotRef,
    lastSupplyJambIdRef,
    lastSupplyCasingIdRef,
    lastSupplySnapshotRef,
    lastSupplyCustomJCRef,
    resetAllSupplyRefs,
  } = refs

  const handleToggleSupplyOnly = useCallback(
    (isSupply: boolean) => {
      if (isSupplyOnly === isSupply) return
      setIsSupplyOnly(isSupply)
      if (isSupply) {
        setIsServiceOnly(false)
        swapCustomPricesForSupply(
          refs,
          customJC,
          customLabour,
          customMisc,
          taxTotals,
          setCustomJC,
          setCustomLabour,
          setCustomMisc
        )

        const targetJambId =
          lastSupplyJambIdRef.current !== "none"
            ? lastSupplyJambIdRef.current
            : "none"
        const targetCasingId =
          lastSupplyCasingIdRef.current !== "none"
            ? lastSupplyCasingIdRef.current
            : "none"

        setSupplyJambIdState(targetJambId)
        setSupplyJambNameState(refs.lastSupplyJambNameRef.current || "")
        setSupplyJambRateState(refs.lastSupplyJambRateRef.current || "")
        setSupplyCasingIdState(targetCasingId)
        setSupplyCasingNameState(refs.lastSupplyCasingNameRef.current || "")
        setSupplyCasingRateState(refs.lastSupplyCasingRateRef.current || "")

        setTaxTotals((prev: any) => {
          const current = prev || {}
          if (!current.isSupplyOnly) {
            lastInstallSnapshotRef.current = current
            if (
              current.selectedJamb?.id &&
              current.selectedJamb.id !== "none"
            ) {
              lastInstallJambRef.current = current.selectedJamb.id
            } else if (current.jambId && current.jambId !== "none") {
              lastInstallJambRef.current = current.jambId
            }
            if (
              current.selectedCasing?.id &&
              current.selectedCasing.id !== "none"
            ) {
              lastInstallCasingRef.current = current.selectedCasing.id
            } else if (current.casingId && current.casingId !== "none") {
              lastInstallCasingRef.current = current.casingId
            }
          }

          if (lastSupplySnapshotRef.current) {
            return {
              ...lastSupplySnapshotRef.current,
              isSupplyOnly: true,
              isServiceOnly: false,
            }
          }
          return buildDefaultSupplyTaxState(
            current,
            targetJambId,
            targetCasingId
          )
        })
      } else {
        swapCustomPricesForInstall(
          refs,
          customJC,
          setCustomJC,
          setCustomLabour,
          setCustomMisc
        )

        setTaxTotals((prev: any) => {
          const current = prev || {}
          if (current.isSupplyOnly) lastSupplySnapshotRef.current = current
          return buildInstallTaxState(
            current,
            lastInstallSnapshotRef.current,
            lastInstallJambRef.current || "j3",
            lastInstallCasingRef.current || "vinyl"
          )
        })
      }
    },
    [
      customJC,
      customLabour,
      customMisc,
      lastInstallCasingRef,
      lastInstallJambRef,
      lastInstallSnapshotRef,
      lastSupplyCasingIdRef,
      lastSupplyJambIdRef,
      lastSupplySnapshotRef,
      refs,
      setCustomJC,
      setCustomLabour,
      setCustomMisc,
      setSupplyCasingIdState,
      setSupplyCasingNameState,
      setSupplyCasingRateState,
      setSupplyJambIdState,
      setSupplyJambNameState,
      setSupplyJambRateState,
      setTaxTotals,
      isSupplyOnly,
    ]
  )

  const handleModeChange = useCallback(
    (mode: "installation" | "supply_only" | "service_only") => {
      if (mode === "supply_only") {
        handleToggleSupplyOnly(true)
      } else if (mode === "service_only") {
        setIsSupplyOnly(false)
        setIsServiceOnly(true)
        setHstRate(13)
        setTaxTotals((prev: any) => {
          if (!prev)
            return {
              isSupplyOnly: false,
              isServiceOnly: true,
              jc: 0,
              finalJC: 0,
            }
          return { ...prev, isSupplyOnly: false, isServiceOnly: true }
        })
      } else {
        setIsServiceOnly(false)
        handleToggleSupplyOnly(false)
      }
    },
    [handleToggleSupplyOnly, setHstRate, setTaxTotals]
  )

  const handleSupplyJCCalculated = useCallback(
    (data: {
      linearFeet: number
      jambTotCents: number
      casingTotCents: number
      jcTotalCents: number
      selectedJamb: any
      selectedCasing: any
      customMaterials?: any[]
      customMaterialsTotalCents?: number
    }) => {
      if (!isSupplyOnly) return
      setTaxTotals((prev: any) => {
        const matCents = data.customMaterialsTotalCents || 0
        if (
          prev?.isSupplyOnly &&
          prev?.jcLabourCents === data.jcTotalCents &&
          prev?.ln === data.linearFeet &&
          prev?.selectedJamb?.id === data.selectedJamb?.id &&
          prev?.selectedCasing?.id === data.selectedCasing?.id &&
          prev?.customMaterialsCents === matCents &&
          JSON.stringify(prev?.customMaterials) ===
            JSON.stringify(data.customMaterials)
        ) {
          return prev
        }
        const updated = {
          ...prev,
          isSupplyOnly: true,
          standardLabourCents: 0,
          miscLabourCents: 0,
          finalLabour: 0,
          finalMisc: 0,
          ln: data.linearFeet,
          jc: data.jcTotalCents / 100,
          finalJC: data.jcTotalCents / 100,
          jcLabourCents: data.jcTotalCents,
          selectedJamb: data.selectedJamb,
          selectedCasing: data.selectedCasing,
          customMaterials: data.customMaterials || [],
          customMaterialsTotal: matCents / 100,
          customMaterialsCents: matCents,
        }
        lastSupplySnapshotRef.current = updated
        return updated
      })
    },
    [isSupplyOnly, lastSupplySnapshotRef, setTaxTotals]
  )

  useEffect(() => {
    if (taxTotals?._quoteId && taxTotals?.isSupplyOnly) {
      syncTaxTotalsToSupplyRefs(taxTotals, refs, setAttachedUpgrade)
    }
  }, [taxTotals?._quoteId])

  const resetSupplyMode = useCallback(() => {
    setIsSupplyOnly(false)
    setIsServiceOnly(false)
    resetAllSupplyRefs()
  }, [resetAllSupplyRefs])

  return {
    isSupplyOnly,
    setIsSupplyOnly,
    isServiceOnly,
    setIsServiceOnly,
    supplyJambId,
    setSupplyJambId,
    supplyJambName,
    setSupplyJambName,
    supplyJambRate,
    setSupplyJambRate,
    supplyCasingId,
    setSupplyCasingId,
    supplyCasingName,
    setSupplyCasingName,
    supplyCasingRate,
    setSupplyCasingRate,
    handleToggleSupplyOnly,
    handleModeChange,
    handleSupplyJCCalculated,
    resetSupplyMode,
  }
}
