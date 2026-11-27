"use client"

export const SESSION_SUPPLY_KEY = "vwd_quote_supply_custom_state"
export const SESSION_INSTALL_KEY = "vwd_quote_install_custom_state"

import type { DoorHardwareSelection } from "@/components/shared/compare/DoorHardwareCompareSection"

export type QuoteOptionScope = "window" | "door" | "sealed_unit"

const ALL_QUOTE_OPTION_SCOPES: QuoteOptionScope[] = [
  "window",
  "door",
  "sealed_unit",
]

/**
 * Infers the active quote scope from the browser URL pathname when explicit
 * scope isn't provided, keeping window/door/sealed-unit storage isolated.
 */
export function resolveQuoteOptionScope(scope?: QuoteOptionScope): QuoteOptionScope {
  if (scope) return scope
  if (typeof window !== "undefined") {
    const path = window.location?.pathname || ""
    if (path.startsWith("/doors")) return "door"
    if (path.startsWith("/sealed-units")) return "sealed_unit"
  }
  return "window"
}

function getScopedAttachedInstallKey(scope?: QuoteOptionScope): string {
  return `${SESSION_ATTACHED_INSTALL_OPTION_KEY}_${resolveQuoteOptionScope(scope)}`
}

function getScopedCustomOptionsKey(scope?: QuoteOptionScope): string {
  return `${SESSION_CUSTOM_OPTIONS_KEY}_${resolveQuoteOptionScope(scope)}`
}

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
  amountPreTax?: number
  mode?: "supply" | "install"
  title?: string
  hasSupplyJC?: boolean
  hardwareTotal?: number
  hardwareQty?: number
  hardwareConfig?: DoorInstallHardwareConfig
  hardwareBreakdown?: DoorHardwareSelection[]
}

export function readSessionAttachedInstallOption(
  scope?: QuoteOptionScope
): CachedAttachedInstallOption | null {
  if (typeof window === "undefined") return null
  try {
    // Drop legacy un-scoped key so old cross-page entries never bleed between calculators
    sessionStorage.removeItem(SESSION_ATTACHED_INSTALL_OPTION_KEY)
    const raw = sessionStorage.getItem(getScopedAttachedInstallKey(scope))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const ATTACHED_INSTALL_CHANGE_EVENT = "vwd_attached_install_changed"

export function writeSessionAttachedInstallOption(
  option: CachedAttachedInstallOption | null,
  scope?: QuoteOptionScope
) {
  if (typeof window === "undefined") return
  try {
    const resolved = resolveQuoteOptionScope(scope)
    const key = getScopedAttachedInstallKey(resolved)
    sessionStorage.removeItem(SESSION_ATTACHED_INSTALL_OPTION_KEY)
    if (!option) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, JSON.stringify(option))
    window.dispatchEvent(
      new CustomEvent(ATTACHED_INSTALL_CHANGE_EVENT, { detail: { scope: resolved } })
    )
  } catch {}
}

export const SESSION_CUSTOM_OPTIONS_KEY = "vwd_quote_custom_options"

export interface CustomQuoteOption {
  id: string
  title: string
  amountPreTaxCents: number
}

export function readSessionCustomOptions(
  scope?: QuoteOptionScope
): CustomQuoteOption[] {
  if (typeof window === "undefined") return []
  try {
    // Drop legacy un-scoped key so old cross-page entries never bleed between calculators
    sessionStorage.removeItem(SESSION_CUSTOM_OPTIONS_KEY)
    const raw = sessionStorage.getItem(getScopedCustomOptionsKey(scope))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const CUSTOM_OPTIONS_CHANGE_EVENT = "vwd_custom_options_changed"

export function writeSessionCustomOptions(
  options: CustomQuoteOption[],
  scope?: QuoteOptionScope
) {
  if (typeof window === "undefined") return
  try {
    const resolved = resolveQuoteOptionScope(scope)
    const key = getScopedCustomOptionsKey(resolved)
    sessionStorage.removeItem(SESSION_CUSTOM_OPTIONS_KEY)
    if (!options || options.length === 0) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, JSON.stringify(options))
    window.dispatchEvent(
      new CustomEvent(CUSTOM_OPTIONS_CHANGE_EVENT, { detail: { scope: resolved } })
    )
  } catch {}
}

/**
 * Purges quote-related session storage for one scope (when given) or across all scopes.
 * Call when importing a new PDF, resetting a quote, or switching to an independent workspace.
 */
export function clearAllQuoteSessionState(scope?: QuoteOptionScope) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(SESSION_ATTACHED_INSTALL_OPTION_KEY)
    sessionStorage.removeItem(SESSION_CUSTOM_OPTIONS_KEY)
    const targetScopes = scope ? [scope] : ALL_QUOTE_OPTION_SCOPES
    for (const s of targetScopes) {
      sessionStorage.removeItem(getScopedAttachedInstallKey(s))
      sessionStorage.removeItem(getScopedCustomOptionsKey(s))
    }
    if (!scope || scope === "door") {
      sessionStorage.removeItem(SESSION_DOOR_HARDWARE_CONFIG_KEY)
    }
    if (!scope || scope === "window") {
      sessionStorage.removeItem(SESSION_SUPPLY_KEY)
      sessionStorage.removeItem(SESSION_INSTALL_KEY)
    }
  } catch {}
}


