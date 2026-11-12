"use client"

import React from "react"
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
import { Plus } from "lucide-react"
import { DepartmentType } from "./types"

export interface CreateStaffCardProps {
  departments: DepartmentType[]
  department: string
  setDepartment: (dept: string) => void
  role: string
  setRole: (role: string) => void
  username: string
  setUsername: (username: string) => void
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  error: string
  success: string
  handleCreateUser: (e: React.FormEvent) => Promise<void>
}

export function CreateStaffCard({
  departments,
  department,
  setDepartment,
  role,
  setRole,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  error,
  success,
  handleCreateUser,
}: CreateStaffCardProps) {
  return (
    <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Plus className="h-5 w-5 text-primary" />
          Add New Staff
        </CardTitle>
        <CardDescription>
          Assign department, role, and credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dept">Department / Category</Label>
            <select
              id="dept"
              className="flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">System Role</Label>
            <select
              id="role"
              className="flex h-10 w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="EMPLOYEE">Employee (Standard Access)</option>
              <option value="ADMIN">Admin (Prices, Staff &amp; Reviews)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              required
              className="bg-background"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              className="bg-background"
              value={email}
              placeholder="employee@company.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password</Label>
            <Input
              id="password"
              type="password"
              required
              className="bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}
          {success && (
            <div className="text-sm font-medium text-emerald-500">
              {success}
            </div>
          )}

          <Button
            type="submit"
            className="mt-2 w-full cursor-pointer font-bold"
          >
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
