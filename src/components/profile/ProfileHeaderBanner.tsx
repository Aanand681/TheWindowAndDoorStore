"use client"

import React from "react"
import { Shield, Briefcase, Calendar, Clock, User } from "lucide-react"

interface ProfileHeaderBannerProps {
  name?: string
  username?: string
  role?: string
  department?: string
  createdAt?: string | Date
  lastLoginAt?: string | Date
}

function formatDate(dateValue?: string | Date): string {
  if (!dateValue) return "Not recorded"
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return "Not recorded"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d)
  } catch {
    return "Not recorded"
  }
}

function formatDateTime(dateValue?: string | Date): string {
  if (!dateValue) return "First active session"
  try {
    const d = new Date(dateValue)
    if (isNaN(d.getTime())) return "First active session"
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d)
  } catch {
    return "First active session"
  }
}

export function ProfileHeaderBanner({
  name,
  username,
  role,
  department,
  createdAt,
  lastLoginAt,
}: ProfileHeaderBannerProps) {
  const displayName = name?.trim() || username || "Team Member"
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card/80 to-card/40 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary ring-2 ring-primary/20">
            {initial || <User className="h-8 w-8" />}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {displayName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {username && (
                <span className="font-mono text-muted-foreground">
                  @{username}
                </span>
              )}
              {role && (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                  <Shield className="h-3 w-3" />
                  {role}
                </span>
              )}
              {department && (
                <span className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 font-semibold text-secondary-foreground">
                  <Briefcase className="h-3 w-3" />
                  {department}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-border pt-4 text-xs text-muted-foreground sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
            <span>Account created:</span>
            <span className="font-medium text-foreground">
              {formatDate(createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
            <span>Last login:</span>
            <span className="font-medium text-foreground">
              {formatDateTime(lastLoginAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
