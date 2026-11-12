import React from "react"
import { AlertTriangle } from "lucide-react"

export function ReviewerRevisionAlert({ notes }: { notes?: string }) {
  if (!notes) return null
  return (
    <div className="mt-3 flex animate-in items-start gap-2 rounded-xl border border-amber-500/35 bg-amber-500/15 p-3 text-xs font-medium text-amber-950 shadow-xs fade-in dark:text-amber-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div>
        <strong className="text-amber-900 dark:text-amber-300">
          Reviewer Revision Instructions:
        </strong>
        <p className="mt-0.5 font-normal text-foreground/90 italic">
          &quot;{notes}&quot;
        </p>
      </div>
    </div>
  )
}
