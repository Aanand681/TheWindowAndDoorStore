"use client"

import React, { useState, useEffect, useRef } from "react"
import { Bell, CheckCheck, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  NotificationItem,
  useNotifications,
  NotificationItemRow,
} from "@/components/notifications"

export type { NotificationItem }

export default function NotificationBell() {
  const {
    notifications,
    unreadList,
    unreadCount,
    handleMarkAllAsRead,
    handleNotificationClick,
  } = useNotifications()

  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"unread" | "history">("unread")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const displayedList = activeTab === "unread" ? unreadList : notifications

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 cursor-pointer rounded-full text-muted-foreground hover:text-foreground"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 z-50 mt-2 w-80 animate-in overflow-hidden border-border bg-card/95 p-0 shadow-2xl backdrop-blur-xl duration-150 fade-in slide-in-from-top-2 sm:w-96">
          {/* Snug Header Group */}
          <div className="border-b border-border/70 bg-muted/20">
            {/* Title & Action Row */}
            <div className="flex items-center justify-between px-3.5 pt-3 pb-1.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="py-0.2 rounded-full bg-amber-500/15 px-2 text-[10px] font-bold text-amber-500">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* Sub Tabs */}
            <div className="mt-1 flex border-t border-border/40">
              <button
                onClick={() => setActiveTab("unread")}
                className={`flex-1 cursor-pointer border-b-2 py-1.5 text-center text-xs font-semibold transition-all ${
                  activeTab === "unread"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 cursor-pointer border-b-2 py-1.5 text-center text-xs font-semibold transition-all ${
                  activeTab === "history"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                History / All ({notifications.length})
              </button>
            </div>
          </div>

          {/* Notifications Scroll Area */}
          <div className="max-h-80 divide-y divide-border/40 overflow-y-auto">
            {displayedList.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-30" />
                <p className="font-semibold text-foreground/80">
                  All caught up!
                </p>
                <p className="mt-1 opacity-70">
                  {activeTab === "unread"
                    ? 'No new quote review alerts. Check "History / All" for past records.'
                    : "Your notifications will appear here."}
                </p>
              </div>
            ) : (
              displayedList.map((n) => (
                <NotificationItemRow
                  key={n._id}
                  notification={n}
                  onClick={() =>
                    handleNotificationClick(n, () => setIsOpen(false))
                  }
                />
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
