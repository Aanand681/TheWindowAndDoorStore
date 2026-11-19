"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCircle, Mail } from "lucide-react"

interface PersonalInfoCardProps {
  name: string
  setName: (val: string) => void
  username: string
  setUsername: (val: string) => void
  email: string
  setEmail: (val: string) => void
}

export function PersonalInfoCard({
  name,
  setName,
  username,
  setUsername,
  email,
  setEmail,
}: PersonalInfoCardProps) {
  return (
    <Card className="border-border bg-card/50 shadow-md backdrop-blur-xl">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserCircle className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Your identity details across quotes, invoices, and login credentials.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="fullName">Full Name</Label>
            <span className="text-xs text-muted-foreground">
              Shown on customer quotes &amp; PDFs
            </span>
          </div>
          <Input
            id="fullName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Smith"
            maxLength={100}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Customer quote PDFs, invoices, and email headers will print this name instead of your username.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="off"
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
                autoComplete="off"
                className="bg-background pl-9"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
