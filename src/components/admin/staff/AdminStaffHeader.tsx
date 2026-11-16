"use client"

import React from "react"
import { Users, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import SmartBackButton from "@/components/shared/SmartBackButton"

export interface AdminStaffHeaderProps {
  onOpenDeptModal: () => void
}

export function AdminStaffHeader({ onOpenDeptModal }: AdminStaffHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-2 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-3">
        <SmartBackButton fallbackUrl="/admin" title="Back to Admin" />
        <div className="inline-flex items-center gap-2">
          <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Manage Staff
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add new employees, manage roles, departments, passwords, and permissions.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenDeptModal}
          className="cursor-pointer gap-2 border-primary/40 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Departments &amp; Permissions</span>
        </Button>
      </div>
    </div>
  )
}
