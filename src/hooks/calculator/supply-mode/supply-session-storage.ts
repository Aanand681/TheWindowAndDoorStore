"use client"

export const SESSION_SUPPLY_KEY = "vwd_quote_supply_custom_state"
export const SESSION_INSTALL_KEY = "vwd_quote_install_custom_state"

export interface CachedSupplyState {
  jambId: string
  jambName: string
  jambRate: string
  casingId: string
  casingName: string
  casingRate: string
  customJC: string
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

export const SESSION_ATTACHED_INSTALL_OPTION_KEY =
  "vwd_quote_attached_install_option"

export interface CachedAttachedInstallOption {
  enabled: boolean
  amountPreTaxCents: number
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
  } catch {}
}
