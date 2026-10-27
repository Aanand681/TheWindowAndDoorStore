'use client';

import React from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface StudioUploadCardProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  loading: boolean;
  loadingStatus: string;
  itemCount: number;
  onFileUpload: (file: File) => void;
}

export function StudioUploadCard({
  fileInputRef,
  loading,
  loadingStatus,
  itemCount,
  onFileUpload,
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
          {itemCount > 0 && (
            <span className="text-xs bg-emerald-500/10 text-emerald-500 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {itemCount} items extracted
            </span>
          )}
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
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            loading
              ? 'border-primary bg-primary/5 animate-pulse'
              : 'border-border/80 hover:border-primary/50 hover:bg-muted/30'
          }`}
        >
          <UploadCloud className="w-10 h-10 text-primary/70 mx-auto mb-2" />
          <p className="font-medium text-sm">
            {loading ? loadingStatus : 'Click to select or drag & drop supplier PDF here'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Extracts Quote #, Customer Name, Window Sizes, Options, and Outside CAD Drawings
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
