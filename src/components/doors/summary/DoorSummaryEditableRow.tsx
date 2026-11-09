'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface DoorSummaryEditableRowProps {
  field: 'labour' | 'misc';
  label: string;
  amount: number;
  customVal: string;
  defaultAmount: number;
  isInstallation: boolean;
  editingField: 'labour' | 'misc' | null;
  setEditingField: (field: 'labour' | 'misc' | null) => void;
  tempEditVal: string;
  setTempEditVal: (val: string) => void;
  setter?: (val: string) => void;
  suffix?: string;
}

export function DoorSummaryEditableRow({
  field,
  label,
  amount,
  customVal,
  defaultAmount,
  isInstallation,
  editingField,
  setEditingField,
  tempEditVal,
  setTempEditVal,
  setter,
  suffix,
}: DoorSummaryEditableRowProps) {
  const isEditing = editingField === field;
  const isCustom = customVal !== '';

  if (isEditing && setter) {
    return (
      <div
        key={field}
        className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-primary/10 border border-primary/30 my-1 animate-in fade-in duration-150"
      >
        <span className="font-semibold text-primary text-[11px] shrink-0">Edit {label}:</span>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs font-mono text-muted-foreground">$</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={tempEditVal}
            onChange={(e) => setTempEditVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setter(tempEditVal);
                setEditingField(null);
                toast.success(`Updated ${label} to $${Number(tempEditVal || 0).toFixed(2)}`);
              } else if (e.key === 'Escape') {
                setEditingField(null);
              }
            }}
            className="h-6 w-24 text-xs font-mono text-right px-1.5 py-0 bg-background"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={() => {
              setter(tempEditVal);
              setEditingField(null);
              toast.success(`Updated ${label} to $${Number(tempEditVal || 0).toFixed(2)}`);
            }}
            className="h-6 px-2 text-[10px] font-bold cursor-pointer"
          >
            Save
          </Button>
          {isCustom && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setter('');
                setEditingField(null);
                toast.info(`Reset ${label} to default ($${defaultAmount.toFixed(2)})`);
              }}
              className="h-6 px-1.5 text-[10px] cursor-pointer"
              title="Reset to default calculated price"
            >
              Reset
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditingField(null)}
            className="h-6 px-1 text-[10px] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div key={field} className="flex items-center justify-between text-xs py-0.5 group">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-muted-foreground truncate">
          {label} {suffix && <span className="text-[10px] text-muted-foreground/70">{suffix}</span>}
        </span>
        {isCustom && (
          <span className="text-[9px] bg-primary/15 text-primary font-bold px-1.5 py-0.5 rounded shrink-0">
            custom
          </span>
        )}
        {isCustom && setter && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setter('');
              toast.info(`Reset ${label} to default ($${defaultAmount.toFixed(2)})`);
            }}
            className="h-5 px-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            title="Reset to default calculated price"
          >
            <RotateCcw className="w-2.5 h-2.5 mr-0.5" />
            Reset
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={cn(
            'font-mono whitespace-nowrap',
            amount === 0
              ? 'text-muted-foreground text-xs'
              : isCustom
              ? 'font-bold text-primary'
              : 'text-foreground font-medium'
          )}
        >
          ${amount.toFixed(2)}
        </span>
        {setter && isInstallation && (
          <button
            type="button"
            onClick={() => {
              setEditingField(field);
              setTempEditVal(isCustom ? customVal : amount.toFixed(2));
            }}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            title={`Edit ${label} price`}
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

