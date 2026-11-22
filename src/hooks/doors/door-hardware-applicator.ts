import { writeSessionDoorHardwareConfig } from "@/hooks/calculator/supply-mode/supply-session-storage"

export function applyDoorHardwareConfig(
  prevItems: any[],
  configOrSelections: any
): any[] {
  if (!configOrSelections) return prevItems

  if (
    typeof configOrSelections.standardQty === "number" ||
    typeof configOrSelections.totalQty === "number"
  ) {
    const config = configOrSelections
    writeSessionDoorHardwareConfig(config)
    let remainingStd = config.type === "standard" ? config.standardQty : 0
    let remainingCust = config.hasCustom
      ? config.customQty
      : config.type === "custom"
        ? config.standardPrice
          ? config.standardQty
          : 0
        : 0
    const custPrice = config.hasCustom
      ? config.customPrice
      : config.type === "custom"
        ? config.standardPrice
        : 220

    return prevItems.map((item) => {
      if (item.category === "storm") return item
      const q = item.quantity || 1
      let hwType: "standard" | "custom" | "none" = "none"
      let hwPrice = 0

      if (remainingStd >= q) {
        hwType = "standard"
        hwPrice = config.standardPrice || 158.0
        remainingStd -= q
      } else if (remainingCust >= q) {
        hwType = "custom"
        hwPrice = custPrice
        remainingCust -= q
      } else if (remainingStd > 0) {
        hwType = "standard"
        hwPrice = config.standardPrice || 158.0
        remainingStd = 0
      } else if (remainingCust > 0) {
        hwType = "custom"
        hwPrice = custPrice
        remainingCust = 0
      }

      return {
        ...item,
        hardwareType: hwType,
        hardwarePrice: hwPrice,
        installHardwareType: hwType,
        installHardwarePrice: hwPrice,
        lineHardwareTotal: Math.round(hwPrice * q * 100) / 100,
      }
    })
  }

  if (Array.isArray(configOrSelections)) {
    return prevItems.map((item, idx) => {
      const match = configOrSelections.find(
        (s: any) => s.doorId === item.id || s.doorId === `door_${idx}`
      )
      if (!match) return item
      return {
        ...item,
        hardwareType: match.hardwareType,
        hardwarePrice: match.price,
        installHardwareType: match.hardwareType,
        installHardwarePrice: match.price,
        customHardwareName: match.customHardwareName,
        lineHardwareTotal:
          Math.round(match.price * (item.quantity || 1) * 100) / 100,
      }
    })
  }

  return prevItems
}
