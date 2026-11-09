"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, InformationCircleIcon, Alert02Icon, MultiplicationSignCircleIcon, Loading03Icon } from "@hugeicons/core-free-icons"

const TOASTER_ICONS = {
  success: <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />,
  info: <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4" />,
  warning: <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />,
  error: <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2} className="size-4" />,
  loading: <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />,
}

const TOASTER_STYLE = {
  "--normal-bg": "var(--popover)",
  "--normal-text": "var(--popover-foreground)",
  "--normal-border": "var(--border)",
  "--border-radius": "var(--radius)",
} as React.CSSProperties

const TOASTER_OPTIONS = {
  classNames: {
    toast: "cn-toast",
  },
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={TOASTER_ICONS}
      style={TOASTER_STYLE}
      toastOptions={TOASTER_OPTIONS}
      {...props}
    />
  )
}

export { Toaster }
