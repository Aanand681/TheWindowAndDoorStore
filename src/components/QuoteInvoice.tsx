import React from 'react';
import { WindowItem, formatMoney } from '@/lib/promo-logic';

export default function QuoteInvoice({
  customerName,
  quoteNumber,
  windows,
  taxTotals,
  activePromo,
  regionName,
}: {
  customerName: string;
  quoteNumber: string;
  windows: any[];
  taxTotals: any;
  activePromo?: any;
  regionName?: string;
}) {
  const [currentDate, setCurrentDate] = React.useState<string>('');

  React.useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  if (!taxTotals) return null;

  return (
    <div id="printable-invoice" className="hidden print:block absolute top-0 left-0 w-full min-h-screen bg-white text-black p-8 text-sm z-[9999]">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">The Window & Door Store</h1>
          <p className="text-gray-600 mt-1">Official Quote / Estimate</p>
        </div>
        <div className="text-right space-y-1 text-gray-800">
          <p suppressHydrationWarning><b>Date:</b> {currentDate || new Date().toLocaleDateString()}</p>
          {quoteNumber && <p><b>Ref Order #:</b> {quoteNumber}</p>}
          {customerName && <p><b>Customer:</b> {customerName}</p>}
          {regionName && <p><b>Region:</b> {regionName}</p>}
        </div>
      </div>

      {/* Windows Table */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">Window Details</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-800">
              <th className="p-2 border-b border-gray-300">Item</th>
              <th className="p-2 border-b border-gray-300">Size (W x H)</th>
              <th className="p-2 border-b border-gray-300">Qty</th>
              <th className="p-2 border-b border-gray-300 text-right">Base Price</th>
            </tr>
          </thead>
          <tbody>
            {windows.map((w, i) => (
              <tr key={w.id} className="border-b border-gray-100">
                <td className="p-2 font-medium">{i + 1}</td>
                <td className="p-2 text-gray-600">{w.w && w.h ? `${w.w}" x ${w.h}"` : 'Custom'}</td>
                <td className="p-2">{w.qty}</td>
                <td className="p-2 text-right">{formatMoney((Number(w.base) || 0) * (Number(w.qty) || 1))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-2 gap-12 mb-8">
        <div>
          <h2 className="text-lg font-bold mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">Installation & Travel</h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Window Labour</span>
              <span>{formatMoney(taxTotals.labourWindows * 100)}</span>
            </div>
            {taxTotals.finalJC > 0 && (
              <div className="flex justify-between">
                <span>Jambs & Casings</span>
                <span>{formatMoney(taxTotals.finalJC * 100)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-2 border-t border-gray-200">
              <span>Travel & Setup Fee</span>
              <span>{formatMoney(taxTotals.extras * 100)}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3 uppercase tracking-wide border-b border-gray-300 pb-1">Summary</h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(taxTotals.subtotal * 100)}</span>
            </div>
            
            {activePromo && activePromo.discount > 0 && (
              <div className="flex justify-between text-green-700 font-medium">
                <span>Promo: {activePromo.name}</span>
                <span>-{formatMoney(activePromo.discount * 100)}</span>
              </div>
            )}

            <div className="flex justify-between border-b border-gray-300 pb-2">
              <span>HST</span>
              <span>{formatMoney(taxTotals.hst * 100)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-black pt-2">
              <span>Total</span>
              <span>{formatMoney(taxTotals.total * 100)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Payment Terms */}
      <div className="mt-12 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-700">
        <h3 className="font-bold mb-2">Payment Terms</h3>
        <p>50% Deposit Required: <span className="font-bold">{formatMoney((taxTotals.total * 100) / 2)}</span></p>
        <p>Remaining balance due upon completion of installation.</p>
        <p className="mt-4 text-xs text-gray-500 uppercase tracking-widest">Thank you for your business!</p>
      </div>

    </div>
  );
}
