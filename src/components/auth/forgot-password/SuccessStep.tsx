"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function SuccessStep() {
  const router = useRouter()

  return (
    <div className="space-y-5 py-2 text-center">
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-400">
        Your password has been changed securely. You can now use your new
        password to sign into your account.
      </div>

      <Button
        onClick={() => router.push("/login")}
        className="h-11 w-full text-base font-medium"
      >
        Proceed to Sign In
      </Button>
    </div>
  )
}
