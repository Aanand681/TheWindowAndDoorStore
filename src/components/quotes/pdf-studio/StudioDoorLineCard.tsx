'use client';

import React, { useRef } from 'react';
import { Upload, SlidersHorizontal, DoorClosed, Trash2, RotateCcw } from 'lucide-react';
import { StudioDoorLine } from '@/lib/pdf-studio/door-types';
import { StudioDoorSpecList } from './StudioDoorSpecList';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface StudioDoorLineCardProps {
  line: StudioDoorLine;
  index: number;
  onUpdateLine: (index: number, updates: Partial<StudioDoorLine>) => void;
  onRecropLine: (index: number, trimLeft: number, trimBottom: number) => void;
  onReplaceDrawing: (index: number, file: File) => void;
  onToggleSpecBold: (lineIndex: number, specIndex: number) => void;
  onUpdateSpecText: (lineIndex: number, specIndex: number, text: string) => void;
  onRemoveLine?: (index: number) => void;
  onResetTrims?: (index: number) => void;
}

export function StudioDoorLineCard({
  line,
  index,
  onUpdateLine,
  onRecropLine,
  onReplaceDrawing,
  onToggleSpecBold,
  onUpdateSpecText,
  onRemoveLine,
  onResetTrims,
}: StudioDoorLineCardProps) {
  const replaceInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="bg-card/90 border-border/70 shadow-sm overflow-hidden">
      <div className="bg-muted/40 px-4 py-2 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DoorClosed className="w-4 h-4 text-emerald-500" />
          <span className="font-bold text-sm text-foreground">Line {line.number}</span>
          {line.qty && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-mono">
              Qty: {line.qty}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {line.price ? (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              CAD ${line.price}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">No price set</span>
          )}
          {onRemoveLine && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemoveLine(index)}
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              title={`Remove Line ${line.number}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Name and Price Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Name right of image (optional)</Label>
            <Input
              value={line.name || ''}
              onChange={e => onUpdateLine(index, { name: e.target.value })}
              placeholder="e.g. Front Entry Door"
              className="bg-background/80 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Price (CAD)</Label>
            <Input
              type="number"
              step="any"
              min="0"
              value={line.price || ''}
              onChange={e => onUpdateLine(index, { price: e.target.value })}
              placeholder="e.g. 1850.00"
              className="bg-background/80 text-xs font-mono"
            />
          </div>
        </div>

        {/* Drawing & Trimming Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start bg-muted/20 p-3 rounded-lg border border-border/50">
          {/* Drawing Preview */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center min-h-[140px] bg-background/80 border border-border/60 rounded-md p-2">
            {line.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={line.image}
                alt={`Door ${line.number} drawing`}
                className="max-h-40 max-w-full object-contain"
              />
            ) : (
              <div className="text-xs text-muted-foreground text-center py-6">
                No elevation drawing extracted
              </div>
            )}
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) onReplaceDrawing(index, file);
              }}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => replaceInputRef.current?.click()}
              className="w-full mt-2 text-xs gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3 text-muted-foreground" />
              <span>Replace Drawing</span>
            </Button>
          </div>

          {/* Controls: Visual Trimming & Glass Style */}
          <div className="sm:col-span-7 space-y-3">
            {(line.rawCanvas || line.raw) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Visual Canvas Trimming</span>
                  </div>
                  {onResetTrims && (
                    <button
                      type="button"
                      onClick={() => onResetTrims(index)}
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                      title="Reset trims to default"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Trim</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Trim Left (pt)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={line.trimLeft}
                      onChange={e => onRecropLine(index, Number(e.target.value) || 0, line.trimBottom)}
                      className="h-8 text-xs bg-background/80 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Trim Bottom (pt)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={line.trimBottom}
                      onChange={e => onRecropLine(index, line.trimLeft, Number(e.target.value) || 0)}
                      className="h-8 text-xs bg-background/80 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-medium">Glass Style (shown in PDF Glass Box)</Label>
              <Textarea
                rows={2}
                value={line.glass || ''}
                onChange={e => onUpdateLine(index, { glass: e.target.value })}
                placeholder="e.g. Thermal Double Glazed Sandblasted"
                className="bg-background/80 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Specifications List */}
        <StudioDoorSpecList
          specs={line.spec}
          onToggleBold={specIdx => onToggleSpecBold(index, specIdx)}
          onUpdateText={(specIdx, text) => onUpdateSpecText(index, specIdx, text)}
        />
      </CardContent>
    </Card>
  );
}
