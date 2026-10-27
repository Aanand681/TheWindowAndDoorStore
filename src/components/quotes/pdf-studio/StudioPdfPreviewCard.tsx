'use client';

import React from 'react';
import { Eye, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StudioPdfPreviewCardProps {
  pdfUrl: string | null;
  onDownloadPdf: () => void;
}

export function StudioPdfPreviewCard({
  pdfUrl,
  onDownloadPdf,
}: StudioPdfPreviewCardProps) {
  return (
    <Card className="bg-card/70 border-border backdrop-blur-xl shadow-md overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-semibold">Live PDF Preview</CardTitle>
          </div>
          {pdfUrl && (
            <Button
              size="sm"
              onClick={onDownloadPdf}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 h-8 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="Clean Customer PDF Preview"
            className="w-full h-[780px] border-0 bg-zinc-100 dark:bg-zinc-900"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[520px] text-center p-8 text-muted-foreground">
            <FileText className="w-16 h-16 text-muted-foreground/30 mb-3" />
            <p className="font-semibold text-base text-foreground">No PDF Generated Yet</p>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Upload your supplier quote-list PDF on the left. The clean customer version will render here
              in real-time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
