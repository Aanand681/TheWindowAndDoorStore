'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckSquare, Square } from 'lucide-react';
import { StudioDoorSpec } from '@/lib/pdf-studio/door-types';
import { Input } from '@/components/ui/input';

interface StudioDoorSpecListProps {
  specs: StudioDoorSpec[];
  onToggleBold: (specIndex: number) => void;
  onUpdateText: (specIndex: number, text: string) => void;
}

export function StudioDoorSpecList({
  specs,
  onToggleBold,
  onUpdateText,
}: StudioDoorSpecListProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border/70 rounded-lg overflow-hidden bg-muted/20">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-muted/40 hover:bg-muted/60 transition-colors text-left cursor-pointer"
      >
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span>Door Specifications ({specs.length} items)</span>
        </span>
        <span className="text-[11px] text-muted-foreground">
          {isOpen ? 'Click to collapse' : 'Click to edit lines & toggle bold'}
        </span>
      </button>

      {isOpen && (
        <div className="p-3 space-y-2 max-h-96 overflow-y-auto divide-y divide-border/40">
          <p className="text-[11px] text-muted-foreground pb-1">
            Check <strong>Bold</strong> to emphasize any specification line in the generated customer PDF:
          </p>
          {specs.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2 pt-2 first:pt-0">
              <button
                type="button"
                onClick={() => onToggleBold(idx)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                  s.bold
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                title="Toggle bold for this line"
              >
                {s.bold ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                <span>Bold</span>
              </button>

              <Input
                value={s.text}
                onChange={e => onUpdateText(idx, e.target.value)}
                className={`h-8 text-xs bg-background/80 flex-1 ${s.bold ? 'font-bold text-foreground' : ''}`}
                placeholder="Specification text"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

