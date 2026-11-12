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
import { DoorLineItem, DoorQuotingMode } from "@/lib/doors/types"
import {
  DoorClosed,
  Copy,
  Edit,
  Trash2,
  Sparkles,
  KeyRound,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DoorLineItemsTableProps {
  lineItems: DoorLineItem[]
  mode: DoorQuotingMode
  onEdit: (item: DoorLineItem) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  className?: string
}

export function DoorLineItemsTable({
  lineItems,
  mode,
  onEdit,
  onDuplicate,
  onDelete,
  className,
}: DoorLineItemsTableProps) {
  if (lineItems.length === 0) {
    return (
      <Card
        className={cn(
          "border-2 border-dashed border-border/80 bg-card/50 py-10 text-center",
          className
        )}
      >
        <CardContent className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <DoorClosed className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              No doors added to quote yet
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Use the form on the left to configure doors from your Inkster
              software specs.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isInstallation = mode === "installation"

  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden border-border bg-card/70 py-0 shadow-md backdrop-blur-md [--card-spacing:0px]",
        className
      )}
    >
      <CardHeader className="border-b border-border/50 p-3.5 pb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">
                Configured Doors ({lineItems.length}{" "}
                {lineItems.length === 1 ? "Entry" : "Entries"})
              </CardTitle>
              <CardDescription className="text-xs">
                Review items, quantities, hardware, and customer upgrade
                options.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-xs tracking-wider text-muted-foreground uppercase">
                <th className="w-12 px-3 py-2.5 text-center">Qty</th>
                <th className="px-3 py-2.5">Door Specifications</th>
                <th className="w-36 px-3 py-2.5">Preset &amp; Category</th>
                <th className="w-32 px-3 py-2.5 text-right">Door Base Price</th>
                {isInstallation && (
                  <th className="w-32 px-3 py-2.5 text-right">
                    Labour &amp; Misc
                  </th>
                )}
                <th className="w-32 px-3 py-2.5 text-right">Line Total</th>
                <th className="w-24 px-3 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {lineItems.map((item, idx) => {
                const hasHardware = item.hardwareType !== "none"
                const hasUpgrade = item.upgradeOption?.enabled

                let hwLabel = "None"
                if (item.hardwareType === "standard")
                  hwLabel = `Standard Set ($${item.hardwarePrice.toFixed(0)})`
                else if (item.hardwareType === "customer_supplied")
                  hwLabel = `Customer ($${(item.customerHardwareFee || 80).toFixed(0)} Reinstall Labour)`
                else if (item.hardwareType === "custom")
                  hwLabel = `${item.customHardwareName || "Custom"} ($${item.hardwarePrice.toFixed(0)})`

                return (
                  <React.Fragment key={item.id || idx}>
                    <tr className="transition-colors hover:bg-muted/20">
                      <td className="px-3 py-3 text-center font-mono text-sm font-bold">
                        {item.quantity}
                      </td>

                      <td className="px-3 py-3">
                        <div className="text-xs font-semibold text-foreground sm:text-sm">
                          {item.customDescription || item.presetLabel}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span>
                            Inkster Base: ${item.inksterBasePrice.toFixed(2)}
                            /unit
                          </span>
                          {hasHardware && (
                            <span className="inline-flex items-center gap-1 rounded border border-border/50 bg-muted/60 px-1.5 py-0.5 text-[10px]">
                              <KeyRound className="h-2.5 w-2.5" />
                              {hwLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="text-xs font-medium">
                          {item.presetLabel}
                        </div>
                        <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                          {item.category}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <div className="font-mono text-xs font-medium">
                          ${(item.inksterBasePrice * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          ${item.inksterBasePrice.toFixed(2)}/ea
                        </div>
                      </td>

                      {isInstallation && (
                        <td className="px-3 py-3 text-right">
                          <div className="font-mono text-xs font-medium">
                            $
                            {(
                              item.lineLabourTotal +
                              item.lineMiscTotal +
                              item.lineHardwareTotal
                            ).toFixed(2)}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Lab: ${item.lineLabourTotal.toFixed(2)}
                          </div>
                        </td>
                      )}

                      <td className="px-3 py-3 text-right">
                        <div className="font-mono text-sm font-bold text-foreground">
                          $
                          {(isInstallation
                            ? item.lineGrandTotal
                            : (item.lineSupplyTotal ??
                              item.lineDoorSupplyTotal +
                                item.lineHardwareTotal +
                                item.surchargeAmount * item.quantity -
                                item.discountAmount * item.quantity)
                          ).toFixed(2)}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
                            title="Edit Door"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDuplicate(item.id)}
                            className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
                            title="Duplicate Door"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item.id)}
                            className="h-7 w-7 cursor-pointer text-destructive hover:bg-destructive/10"
                            title="Delete Door"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Upgrade Option Row: Simple & Clean */}
                    {hasUpgrade && item.upgradeOption && (
                      <tr className="border-b border-emerald-500/20 bg-emerald-50/5">
                        <td
                          colSpan={isInstallation ? 7 : 6}
                          className="px-4 py-2"
                        >
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-emerald-800 dark:text-emerald-300">
                              <Sparkles className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>
                                option for Door upgrade:{" "}
                                {item.upgradeOption.title ||
                                  item.customDescription}{" "}
                                Add
                              </span>
                            </div>

                            <div className="shrink-0 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              +$
                              {(
                                (item.upgradeOption.subtotalDifference || 0) *
                                (item.quantity || 1)
                              ).toFixed(2)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
