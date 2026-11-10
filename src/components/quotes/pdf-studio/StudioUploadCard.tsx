'use client';

import React from 'react';
import { UploadCloud, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StudioUploadCardProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  loading: boolean;
  loadingStatus: string;
  itemCount: number;
  onFileUpload: (file: File) => void;
  onReset?: () => void;
}

export function StudioUploadCard({
  fileInputRef,
  loading,
  loadingStatus,
  itemCount,
  onFileUpload,
  onReset,
}: StudioUploadCardProps) {
  return (
    <Card className="bg-card/70 border-border backdrop-blur-xl shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              1
            </span>
            <CardTitle className="text-base font-semibold">Upload Supplier Quote-List PDF</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {itemCount > 0 && (
              <span className="text-xs bg-emerald-500/10 text-emerald-500 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {itemCount} items extracted
              </span>
            )}
            {itemCount > 0 && onReset && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReset}
                className="h-7 px-2 text-xs font-semibold cursor-pointer gap-1 text-destructive hover:bg-destructive/10 border-border/70 shadow-xs"
                title="Reset quote & start fresh"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Upload the raw manufacturer/supplier PDF. Text and CAD diagrams will be auto-extracted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) onFileUpload(f);
          }}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) onFileUpload(f);
          }}
          className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            loading
              ? 'border-primary/50 bg-primary/5 cursor-wait'
              : 'border-border/80 hover:border-primary/60 hover:bg-muted/30 bg-background/50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
            <UploadCloud className={`w-6 h-6 ${loading ? 'animate-bounce' : ''}`} />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {loading ? 'Processing Supplier PDF…' : 'Click to upload or drag & drop quote PDF'}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {loading ? loadingStatus : 'Supports raw Inkster Park Millwork Quote-List PDFs.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
