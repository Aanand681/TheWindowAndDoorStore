"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  UserCircle,
  ShieldCheck,
  Mail,
  KeyRound,
  Component,
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import NotificationBell from "@/components/shared/NotificationBell"
import QuotesBinPill from "@/components/quotes/QuotesBinPill"
import SmartBackButton from "@/components/shared/SmartBackButton"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile State
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [landingPage, setLandingPage] = useState("calculator")
  const [muteNotifications, setMuteNotifications] = useState(false)
  const [receiveQuoteEmails, setReceiveQuoteEmails] = useState(true)

  // Password State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          setUsername(data.username || "")
          setEmail(data.email || "")
          setRole(data.role || "")
          setLandingPage(data.landingPage || "calculator")
          setMuteNotifications(Boolean(data.muteNotifications))
          setReceiveQuoteEmails(data.receiveQuoteEmails !== false)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: "New passwords do not match", type: "error" })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          landingPage,
          muteNotifications,
          receiveQuoteEmails,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setMessage({ text: "Profile updated successfully!", type: "success" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto max-w-4xl space-y-8 px-4 py-12">
        <header className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-wrap items-center gap-3">
            <SmartBackButton fallbackUrl="/" label="Back" />
            <Link
              href="/"
              className="group inline-flex cursor-pointer items-center gap-2 text-primary transition-opacity hover:opacity-80"
              title="Window & Door Store - Home / Calculator"
            >
              <Component className="h-6 w-6 transition-transform group-hover:scale-105" />
              <span className="text-xl font-semibold tracking-wider uppercase">
                Window &amp; Door Store
              </span>
            </Link>
            <span className="hidden text-muted-foreground/40 sm:inline">/</span>
            <div className="inline-flex items-center gap-1.5 text-muted-foreground">
              <UserCircle className="h-5 w-5 text-primary" />
              <span className="text-base font-semibold tracking-wider uppercase">
                My Profile
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <QuotesBinPill />
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        <Card className="mx-auto max-w-2xl border-border bg-card/50 shadow-xl backdrop-blur-xl">
          <CardHeader className="border-b border-border pb-6">
            <CardTitle className="flex items-center gap-2 text-2xl">
              Account Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and password.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {role && role !== "SUPERADMIN" && (
              <div className="mb-8 flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Role Level
                  </p>
                  <p className="font-bold tracking-wider">{role}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Recovery Email</Label>
                    <div className="relative">
                      <Mail className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="bg-background pl-9"
                      />
                    </div>
                  </div>
                  <div className="col-span-full space-y-2">
                    <Label htmlFor="landingPage">
                      Default Landing Page Upon Login
                    </Label>
                    <select
                      id="landingPage"
                      value={landingPage}
                      onChange={(e) => setLandingPage(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      <option value="calculator">Promo Calculator (/)</option>
                      <option value="quotes">
                        Quote Review & Bin (/quotes)
                      </option>
                      {(role === "ADMIN" || role === "SUPERADMIN") && (
                        <option value="admin">Admin Dashboard (/admin)</option>
                      )}
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Choose where you automatically land right after logging
                      in.
                    </p>
                  </div>

                  <div className="col-span-full space-y-3 pt-2">
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3.5">
                      <div className="space-y-0.5 pr-4">
                        <Label
                          htmlFor="emailNotif"
                          className="cursor-pointer text-sm font-semibold"
                        >
                          Receive Quote Notification Emails
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Receive email alerts when quotes are assigned to you
                          for review, approved, or modified.
                        </p>
                      </div>
                      <input
                        id="emailNotif"
                        type="checkbox"
                        checked={receiveQuoteEmails}
                        onChange={(e) =>
                          setReceiveQuoteEmails(e.target.checked)
                        }
                        className="h-5 w-5 cursor-pointer rounded accent-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3.5">
                      <div className="space-y-0.5 pr-4">
                        <Label
                          htmlFor="muteNotif"
                          className="cursor-pointer text-sm font-semibold"
                        >
                          Mute In-App Review Notifications
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Turn this on if you don&apos;t want to receive in-app
                          notification popups when a reviewer approves or
                          modifies your quotes.
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
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  Change Password
                </h3>
                <p className="mb-4 text-xs text-muted-foreground">
                  Leave these fields blank if you do not want to change your
                  password.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {message.text && (
                <div
                  className={`rounded border p-3 text-sm font-medium ${message.type === "error" ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"}`}
                >
                  {message.text}
                </div>
              )}

              <Button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto"
              >
                {saving ? "Saving Changes..." : "Save Profile Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
