"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  UserCircle,
  LogOut,
  ShieldCheck,
  Calculator,
  Inbox,
  ChevronDown,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getCachedData } from "@/lib/client-cache"
import { EstimatorGuideModal } from "@/components/calculator/EstimatorGuideModal"

export interface UserProfileMenuProps {
  user?: {
    username?: string
    role?: string
    email?: string
    permissions?: any
    canAccessAdmin?: boolean
  } | null
  className?: string
}

export default function UserProfileMenu({
  user: propUser,
  className,
}: UserProfileMenuProps) {
  const [user, setUser] = useState<{
    username?: string
    role?: string
    email?: string
    permissions?: any
    canAccessAdmin?: boolean
  } | null>(propUser || getCachedData("/api/profile") || null)
  const [isOpen, setIsOpen] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // If user wasn't passed as prop, fetch from profile endpoint with deduplication
  useEffect(() => {
    if (propUser) {
      setUser(propUser)
      return
    }

    fetch("/api/profile")
      .then((res) => {
        if (res.status === 404) {
          // Account was deleted while session was active! Auto-clear session & redirect to login
          signOut({ redirect: false }).then(() => {
            window.location.href = "/login"
          })
          return null
        }
        return res.ok ? res.json() : null
      })
      .then((data) => {
        if (data) setUser(data)
      })
      .catch(() => {})
  }, [propUser])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("greeting_shown_session")
    }
    await signOut({ redirect: false })
    window.location.href = "/login"
  }

  if (!user && !propUser) {
    return null
  }

  const username = user?.username || propUser?.username || "User"
  const role = user?.role || propUser?.role || "Staff"
  const initials = username.slice(0, 2).toUpperCase()
  const isAdmin =
    role === "ADMIN" ||
    role === "SUPERADMIN" ||
    Boolean(
      user?.permissions?.canAccessAdmin ||
      propUser?.permissions?.canAccessAdmin ||
      (user as any)?.canAccessAdmin ||
      (propUser as any)?.canAccessAdmin
    )

  return (
    <div
      className={cn("relative inline-block text-left", className)}
      ref={menuRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-border/70 bg-card/50 py-1 pr-2.5 pl-1.5 shadow-xs backdrop-blur transition-all hover:bg-muted/70 focus:outline-hidden"
        title="Account Menu"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-[11px] font-black text-primary uppercase shadow-xs">
          {initials}
        </div>
        <span className="hidden max-w-[90px] truncate text-xs font-semibold text-foreground sm:inline">
          {username}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-60 animate-in rounded-2xl border border-border bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl duration-150 fade-in slide-in-from-top-2">
          {/* User Info Header */}
          <div className="border-b border-border/60 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-black text-primary uppercase">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-foreground">
                  {username}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="py-0.2 rounded-md bg-primary/15 px-1.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                    {role === "SUPERADMIN" ? "ADMIN" : role}
                  </span>
                  {user?.email && (
                    <span className="max-w-[100px] truncate text-[10px] text-muted-foreground">
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Items */}
          <div className="space-y-0.5 py-1.5">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70"
            >
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              <span>Profile &amp; Settings</span>
            </Link>

            <Link
              href="/quotes"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70"
            >
              <Inbox className="h-4 w-4 text-amber-500" />
              <span>Quotes History &amp; Bin</span>
            </Link>

            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70"
            >
              <Calculator className="h-4 w-4 text-primary" />
              <span>Quote Calculator</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setIsGuideOpen(true)
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-muted/70"
            >
              <HelpCircle className="h-4 w-4 text-primary" />
              <span>Estimator Workflow Guide</span>
            </button>
          </div>

          {/* Sign Out Footer */}
          <div className="border-t border-border/60 pt-1.5">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      <EstimatorGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  )
}
