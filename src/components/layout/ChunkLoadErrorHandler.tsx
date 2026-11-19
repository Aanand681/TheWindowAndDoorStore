"use client"

import { useEffect } from "react"

export function ChunkLoadErrorHandler() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason
      const msg = typeof reason === "string" ? reason : reason?.message || ""
      const isChunk =
        reason?.name === "ChunkLoadError" ||
        msg.includes("Loading chunk") ||
        msg.includes("failed to fetch dynamically imported module")

      if (isChunk && typeof window !== "undefined") {
        const now = Date.now()
        const last = Number(sessionStorage.getItem("last_chunk_reload") || "0")
        if (now - last > 10000) {
          sessionStorage.setItem("last_chunk_reload", String(now))
          event.preventDefault()
          window.location.reload()
        }
      }
    }

    const handleError = (event: ErrorEvent) => {
      const msg = event?.message || ""
      const isChunk =
        event?.error?.name === "ChunkLoadError" ||
        msg.includes("Loading chunk") ||
        msg.includes("failed to fetch dynamically imported module")

      if (isChunk && typeof window !== "undefined") {
        const now = Date.now()
        const last = Number(sessionStorage.getItem("last_chunk_reload") || "0")
        if (now - last > 10000) {
          sessionStorage.setItem("last_chunk_reload", String(now))
          window.location.reload()
        }
      }
    }

    window.addEventListener("unhandledrejection", handleRejection)
    window.addEventListener("error", handleError)
    return () => {
      window.removeEventListener("unhandledrejection", handleRejection)
      window.removeEventListener("error", handleError)
    }
  }, [])

  return null
}
