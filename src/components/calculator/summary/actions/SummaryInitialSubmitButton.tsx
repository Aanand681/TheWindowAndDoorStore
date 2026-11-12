"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Send, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface SummaryInitialSubmitButtonProps {
  user: any
  quoteNumber: string
  customerName: string
  staffList: any[]
  clerkList: any[]
  assignedReviewer: string
  setAssignedReviewer: (val: string) => void
  selectedOdooClerk: string
  setSelectedOdooClerk: (val: string) => void
  setShowSubmitModal: (val: boolean) => void
}

export function SummaryInitialSubmitButton({
  user,
  quoteNumber,
  customerName,
  staffList,
  clerkList,
  assignedReviewer,
  setAssignedReviewer,
  selectedOdooClerk,
  setSelectedOdooClerk,
  setShowSubmitModal,
}: SummaryInitialSubmitButtonProps) {
  const handleClick = () => {
    if (!quoteNumber.trim() || !customerName.trim()) {
      toast.error(
        "Please enter a Customer Name and Quote Number before submitting!"
      )
      return
    }
    const otherReviewers = staffList.filter(
      (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
    )
    if (
      otherReviewers.length > 0 &&
      (!assignedReviewer ||
        assignedReviewer.toLowerCase() === user?.username?.toLowerCase() ||
        assignedReviewer === "Admin")
    ) {
      setAssignedReviewer(otherReviewers[0].username)
    }
    if (!selectedOdooClerk && clerkList.length > 0) {
      const defaultClerk =
        clerkList.find((c) => c.department === "CLERK") || clerkList[0]
      if (defaultClerk) setSelectedOdooClerk(defaultClerk.username)
    }
    setShowSubmitModal(true)
  }

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN"

  return (
    <Button
      variant="default"
      className={cn(
        "h-11 w-full cursor-pointer text-sm font-bold text-white shadow-md transition-colors",
        isAdmin
          ? "bg-emerald-600 hover:bg-emerald-700"
          : "bg-amber-600 hover:bg-amber-700"
      )}
      onClick={handleClick}
    >
      {isAdmin ? (
        <>
          <ShieldCheck className="mr-2 h-4 w-4" /> Approve &amp; Assign / Submit
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" /> Submit for Review
        </>
      )}
    </Button>
  )
}
