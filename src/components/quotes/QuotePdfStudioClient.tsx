'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Calculator, Component, ShieldCheck, Inbox } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import NotificationBell from '@/components/shared/NotificationBell';
import UserProfileMenu from '@/components/shared/UserProfileMenu';
import { cn } from '@/lib/utils';
import { useQuotePdfStudio } from '@/hooks/useQuotePdfStudio';
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

      <div className="max-w-[1650px] w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 relative z-10 space-y-6 sm:space-y-8">
        {/* Standard Unified Application Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity cursor-pointer group"
            title="Window & Door Store - Home / Calculator"
          >
            <Component className="w-6 h-6 transition-transform group-hover:scale-105" />
            <span className="text-xl font-semibold tracking-wider uppercase">Window &amp; Door Store</span>
          </Link>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur transition-colors cursor-pointer border-primary/40 text-primary hover:bg-primary/10'
              )}
            >
              <Calculator className="w-3.5 h-3.5 text-primary" />
              <span>Calculator</span>
            </Link>

            <Link
              href="/?tab=quotes"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur transition-colors cursor-pointer border-amber-500/40 text-amber-500 hover:bg-amber-500/10'
              )}
            >
              <Inbox className="w-3.5 h-3.5 text-amber-500" />
              <span>Quotes &amp; Bin</span>
            </Link>

            {user && canAccessAdmin && (
              <Link
                href="/admin"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'rounded-full gap-1.5 text-xs font-semibold shadow-sm'
                )}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Dashboard</span>
              </Link>
            )}

            <NotificationBell />
            <ThemeToggle />
            <UserProfileMenu user={user} />
          </div>
        </header>

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
