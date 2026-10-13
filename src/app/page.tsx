"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WindowItem,
  DBPromo,
  formatMoney,
  toCents,
  calculatePromo,
  calculateUpgrade,
} from '@/lib/promo-logic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Calculator, Tag, Info, Receipt, Component, FileUp, UserCircle, LogOut, Eye, Download, RotateCcw, Bold, List } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { readPdfItems, parseManufacturerPdfItems, extractPdfMetadata } from '@/lib/pdf-parser';
import { useRef } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaxCalculatorTab from '@/components/TaxCalculatorTab';
import QuoteInvoice, { QuoteTemplateType } from '@/components/QuoteInvoice';
import QuotePreviewModal from '@/components/QuotePreviewModal';
import QuoteNotesEditor from '@/components/QuoteNotesEditor';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

type UIWindowItem = {
  id: string;
  qty: string;
  base: string;
  argon: string;
  solar: string;
  triple: string;
  w?: string;
  h?: string;
};

export default function PromoCalculator() {
  const [windows, setWindows] = useState<UIWindowItem[]>([
    { id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '' },
  ]);
  const [surchargeRate, setSurchargeRate] = useState<number>(8);
  const [customerName, setCustomerName] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  
  // Dynamic Promos State
  const [availablePromos, setAvailablePromos] = useState<DBPromo[]>([]);
  const [activePromoId, setActivePromoId] = useState<string>('none');
  const [lockedPromoId, setLockedPromoId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('promo');

  // Tax and Calculation State
  const [taxTotals, setTaxTotals] = useState<any>(null);
  const taxJC = taxTotals ? Math.round(taxTotals.finalJC * 100) : 0;
  const taxMisc = taxTotals ? Math.round(taxTotals.finalMisc * 100) : 0;
  const taxLabour = taxTotals ? Math.round(taxTotals.finalLabour * 100) : 0;
  
  // Custom Editable Overrides for Final Prices
  const [customJC, setCustomJC] = useState<string>('');
  const [customMisc, setCustomMisc] = useState<string>('');
  const [customLabour, setCustomLabour] = useState<string>('');

  const effectiveJC = customJC.trim() !== '' ? Math.round(Number(customJC) * 100) : taxJC;
  const effectiveMisc = customMisc.trim() !== '' ? Math.round(Number(customMisc) * 100) : taxMisc;
  const effectiveLabour = customLabour.trim() !== '' ? Math.round(Number(customLabour) * 100) : taxLabour;

  // Preview Modal & Customizer State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [quoteTemplate, setQuoteTemplate] = useState<QuoteTemplateType>('modern');
  const [quoteFontSize, setQuoteFontSize] = useState<number>(11.5);
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0);
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  const [wantsUpgrade, setWantsUpgrade] = useState<boolean>(false);
  const [includeLabourInPromo, setIncludeLabourInPromo] = useState<boolean>(true);
  const [includeMiscInPromo, setIncludeMiscInPromo] = useState<boolean>(true);
  const [includeJCInPromo, setIncludeJCInPromo] = useState<boolean>(true);
  const [hstRate, setHstRate] = useState<number>(13);
  
  const windowEndRef = useRef<HTMLDivElement>(null);

  // Derived Values
  const [quoteResult, setQuoteResult] = useState<ReturnType<typeof calculatePromo> | null>(null);
  const [compareOptions, setCompareOptions] = useState<ReturnType<typeof calculatePromo>[]>([]);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User State
  const [user, setUser] = useState<{ username: string, role: string } | null>(null);

  // Fetch Live Promos & User
  useEffect(() => {
    fetch('/api/promos?active=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailablePromos(data);
      })
      .catch(console.error);
      
    fetch('/api/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data);
      })
      .catch(console.error);

    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.surchargeRate !== undefined) {
          setSurchargeRate(data.surchargeRate);
        }
      })
      .catch(console.error);
  }, []);

  const handleAddWindow = () => {
    setLockedPromoId(null);
    setWindows([...windows, { id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '' }]);
    setTimeout(() => {
      windowEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const container = windowEndRef.current?.parentElement;
      if (container) {
        const inputs = container.querySelectorAll('input');
        if (inputs.length > 0) inputs[inputs.length - 6]?.focus(); // focus base price or qty
      }
    }, 50);
  };

  const handleRemoveWindow = (id: string) => {
    setLockedPromoId(null);
    setWindows(windows.filter((w) => w.id !== id));
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      toast.info('Parsing PDF...');
      const items = await readPdfItems(file);
      
      const meta = extractPdfMetadata(items);
      if (meta.customerName) setCustomerName(meta.customerName);
      if (meta.quoteNumber) setQuoteNumber(meta.quoteNumber);

      const imported = parseManufacturerPdfItems(items).map(w => ({
        id: w.id,
        qty: String(w.qty),
        base: w.base ? (w.base / 100).toString() : '',
        argon: w.argon ? (w.argon / 100).toString() : '',
        solar: w.solar ? (w.solar / 100).toString() : '',
        triple: w.triple ? (w.triple / 100).toString() : '',
        w: w.w || '',
        h: w.h || ''
      }));
      setWindows(imported.length > 0 ? imported : [{ id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '' }]);
      setLockedPromoId(null);
      setActivePromoId('none');
      toast.success(`Imported ${imported.length} window(s) from ${file.name}.`);
    } catch (error: any) {
      toast.error(`PDF import failed: ${error.message}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleWindowChange = (id: string, field: keyof UIWindowItem, value: string) => {
    setWindows(
      windows.map((w) => {
        if (w.id !== id) return w;
        return { ...w, [field]: value };
      })
    );
  };

  const calculateQuote = () => {
    const validWindows = windows.map(w => ({
      id: w.id,
      qty: parseInt(w.qty) || 1,
      base: toCents(w.base),
      argon: toCents(w.argon),
      solar: toCents(w.solar),
      triple: toCents(w.triple)
    })).filter((w) => w.base > 0);
    
    if (!validWindows.length) return; 
    
    const options = availablePromos.map((p) => calculatePromo(p, validWindows, surchargeRate));
    options.push(calculatePromo(null, validWindows, surchargeRate)); // Add 'none' option
    
    setCompareOptions(options);

    const validOptions = options.filter(o => o.promoId !== 'none');
    const lowest = validOptions.length > 0 
      ? validOptions.reduce((min, o) => o.final < min.final ? o : min, validOptions[0])
      : options[0]; // fallback to none
    
    // Automatically follow lowest promo unless explicitly locked by user to another promo
    const selectedId = (lockedPromoId && options.some(o => o.promoId === lockedPromoId))
      ? lockedPromoId
      : lowest.promoId;

    setActivePromoId(selectedId);

    const selectedOption = options.find(o => o.promoId === selectedId) || options.find(o => o.promoId === 'none');
    setQuoteResult(selectedOption || null);
  };

  useEffect(() => {
    if (windows.some(w => toCents(w.base) > 0)) {
      calculateQuote();
    } else {
      setQuoteResult(null);
      setCompareOptions([]);
    }
  }, [windows, surchargeRate, lockedPromoId, availablePromos]);

  const beforeTaxDiscount = quoteResult 
    ? quoteResult.base + 
      (includeJCInPromo ? effectiveJC : 0) + 
      (includeMiscInPromo ? effectiveMisc : 0) + 
      (includeLabourInPromo ? effectiveLabour : 0) + 
      quoteResult.surcharge 
    : 0;
  
  const afterDiscount = Math.max(0, beforeTaxDiscount - (quoteResult?.promoDiscount || 0));
  const upgrade = calculateUpgrade(afterDiscount);
  const shownUpgrade = wantsUpgrade ? upgrade.charge : 0;
  const hst = hstRate > 0 ? Math.round(afterDiscount * (hstRate / 100)) : 0;
  const total = afterDiscount + hst;
  const firstPayment = Math.floor(total / 2);
  const secondPayment = total - firstPayment;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 space-y-8 print:hidden">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="inline-flex items-center gap-2 text-primary">
            <Component className="w-6 h-6" />
            <span className="text-xl font-semibold tracking-wider uppercase">Window & Door Store</span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-4">
            {user && (
              <>
                <div className="text-sm border border-border bg-card/50 px-3 py-1.5 rounded-full font-medium hidden sm:block">
                  <span className="text-muted-foreground mr-1">Hello,</span>
                  <span className="text-primary">{user.username}</span>
                </div>
                {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
                  <Link 
                    href="/admin" 
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
                  >
                    Dashboard
                  </Link>
                )}
              </>
            )}
            <ThemeToggle />
            {user && (
              <>
                <Link 
                  href="/profile" 
                  className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full text-muted-foreground hover:text-primary transition-colors")}
                >
                  <UserCircle className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'rounded-full text-muted-foreground hover:text-destructive transition-colors')}
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-muted p-1 rounded-full border border-border/50 shadow-sm">
            <TabsTrigger value="promo" className="rounded-full text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Promo Calculator</TabsTrigger>
            <TabsTrigger value="tax" className="rounded-full text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Tax & Labour Calculator</TabsTrigger>
          </TabsList>
          
          <div className={cn("mt-0 outline-none", activeTab !== 'promo' && "hidden")}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Card className="bg-card/50 border-border backdrop-blur-xl shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Component className="w-6 h-6 text-primary" />
                    Window Configurations
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Enter the base prices and upgrade components for each window.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border border-border/50">
                  <Label htmlFor="surcharge" className="whitespace-nowrap px-2">Surcharge %</Label>
                  <Input
                    id="surcharge"
                    type="number"
                    readOnly
                    value={surchargeRate}
                    className="w-24 bg-background opacity-70 cursor-not-allowed"
                    title="Configured by Admin in Settings"
                  />
                  <input 
                    type="file" 
                    accept=".pdf,application/pdf" 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handlePdfUpload} 
                  />
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="whitespace-nowrap shadow-sm">
                    <FileUp className="w-4 h-4 mr-2" />
                    Import PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/20 border-t border-border">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quote/Order Number</Label>
                    <Input value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} placeholder="e.g. 400820" className="bg-background shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Customer Name</Label>
                    <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Jason Schram" className="bg-background shadow-sm" />
                  </div>
                </div>
                <div className="w-full max-h-[600px] overflow-auto border-t border-border">
                  <div className="min-w-[800px] p-6">
                    <div className="grid grid-cols-12 gap-4 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                      <div className="col-span-1">Seq</div>
                      <div className="col-span-1">Qty</div>
                      <div className="col-span-2">Base Total</div>
                      <div className="col-span-2">Argon Total</div>
                      <div className="col-span-2">Solar Total</div>
                      <div className="col-span-2">Triple Pane Total</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    
                    <div className="space-y-3">
                      <AnimatePresence>
                        {windows.map((w, i) => (
                          <motion.div
                            key={w.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="grid grid-cols-12 gap-4 items-center bg-muted/30 p-2 rounded-xl border border-border/80 transition-colors hover:border-border"
                          >
                            <div className="col-span-1 pl-3 font-mono text-muted-foreground">{i + 1}</div>
                            <div className="col-span-1">
                              <Input
                                type="number"
                                min="1"
                                value={w.qty}
                                onChange={(e) => handleWindowChange(w.id, 'qty', e.target.value)}
                                className="bg-background h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="col-span-2 relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={w.base}
                                onChange={(e) => handleWindowChange(w.id, 'base', e.target.value)}
                                className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="col-span-2 relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={w.argon}
                                onChange={(e) => handleWindowChange(w.id, 'argon', e.target.value)}
                                className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="col-span-2 relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={w.solar}
                                onChange={(e) => handleWindowChange(w.id, 'solar', e.target.value)}
                                className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="col-span-2 relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={w.triple}
                                onChange={(e) => handleWindowChange(w.id, 'triple', e.target.value)}
                                className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="col-span-2 flex justify-end pr-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors h-9 w-9"
                                onClick={() => handleRemoveWindow(w.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={windowEndRef} />
                    </div>

                  </div>
                </div>
                <div className="p-6 border-t border-border bg-muted/10 rounded-b-xl flex justify-center sm:justify-start">
                  <Button 
                    onClick={handleAddWindow}
                    className="shadow-lg w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Window Manually
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Promo Comparison Cards */}
            {compareOptions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Promo Comparison</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {compareOptions.filter(opt => opt.promoId !== 'none').map((opt) => {
                    const isSelected = activePromoId === opt.promoId;
                    const validOptions = compareOptions.filter(o => o.promoId !== 'none');
                    const isLowest = Math.min(...validOptions.map(o => o.final)) === opt.final;
                    const noneOpt = compareOptions.find(o => o.promoId === 'none');
                    const savings = (noneOpt?.final || 0) - opt.final;

                    return (
                      <motion.div
                        key={opt.promoId}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (isLowest) {
                            setLockedPromoId(null);
                          } else {
                            setLockedPromoId(opt.promoId);
                          }
                          setActivePromoId(opt.promoId);
                        }}
                        className={`relative cursor-pointer rounded-2xl p-5 border transition-all duration-300 ${
                          isSelected 
                            ? 'bg-primary/10 border-primary shadow-xl shadow-primary/10 ring-1 ring-primary/50' 
                            : 'bg-card border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        {isLowest && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg">
                            Lowest
                          </div>
                        )}
                        <h3 className="text-sm text-muted-foreground font-medium mb-1 line-clamp-1">
                          {opt.promoName}
                        </h3>
                        <div className={`text-2xl font-bold mb-2 tracking-tight ${isSelected ? 'text-primary' : ''}`}>
                          {formatMoney(opt.final)}
                        </div>
                        <div className="text-xs space-y-1">
                          {savings > 0 ? (
                            <div className="text-emerald-500 font-medium">Saves {formatMoney(savings)}</div>
                          ) : (
                            <div className="text-muted-foreground">No savings</div>
                          )}
                          <div className="text-muted-foreground truncate">
                            Discount {formatMoney(opt.promoDiscount)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Calculation Results */}
          <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit pb-12">
            <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Promo Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quoteResult ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base windows</span>
                        <span className="font-mono">{formatMoney(quoteResult.base)}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-border pt-3">
                        <span className="text-muted-foreground">Surcharge (base price)</span>
                        <span className="font-mono">{formatMoney(quoteResult.surcharge)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-emerald-500">
                        <span>Selected promo discount</span>
                        <span className="font-mono">-{formatMoney(quoteResult.promoDiscount)}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-semibold">Final Total</span>
                        <span className="text-2xl font-bold font-mono tracking-tight">
                          {formatMoney(quoteResult.final)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-4 bg-muted p-3 rounded-lg border border-border">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                        <span>{quoteResult.text}</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Enter valid window base prices to see the summary.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  Tax Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Base price of windows</Label>
                    <div className="h-9 px-3 py-2 bg-background border border-border rounded-md font-mono text-sm opacity-70">
                      {formatMoney(quoteResult?.base || 0)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Checkbox id="incJc" checked={includeJCInPromo} onCheckedChange={c => setIncludeJCInPromo(!!c)} />
                          <Label htmlFor="incJc" className="text-xs text-muted-foreground cursor-pointer">Include J & C</Label>
                        </div>
                        {customJC !== '' && (
                          <button
                            type="button"
                            onClick={() => setCustomJC('')}
                            title="Reset to calculated"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer select-none no-underline"
                          >
                            <RotateCcw className="w-2.5 h-2.5 cursor-pointer" />
                            <span className="cursor-pointer">Reset</span>
                          </button>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-xs text-muted-foreground font-mono pointer-events-none">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={(taxJC / 100).toFixed(2)}
                          value={customJC}
                          onChange={(e) => setCustomJC(e.target.value)}
                          disabled={!includeJCInPromo}
                          className={`h-9 pl-6 pr-3 font-mono text-sm bg-background ${!includeJCInPromo ? 'opacity-30 line-through' : ''}`}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Checkbox id="incMisc" checked={includeMiscInPromo} onCheckedChange={c => setIncludeMiscInPromo(!!c)} />
                          <Label htmlFor="incMisc" className="text-xs text-muted-foreground cursor-pointer">Include Misc</Label>
                        </div>
                        {customMisc !== '' && (
                          <button
                            type="button"
                            onClick={() => setCustomMisc('')}
                            title="Reset to calculated"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer select-none no-underline"
                          >
                            <RotateCcw className="w-2.5 h-2.5 cursor-pointer" />
                            <span className="cursor-pointer">Reset</span>
                          </button>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-xs text-muted-foreground font-mono pointer-events-none">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={(taxMisc / 100).toFixed(2)}
                          value={customMisc}
                          onChange={(e) => setCustomMisc(e.target.value)}
                          disabled={!includeMiscInPromo}
                          className={`h-9 pl-6 pr-3 font-mono text-sm bg-background ${!includeMiscInPromo ? 'opacity-30 line-through' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Checkbox id="incLab" checked={includeLabourInPromo} onCheckedChange={c => setIncludeLabourInPromo(!!c)} />
                        <Label htmlFor="incLab" className="text-xs text-muted-foreground cursor-pointer">Include Labour</Label>
                      </div>
                      {customLabour !== '' && (
                        <button
                          type="button"
                          onClick={() => setCustomLabour('')}
                          title="Reset to calculated"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer select-none no-underline"
                        >
                          <RotateCcw className="w-2.5 h-2.5 cursor-pointer" />
                          <span className="cursor-pointer">Reset</span>
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-xs text-muted-foreground font-mono pointer-events-none">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={(taxLabour / 100).toFixed(2)}
                        value={customLabour}
                        onChange={(e) => setCustomLabour(e.target.value)}
                        disabled={!includeLabourInPromo}
                        className={`h-9 pl-6 pr-3 font-mono text-sm bg-background ${!includeLabourInPromo ? 'opacity-30 line-through' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Surcharge</Label>
                      <div className="h-9 px-3 py-2 bg-background border border-border rounded-md font-mono text-sm opacity-70">
                        {formatMoney(quoteResult?.surcharge || 0)}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Discount</Label>
                      <div className="h-9 px-3 py-2 bg-background border border-border rounded-md font-mono text-sm opacity-70 text-emerald-500">
                        -{formatMoney(quoteResult?.promoDiscount || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-primary/10 p-4 rounded-xl border border-primary/20">
                  <Checkbox 
                    id="upgrade" 
                    checked={wantsUpgrade} 
                    onCheckedChange={(c) => setWantsUpgrade(!!c)} 
                    className="mt-1"
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor="upgrade" className="text-sm font-medium cursor-pointer">
                      Include 5-year free labour upgrade
                    </Label>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Optional. Shows upgrade price only; not included in HST or final total.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono">{formatMoney(beforeTaxDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After Discount</span>
                    <span className="font-mono font-medium">{formatMoney(afterDiscount)}</span>
                  </div>
                  
                  {wantsUpgrade && (
                    <div className="flex justify-between text-sm text-primary bg-primary/10 p-2 rounded -mx-2 px-2">
                      <span>Labour Upgrade ({upgrade.rate})</span>
                      <span className="font-mono">{formatMoney(shownUpgrade)}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2 border-t border-border">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="promoHst13" 
                          checked={hstRate === 13} 
                          onCheckedChange={(c) => setHstRate(c ? 13 : 0)} 
                        />
                        <Label htmlFor="promoHst13" className="cursor-pointer text-muted-foreground font-normal">
                          Include HST (13%)
                        </Label>
                      </div>
                      <span className={`font-mono ${hstRate !== 13 ? 'line-through opacity-50' : ''}`}>
                        {formatMoney(Math.round(afterDiscount * 0.13))}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="promoHst8" 
                          checked={hstRate === 8} 
                          onCheckedChange={(c) => setHstRate(c ? 8 : 0)} 
                        />
                        <Label htmlFor="promoHst8" className="cursor-pointer text-muted-foreground font-normal">
                          Include HST (8%)
                        </Label>
                      </div>
                      <span className={`font-mono ${hstRate !== 8 ? 'line-through opacity-50' : ''}`}>
                        {formatMoney(Math.round(afterDiscount * 0.08))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-border">
                    <span className="font-bold">Total incl. HST</span>
                    <span className="font-bold font-mono text-xl tracking-tight">
                      {formatMoney(total)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
                    <div className="bg-muted rounded-lg p-3 border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">First 50%</div>
                      <div className="font-mono font-semibold text-primary">{formatMoney(firstPayment)}</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3 border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Final 50%</div>
                      <div className="font-mono font-semibold text-primary">{formatMoney(secondPayment)}</div>
                    </div>
                  </div>

                  {/* Optional Quote Notes Field with Rich Auto-Growing WYSIWYG Editor */}
                  <div className="pt-3 border-t border-border/50">
                    <QuoteNotesEditor
                      id="quoteNotesInput"
                      value={quoteNotes}
                      onChange={setQuoteNotes}
                      placeholder="Enter special site notes, instructions, or employee comments..."
                    />
                  </div>

                  {/* Vertically stacked full-width buttons - NO overflow outside the card */}
                  <div className="mt-4 flex flex-col gap-2.5 w-full">
                    <Button 
                      variant="outline"
                      className="w-full h-11 text-sm shadow-sm font-semibold border-primary/40 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer" 
                      onClick={() => {
                        if (!taxTotals) {
                          toast.error("Please calculate travel in the Tax Calculator tab first!");
                          return;
                        }
                        setIsPreviewOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2 text-primary cursor-pointer" /> Preview &amp; Customize
                    </Button>
                    <Button 
                      className="w-full h-11 text-sm shadow-md font-semibold cursor-pointer" 
                      onClick={() => {
                        if (!taxTotals) {
                          toast.error("Please calculate travel in the Tax Calculator tab first!");
                          return;
                        }
                        window.print();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2 cursor-pointer" /> Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className={cn("mt-0 outline-none", activeTab !== 'tax' && "hidden")}>
        <TaxCalculatorTab windows={windows} onWindowsChange={setWindows} onCalculated={setTaxTotals} />
      </div>
    </Tabs>
      </div>

      <QuoteInvoice 
        customerName={customerName} 
        quoteNumber={quoteNumber} 
        windows={windows} 
        taxTotals={taxTotals} 
        quoteResult={quoteResult}
        activePromo={quoteResult && quoteResult.promoDiscount > 0 ? { 
          name: availablePromos.find(p => p._id === activePromoId || (p as any).id === activePromoId)?.name || 'Custom Promo', 
          discount: quoteResult.promoDiscount 
        } : null} 
        basePrice={quoteResult?.base || 0}
        surcharge={quoteResult?.surcharge || 0}
        wantsUpgrade={wantsUpgrade}
        shownUpgrade={shownUpgrade}
        hstRate={hstRate}
        total={total}
        beforeTaxDiscount={beforeTaxDiscount}
        afterDiscount={afterDiscount}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        regionName={taxTotals?.regionName || taxTotals?.city} 
        includeLabourInPromo={includeLabourInPromo}
        includeMiscInPromo={includeMiscInPromo}
        includeJCInPromo={includeJCInPromo}
        effectiveJC={effectiveJC}
        effectiveMisc={effectiveMisc}
        effectiveLabour={effectiveLabour}
        template={quoteTemplate}
        fontSize={quoteFontSize}
        spacing={quoteSpacing}
        quoteNotes={quoteNotes}
      />

      <QuotePreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={quoteTemplate}
        onTemplateChange={setQuoteTemplate}
        fontSize={quoteFontSize}
        onFontSizeChange={setQuoteFontSize}
        spacing={quoteSpacing}
        onSpacingChange={setQuoteSpacing}
        quoteNotes={quoteNotes}
        onQuoteNotesChange={setQuoteNotes}
        customerName={customerName}
        quoteNumber={quoteNumber}
        windows={windows}
        taxTotals={taxTotals}
        quoteResult={quoteResult}
        activePromo={quoteResult && quoteResult.promoDiscount > 0 ? { 
          name: availablePromos.find(p => p._id === activePromoId || (p as any).id === activePromoId)?.name || 'Custom Promo', 
          discount: quoteResult.promoDiscount 
        } : null}
        basePrice={quoteResult?.base || 0}
        surcharge={quoteResult?.surcharge || 0}
        wantsUpgrade={wantsUpgrade}
        shownUpgrade={shownUpgrade}
        hstRate={hstRate}
        total={total}
        beforeTaxDiscount={beforeTaxDiscount}
        afterDiscount={afterDiscount}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        regionName={taxTotals?.regionName || taxTotals?.city}
        includeLabourInPromo={includeLabourInPromo}
        includeMiscInPromo={includeMiscInPromo}
        includeJCInPromo={includeJCInPromo}
        effectiveJC={effectiveJC}
        effectiveMisc={effectiveMisc}
        effectiveLabour={effectiveLabour}
      />
    </div>
  );
}
