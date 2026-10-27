'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  UploadCloud,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  ImageIcon,
  CheckCircle2,
  Calculator,
  Component,
  ShieldCheck,
  Inbox,
  Eye,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import NotificationBell from '@/components/shared/NotificationBell';
import UserProfileMenu from '@/components/shared/UserProfileMenu';
import { cn } from '@/lib/utils';
import { cachedFetch, getCachedData } from '@/lib/client-cache';
import { toast } from 'sonner';

import { StudioQuoteData, StudioWindowItem } from '@/lib/pdf-studio/types';
import { extractSupplierQuote, rough, pretty } from '@/lib/pdf-studio/extractor';
import { generateStudioPdf } from '@/lib/pdf-studio/generator';

export default function QuotePdfStudioClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // User State for standard navigation bar
  const [user, setUser] = useState<{
    username: string;
    role: string;
    department?: string;
    departmentPermissions?: any;
    customPermissions?: any;
    permissions?: any;
    canAccessAdmin?: boolean;
  } | null>(() => getCachedData<any>('/api/profile') || null);

  useEffect(() => {
    cachedFetch<any>('/api/profile')
      .then(data => {
        if (data) setUser(data);
      })
      .catch(() => { });
  }, []);

  // Studio Quote State
  const [quoteData, setQuoteData] = useState<StudioQuoteData>({
    quoteNumber: '',
    customerName: '',
    companyName: 'The Window & Door Store',
    address: '305 Kirsti Pl\nHWY 11/71 W\nFort Frances, ON P9A 3V9\nPH: 1 807 274-0302',
    logoDataUrl: null,
    mode: 'supply',
    items: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('Customer-Quote.pdf');
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Generate clean filename format: (firstname lastname quote#) with spaces and no hyphens
  const getCleanPdfFileName = (data: StudioQuoteData) => {
    const cust = (data.customerName || 'Customer').trim();
    const quote = (data.quoteNumber || '').trim();
    const parts = [cust, quote].filter(Boolean);
    return `${parts.join(' ')}.pdf`;
  };

  // Handle PDF file upload & extraction
  const handleFileUpload = async (file: File) => {
    if (!file || (file.type !== 'application/pdf' && !file.name.endsWith('.pdf'))) {
      toast.error('Please upload a valid PDF quote-list file.');
      return;
    }

    setLoading(true);
    setLoadingStatus('Reading supplier quote PDF…');

    try {
      const extracted = await extractSupplierQuote(file, status => {
        setLoadingStatus(status);
      });

      const updatedData: StudioQuoteData = {
        ...quoteData,
        quoteNumber: extracted.quoteNumber || quoteData.quoteNumber,
        customerName: extracted.customerName || quoteData.customerName,
        items: extracted.items,
      };

      setQuoteData(updatedData);
      setPdfFileName(getCleanPdfFileName(updatedData));

      toast.success(`Successfully extracted ${extracted.items.length} window items with CAD drawings!`);

      // Auto-generate preview immediately
      setGenerating(true);
      const pdfBytes = await generateStudioPdf(updatedData);

      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const newUrl = URL.createObjectURL(blob);
      setPdfUrl(newUrl);
    } catch (err: any) {
      console.error('PDF extraction failed:', err);
      toast.error(err.message || 'Failed to extract quote from PDF');
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  // Re-generate PDF
  const handleGeneratePdf = async (customData?: StudioQuoteData) => {
    const dataToUse = customData || quoteData;
    if (!dataToUse.items.length) {
      toast.error('Please upload a PDF or add at least one window item first.');
      return;
    }

    setGenerating(true);
    try {
      const pdfBytes = await generateStudioPdf(dataToUse);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const newUrl = URL.createObjectURL(blob);
      setPdfUrl(newUrl);

      setPdfFileName(getCleanPdfFileName(dataToUse));
      toast.success('Clean customer PDF generated successfully!');
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      toast.error(err.message || 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  // Auto-regenerate when clicking Supply vs Install Quote mode
  const handleModeChange = async (newMode: 'supply' | 'install') => {
    const updated = { ...quoteData, mode: newMode };
    setQuoteData(updated);
    if (updated.items.length) {
      await handleGeneratePdf(updated);
    }
  };

  // Download PDF
  const handleDownloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = pdfFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Add new blank window item
  const handleAddItem = () => {
    const nextId = String(quoteData.items.length + 1);
    setQuoteData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: nextId,
          name: 'New Window',
          qty: '1',
          fr: '',
          bm: '',
          ro: '',
          price: '',
          options: '',
          child: false,
          image: null,
        },
      ],
    }));
  };

  // Remove window item
  const handleRemoveItem = (index: number) => {
    setQuoteData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Update item field
  const handleUpdateItem = (index: number, field: keyof StudioWindowItem, value: any) => {
    setQuoteData(prev => {
      const updated = [...prev.items];
      const cur = { ...updated[index], [field]: value };

      // Auto-recalc rough opening if frame size changes
      if (field === 'fr') {
        cur.ro = rough(value);
      }

      updated[index] = cur;
      return { ...prev, items: updated };
    });
  };

  // Replace item image
  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleUpdateItem(index, 'image', reader.result);
        toast.success(`Drawing updated for Window ${quoteData.items[index]?.id || index + 1}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Custom Logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setQuoteData(prev => ({ ...prev, logoDataUrl: reader.result as string }));
        toast.success('Custom company logo loaded!');
      }
    };
    reader.readAsDataURL(file);
  };

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
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur transition-colors cursor-pointer border-primary/40 text-primary hover:bg-primary/10"
              )}
            >
              <Calculator className="w-3.5 h-3.5 text-primary" />
              <span>Calculator</span>
            </Link>

            <Link
              href="/?tab=quotes"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur transition-colors cursor-pointer border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
              )}
            >
              <Inbox className="w-3.5 h-3.5 text-amber-500" />
              <span>Quotes &amp; Bin</span>
            </Link>

            {user && (user.role === 'SUPERADMIN' || user.role === 'ADMIN' || user.permissions?.canAccessAdmin || (user as any).canAccessAdmin) && (
              <Link
                href="/admin"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full gap-1.5 text-xs font-semibold shadow-sm")}
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
            {/* Step 1: Upload Supplier PDF */}
            <Card className="bg-card/70 border-border backdrop-blur-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <CardTitle className="text-base font-semibold">Upload Supplier Quote-List PDF</CardTitle>
                  </div>
                  {quoteData.items.length > 0 && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-500 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {quoteData.items.length} items extracted
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
                    if (f) handleFileUpload(f);
                  }}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${loading
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

            {/* Step 2: Quote Mode & Branding */}
            <Card className="bg-card/70 border-border backdrop-blur-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <CardTitle className="text-base font-semibold">Quote Type &amp; Branding</CardTitle>
                </div>
                <CardDescription>Configure customer quote presentation and header branding.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quote Type Toggle */}
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Quote Presentation Mode
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleModeChange('supply')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${quoteData.mode === 'supply'
                          ? 'border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary'
                          : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
                        }`}
                    >
                      <div className="font-semibold text-sm">Supply Quote</div>
                      <div className="text-xs opacity-80 mt-0.5">
                        Shows FR, BM (if present), and R/O (+1&quot;) on parents
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleModeChange('install')}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${quoteData.mode === 'install'
                          ? 'border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary'
                          : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
                        }`}
                    >
                      <div className="font-semibold text-sm">Install Quote</div>
                      <div className="text-xs opacity-80 mt-0.5">
                        Keeps SIZE column blank for site measure verification
                      </div>
                    </button>
                  </div>
                </div>

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Customer Reference</Label>
                    <Input
                      value={quoteData.customerName}
                      onChange={e => setQuoteData(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="e.g. Simeon Nussbaumer"
                      className="bg-background/80"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Quote Number</Label>
                    <Input
                      value={quoteData.quoteNumber}
                      onChange={e => setQuoteData(prev => ({ ...prev, quoteNumber: e.target.value }))}
                      placeholder="e.g. 401729"
                      className="bg-background/80"
                    />
                  </div>
                </div>

                {/* Company & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Company Name</Label>
                    <Input
                      value={quoteData.companyName}
                      onChange={e => setQuoteData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="bg-background/80"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Custom Logo (Auto-loads from /public/images/logo.png)</Label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full text-xs gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-primary" />
                        <span>{quoteData.logoDataUrl ? 'Change Custom Logo' : 'Upload Custom Logo'}</span>
                      </Button>
                      {quoteData.logoDataUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuoteData(prev => ({ ...prev, logoDataUrl: null }))}
                          className="text-xs text-destructive hover:bg-destructive/10"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Address / Contact Block</Label>
                  <Textarea
                    rows={3}
                    value={quoteData.address}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setQuoteData(prev => ({ ...prev, address: e.target.value }))
                    }
                    className="bg-background/80 text-xs font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Interactive Window Items */}
            <Card className="bg-card/70 border-border backdrop-blur-xl shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <CardTitle className="text-base font-semibold">
                      Window Schedule &amp; Drawings ({quoteData.items.length})
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                      className="text-xs cursor-pointer"
                    >
                      {isDetailsOpen ? 'Collapse' : 'Expand'}
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleAddItem}
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
                  {quoteData.items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                      No window items yet. Upload a supplier PDF or click &ldquo;Add Window&rdquo;.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                      {quoteData.items.map((item, idx) => (
                        <div
                          key={idx}
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
                              onClick={() => handleRemoveItem(idx)}
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
                                onChange={e => handleUpdateItem(idx, 'id', e.target.value)}
                                className="h-8 text-xs bg-background/80"
                              />
                            </div>
                            <div className="space-y-1 col-span-2 sm:col-span-2">
                              <Label className="text-[11px] text-muted-foreground">Description</Label>
                              <Input
                                value={item.name}
                                onChange={e => handleUpdateItem(idx, 'name', e.target.value)}
                                className="h-8 text-xs bg-background/80"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[11px] text-muted-foreground">Quantity</Label>
                              <Input
                                value={item.qty}
                                onChange={e => handleUpdateItem(idx, 'qty', e.target.value)}
                                className="h-8 text-xs bg-background/80"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] text-muted-foreground">FR Size (Frame)</Label>
                              <Input
                                value={item.fr}
                                onChange={e => handleUpdateItem(idx, 'fr', e.target.value)}
                                placeholder="48 X 22"
                                className="h-8 text-xs bg-background/80"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] text-muted-foreground">BM Size (Brickmould)</Label>
                              <Input
                                value={item.bm}
                                onChange={e => handleUpdateItem(idx, 'bm', e.target.value)}
                                placeholder="Optional"
                                className="h-8 text-xs bg-background/80"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] text-muted-foreground">R/O Size (+1&quot;)</Label>
                              <Input
                                value={item.ro}
                                onChange={e => handleUpdateItem(idx, 'ro', e.target.value)}
                                placeholder="49 X 23"
                                className="h-8 text-xs bg-background/80"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-[11px] text-muted-foreground">Total / List ($)</Label>
                              <Input
                                value={item.price}
                                onChange={e => handleUpdateItem(idx, 'price', e.target.value)}
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
                                onChange={e => handleUpdateItem(idx, 'options', e.target.value)}
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
                                    handleUpdateItem(idx, 'options', e.target.value)
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
                                    onChange={e => handleImageUpload(idx, e)}
                                  />
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Generate Button at bottom of editor */}
                  <div className="pt-2">
                    <Button
                      onClick={() => handleGeneratePdf()}
                      disabled={generating || !quoteData.items.length}
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
          </div>

          {/* Right Column: Live PDF Preview */}
          <div className="lg:col-span-6 xl:col-span-6 sticky top-6 space-y-4">
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
                      onClick={handleDownloadPdf}
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
          </div>
        </div>
      </div>
    </div>
  );
}
