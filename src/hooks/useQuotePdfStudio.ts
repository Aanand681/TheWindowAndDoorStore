'use client';

import { useState, useRef, useEffect } from 'react';
import { StudioQuoteData, StudioWindowItem } from '@/lib/pdf-studio/types';
import { extractSupplierQuote, rough } from '@/lib/pdf-studio/extractor';
import { generateStudioPdf } from '@/lib/pdf-studio/generator';
import { cachedFetch, getCachedData } from '@/lib/client-cache';
import { toast } from 'sonner';

export function useQuotePdfStudio() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // User State for navigation / permissions
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
      .catch(() => {});
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

  return {
    fileInputRef,
    logoInputRef,
    user,
    quoteData,
    setQuoteData,
    loading,
    loadingStatus,
    generating,
    pdfUrl,
    pdfFileName,
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
  };
}
