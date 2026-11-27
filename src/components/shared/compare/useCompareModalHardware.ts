"use client"

import { useState, useEffect, useMemo } from "react"
import { DoorLineItem } from "@/lib/doors/types"
import { DoorInstallHardwareConfig } from "@/hooks/calculator/supply-mode/supply-session-storage"
import {
  readSessionAttachedInstallOption,
  writeSessionAttachedInstallOption,
  readSessionDoorHardwareConfig,
  writeSessionDoorHardwareConfig,
  type QuoteOptionScope,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { calculateCompareTotals } from "./compare-math"

export interface UseCompareModalHardwareParams {
  doorItems?: DoorLineItem[]
  standardHardwarePrice: number
  hardwareAmount?: number
  currentMode: "supply" | "install"
  currentSubtotal?: number
  baseAmount: number
  attachedAmount?: number
  surchargeAmount?: number
  discountAmount?: number
  opt1JCAmount: number
  opt2JCAmount: number
  labourAmount?: number
  miscAmount?: number
  hstRate: number
  attachTitle: string
  hasSupplyJC: boolean
  onToggleAttachOption?: (
    attached: boolean,
    cents: number,
    title: string,
    hasSupplyJC: boolean,
    config: any,
    hardwareTotal: number
  ) => void
  isOpen: boolean
  optionScope?: QuoteOptionScope
}

export function useCompareModalHardware(params: UseCompareModalHardwareParams) {
  const {
    doorItems,
    standardHardwarePrice,
    hardwareAmount = 0,
    currentMode,
    currentSubtotal,
    baseAmount,
    attachedAmount = 0,
    surchargeAmount = 0,
    discountAmount = 0,
    opt1JCAmount,
    opt2JCAmount,
    labourAmount = 0,
    miscAmount = 0,
    hstRate,
    attachTitle,
    hasSupplyJC,
    onToggleAttachOption,
    isOpen,
    optionScope,
  } = params

  const [isOptionAttached, setIsOptionAttached] = useState(false)

  const totalDoorCount = useMemo(() => {
    return doorItems
      ? doorItems.reduce(
          (acc, it) =>
            acc + (it.category !== "storm" ? Number(it.quantity) || 1 : 0),
          0
        )
      : 0
  }, [doorItems])

  const [hardwareConfig, setHardwareConfig] =
    useState<DoorInstallHardwareConfig>(() => {
      const saved = readSessionDoorHardwareConfig()
      if (saved) return saved
      const attached = readSessionAttachedInstallOption(optionScope)
      if (attached?.hardwareConfig) return attached.hardwareConfig
      if (doorItems && doorItems.length > 0) {
        let std = 0
        let cust = 0
        let custPrice = 220.0
        let hasCustom = false
        doorItems.forEach((it) => {
          if (it.category === "storm") return
          const q = it.quantity || 1
          const hwType = it.installHardwareType || it.hardwareType
          const hwPrice = it.installHardwarePrice || it.hardwarePrice || 0
          if (hwType === "standard") {
            std += q
          } else if (hwType === "custom") {
            hasCustom = true
            cust += q
            custPrice = hwPrice || 220.0
          }
        })
        const total = std + cust
        if (total > 0) {
          const totPrice =
            Math.round(
              (std * standardHardwarePrice + cust * custPrice) * 100
            ) / 100
          return {
            type: std > 0 ? "standard" : "custom",
            standardQty: std,
            standardPrice: standardHardwarePrice,
            hasCustom,
            customQty: cust,
            customPrice: custPrice,
            totalQty: total,
            totalPrice: totPrice,
          }
        }
      }
      return {
        type: "standard",
        standardQty: totalDoorCount,
        standardPrice: standardHardwarePrice,
        hasCustom: false,
        customQty: 0,
        customPrice: 220.0,
        totalQty: totalDoorCount,
        totalPrice:
          Math.round(totalDoorCount * standardHardwarePrice * 100) / 100,
      }
    })

  useEffect(() => {
    if (isOpen) {
      const cached = readSessionAttachedInstallOption(optionScope)
      setIsOptionAttached(Boolean(cached?.enabled))

      const saved = readSessionDoorHardwareConfig()
      if (saved) {
        setHardwareConfig(saved)
      } else if (cached?.hardwareConfig) {
        setHardwareConfig(cached.hardwareConfig)
      } else if (doorItems && doorItems.length > 0) {
        let std = 0
        let cust = 0
        let custPrice = 220.0
        let hasCustom = false
        doorItems.forEach((it) => {
          if (it.category === "storm") return
          const q = it.quantity || 1
          const hwType = it.installHardwareType || it.hardwareType
          const hwPrice = it.installHardwarePrice || it.hardwarePrice || 0
          if (hwType === "standard") {
            std += q
          } else if (hwType === "custom") {
            hasCustom = true
            cust += q
            custPrice = hwPrice || 220.0
          }
        })
        const total = std + cust
        if (total > 0) {
          setHardwareConfig({
            type: std > 0 ? "standard" : "custom",
            standardQty: std,
            standardPrice: standardHardwarePrice,
            hasCustom,
            customQty: cust,
            customPrice: custPrice,
            totalQty: total,
            totalPrice:
              Math.round(
                (std * standardHardwarePrice + cust * custPrice) * 100
              ) / 100,
          })
        }
      }
    }
  }, [isOpen, doorItems, standardHardwarePrice, totalDoorCount, optionScope])

  const supplyHardwareTotal = useMemo(() => {
    return doorItems && doorItems.length > 0
      ? doorItems.reduce((acc, it) => {
          if (it.category === "storm") return acc
          const q = it.quantity || 1
          const p =
            currentMode === "supply"
              ? it.lineHardwareTotal || 0
              : it.supplyHardwareType && it.supplyHardwareType !== "none"
                ? (it.supplyHardwarePrice || 0) * q
                : 0
          return acc + p
        }, 0)
      : currentMode === "supply"
        ? hardwareAmount
        : 0
  }, [doorItems, currentMode, hardwareAmount])

  const supplyHardwareLabel =
    supplyHardwareTotal > 0 ? "Lockset & Hardware (Supply)" : undefined

  const installHardwareTotal =
    doorItems && doorItems.length > 0
      ? hardwareConfig.totalPrice
      : hardwareAmount

  const installHardwareLabel =
    hardwareConfig.totalQty > 0
      ? `${hardwareConfig.totalQty} Locksets & Deadbolts`
      : "Locksets & Deadbolts"

  const supplyHardwareCents = Math.round(supplyHardwareTotal * 100)
  const installHardwareCents = Math.round(installHardwareTotal * 100)

  const handleHardwareConfigChange = (newConfig: DoorInstallHardwareConfig) => {
    setHardwareConfig(newConfig)
    writeSessionDoorHardwareConfig(newConfig)

    if (isOptionAttached) {
      const newInstallHwCents = Math.round(newConfig.totalPrice * 100)
      const currentSupplyHwCents = Math.round(supplyHardwareTotal * 100)
      const newTotals = calculateCompareTotals({
        currentMode,
        currentSubtotal,
        baseAmount,
        attachedAmount,
        surchargeAmount,
        discountAmount,
        supplyHardwareCents: currentSupplyHwCents,
        installHardwareCents: newInstallHwCents,
        opt1JCCents: Math.round(opt1JCAmount * 100),
        opt2JCCents: Math.round(opt2JCAmount * 100),
        labourCents: Math.round(labourAmount * 100),
        miscCents: Math.round(miscAmount * 100),
        hstRate,
      })

      writeSessionAttachedInstallOption(
        {
          enabled: true,
          amountPreTaxCents: newTotals.extraSubtotalCents,
          mode: currentMode,
          title: attachTitle,
          hasSupplyJC,
          hardwareTotal: newConfig.totalPrice,
          hardwareQty: newConfig.totalQty,
          hardwareConfig: newConfig,
        },
        optionScope
      )

      if (onToggleAttachOption) {
        onToggleAttachOption(
          true,
          newTotals.extraSubtotalCents,
          attachTitle,
          hasSupplyJC,
          newConfig,
          newConfig.totalPrice
        )
      }
    }
  }

  return {
    totalDoorCount,
    hardwareConfig,
    isOptionAttached,
    setIsOptionAttached,
    supplyHardwareTotal,
    supplyHardwareLabel,
    installHardwareTotal,
    installHardwareLabel,
    supplyHardwareCents,
    installHardwareCents,
    handleHardwareConfigChange,
  }
}

