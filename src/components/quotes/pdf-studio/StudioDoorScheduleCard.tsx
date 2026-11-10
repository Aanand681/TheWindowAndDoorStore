'use client';

import React from 'react';
import { DoorOpen, Sparkles, RefreshCw, Send, Check, Plus, RotateCcw } from 'lucide-react';
import { StudioDoorLine } from '@/lib/pdf-studio/door-types';
import { StudioDoorLineCard } from './StudioDoorLineCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StudioDoorScheduleCardProps {
  lines: StudioDoorLine[];
  allName: string;
  allPrice: string;
  generating: boolean;
  onSetAllName: (val: string) => void;
  onSetAllPrice: (val: string) => void;
  onApplyAll: () => void;
  onUpdateLine: (index: number, updates: Partial<StudioDoorLine>) => void;
  onRecropLine: (index: number, trimLeft: number, trimBottom: number) => void;
  onReplaceDrawing: (index: number, file: File) => void;
  onToggleSpecBold: (lineIndex: number, specIndex: number) => void;
  onUpdateSpecText: (lineIndex: number, specIndex: number, text: string) => void;
  onGeneratePdf: () => void;
  onAddLine?: () => void;
  onRemoveLine?: (index: number) => void;
  onResetTrims?: (index: number) => void;
  onResetQuote?: () => void;
}

export function StudioDoorScheduleCard({
  lines,
  allName,
  allPrice,
  generating,
  onSetAllName,
  onSetAllPrice,
  onApplyAll,
  onUpdateLine,
  onRecropLine,
  onReplaceDrawing,
  onToggleSpecBold,
  onUpdateSpecText,
  onGeneratePdf,
  onAddLine,
  onRemoveLine,
  onResetTrims,
  onResetQuote,
}: StudioDoorScheduleCardProps) {
  return (
    <Card className="bg-card/70 border-border backdrop-blur-xl shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-emerald-500" />
              <span>Door Schedule ({lines.length} lines)</span>
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onResetQuote && lines.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onResetQuote}
                className="h-8 px-2.5 text-xs font-semibold cursor-pointer gap-1 text-destructive hover:bg-destructive/10 border-border/70 shadow-xs"
                title="Reset quote & start fresh"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}

            {onAddLine && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddLine}
                className="h-8 px-2.5 text-xs font-semibold cursor-pointer gap-1 border-border/70 shadow-xs"
                title="Add a custom door line"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <span>Add Door</span>
              </Button>
            )}

            <Button
              type="button"
              onClick={onGeneratePdf}
              disabled={generating || lines.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-sm cursor-pointer h-8 text-xs"
              size="sm"
            >
              {generating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Generate Customer PDF</span>
            </Button>
          </div>
        </div>
        <CardDescription>
          Review extracted door lines, apply batch pricing, adjust canvas trims, and customize specifications.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Batch Price & Name Section */}
        <div className="p-3.5 rounded-lg bg-muted/30 border border-border/60 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Apply to All Door Lines</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5 space-y-1">
              <Label className="text-xs text-muted-foreground">Name for all lines</Label>
              <Input
                value={allName}
                onChange={e => onSetAllName(e.target.value)}
                placeholder="e.g. Standard Entry Door"
                className="bg-background/80 text-xs"
              />
            </div>

            <div className="sm:col-span-4 space-y-1">
              <Label className="text-xs text-muted-foreground">Price for all lines (CAD)</Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={allPrice}
                onChange={e => onSetAllPrice(e.target.value)}
                placeholder="e.g. 1950.00"
                className="bg-background/80 text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onApplyAll}
                disabled={lines.length === 0}
                className="w-full text-xs gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to All</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Lines List */}
        {lines.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-lg bg-muted/10">
            <DoorOpen className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No door lines extracted yet.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Upload a supplier quote PDF above to automatically load door lines and drawings.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lines.map((line, idx) => (
              <StudioDoorLineCard
                key={line.number || idx}
                line={line}
                index={idx}
                onUpdateLine={onUpdateLine}
                onRecropLine={onRecropLine}
                onReplaceDrawing={onReplaceDrawing}
                onToggleSpecBold={onToggleSpecBold}
                onUpdateSpecText={onUpdateSpecText}
                onRemoveLine={onRemoveLine}
                onResetTrims={onResetTrims}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
