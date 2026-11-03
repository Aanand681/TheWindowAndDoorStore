'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Calculator,
  Layers,
  Sparkles,
  HelpCircle,
  FileCheck2,
  Bookmark,
  Printer,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EstimatorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'fenevision' | 'calculator' | 'studio' | 'sealed_units' | 'workflow';
}

export function EstimatorGuideModal({
  isOpen,
  onClose,
  defaultTab = 'fenevision',
}: EstimatorGuideModalProps) {
  const [activeTab, setActiveTab] = useState<
    'fenevision' | 'calculator' | 'studio' | 'sealed_units' | 'workflow'
  >(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-card border border-border shadow-2xl rounded-2xl flex flex-col max-h-[88vh] overflow-hidden">
        <div className="p-5 sm:p-6 pb-4 border-b border-border/70 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Estimator &amp; Quoting Workflow Guide
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Quick instructions for FeneVision PDFs, Window Calculations, Quote Studio &amp; Sealed Units.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Pills */}
          <div className="flex flex-wrap gap-1.5 mt-4 pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={() => setActiveTab('fenevision')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'fenevision'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>1. FeneVision PDFs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'calculator'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>2. Window Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('studio')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'studio'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>3. Quote PDF Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sealed_units')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'sealed_units'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>4. Sealed Units &amp; Attach</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workflow')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                activeTab === 'workflow'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>5. Save &amp; Print Policy</span>
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4 text-sm leading-relaxed flex-1 overflow-y-auto">
          {/* TAB 1: FeneVision */}
          {activeTab === 'fenevision' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                <FileCheck2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-foreground text-sm">Download the Right PDF from FeneVision</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Depending on what tool you are using, FeneVision produces two different formats:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                      A
                    </span>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-foreground">Standard Quote PDF</h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use for the <strong>Window Promo Calculator</strong>. Contains Quote #, Customer Name, and pricing columns (Base, Argon, Solar, Triple).
                  </p>
                  <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    Target: Window Calculator → Import PDF
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center">
                      B
                    </span>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-foreground">QL (Quote List) PDF</h5>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use for the <strong>Quote PDF Studio</strong>. You <em>must</em> export with the <strong>QL report format</strong> in FeneVision so CAD window diagrams are included.
                  </p>
                  <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                    Target: Tools → Quote PDF Studio
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Window Calculator */}
          {activeTab === 'calculator' && (
            <div className="space-y-4">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                <span>How to Price Windows with Promos</span>
              </h4>

              <ol className="list-decimal list-inside space-y-2.5 text-xs text-muted-foreground">
                <li className="pl-1">
                  <strong className="text-foreground">Click "Import PDF":</strong> Select your FeneVision Quote PDF in the Window Configurations toolbar. It extracts all windows, dimensions, and glass options automatically.
                </li>
                <li className="pl-1">
                  <strong className="text-foreground">Automatic Promo Applied:</strong> The engine automatically calculates the maximum customer discount (e.g. Free Triple Glass, Free Solar, Cash Back).
                </li>
                <li className="pl-1">
                  <strong className="text-foreground">Supply Only Mode:</strong> If the client is installing themselves, check <span className="font-semibold text-foreground">Supply Only</span> in Row 1. All installation labour is automatically zeroed.
                </li>
                <li className="pl-1">
                  <strong className="text-foreground">Edit Extras On-the-Fly:</strong> You can edit Jambs &amp; Casing, Labour, and Misc directly in the Promo Summary card. Click the <span className="font-semibold text-foreground">pencil icon</span> to override, or click <span className="font-semibold text-foreground">Reset</span> to restore defaults.
                </li>
                <li className="pl-1">
                  <strong className="text-foreground">No Auto-Jamb Charges:</strong> Jambs and Casings are set to <span className="font-semibold text-foreground">None</span> by default. You only pay for what you explicitly select.
                </li>
              </ol>
            </div>
          )}

          {/* TAB 3: Quote PDF Studio */}
          {activeTab === 'studio' && (
            <div className="space-y-4">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Quote PDF Studio (Windows + Outside CAD Drawings)</span>
              </h4>

              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs text-muted-foreground space-y-2">
                <p>
                  <strong>Quote PDF Studio</strong> is designed specifically for <strong>Windows</strong> to transform raw supplier line-lists into high-end customer presentations with CAD elevations.
                </p>
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Always upload the FeneVision QL (Quote List) PDF to extract drawings.</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Step 1:</strong> Go to <span className="text-foreground font-semibold">Tools → Quote PDF Studio</span>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Step 2:</strong> Upload your FeneVision QL PDF. CAD elevations, dimensions, and window quantities are parsed instantly.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Step 3:</strong> Select <em>Supply Only</em> or <em>Supply &amp; Install</em>, customize branding/notes, and click <strong>Generate Customer PDF</strong> to download!</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Sealed Units & Attach Quote */}
          {activeTab === 'sealed_units' && (
            <div className="space-y-4">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Sealed Unit Calculator &amp; Attaching to Windows</span>
              </h4>

              <div className="space-y-3 text-xs text-muted-foreground">
                <p>
                  Need to quote insulated glass units or attach replacement glass to a window order?
                </p>

                <div className="p-3 rounded-xl border border-border/80 bg-card space-y-1.5">
                  <span className="font-bold text-foreground">1. Price the Sealed Units:</span>
                  <p>
                    Open <span className="font-semibold text-foreground">Tools → Sealed Units</span>. Add widths, heights (fractions like <code>24 1/2</code> are supported), Dual/Triple pane, tempered glass, and installation/travel fees.
                  </p>
                  <p>Click <span className="font-semibold text-foreground">Save Draft</span> when done.</p>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-card space-y-1.5">
                  <span className="font-bold text-foreground">2. Attach to a Window Quote:</span>
                  <p>
                    Open the <span className="font-semibold text-foreground">Window Calculator</span>. In Row 2 of the toolbar, click <span className="font-semibold text-foreground">Attach Quote</span>.
                  </p>
                  <p>
                    Select your saved Sealed Unit quote. The summary ledger immediately merges both quotations into a clean, unified financial ledger with 13% HST and a single 50/50 deposit!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Calculation-Only Workflow */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                    Calculation-Only Mode (Do NOT Assign Admin/Clerks)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We are currently operating purely in real-time estimation and calculation mode. Follow these guidelines:
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Use "Save Draft":</strong> Quotes save directly to your browser's persistent storage. Each quote number is saved once (updates in-place without duplicates).
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Use "Saved Quotes":</strong> Open any previous quote from the <FolderOpen className="w-3.5 h-3.5 inline mx-0.5 text-primary" /> button. You can search by customer or quote # and delete old drafts with one click.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Use "Preview &amp; Print Quote":</strong> Click the preview button at the bottom of the calculator to generate and print your customer proposal.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-destructive">Skip "Submit for Review":</strong> Do not click "Submit for Review" or select an Odoo clerk or reviewer. Estimation mode handles all pricing locally!
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/70 bg-muted/20 flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">
            The Window &amp; Door Store • Estimator Suite
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs font-semibold cursor-pointer"
          >
            Close Guide
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EstimatorGuideModal;
