'use client';

import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StudioWindowItem } from '@/lib/pdf-studio/types';
import { StudioWindowItemRow } from './StudioWindowItemRow';

interface StudioWindowScheduleCardProps {
  items: StudioWindowItem[];
  isDetailsOpen: boolean;
  generating: boolean;
  onToggleDetails: () => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof StudioWindowItem, value: any) => void;
  onImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
  onGeneratePdf: () => void;
}

export function StudioWindowScheduleCard({
  items,
  isDetailsOpen,
  generating,
  onToggleDetails,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onImageUpload,
  onGeneratePdf,
}: StudioWindowScheduleCardProps) {
  return (
    <Card className="bg-card/70 border-border backdrop-blur-xl shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              3
            </span>
            <CardTitle className="text-base font-semibold">
              Window Schedule &amp; Drawings ({items.length})
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleDetails}
              className="text-xs cursor-pointer"
            >
              {isDetailsOpen ? 'Collapse' : 'Expand'}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onAddItem}
              className="text-xs gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Window</span>
            </Button>
          </div>
        </div>
        <CardDescription>
          Review and edit extracted window dimensions, options, prices, and CAD drawings.
        </CardDescription>
      </CardHeader>

      {isDetailsOpen && (
        <CardContent className="space-y-4 pt-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
              No window items yet. Upload a supplier PDF or click &ldquo;Add Window&rdquo;.
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <StudioWindowItemRow
                  key={idx}
                  item={item}
                  idx={idx}
                  onUpdateItem={onUpdateItem}
                  onRemoveItem={onRemoveItem}
                  onImageUpload={onImageUpload}
                />
              ))}
            </div>
          )}

          {/* Generate Button at bottom of editor */}
          <div className="pt-2">
            <Button
              onClick={onGeneratePdf}
              disabled={generating || !items.length}
              className="w-full gap-2 shadow-md cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating PDF…</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Update &amp; Re-generate PDF</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
