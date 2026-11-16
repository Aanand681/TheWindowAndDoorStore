import React from "react"

/**
 * Prevents typing negative signs, exponential notation ("e", "E"), or plus signs
 * into numeric input fields where negative numbers are invalid.
 */
export function blockNegativeKey(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
    e.preventDefault()
  }
}

/**
 * Sanitizes a numeric string to ensure it contains no negative signs
 * and keeps only valid digits and at most one decimal point.
 */
export function sanitizeNonNegativeNumber(val: string): string {
  if (!val) return ""
  // Remove all minus signs and illegal characters
  let cleaned = val.replace(/[^0-9.]/g, "")
  // Ensure at most one decimal point
  const parts = cleaned.split(".")
  if (parts.length > 2) {
    cleaned = `${parts[0]}.${parts.slice(1).join("")}`
  }
  return cleaned
}

/**
 * Sanitizes an integer quantity string, ensuring it is at least 1 and contains only digits.
 */
export function sanitizePositiveInteger(val: string, fallback = "1"): string {
  if (!val) return ""
  const digits = val.replace(/[^0-9]/g, "")
  if (!digits) return ""
  const intVal = parseInt(digits, 10)
  if (isNaN(intVal) || intVal < 1) return fallback
  return String(intVal)
}

/**
 * Clamps any numeric value to be at least 0 (non-negative).
 */
export function clampNonNegative(
  val: number | string | undefined | null,
  fallback = 0
): number {
  if (val === undefined || val === null || val === "") return fallback
  const parsed = typeof val === "number" ? val : parseFloat(val)
  if (isNaN(parsed) || parsed < 0) return fallback
  return parsed
}

/**
 * Clamps any integer quantity to be at least minVal (default 1).
 */
export function clampPositiveInteger(
  val: number | string | undefined | null,
  minVal = 1
): number {
  if (val === undefined || val === null || val === "") return minVal
  const parsed = typeof val === "number" ? val : parseInt(String(val), 10)
  if (isNaN(parsed) || parsed < minVal) return minVal
  return Math.floor(parsed)
}

