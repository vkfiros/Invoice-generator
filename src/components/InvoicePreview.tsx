import React, { useRef } from 'react';
import { Printer, X, Download, ShieldCheck, Mail, Phone, Calendar, ArrowLeft } from 'lucide-react';
import { Invoice } from '../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
  currencySymbol: string;
}

export default function InvoicePreview({ invoice, onClose, currencySymbol }: InvoicePreviewProps) {
  // Line item subtotal
  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (invoice.taxRate / 100);
  const totalAmount = Math.max(0, subtotal + taxAmount - invoice.discount);

  // Trigger browser print
  const handlePrint = () => {
    // Standard print is fully supported and triggers client-side PDF generation natively via print-to-pdf
    window.print();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-4 md:p-8 z-50 animate-fade-in no-print" id="invoice-preview-backdrop">
      <div className="bg-slate-100 rounded-3xl shadow-2xl max-w-4xl w-full my-4 overflow-hidden border border-slate-200/50 flex flex-col no-print" id="invoice-preview-modal-card">
        {/* Actions bar */}
        <div className="p-4 md:p-5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print" id="preview-actions-bar">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              id="back-to-list-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              id="print-invoice-pdf-btn"
            >
              <Printer className="w-4 h-4" />
              <span>Print or Save to PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Page Container (Matches standard A4 / Letter format) */}
        <div className="p-6 md:p-12 bg-white flex-1 overflow-y-auto" id="printable-invoice-container">
          <div className="max-w-3xl mx-auto print-card space-y-10" id="invoice-bill-paper">
            
            {/* Invoice Header / Branding */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8" id="invoice-header-block">
              <div className="space-y-2.5">
                {/* Visual Company Identity Banner */}
                <div className="flex items-center gap-2" id="invoice-logo-wrapper">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                    {invoice.sender.name ? invoice.sender.name.charAt(0).toUpperCase() : 'I'}
                  </div>
                  <span className="text-xl font-bold font-sans text-slate-800 tracking-tight">{invoice.sender.name || 'Your Company Name'}</span>
                </div>
                <div className="text-xs text-slate-500 space-y-1" id="sender-address-block">
                  <p className="whitespace-pre-line leading-relaxed">{invoice.sender.address}</p>
                  {invoice.sender.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {invoice.sender.phone}</p>}
                  {invoice.sender.email && <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {invoice.sender.email}</p>}
                  {invoice.sender.taxId && <p className="text-slate-400 mt-1 font-mono">Tax ID: {invoice.sender.taxId}</p>}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="text-left md:text-right space-y-3" id="invoice-meta-block">
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Invoice</h1>
                <div className="font-mono text-sm text-slate-500" id="invoice-num-label">
                  No. <span className="font-bold text-slate-800">{invoice.invoiceNumber}</span>
                </div>
                
                {/* Status indicator on invoice */}
                <div className="inline-block" id="invoice-status-badge">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    invoice.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : invoice.status === 'Sent'
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : invoice.status === 'Overdue'
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : 'bg-slate-50 text-slate-600 border border-slate-200'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Bill To & Dates info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="invoice-addresses-grid">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bill To</span>
                <div className="text-slate-800 space-y-1.5">
                  <p className="font-bold text-sm text-slate-900">{invoice.client.name}</p>
                  <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{invoice.client.address}</p>
                  {invoice.client.phone && <p className="text-xs text-slate-500">Phone: {invoice.client.phone}</p>}
                  {invoice.client.email && <p className="text-xs text-slate-500">Email: {invoice.client.email}</p>}
                  {invoice.client.taxId && <p className="text-xs text-slate-400 font-mono mt-1">Tax ID: {invoice.client.taxId}</p>}
                </div>
              </div>

              <div className="flex md:justify-end" id="invoice-dates-card">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs" style={{ minWidth: '220px' }}>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Date Issued:</span>
                  <span className="text-slate-700 font-medium text-right">{formatDate(invoice.issueDate)}</span>
                  
                  <span className="text-slate-400 font-semibold uppercase tracking-wider">Due Date:</span>
                  <span className="text-slate-700 font-bold text-right">{formatDate(invoice.dueDate)}</span>

                  {invoice.terms && (
                    <>
                      <span className="text-slate-400 font-semibold uppercase tracking-wider">Terms:</span>
                      <span className="text-slate-700 font-medium text-right">{invoice.terms}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Line Items Table */}
            <div className="border border-slate-100 rounded-xl overflow-hidden" id="invoice-items-table">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Item Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {invoice.items.map((item, index) => (
                    <tr key={item.id || index} className="text-slate-700">
                      <td className="py-3.5 px-4 font-medium text-slate-800">{item.description}</td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                        {currencySymbol}{item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800 font-mono">
                        {currencySymbol}{(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 4: Notes and Financial Totals */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4" id="invoice-summary-block">
              {/* Notes */}
              <div className="md:col-span-6 space-y-3" id="invoice-notes-block">
                {invoice.notes && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes / Remarks</h4>
                    <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">{invoice.notes}</p>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-slate-400" id="secured-invoice-footer">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Verified Secure Invoice Bill</span>
                </div>
              </div>

              {/* Totals Table */}
              <div className="md:col-span-6 flex flex-col justify-start" id="invoice-totals-block">
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold font-mono text-slate-700">{currencySymbol}{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {invoice.taxRate > 0 && (
                    <div className="flex justify-between items-center text-slate-500">
                      <span>VAT / Tax ({invoice.taxRate}%)</span>
                      <span className="font-semibold font-mono text-slate-700">{currencySymbol}{taxAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {invoice.discount > 0 && (
                    <div className="flex justify-between items-center text-rose-500">
                      <span>Discount Credit</span>
                      <span className="font-semibold font-mono">-{currencySymbol}{invoice.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-200/60 pt-3 flex justify-between items-center text-sm font-bold text-slate-800" id="invoice-total-highlight">
                    <span>Total Outstanding</span>
                    <span className="text-base font-black text-blue-600 font-sans">
                      {invoice.currency} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom styled Print View Only Styles (Hidden in Web view, visible when printing) */}
            <div className="hidden print:block text-center text-[10px] text-slate-400 pt-12 border-t border-dashed border-slate-200">
              <p>Generated via Professional Invoice Billing System on {new Date().toLocaleDateString()}</p>
              <p className="mt-1">Thank you for your business!</p>
            </div>

          </div>
        </div>
      </div>

      {/* Dynamic PRINT-ONLY container to ensure clean printing on all screen sizes */}
      <style>{`
        @media print {
          /* Hide all screen components */
          body * {
            visibility: hidden;
          }
          /* Show only the invoice container */
          #printable-invoice-container, #printable-invoice-container * {
            visibility: visible;
          }
          #printable-invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
