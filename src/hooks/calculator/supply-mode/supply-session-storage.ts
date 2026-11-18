"use client"

export const SESSION_SUPPLY_KEY = "vwd_quote_supply_custom_state"
export const SESSION_INSTALL_KEY = "vwd_quote_install_custom_state"

import type { DoorHardwareSelection } from "@/components/shared/compare/DoorHardwareCompareSection"

export interface CachedSupplyState {
  jambId: string
  jambName: string
  jambRate: string
  casingId: string
  casingName: string
  casingRate: string
  customJC: string
  supplyJCAmount?: number
}

export interface CachedInstallState {
  customJC: string
  customLabour: string
  customMisc: string
  installJCAmount?: number
  installLabourAmount?: number
  installMiscAmount?: number
}

export function readSessionSupplyState(): CachedSupplyState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(SESSION_SUPPLY_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeSessionSupplyState(state: CachedSupplyState | null) {
  if (typeof window === "undefined") return
  try {
    if (!state) sessionStorage.removeItem(SESSION_SUPPLY_KEY)
    else sessionStorage.setItem(SESSION_SUPPLY_KEY, JSON.stringify(state))
  } catch {}
}

export function readSessionInstallState(): CachedInstallState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(SESSION_INSTALL_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeSessionInstallState(state: CachedInstallState | null) {
  if (typeof window === "undefined") return
  try {
    if (!state) sessionStorage.removeItem(SESSION_INSTALL_KEY)
    else sessionStorage.setItem(SESSION_INSTALL_KEY, JSON.stringify(state))
  } catch {}
}

export const SESSION_DOOR_HARDWARE_CONFIG_KEY =
  "vwd_door_install_hardware_config"

export interface DoorInstallHardwareConfig {
  type: "standard" | "custom"
  standardQty: number
  standardPrice: number
  hasCustom: boolean
  customQty: number
  customPrice: number
  totalQty: number
  totalPrice: number
}

export function readSessionDoorHardwareConfig(): DoorInstallHardwareConfig | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(SESSION_DOOR_HARDWARE_CONFIG_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeSessionDoorHardwareConfig(
  config: DoorInstallHardwareConfig | null
) {
  if (typeof window === "undefined") return
  try {
    if (!config) sessionStorage.removeItem(SESSION_DOOR_HARDWARE_CONFIG_KEY)
    else
      sessionStorage.setItem(
        SESSION_DOOR_HARDWARE_CONFIG_KEY,
        JSON.stringify(config)
      )
  } catch {}
}

export const SESSION_ATTACHED_INSTALL_OPTION_KEY =
  "vwd_quote_attached_install_option"

export interface CachedAttachedInstallOption {
  enabled: boolean
  amountPreTaxCents: number
  mode?: "supply" | "install"
  title?: string
  hasSupplyJC?: boolean
  hardwareTotal?: number
  hardwareQty?: number
  hardwareConfig?: DoorInstallHardwareConfig
  hardwareBreakdown?: DoorHardwareSelection[]
}

export function readSessionAttachedInstallOption(): CachedAttachedInstallOption | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(SESSION_ATTACHED_INSTALL_OPTION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const ATTACHED_INSTALL_CHANGE_EVENT = "vwd_attached_install_changed"

export function writeSessionAttachedInstallOption(
  option: CachedAttachedInstallOption | null
) {
  if (typeof window === "undefined") return
  try {
    if (!option) sessionStorage.removeItem(SESSION_ATTACHED_INSTALL_OPTION_KEY)
    else
      sessionStorage.setItem(
        SESSION_ATTACHED_INSTALL_OPTION_KEY,
        JSON.stringify(option)
      )
    window.dispatchEvent(new CustomEvent(ATTACHED_INSTALL_CHANGE_EVENT))
  } catch {}
}

export const SESSION_CUSTOM_OPTIONS_KEY = "vwd_quote_custom_options"

export interface CustomQuoteOption {
  id: string
  title: string
  amountPreTaxCents: number
}

export function readSessionCustomOptions(): CustomQuoteOption[] {
  if (typeof window === "undefined") return []
  try {
    const raw = sessionStorage.getItem(SESSION_CUSTOM_OPTIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const CUSTOM_OPTIONS_CHANGE_EVENT = "vwd_custom_options_changed"

export function writeSessionCustomOptions(options: CustomQuoteOption[]) {
  if (typeof window === "undefined") return
  try {
    if (!options || options.length === 0)
      sessionStorage.removeItem(SESSION_CUSTOM_OPTIONS_KEY)
    else
      sessionStorage.setItem(
        SESSION_CUSTOM_OPTIONS_KEY,
        JSON.stringify(options)
      )
    window.dispatchEvent(new CustomEvent(CUSTOM_OPTIONS_CHANGE_EVENT))
  } catch {}
}

/**
 * Completely purges all quote-related session storage.
 * Call when importing a new PDF, resetting a quote, or switching to an independent workspace.
 */
export function clearAllQuoteSessionState() {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(SESSION_ATTACHED_INSTALL_OPTION_KEY)
    sessionStorage.removeItem(SESSION_CUSTOM_OPTIONS_KEY)
    sessionStorage.removeItem(SESSION_DOOR_HARDWARE_CONFIG_KEY)
    sessionStorage.removeItem(SESSION_SUPPLY_KEY)
    sessionStorage.removeItem(SESSION_INSTALL_KEY)
  } catch {}
}


