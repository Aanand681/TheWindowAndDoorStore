"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  saveActiveAutoSave,
  clearActiveAutoSave,
  QuoteType,
} from "@/lib/quote-drafts-storage"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
  resolveQuoteOptionScope,
  CUSTOM_OPTIONS_CHANGE_EVENT,
  ATTACHED_INSTALL_CHANGE_EVENT,
  type QuoteOptionScope,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

/**
 * Watches session custom options & attached install/supply options for a given
 * quote scope and returns a deterministic hash string whenever session storage changes.
 */
export function useSessionOptionsHash(scope?: QuoteOptionScope): string {
  const activeScope = resolveQuoteOptionScope(scope)
  const [optionsHash, setOptionsHash] = useState(() =>
    JSON.stringify({
      c: readSessionCustomOptions(activeScope),
      a: readSessionAttachedInstallOption(activeScope),
    })
  )

  useEffect(() => {
    const updateHash = () => {
      setOptionsHash(
        JSON.stringify({
          c: readSessionCustomOptions(activeScope),
          a: readSessionAttachedInstallOption(activeScope),
        })
      )
    }
    updateHash()
    window.addEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, updateHash)
    window.addEventListener(ATTACHED_INSTALL_CHANGE_EVENT, updateHash)
    window.addEventListener("storage", updateHash)
    return () => {
      window.removeEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, updateHash)
      window.removeEventListener(ATTACHED_INSTALL_CHANGE_EVENT, updateHash)
      window.removeEventListener("storage", updateHash)
    }
  }, [activeScope])

  return optionsHash
}

export interface UseUniversalAutoSaveParams {
  quoteType: QuoteType
  enabled?: boolean
  enabledRef?: React.RefObject<boolean>
  hasContent: boolean
  fingerprint: string
  buildPayload: () => {
    type: QuoteType
    quoteNumber: string
    customerName: string
    itemCount: number
    grandTotal: number
    summaryLabel: string
    data: any
  }
  debounceMs?: number
}

/**
 * Shared local auto-save debounce, timestamp, and fingerprint tracking
 * across Window, Door, and Sealed Unit workspaces.
 */
export function useUniversalAutoSave({
  quoteType,
  enabled = true,
  enabledRef,
  hasContent,
  fingerprint,
  buildPayload,
  debounceMs = 800,
}: UseUniversalAutoSaveParams) {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedFingerprintRef = useRef<string | null>(null)
  const buildPayloadRef = useRef(buildPayload)

  useEffect(() => {
    buildPayloadRef.current = buildPayload
  })

  useEffect(() => {
    if (!enabled || (enabledRef && !enabledRef.current)) return

    if (!hasContent) {
      clearActiveAutoSave(quoteType)
      lastSavedFingerprintRef.current = null
      return
    }

    if (lastSavedFingerprintRef.current === fingerprint) {
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      const payload = buildPayloadRef.current()
      saveActiveAutoSave(quoteType, payload)
      lastSavedFingerprintRef.current = fingerprint
      setLastSavedAt(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    }, debounceMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [quoteType, enabled, enabledRef, hasContent, fingerprint, debounceMs])

  const clearAutoSaveTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const markFingerprintSaved = useCallback(
    (savedFingerprint?: string) => {
      lastSavedFingerprintRef.current = savedFingerprint ?? fingerprint
    },
    [fingerprint]
  )

  return {
    lastSavedAt,
    setLastSavedAt,
    clearAutoSaveTimer,
    markFingerprintSaved,
  }
}
