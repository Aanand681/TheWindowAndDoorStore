'use client';

import React from 'react';
import { Trash2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StudioWindowItem } from '@/lib/pdf-studio/types';

interface StudioWindowItemRowProps {
  item: StudioWindowItem;
  idx: number;
  onUpdateItem: (index: number, field: keyof StudioWindowItem, value: any) => void;
  onRemoveItem: (index: number) => void;
  onImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StudioWindowItemRow({
  item,
  idx,
  onUpdateItem,
  onRemoveItem,
  onImageUpload,
}: StudioWindowItemRowProps) {
  return (
    <div
      className={`rounded-xl border transition-all ${
        item.child
          ? 'bg-muted/15 border-border/40 ml-5 p-2.5 -mt-3 space-y-1'
          : 'bg-card/90 border-border/80 shadow-sm p-3.5'
      }`}
    >
      {/* Row Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground">
            Window {item.id || idx + 1}
          </span>
          {item.child && (
            <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              Child unit
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemoveItem(idx)}
          className="text-destructive hover:bg-destructive/10 text-xs h-7 px-2"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Remove
        </Button>
      </div>

      {/* Dimensions & Fields Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Item #</Label>
          <Input
            value={item.id}
            onChange={e => onUpdateItem(idx, 'id', e.target.value)}
            className="h-8 text-xs bg-background/80"
          />
        </div>
        <div className="space-y-1 col-span-2 sm:col-span-2">
          <Label className="text-[11px] text-muted-foreground">Description</Label>
          <Input
            value={item.name}
            onChange={e => onUpdateItem(idx, 'name', e.target.value)}
            className="h-8 text-xs bg-background/80"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Quantity</Label>
          <Input
            value={item.qty}
            onChange={e => onUpdateItem(idx, 'qty', e.target.value)}
            className="h-8 text-xs bg-background/80"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">FR Size (Frame)</Label>
          <Input
            value={item.fr}
            onChange={e => onUpdateItem(idx, 'fr', e.target.value)}
            placeholder="48 X 22"
            className="h-8 text-xs bg-background/80"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">BM Size (Brickmould)</Label>
          <Input
            value={item.bm}
            onChange={e => onUpdateItem(idx, 'bm', e.target.value)}
            placeholder="Optional"
            className="h-8 text-xs bg-background/80"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">R/O Size (+1&quot;)</Label>
          <Input
            value={item.ro}
            onChange={e => onUpdateItem(idx, 'ro', e.target.value)}
            placeholder="49 X 23"
            className="h-8 text-xs bg-background/80"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Total / List ($)</Label>
          <Input
            value={item.price}
            onChange={e => onUpdateItem(idx, 'price', e.target.value)}
            placeholder="823.84"
            className="h-8 text-xs bg-background/80 font-mono"
          />
        </div>
      </div>

      {/* Options & CAD Drawing */}
      {item.child ? (
        <div className="space-y-1 mt-2">
          <Label className="text-[11px] text-muted-foreground">Options &amp; Performance</Label>
          <Input
            value={item.options}
            onChange={e => onUpdateItem(idx, 'options', e.target.value)}
            className="h-8 text-xs bg-background/80"
            placeholder="Child unit options..."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-3 items-center">
          <div className="sm:col-span-8 space-y-1">
            <Label className="text-[11px] text-muted-foreground">Options &amp; Performance</Label>
            <Textarea
              rows={2}
              value={item.options}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onUpdateItem(idx, 'options', e.target.value)
              }
              className="text-xs bg-background/80"
            />
          </div>

          {/* Drawing Preview & Upload */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center p-2 rounded-lg bg-muted/20 border border-border/40">
            {item.image ? (
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt="CAD drawing"
                  className="max-h-20 max-w-full object-contain mx-auto bg-white p-1 rounded border shadow-xs"
                />
                <span className="text-[10px] text-muted-foreground block mt-1">Outside view</span>
              </div>
            ) : (
              <div className="text-center py-2 text-muted-foreground text-xs">
                <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-40" />
                <span>No drawing</span>
              </div>
            )}

            <label className="mt-1 text-[11px] text-primary hover:underline cursor-pointer flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>{item.image ? 'Replace' : 'Upload drawing'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={e => onImageUpload(idx, e)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
