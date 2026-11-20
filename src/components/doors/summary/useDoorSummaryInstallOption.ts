"use client"

import { useState, useEffect, useMemo } from "react"
import { DoorLineItem, DoorQuoteTotals, DoorQuotingMode } from "@/lib/doors/types"
import {
  readSessionAttachedInstallOption,
  writeSessionAttachedInstallOption,
  readSessionDoorHardwareConfig,
  ATTACHED_INSTALL_CHANGE_EVENT,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export function useDoorSummaryInstallOption(p: {
  mode: DoorQuotingMode
  quoteNumber?: string
  lineItems: DoorLineItem[]
  totals: DoorQuoteTotals
  compareLabour: number
  compareMisc: number
}) {
  const { mode, quoteNumber, lineItems, totals, compareLabour, compareMisc } = p
  const [attachedInstallOption, setAttachedInstallOption] = useState<{
    enabled: boolean
    amountPreTaxCents: number
    title?: string
    hasSupplyJC?: boolean
    hardwareConfig?: any
    hardwareTotal?: number
    hardwareBreakdown?: any[]
  } | null>(null)

  useEffect(() => {
    const sync = () => setAttachedInstallOption(readSessionAttachedInstallOption())
    sync()
    window.addEventListener(ATTACHED_INSTALL_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(ATTACHED_INSTALL_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [mode, quoteNumber])

  const supplyHardwareDollars = useMemo(() => {
    return lineItems.reduce((acc, item) => {
      if (item.category === "storm") return acc
      const q = item.quantity || 1
      const price =
        mode === "supply_only"
          ? item.lineHardwareTotal || 0
          : item.supplyHardwareType && item.supplyHardwareType !== "none"
            ? (item.supplyHardwarePrice || 0) * q
            : 0
      return acc + price
    }, 0)
  }, [lineItems, mode])

  const installHardwareDollars = useMemo(() => {
    if (attachedInstallOption?.hardwareTotal !== undefined) {
      return Number(attachedInstallOption.hardwareTotal) || 0
    }
    const saved = readSessionDoorHardwareConfig()
    if (saved?.totalPrice !== undefined) {
      return Number(saved.totalPrice) || 0
    }
    if (mode === "installation") {
      return totals.hardwareTotal || 0
    }
    const nonStormCount = lineItems.reduce(
      (acc, it) => acc + (it.category === "storm" ? 0 : it.quantity || 1),
      0
    )
    return Math.round(nonStormCount * 158.0 * 100) / 100
  }, [attachedInstallOption, mode, totals.hardwareTotal, lineItems])

  const dynamicInstallDeltaDollars = useMemo(() => {
    const netHardware = Math.max(0, installHardwareDollars - supplyHardwareDollars)
    return Math.round((compareLabour + compareMisc + netHardware) * 100) / 100
  }, [compareLabour, compareMisc, installHardwareDollars, supplyHardwareDollars])

  useEffect(() => {
    if (attachedInstallOption?.enabled && dynamicInstallDeltaDollars > 0) {
      const current = readSessionAttachedInstallOption()
      const newCents = Math.round(dynamicInstallDeltaDollars * 100)
      if (current?.enabled && current.amountPreTaxCents !== newCents) {
        const updated = { ...current, amountPreTaxCents: newCents }
        writeSessionAttachedInstallOption(updated)
        setAttachedInstallOption(updated)
      }
    }
  }, [dynamicInstallDeltaDollars, attachedInstallOption?.enabled])

  return {
    attachedInstallOption,
    setAttachedInstallOption,
    dynamicInstallDeltaDollars,
  }
}
