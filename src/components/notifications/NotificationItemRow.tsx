"use client"

import React from "react"
import {
  Check,
  FileText,
  Sparkles,
  AlertTriangle,
  Send,
  ClipboardCheck,
  CheckSquare,
} from "lucide-react"
import { NotificationItem } from "./types"

interface NotificationItemRowProps {
  notification: NotificationItem
  onClick: () => void
}

function formatTime(isoString: string) {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationItemRow({
  notification: n,
  onClick,
}: NotificationItemRowProps) {
  const isModified = n.type === "QUOTE_MODIFIED"
  const isReturned = n.type === "QUOTE_RETURNED"
  const isApproved = n.type === "QUOTE_APPROVED"
  const isSubmission =
    n.type === "QUOTE_SUBMITTED" || n.type === "QUOTE_ASSIGNED"
  const isOdoo = n.type === "QUOTE_ODOO_ASSIGNED"
  const isOdooDone = n.type === "ODOO_ENTRY_COMPLETED"

  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer gap-3 p-3 text-left transition-colors hover:bg-muted/50 ${
        !n.isRead ? "bg-primary/5 font-medium" : "opacity-85"
      }`}
    >
      <div className="shrink-0 pt-0.5">
        {isOdoo && (
          <div className="rounded-lg bg-indigo-500/15 p-1.5 text-indigo-500">
            <ClipboardCheck className="h-4 w-4" />
          </div>
        )}
        {isOdooDone && (
          <div className="rounded-lg bg-emerald-500/15 p-1.5 text-emerald-500">
            <CheckSquare className="h-4 w-4" />
          </div>
        )}
        {isModified && (
          <div className="rounded-lg bg-blue-500/15 p-1.5 text-blue-500">
            <Sparkles className="h-4 w-4" />
          </div>
        )}
        {isReturned && (
          <div className="rounded-lg bg-destructive/15 p-1.5 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </div>
        )}
        {isApproved && (
          <div className="rounded-lg bg-emerald-500/15 p-1.5 text-emerald-500">
            <Check className="h-4 w-4" />
          </div>
        )}
        {isSubmission && (
          <div className="rounded-lg bg-amber-500/15 p-1.5 text-amber-500">
            <Send className="h-4 w-4" />
          </div>
        )}
        {!isModified &&
          !isReturned &&
          !isApproved &&
          !isSubmission &&
          !isOdoo &&
          !isOdooDone && (
            <div className="rounded-lg bg-primary/15 p-1.5 text-primary">
              <FileText className="h-4 w-4" />
            </div>
          )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-xs font-bold text-foreground">
            {n.title}
          </span>
          <span className="text-[10px] whitespace-nowrap text-muted-foreground">
            {formatTime(n.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {n.message}
        </p>

        {n.reviewChanges && n.reviewChanges.length > 0 && (
          <div className="mt-1.5 rounded border border-border/30 bg-muted/60 p-1.5 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground/80">Revisions:</span>
            <ul className="mt-0.5 list-inside list-disc space-y-0.5">
              {n.reviewChanges.slice(0, 2).map((c, i) => (
                <li key={i} className="truncate">
                  {c}
                </li>
              ))}
              {n.reviewChanges.length > 2 && (
                <li className="text-[10px] italic">
                  +{n.reviewChanges.length - 2} more changes
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {!n.isRead && (
        <div className="shrink-0 self-center">
          <span className="block h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
    </div>
  )
}
