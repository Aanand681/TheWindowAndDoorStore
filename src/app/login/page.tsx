"use client"

import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2, User } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [expiredNotice, setExpiredNotice] = useState(false)

  // If already authenticated, redirect to app automatically (unless session just expired)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("vwd_last_active_time")
        sessionStorage.removeItem("vwd_tab_init_time")
      } catch {}

      const params = new URLSearchParams(window.location.search)
      if (params.get("expired") === "true") {
        setExpiredNotice(true)
        return
      }
    }

    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          router.replace("/")
        }
      })
      .catch(() => {})
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("credentials", {
      redirect: false,
      usernameOrEmail: username,
      password: password,
    })

    if (res?.error) {
      // Check if error contains rate limiting / lockout message
      if (
        res.error.toLowerCase().includes("too many") ||
        res.error.toLowerCase().includes("locked")
      ) {
        setError(res.error)
      } else if (res.error.includes("(") && res.error.includes("remaining)")) {
        setError(res.error)
      } else {
        setError("Invalid username or password. Please try again.")
      }
      setLoading(false)
    } else {
      // Immediately prime active session timestamps to prevent premature inactivity logout
      try {
        const now = Date.now()
        localStorage.setItem("vwd_last_active_time", String(now))
        sessionStorage.setItem("vwd_tab_init_time", String(now))
      } catch {}

      let targetUrl = "/"
      try {
        const profRes = await fetch("/api/profile")
        if (profRes.ok) {
          const prof = await profRes.json()
          if (
            prof.landingPage === "admin" &&
            (prof.role === "ADMIN" || prof.role === "SUPERADMIN")
          ) {
            targetUrl = "/admin"
          } else if (prof.landingPage === "quotes") {
            targetUrl = "/quotes"
          }
        }
      } catch (err) {
        console.error("Error fetching landing page preference:", err)
      }
      // Use window.location.href to guarantee full session cookie synchronization and instant redirection
      window.location.href = targetUrl
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Background decoration */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Logo / Brand */}
      <div className="relative z-10 mb-8 text-center">
        <Link
          href="/"
          className="group inline-block cursor-pointer transition-opacity hover:opacity-90"
          title="Window & Door Store - Home / Calculator"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-8 ring-primary/5 transition-transform group-hover:scale-105">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            The Window &amp; Door Store
          </h1>
        </Link>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Staff Portal — Sign in to continue
        </p>
      </div>

      {/* Card */}
      <Card className="relative z-10 w-full max-w-md border border-border/60 bg-card/90 shadow-2xl backdrop-blur-sm">
        <CardContent className="space-y-5 px-7 pt-6 pb-8">
          {/* Session Expiration Banner */}
          {expiredNotice && (
            <div className="flex animate-in items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm text-amber-900 shadow-sm duration-200 fade-in dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-xs font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-400">
                  Session Expired
                </p>
                <p className="mt-0.5 text-xs text-amber-800/90 dark:text-amber-200/90">
                  You have been logged out after 1 hour of inactivity. Please
                  sign in again to continue.
                </p>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex animate-in items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive duration-200 fade-in">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Username or Email
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  autoFocus
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 pl-9"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              id="login-submit"
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="mt-2 h-11 w-full text-base font-semibold shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Forgot password — standard placement below submit */}
            <div className="pt-1 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="relative z-10 mt-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} The Window & Door Store. All rights
        reserved.
      </p>
    </div>
  )
}
