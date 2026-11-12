import { useState, useRef, useCallback, useMemo } from "react"
import {
  writeSessionSupplyState,
  writeSessionInstallState,
  readSessionInstallState,
} from "./supply-session-storage"

export function useSupplyStateRefs() {
  const [supplyJambId, setSupplyJambIdState] = useState<string>("none")
  const [supplyJambName, setSupplyJambNameState] = useState<string>("")
  const [supplyJambRate, setSupplyJambRateState] = useState<string>("")
  const [supplyCasingId, setSupplyCasingIdState] = useState<string>("none")
  const [supplyCasingName, setSupplyCasingNameState] = useState<string>("")
  const [supplyCasingRate, setSupplyCasingRateState] = useState<string>("")

  const lastInstallJambRef = useRef<string>("j3")
  const lastInstallCasingRef = useRef<string>("vinyl")
  const lastInstallSnapshotRef = useRef<any>(null)
  const lastInstallCustomJCRef = useRef<string>("")
  const lastInstallCustomLabourRef = useRef<string>("")
  const lastInstallCustomMiscRef = useRef<string>("")
  const lastInstallJCAmountRef = useRef<number>(0)
  const lastInstallLabourAmountRef = useRef<number>(0)
  const lastInstallMiscAmountRef = useRef<number>(0)

  const lastSupplyJambIdRef = useRef<string>("none")
  const lastSupplyJambNameRef = useRef<string>("")
  const lastSupplyJambRateRef = useRef<string>("")
  const lastSupplyCasingIdRef = useRef<string>("none")
  const lastSupplyCasingNameRef = useRef<string>("")
  const lastSupplyCasingRateRef = useRef<string>("")
  const lastSupplySnapshotRef = useRef<any>(null)
  const lastSupplyCustomJCRef = useRef<string>("")

  const syncSupplyToSession = useCallback(() => {
    writeSessionSupplyState({
      jambId: lastSupplyJambIdRef.current,
      jambName: lastSupplyJambNameRef.current,
      jambRate: lastSupplyJambRateRef.current,
      casingId: lastSupplyCasingIdRef.current,
      casingName: lastSupplyCasingNameRef.current,
      casingRate: lastSupplyCasingRateRef.current,
      customJC: lastSupplyCustomJCRef.current,
    })
  }, [])

  const syncInstallToSession = useCallback(() => {
    writeSessionInstallState({
      customJC: lastInstallCustomJCRef.current,
      customLabour: lastInstallCustomLabourRef.current,
      customMisc: lastInstallCustomMiscRef.current,
      installJCAmount: lastInstallJCAmountRef.current,
      installLabourAmount: lastInstallLabourAmountRef.current,
      installMiscAmount: lastInstallMiscAmountRef.current,
    })
  }, [])

  const resetAllSupplyRefs = useCallback(() => {
    setSupplyJambIdState("none")
    setSupplyJambNameState("")
    setSupplyJambRateState("")
    setSupplyCasingIdState("none")
    setSupplyCasingNameState("")
    setSupplyCasingRateState("")
    lastInstallJambRef.current = "j3"
    lastInstallCasingRef.current = "vinyl"
    lastInstallSnapshotRef.current = null
    lastInstallJCAmountRef.current = 0
    lastInstallLabourAmountRef.current = 0
    lastInstallMiscAmountRef.current = 0
    lastSupplyJambIdRef.current = "none"
    lastSupplyJambNameRef.current = ""
    lastSupplyJambRateRef.current = ""
    lastSupplyCasingIdRef.current = "none"
    lastSupplyCasingNameRef.current = ""
    lastSupplyCasingRateRef.current = ""
    lastSupplySnapshotRef.current = null
    lastSupplyCustomJCRef.current = ""
    writeSessionSupplyState(null)
    writeSessionInstallState(null)
  }, [])

  const setSupplyJambId = useCallback(
    (id: string) => {
      setSupplyJambIdState(id)
      lastSupplyJambIdRef.current = id
      syncSupplyToSession()
    },
    [syncSupplyToSession]
  )

  const setSupplyJambName = useCallback(
    (name: string) => {
      setSupplyJambNameState(name)
      lastSupplyJambNameRef.current = name
      syncSupplyToSession()
    },
    [syncSupplyToSession]
  )

  const setSupplyJambRate = useCallback(
    (rate: string) => {
      setSupplyJambRateState(rate)
      lastSupplyJambRateRef.current = rate
      syncSupplyToSession()
    },
    [syncSupplyToSession]
  )

  const setSupplyCasingId = useCallback(
    (id: string) => {
      setSupplyCasingIdState(id)
      lastSupplyCasingIdRef.current = id
      syncSupplyToSession()
    },
    [syncSupplyToSession]
  )

  const setSupplyCasingName = useCallback(
    (name: string) => {
      setSupplyCasingNameState(name)
      lastSupplyCasingNameRef.current = name
      syncSupplyToSession()
    },
    [syncSupplyToSession]
  )

  const setSupplyCasingRate = useCallback(
    (rate: string) => {
      setSupplyCasingRateState(rate)
      lastSupplyCasingRateRef.current = rate
      syncSupplyToSession()
    },
    [syncSupplyToSession]
  )

  return useMemo(
    () => ({
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
      lastInstallCustomJCRef,
      lastInstallCustomLabourRef,
      lastInstallCustomMiscRef,
      lastInstallJCAmountRef,
      lastInstallLabourAmountRef,
      lastInstallMiscAmountRef,
      lastSupplyJambIdRef,
      lastSupplyJambNameRef,
      lastSupplyJambRateRef,
      lastSupplyCasingIdRef,
      lastSupplyCasingNameRef,
      lastSupplyCasingRateRef,
      lastSupplySnapshotRef,
      lastSupplyCustomJCRef,
      syncSupplyToSession,
      syncInstallToSession,
      resetAllSupplyRefs,
    }),
    [
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
      syncSupplyToSession,
      syncInstallToSession,
      resetAllSupplyRefs,
    ]
  )
}
