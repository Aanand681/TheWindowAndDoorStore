"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Component, UserCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import NotificationBell from "@/components/shared/NotificationBell"
import SmartBackButton from "@/components/shared/SmartBackButton"
import {
  ProfileHeaderBanner,
  PersonalInfoCard,
  QuotingDefaultsCard,
  NotificationPrefsCard,
  PasswordChangeCard,
} from "@/components/profile"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile Identity & Metadata
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [department, setDepartment] = useState("")
  const [createdAt, setCreatedAt] = useState<string | undefined>()
  const [lastLoginAt, setLastLoginAt] = useState<string | undefined>()

  // Quoting & Navigation Defaults
  const [defaultQuotingMode, setDefaultQuotingMode] = useState<
    "installation" | "supply_only"
  >("installation")
  const [favoriteTemplate, setFavoriteTemplate] = useState("cards")
  const [landingPage, setLandingPage] = useState("calculator")

  // Notifications
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
          setName(data.name || "")
          setUsername(data.username || "")
          setEmail(data.email || "")
          setRole(data.role || "")
          setDepartment(data.department || "")
          setLandingPage(data.landingPage || "calculator")
          setDefaultQuotingMode(data.defaultQuotingMode || "installation")
          setFavoriteTemplate(data.favoriteTemplate || "cards")
          setMuteNotifications(Boolean(data.muteNotifications))
          setReceiveQuoteEmails(data.receiveQuoteEmails !== false)
          setCreatedAt(data.createdAt)
          setLastLoginAt(data.lastLoginAt)
        }
      } catch (err) {
        console.error("Failed to load profile:", err)
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
      const errText = "New passwords do not match"
      setMessage({ text: errText, type: "error" })
      toast.error(errText)
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          email,
          landingPage,
          defaultQuotingMode,
          favoriteTemplate,
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
      toast.success("Profile preferences saved successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" })
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Loading profile settings...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-6 px-4 pt-5 pb-12 sm:px-6 sm:pt-6 lg:px-8">
        {/* Navigation Bar */}
        <header className="flex flex-col items-center justify-between gap-4 md:flex-row">
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
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        {/* Profile Header Banner */}
        <ProfileHeaderBanner
          name={name}
          username={username}
          role={role}
          department={department}
          createdAt={createdAt}
          lastLoginAt={lastLoginAt}
        />

        {/* Settings Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column: Personal Identity & Quoting Defaults */}
            <div className="space-y-6">
              <PersonalInfoCard
                name={name}
                setName={setName}
                username={username}
                setUsername={setUsername}
                email={email}
                setEmail={setEmail}
              />

              <QuotingDefaultsCard
                defaultQuotingMode={defaultQuotingMode}
                setDefaultQuotingMode={setDefaultQuotingMode}
                favoriteTemplate={favoriteTemplate}
                setFavoriteTemplate={setFavoriteTemplate}
                landingPage={landingPage}
                setLandingPage={setLandingPage}
                role={role}
              />
            </div>

            {/* Right Column: Notification Alerts & Password Change */}
            <div className="space-y-6">
              <NotificationPrefsCard
                receiveQuoteEmails={receiveQuoteEmails}
                setReceiveQuoteEmails={setReceiveQuoteEmails}
                muteNotifications={muteNotifications}
                setMuteNotifications={setMuteNotifications}
              />

              <PasswordChangeCard
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
              />
            </div>
          </div>

          {message.text && (
            <div
              className={`rounded-xl border p-3.5 text-sm font-medium ${
                message.type === "error"
                  ? "border-destructive/20 bg-destructive/10 text-destructive"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-2.5 text-sm font-semibold shadow-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
