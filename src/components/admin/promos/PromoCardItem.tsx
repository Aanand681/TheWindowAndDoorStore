'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PromoType } from './types';
import { GripVertical, ChevronUp, ChevronDown, Power, Trash2 } from 'lucide-react';

interface PromoCardItemProps {
  promo: PromoType;
  index: number;
  totalPromos: number;
  draggedIndex: number | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
  isSuperAdmin: boolean;
}

export function PromoCardItem({
  promo,
  index,
  totalPromos,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMove,
  onToggleActive,
  onDelete,
  isSuperAdmin,
}: PromoCardItemProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`p-5 rounded-xl border transition-all duration-200 ${
        draggedIndex === index ? 'opacity-40 border-primary scale-[0.98]' : ''
      } ${
        promo.isActive ? 'bg-primary/5 border-primary/30 shadow-lg' : 'bg-card/30 border-border opacity-70 grayscale'
      }`}
    >
      <div className="flex justify-between items-start mb-4 gap-2">
        <div className="flex items-start gap-2.5">
          {/* Reordering Grip & Arrows */}
          <div className="flex items-center gap-1 bg-muted/60 border border-border/80 rounded-lg p-1">
            <div
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-background/80 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                disabled={index === 0}
                onClick={() => onMove(index, 'up')}
                title="Move up in order"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-background/80 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                disabled={index === totalPromos - 1}
                onClick={() => onMove(index, 'down')}
                title="Move down in order"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                #{index + 1}
              </span>
              <h3 className="text-lg font-bold flex items-center gap-2">
                {promo.name}
                {promo.isActive && (
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    Live
                  </span>
                )}
              </h3>
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md inline-block mt-1.5 uppercase tracking-widest">
              {promo.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={promo.isActive ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onToggleActive(promo._id, promo.isActive)}
            className={promo.isActive ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
          >
            <Power className="w-4 h-4 mr-1.5" />
            {promo.isActive ? 'Turn Off' : 'Turn On'}
          </Button>
          {isSuperAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(promo._id)}
              className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg border border-border/50">
        {promo.type === 'BOGO' && <span>Buy {promo.buyQty}, Get {promo.getQty} Free (cheapest items).</span>}
        {promo.type === 'FREE_PARTS' && <span>Free components: {promo.freeComponents?.join(', ')}.</span>}
        {promo.type === 'PERCENTAGE' && <span>{promo.discountPercentage}% off base price.</span>}
        {promo.type === 'COMBO' && (
          <span>
            Free {promo.freeComponents?.join(', ')} <br />
            <span className="text-primary font-medium">PLUS</span> {promo.discountPercentage}% off
            {promo.applyPercentageAfterFreeParts ? ' (applied after parts deduction).' : ' (applied to total base).'}
          </span>
        )}
      </div>
    </div>
  );
}

