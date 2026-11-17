"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react"
import { AlertTriangle, Trash2, HelpCircle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning" | "info"
  icon?: React.ReactNode
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider")
  }
  return context.confirm
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<{
    resolve: (val: boolean) => void
  } | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts)
      setResolver({ resolve })
    })
  }, [])

  const handleClose = useCallback(
    (result: boolean) => {
      if (resolver) {
        resolver.resolve(result)
      }
      setOptions(null)
      setResolver(null)
    },
    [resolver]
  )

  useEffect(() => {
    if (!options) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        handleClose(false)
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleClose(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [options, handleClose])

  const renderIcon = () => {
    if (options?.icon) return options.icon
    const variant = options?.variant || "default"
    if (variant === "destructive") {
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive ring-8 ring-destructive/10">
          <Trash2 className="h-5 w-5" />
        </div>
      )
    }
    if (variant === "warning") {
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-500 ring-8 ring-amber-500/10">
          <AlertTriangle className="h-5 w-5" />
        </div>
      )
    }
    if (variant === "info") {
      return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-500 ring-8 ring-blue-500/10">
          <Info className="h-5 w-5" />
        </div>
      )
    }
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-8 ring-primary/10">
        <HelpCircle className="h-5 w-5" />
      </div>
    )
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => handleClose(false)}
        >
          <div
            className="relative w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClose(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-start gap-4 pr-6">
              {renderIcon()}
              <div className="space-y-1">
                <h3
                  id="confirm-dialog-title"
                  className="text-base font-bold text-foreground leading-snug"
                >
                  {options.title}
                </h3>
                {options.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {options.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClose(false)}
                className="cursor-pointer text-xs"
              >
                {options.cancelText || "Cancel"}
              </Button>
              <Button
                variant={
                  options.variant === "destructive"
                    ? "destructive"
                    : "default"
                }
                size="sm"
                onClick={() => handleClose(true)}
                className={`cursor-pointer text-xs font-semibold ${
                  options.variant === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : ""
                }`}
                autoFocus
              >
                {options.confirmText || "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

