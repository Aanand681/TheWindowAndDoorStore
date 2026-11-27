import { describe, it, expect, beforeEach } from "vitest"
import {
  readSessionCustomOptions,
  writeSessionCustomOptions,
  readSessionAttachedInstallOption,
  writeSessionAttachedInstallOption,
  resolveQuoteOptionScope,
  clearAllQuoteSessionState,
  SESSION_CUSTOM_OPTIONS_KEY,
  SESSION_ATTACHED_INSTALL_OPTION_KEY,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

function createMockSessionStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v)
    },
    removeItem: (k: string) => {
      store.delete(k)
    },
    clear: () => {
      store.clear()
    },
  }
}

describe("quote session option isolation across calculators", () => {
  beforeEach(() => {
    const storage = createMockSessionStorage()
    const listeners = new Map<string, Set<EventListener>>()
    ;(globalThis as any).window = {
      location: { pathname: "/calculator" },
      dispatchEvent: (evt: Event) => {
        const set = listeners.get(evt.type)
        set?.forEach((fn) => fn(evt))
        return true
      },
      addEventListener: () => {},
      removeEventListener: () => {},
    }
    ;(globalThis as any).sessionStorage = storage
    ;(globalThis as any).CustomEvent = class MockCustomEvent {
      type: string
      detail: any
      constructor(type: string, init?: { detail?: any }) {
        this.type = type
        this.detail = init?.detail
      }
    }
  })

  it("isolates custom options added on window from door and sealed_unit pages", () => {
    writeSessionCustomOptions(
      [{ id: "opt-1", title: "Window Option", amountPreTaxCents: 25000 }],
      "window"
    )

    expect(readSessionCustomOptions("window")).toHaveLength(1)
    expect(readSessionCustomOptions("door")).toEqual([])
    expect(readSessionCustomOptions("sealed_unit")).toEqual([])
  })

  it("isolates attached install/supply options per quote scope", () => {
    writeSessionAttachedInstallOption(
      { enabled: true, amountPreTaxCents: 120000, title: "Door Install Option" },
      "door"
    )

    expect(readSessionAttachedInstallOption("door")?.title).toBe("Door Install Option")
    expect(readSessionAttachedInstallOption("window")).toBeNull()
    expect(readSessionAttachedInstallOption("sealed_unit")).toBeNull()
  })

  it("infers scope automatically from pathname when omitted and clears legacy un-scoped keys", () => {
    ;(globalThis as any).sessionStorage.setItem(
      SESSION_CUSTOM_OPTIONS_KEY,
      JSON.stringify([{ id: "legacy", title: "Stale Global", amountPreTaxCents: 1000 }])
    )
    ;(globalThis as any).sessionStorage.setItem(
      SESSION_ATTACHED_INSTALL_OPTION_KEY,
      JSON.stringify({ enabled: true, amountPreTaxCents: 5000 })
    )
    ;(globalThis as any).window.location.pathname = "/sealed-units"

    expect(resolveQuoteOptionScope()).toBe("sealed_unit")
    expect(readSessionCustomOptions()).toEqual([])
    expect(readSessionAttachedInstallOption()).toBeNull()

    clearAllQuoteSessionState("window")
    expect(readSessionCustomOptions("window")).toEqual([])
  })
})
