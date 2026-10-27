'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Component, FileUp, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UIWindowItem } from '@/hooks/useCalculatorWindows';

export interface WindowConfigurationsCardProps {
  windows: UIWindowItem[];
  surchargeRate: number;
  quoteNumber: string;
  setQuoteNumber: (val: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePdfImportClick: () => void;
  isReadOnly: boolean;
  handleWindowChange: (id: string, field: keyof UIWindowItem, value: string) => void;
  handleRemoveWindow: (id: string) => void;
  handleAddWindow: () => void;
  windowEndRef: React.RefObject<HTMLDivElement | null>;
  isSupplyOnly?: boolean;
  setIsSupplyOnly?: (val: boolean) => void;
}

export function WindowConfigurationsCard({
  windows,
  surchargeRate,
  quoteNumber,
  setQuoteNumber,
  customerName,
  setCustomerName,
  fileInputRef,
  handlePdfUpload,
  handlePdfImportClick,
  isReadOnly,
  handleWindowChange,
  handleRemoveWindow,
  handleAddWindow,
  windowEndRef,
  isSupplyOnly,
  setIsSupplyOnly,
}: WindowConfigurationsCardProps) {
  return (
    <Card className="bg-card/50 border-border backdrop-blur-xl shadow-2xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Component className="w-5 sm:w-6 h-5 sm:h-6 text-primary shrink-0" />
            <span>Window Configurations</span>
          </CardTitle>
          <CardDescription className="mt-1 text-xs sm:text-sm">
            Enter the base prices and upgrade components for each window.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 bg-muted/50 p-1.5 sm:p-2 rounded-xl border border-border/50 w-full sm:w-auto justify-between sm:justify-start">
          {setIsSupplyOnly && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/70 bg-background/60 hover:bg-background transition-colors cursor-pointer select-none">
              <Checkbox
                id="supplyOnlyToggle"
                disabled={isReadOnly}
                checked={isSupplyOnly}
                onCheckedChange={(checked) => setIsSupplyOnly(!!checked)}
              />
              <Label
                htmlFor="supplyOnlyToggle"
                className="text-xs font-semibold cursor-pointer whitespace-nowrap select-none text-foreground"
              >
                Supply Only
              </Label>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,application/pdf"
            hidden
            ref={fileInputRef as any}
            onChange={handlePdfUpload}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePdfImportClick}
            disabled={isReadOnly}
            className="whitespace-nowrap shadow-sm h-9 px-3 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <FileUp className="w-4 h-4 mr-1.5" />
            Import PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/20 border-t border-border">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Quote/Order Number
            </Label>
            <Input
              disabled={isReadOnly}
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              placeholder="e.g. 400820"
              className="bg-background shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Customer Name
            </Label>
            <Input
              disabled={isReadOnly}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Jason Schram"
              className="bg-background shadow-sm"
            />
          </div>
        </div>
        <div className="w-full max-h-[600px] overflow-auto border-t border-border">
          <div className="text-[11px] text-muted-foreground/80 md:hidden px-4 py-2 bg-muted/30 border-b border-border/40 flex items-center justify-between font-medium">
            <span>← Swipe table horizontally to edit all panes &amp; prices →</span>
          </div>
          <div className="min-w-[800px] p-6">
            <div className="grid grid-cols-12 gap-4 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
              <div className="col-span-1">Seq</div>
              <div className="col-span-1">Qty</div>
              <div className="col-span-2">Base Total</div>
              <div className="col-span-2">Argon Total</div>
              <div className="col-span-2">Solar Total</div>
              <div className="col-span-2">Triple Pane Total</div>
              <div className="col-span-2 text-right">Finish &amp; Actions</div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {windows.map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="grid grid-cols-12 gap-4 items-center bg-muted/30 p-2 rounded-xl border border-border/80 transition-colors hover:border-border"
                  >
                    <div className="col-span-1 pl-3 font-mono text-muted-foreground">{i + 1}</div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min="1"
                        disabled={isReadOnly}
                        value={w.qty}
                        onChange={(e) => handleWindowChange(w.id, 'qty', e.target.value)}
                        className="bg-background h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="col-span-2 relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        disabled={isReadOnly}
                        value={w.base}
                        onChange={(e) => handleWindowChange(w.id, 'base', e.target.value)}
                        className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="col-span-2 relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        disabled={isReadOnly}
                        value={w.argon}
                        onChange={(e) => handleWindowChange(w.id, 'argon', e.target.value)}
                        className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="col-span-2 relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        disabled={isReadOnly}
                        value={w.solar}
                        onChange={(e) => handleWindowChange(w.id, 'solar', e.target.value)}
                        className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="col-span-2 relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        disabled={isReadOnly}
                        value={w.triple}
                        onChange={(e) => handleWindowChange(w.id, 'triple', e.target.value)}
                        className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1.5 sm:gap-2 pr-2">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() =>
                          handleWindowChange(
                            w.id,
                            'color',
                            w.color === 'Painted' ? 'White' : 'Painted'
                          )
                        }
                        title="Click to toggle between White and Painted"
                        className={cn(
                          'text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap select-none',
                          w.color === 'Painted'
                            ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/25'
                            : 'bg-muted text-foreground border-border hover:bg-muted/80'
                        )}
                      >
                        {w.color === 'Painted' ? '🎨 Painted' : '⬜ White'}
                      </button>
                      {!isReadOnly ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors h-8 w-8 shrink-0"
                          onClick={() => handleRemoveWindow(w.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground italic pr-2">Locked</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={windowEndRef as any} />
            </div>
          </div>
        </div>
        {!isReadOnly && (
          <div className="p-6 border-t border-border bg-muted/10 rounded-b-xl flex justify-center sm:justify-start">
            <Button onClick={handleAddWindow} className="shadow-lg w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Window Manually
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WindowConfigurationsCard;
