"use client"

import { useState, useEffect, useMemo } from "react"
import {
  readSessionAttachedInstallOption,
  writeSessionAttachedInstallOption,
  ATTACHED_INSTALL_CHANGE_EVENT,
  CachedAttachedInstallOption,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export function useSealedUnitInstallOption(p: {
  mode: string
  quoteNumber?: string
  compareLabour: number
  compareMisc: number
}) {
  const { mode, quoteNumber, compareLabour, compareMisc } = p
  const [attachedInstallOption, setAttachedInstallOption] =
    useState<CachedAttachedInstallOption | null>(() =>
      readSessionAttachedInstallOption("sealed_unit")
    )

  useEffect(() => {
    const sync = () =>
      setAttachedInstallOption(readSessionAttachedInstallOption("sealed_unit"))
    sync()
    window.addEventListener(ATTACHED_INSTALL_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(ATTACHED_INSTALL_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [mode, quoteNumber])

  const dynamicInstallDeltaDollars = useMemo(() => {
    return Math.round((compareLabour + compareMisc) * 100) / 100
  }, [compareLabour, compareMisc])

  useEffect(() => {
    if (attachedInstallOption?.enabled && dynamicInstallDeltaDollars > 0) {
      const current = readSessionAttachedInstallOption("sealed_unit")
      const newCents = Math.round(dynamicInstallDeltaDollars * 100)
      if (current?.enabled && current.amountPreTaxCents !== newCents) {
        const updated = {
          ...current,
          amountPreTaxCents: newCents,
        }
        writeSessionAttachedInstallOption(updated, "sealed_unit")
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
