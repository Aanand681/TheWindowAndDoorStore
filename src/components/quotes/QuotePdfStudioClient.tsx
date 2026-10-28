'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuotePdfStudio } from '@/hooks/useQuotePdfStudio';
import { AppHeader } from '@/components/layout/AppHeader';
import {
  StudioUploadCard,
  StudioBrandingCard,
  StudioWindowScheduleCard,
  StudioPdfPreviewCard,
} from './pdf-studio';

export default function QuotePdfStudioClient() {
  const {
    fileInputRef,
    logoInputRef,
    user,
    quoteData,
    setQuoteData,
    loading,
    loadingStatus,
    generating,
    pdfUrl,
    isDetailsOpen,
    setIsDetailsOpen,
    handleFileUpload,
    handleGeneratePdf,
    handleModeChange,
    handleDownloadPdf,
    handleAddItem,
    handleRemoveItem,
    handleUpdateItem,
    handleImageUpload,
    handleLogoUpload,
  } = useQuotePdfStudio();

  const canAccessAdmin = Boolean(
    user?.canAccessAdmin || user?.role === 'SUPERADMIN' || user?.role === 'ADMIN'
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 relative z-10 space-y-6 sm:space-y-8">
        {/* Standard Unified Application Header */}
        <AppHeader currentPath="/quote-studio" />

        {/* Page Title & Overview */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-primary" />
            <span>Window Quote PDF Studio</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate clean customer-facing Supply or Install quote PDFs from raw supplier quote-list PDFs.
          </p>
        </div>

        {/* Workspace Layout: Left Editor / Right Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input, Controls, Window Editor */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-6">
            <StudioUploadCard
              fileInputRef={fileInputRef}
              loading={loading}
              loadingStatus={loadingStatus}
              itemCount={quoteData.items.length}
              onFileUpload={handleFileUpload}
            />

            <StudioBrandingCard
              quoteData={quoteData}
              logoInputRef={logoInputRef}
              onModeChange={handleModeChange}
              onUpdateQuoteData={setQuoteData}
              onLogoUpload={handleLogoUpload}
            />

            <StudioWindowScheduleCard
              items={quoteData.items}
              isDetailsOpen={isDetailsOpen}
              generating={generating}
              onToggleDetails={() => setIsDetailsOpen(!isDetailsOpen)}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onUpdateItem={handleUpdateItem}
              onImageUpload={handleImageUpload}
              onGeneratePdf={() => handleGeneratePdf()}
            />
          </div>

          {/* Right Column: Live PDF Preview */}
          <div className="lg:col-span-6 xl:col-span-6 sticky top-6 space-y-4">
            <StudioPdfPreviewCard
              pdfUrl={pdfUrl}
              onDownloadPdf={handleDownloadPdf}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
