"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { BellRing, Mail, BellOff } from "lucide-react"

interface NotificationPrefsCardProps {
  receiveQuoteEmails: boolean
  setReceiveQuoteEmails: (val: boolean) => void
  muteNotifications: boolean
  setMuteNotifications: (val: boolean) => void
}

export function NotificationPrefsCard({
  receiveQuoteEmails,
  setReceiveQuoteEmails,
  muteNotifications,
  setMuteNotifications,
}: NotificationPrefsCardProps) {
  return (
    <Card className="border-border bg-card/50 shadow-md backdrop-blur-xl">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BellRing className="h-5 w-5 text-primary" />
          Alerts &amp; Notifications
        </CardTitle>
        <CardDescription>
          Manage email alerts and in-app popup notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3.5 transition-colors hover:bg-muted/50">
          <div className="space-y-0.5 pr-4">
            <Label
              htmlFor="emailNotif"
              className="flex cursor-pointer items-center gap-2 text-sm font-semibold"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              Receive Quote Notification Emails
            </Label>
            <p className="text-xs text-muted-foreground">
              Receive email alerts when quotes are assigned to you for review, approved, or returned.
            </p>
          </div>
          <input
            id="emailNotif"
            type="checkbox"
            checked={receiveQuoteEmails}
            onChange={(e) => setReceiveQuoteEmails(e.target.checked)}
            className="h-5 w-5 cursor-pointer rounded accent-primary"
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3.5 transition-colors hover:bg-muted/50">
          <div className="space-y-0.5 pr-4">
            <Label
              htmlFor="muteNotif"
              className="flex cursor-pointer items-center gap-2 text-sm font-semibold"
            >
              <BellOff className="h-4 w-4 text-muted-foreground" />
              Mute In-App Review Notifications
            </Label>
            <p className="text-xs text-muted-foreground">
              Turn this on if you do not want to receive in-app notification toasts when a reviewer approves or modifies your quotes.
            </p>
          </div>
          <input
            id="muteNotif"
            type="checkbox"
            checked={muteNotifications}
            onChange={(e) => setMuteNotifications(e.target.checked)}
            className="h-5 w-5 cursor-pointer rounded accent-primary"
          />
        </div>
      </CardContent>
    </Card>
  )
}
