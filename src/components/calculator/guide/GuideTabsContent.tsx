"use client"

import React from "react"
import {
  FileText,
  Calculator,
  Layers,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
} from "lucide-react"

export type GuideTabType =
  "fenevision" | "calculator" | "studio" | "sealed_units" | "workflow"

export function GuideTabsContent({ activeTab }: { activeTab: GuideTabType }) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm leading-relaxed sm:p-6">
      {/* TAB 1: FeneVision */}
      {activeTab === "fenevision" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Download the Right PDF from FeneVision
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Depending on what tool you are using, FeneVision produces two
                different formats:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-border/80 bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  A
                </span>
                <h5 className="text-xs font-bold tracking-wider text-foreground uppercase">
                  Standard Quote PDF
                </h5>
              </div>
              <p className="text-xs text-muted-foreground">
                Use for the <strong>Window Promo Calculator</strong>. Contains
                Quote #, Customer Name, and pricing columns (Base, Argon, Solar,
                Triple).
              </p>
              <div className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Target: Window Calculator → Import PDF
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-border/80 bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-600 dark:text-blue-400">
                  B
                </span>
                <h5 className="text-xs font-bold tracking-wider text-foreground uppercase">
                  QL (Quote List) PDF
                </h5>
              </div>
              <p className="text-xs text-muted-foreground">
                Use for the <strong>Quote PDF Studio</strong>. You <em>must</em>{" "}
                export with the <strong>QL report format</strong> in FeneVision
                so CAD window diagrams are included.
              </p>
              <div className="rounded-md bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                Target: Tools → Quote PDF Studio
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Window Calculator */}
      {activeTab === "calculator" && (
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Calculator className="h-4 w-4 text-primary" />
            <span>How to Price Windows with Promos</span>
          </h4>

          <ol className="list-inside list-decimal space-y-2.5 text-xs text-muted-foreground">
            <li className="pl-1">
              <strong className="text-foreground">
                Click &ldquo;Import PDF&rdquo;:
              </strong>{" "}
              Select your FeneVision Quote PDF in the Window Configurations
              toolbar. It extracts all windows, dimensions, and glass options
              automatically.
            </li>
            <li className="pl-1">
              <strong className="text-foreground">
                Automatic Promo Applied:
              </strong>{" "}
              The engine automatically calculates the maximum customer discount
              (e.g. Free Triple Glass, Free Solar, Cash Back).
            </li>
            <li className="pl-1">
              <strong className="text-foreground">Supply Only Mode:</strong> If
              the client is installing themselves, check{" "}
              <span className="font-semibold text-foreground">Supply Only</span>{" "}
              in Row 1. All installation labour is automatically zeroed.
            </li>
            <li className="pl-1">
              <strong className="text-foreground">
                Edit Extras On-the-Fly:
              </strong>{" "}
              You can edit Jambs &amp; Casing, Labour, and Misc directly in the
              Promo Summary card. Click the{" "}
              <span className="font-semibold text-foreground">pencil icon</span>{" "}
              to override, or click{" "}
              <span className="font-semibold text-foreground">Reset</span> to
              restore defaults.
            </li>
            <li className="pl-1">
              <strong className="text-foreground">No Auto-Jamb Charges:</strong>{" "}
              Jambs and Casings are set to{" "}
              <span className="font-semibold text-foreground">None</span> by
              default. You only pay for what you explicitly select.
            </li>
          </ol>
        </div>
      )}

      {/* TAB 3: Quote PDF Studio */}
      {activeTab === "studio" && (
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            <span>Quote PDF Studio (Windows + Outside CAD Drawings)</span>
          </h4>

          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <p>
              <strong>Quote PDF Studio</strong> is designed specifically for{" "}
              <strong>Windows</strong> to transform raw supplier line-lists into
              high-end customer presentations with CAD elevations.
            </p>
            <div className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Always upload the FeneVision QL (Quote List) PDF to extract
                drawings.
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                <strong>Step 1:</strong> Go to{" "}
                <span className="font-semibold text-foreground">
                  Tools → Quote PDF Studio
                </span>
                .
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                <strong>Step 2:</strong> Upload your FeneVision QL PDF. CAD
                elevations, dimensions, and window quantities are parsed
                instantly.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                <strong>Step 3:</strong> Select <em>Supply Only</em> or{" "}
                <em>Supply &amp; Install</em>, customize branding/notes, and
                click <strong>Generate Customer PDF</strong> to download!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Sealed Units & Attach Quote */}
      {activeTab === "sealed_units" && (
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Layers className="h-4 w-4 text-primary" />
            <span>Sealed Unit Calculator &amp; Attaching to Windows</span>
          </h4>

          <div className="space-y-3 text-xs text-muted-foreground">
            <p>
              Need to quote insulated glass units or attach replacement glass to
              a window order?
            </p>

            <div className="space-y-1.5 rounded-xl border border-border/80 bg-card p-3">
              <span className="font-bold text-foreground">
                1. Price the Sealed Units:
              </span>
              <p>
                Open{" "}
                <span className="font-semibold text-foreground">
                  Tools → Sealed Units
                </span>
                . Add widths, heights (fractions like <code>24 1/2</code> are
                supported), Dual/Triple pane, tempered glass, and
                installation/travel fees.
              </p>
              <p>
                Click{" "}
                <span className="font-semibold text-foreground">
                  Save Draft
                </span>{" "}
                when done.
              </p>
            </div>

            <div className="space-y-1.5 rounded-xl border border-border/80 bg-card p-3">
              <span className="font-bold text-foreground">
                2. Attach to a Window Quote:
              </span>
              <p>
                Open the{" "}
                <span className="font-semibold text-foreground">
                  Window Calculator
                </span>
                . In Row 2 of the toolbar, click{" "}
                <span className="font-semibold text-foreground">
                  Attach Quote
                </span>
                .
              </p>
              <p>
                Select your saved Sealed Unit quote. The summary ledger
                immediately merges both quotations into a clean, unified
                financial ledger with 13% HST and a single 50/50 deposit!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Calculation-Only Workflow */}
      {activeTab === "workflow" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">
                Calculation-Only Mode (Do NOT Assign Admin/Clerks)
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                We are currently operating purely in real-time estimation and
                calculation mode. Follow these guidelines:
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                <strong className="text-foreground">
                  Use &ldquo;Save Draft&rdquo;:
                </strong>{" "}
                Quotes save directly to your browser&apos;s persistent storage.
                Each quote number is saved once (updates in-place without
                duplicates).
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                <strong className="text-foreground">
                  Use &ldquo;Saved Quotes&rdquo;:
                </strong>{" "}
                Open any previous quote from the{" "}
                <FolderOpen className="mx-0.5 inline h-3.5 w-3.5 text-primary" />{" "}
                button. You can search by customer or quote # and delete old
                drafts with one click.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>
                <strong className="text-foreground">
                  Use &ldquo;Preview &amp; Print Quote&rdquo;:
                </strong>{" "}
                Click the preview button at the bottom of the calculator to
                generate and print your customer proposal.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <span>
                <strong className="text-destructive">
                  Skip &ldquo;Submit for Review&rdquo;:
                </strong>{" "}
                Do not click &ldquo;Submit for Review&rdquo; or select an Odoo
                clerk or reviewer. Estimation mode handles all pricing locally!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
