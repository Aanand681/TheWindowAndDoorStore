'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { StudioDoorQuoteData, StudioDoorLine } from '@/lib/pdf-studio/door-types';
import { extractDoorQuoteFromPdf } from '@/lib/pdf-studio/door-extractor';
import { generateStudioDoorPdf } from '@/lib/pdf-studio/door-generator';
import { recropDoorLineDrawing, DEFAULT_TRIM_LEFT, DEFAULT_TRIM_BOTTOM } from '@/lib/pdf-studio/door-canvas-crop';
import { toast } from 'sonner';

const INITIAL_DOOR_QUOTE: StudioDoorQuoteData = {
  quoteNumber: '',
  customerName: '',
  companyName: 'The Window & Door Store',
  address: '305 Kirsti Pl\nHWY 11/71 W\nFort Frances, ON P9A 3V9\nPH: 1 807 274-0302',
  logoDataUrl: null,
  makerLogo: null,
  mode: 'supply',
  jobComments: '',
  lines: [],
};

export function useDoorPdfStudio() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [doorQuoteData, setDoorQuoteData] = useState<StudioDoorQuoteData>(INITIAL_DOOR_QUOTE);
  const [allName, setAllName] = useState('');
  const [allPrice, setAllPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState('Door-Customer-Quote.pdf');
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const getCleanPdfFileName = useCallback((data: StudioDoorQuoteData) => {
    const cust = (data.customerName || 'Customer').trim();
    const quote = (data.quoteNumber || '').trim();
    return `${[cust, quote ? `Door Quote ${quote}` : 'Door Quote'].filter(Boolean).join(' ')}.pdf`;
  }, []);

  const updateLineAt = (index: number, updater: (l: StudioDoorLine) => StudioDoorLine) => {
    setDoorQuoteData(prev => ({
      ...prev,
      lines: prev.lines.map((l, i) => (i === index ? updater(l) : l)),
    }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file || !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      toast.error('Please upload a valid PDF quote-list file.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds the 25 MB limit.');
      return;
    }

    setLoading(true);
    setLoadingStatus('Reading supplier door quote PDF…');
    try {
      const extracted = await extractDoorQuoteFromPdf(file, (st: string) => setLoadingStatus(st));
      const updatedData: StudioDoorQuoteData = {
        ...doorQuoteData,
        quoteNumber: extracted.quoteNumber || doorQuoteData.quoteNumber,
        customerName: extracted.customerName || doorQuoteData.customerName,
        makerLogo: extracted.makerLogo || null,
        lines: extracted.lines,
      };

      setDoorQuoteData(updatedData);
      setPdfFileName(getCleanPdfFileName(updatedData));
      toast.success(`Successfully extracted ${extracted.lines.length} door line(s) with CAD drawings!`);

      if (extracted.lines.length > 0) {
        setGenerating(true);
        const pdfBytes = await generateStudioDoorPdf(updatedData);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to extract door quote from PDF');
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const handleGeneratePdf = async (customData?: StudioDoorQuoteData) => {
    const dataToUse = customData || doorQuoteData;
    if (!dataToUse.lines.length) {
      toast.error('Please upload a PDF with door lines first.');
      return;
    }

    setGenerating(true);
    try {
      const pdfBytes = await generateStudioDoorPdf(dataToUse);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
      setPdfFileName(getCleanPdfFileName(dataToUse));
      toast.success('Clean customer door PDF generated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate door PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleModeChange = async (newMode: 'supply' | 'install') => {
    const updated = { ...doorQuoteData, mode: newMode };
    setDoorQuoteData(updated);
    if (updated.lines.length) await handleGeneratePdf(updated);
  };

  const handleApplyAll = () => {
    if (!doorQuoteData.lines.length) return;
    setDoorQuoteData(prev => ({
      ...prev,
      lines: prev.lines.map(line => ({
        ...line,
        name: allName !== '' ? allName : line.name,
        price: allPrice !== '' ? allPrice : line.price,
      })),
    }));
    toast.success('Batch name and price applied to all door lines!');
  };

  const handleUpdateLine = (index: number, updates: Partial<StudioDoorLine>) => {
    updateLineAt(index, l => ({ ...l, ...updates }));
  };

  const handleRecropLine = (index: number, trimLeft: number, trimBottom: number) => {
    updateLineAt(index, line => {
      if (!line.rawCanvas && !line.raw) return line;
      const updated = { ...line, trimLeft: Math.max(0, trimLeft), trimBottom: Math.max(0, trimBottom) };
      recropDoorLineDrawing(updated);
      return updated;
    });
  };

  const handleReplaceDrawing = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateLineAt(index, l => ({ ...l, image: reader.result as string, raw: null, rawCanvas: null }));
        toast.success(`Door drawing replaced for Line ${doorQuoteData.lines[index]?.number}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleSpecBold = (lineIndex: number, specIndex: number) => {
    updateLineAt(lineIndex, line => ({
      ...line,
      spec: line.spec.map((s, idx) => (idx === specIndex ? { ...s, bold: !s.bold } : s)),
    }));
  };

  const handleUpdateSpecText = (lineIndex: number, specIndex: number, text: string) => {
    updateLineAt(lineIndex, line => ({
      ...line,
      spec: line.spec.map((s, idx) => (idx === specIndex ? { ...s, text } : s)),
    }));
  };

  const handleResetQuote = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setDoorQuoteData(INITIAL_DOOR_QUOTE);
    setPdfUrl(null);
    setAllName('');
    setAllPrice('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Door quote reset to start fresh.');
  };

  const handleAddLine = () => {
    const nextNum = String(doorQuoteData.lines.length + 1).padStart(3, '0');
    setDoorQuoteData(prev => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          number: nextNum,
          name: 'Custom Door',
          price: '',
          glass: '',
          spec: [{ text: 'Exterior Door Unit', bold: true }],
          roWarn: false,
          rawCanvas: null,
          raw: null,
          image: null,
          trimLeft: DEFAULT_TRIM_LEFT,
          trimBottom: DEFAULT_TRIM_BOTTOM,
          sourcePages: 'manual',
          qty: '1',
        },
      ],
    }));
    toast.success(`Door Line ${nextNum} added`);
  };

  const handleRemoveLine = (index: number) => {
    setDoorQuoteData(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));
    toast.info('Door line removed');
  };

  const handleResetTrims = (index: number) => {
    handleRecropLine(index, DEFAULT_TRIM_LEFT, DEFAULT_TRIM_BOTTOM);
    toast.info('Trims reset to default (25.5pt / 95.5pt)');
  };

  const handleDownloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = pdfFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    fileInputRef,
    doorQuoteData,
    setDoorQuoteData,
    allName,
    setAllName,
    allPrice,
    setAllPrice,
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
    handleApplyAll,
    handleUpdateLine,
    handleRecropLine,
    handleReplaceDrawing,
    handleToggleSpecBold,
    handleUpdateSpecText,
    handleResetQuote,
    handleAddLine,
    handleRemoveLine,
    handleResetTrims,
    handleDownloadPdf,
  };
}
