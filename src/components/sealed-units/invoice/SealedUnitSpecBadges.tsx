import React from "react"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"

interface SealedUnitSpecBadgesProps {
  lineItems: SealedUnitLineItem[]
}

/**
 * REUSABLE TOP SPECIFICATION BADGES
 * Displayed across all 3 templates with labels:
 * Treatment, Pane, Glass Fill, Glazing Spacer
 * Ink-friendly (white background, thin border, zero black ink block)
 */
export function SealedUnitSpecBadges({ lineItems }: SealedUnitSpecBadgesProps) {
  const treatments = Array.from(
    new Set(lineItems.map((it) => it.treatment).filter(Boolean))
  )
  const treatmentLabel =
    treatments.length > 1
      ? "Mixed"
      : treatments[0] === "tempered"
        ? "Tempered"
        : treatments[0] === "annealed"
          ? "Annealed"
          : "Standard"

  const panes = Array.from(
    new Set(lineItems.map((it) => it.paneType).filter(Boolean))
  )
  const paneLabel =
    panes.length > 1
      ? "Mixed"
      : panes[0] === "triple"
        ? "Triple Pane"
        : "Dual Pane"

  const glassFillLabel = "Argon 90%"

  const spacers = Array.from(
    new Set(
      lineItems
        .map((it) => `${it.thicknessMm || 3}mm Intercept`)
        .filter(Boolean)
    )
  )
  const spacerLabel =
    spacers.length > 1 ? spacers.join(", ") : spacers[0] || "3mm Intercept"

  return (
    <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[7pt]">
      <div className="rounded border border-gray-300 bg-white p-1">
        <span className="block font-sans text-[6pt] text-gray-500 uppercase">
          Treatment
        </span>
        <span className="font-bold text-gray-900 uppercase">
          {treatmentLabel}
        </span>
      </div>
      <div className="rounded border border-gray-300 bg-white p-1">
        <span className="block font-sans text-[6pt] text-gray-500 uppercase">
          Pane
        </span>
        <span className="font-bold text-gray-900 uppercase">{paneLabel}</span>
      </div>
      <div className="rounded border border-gray-300 bg-white p-1">
        <span className="block font-sans text-[6pt] text-gray-500 uppercase">
          Glass Fill
        </span>
        <span className="font-bold text-gray-900">{glassFillLabel}</span>
      </div>
      <div className="rounded border border-gray-300 bg-white p-1">
        <span className="block font-sans text-[6pt] text-gray-500 uppercase">
          Glazing Spacer
        </span>
        <span className="font-bold text-gray-900">{spacerLabel}</span>
      </div>
    </div>
  )
}
