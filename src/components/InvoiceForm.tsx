import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Sparkles, Check, ChevronDown } from 'lucide-react';
import { Invoice, InvoiceItem, ContactInfo, PaymentStatus } from '../types';

interface InvoiceFormProps {
  invoice?: Invoice | null; // If editing
  onSave: (invoice: Invoice) => void;
  onClose: () => void;
  defaultSender: ContactInfo;
  defaultTaxRate: number;
  defaultCurrency: string;
  defaultTerms: string;
  existingClients: ContactInfo[]; // List of previous clients to auto-select
}

export default function InvoiceForm({
  invoice,
  onSave,
  onClose,
  defaultSender,
  defaultTaxRate,
  defaultCurrency,
  defaultTerms,
  existingClients,
}: InvoiceFormProps) {
  // Local states
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('Draft');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  // Sender details
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [senderTaxId, setSenderTaxId] = useState('');

  // Client details
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientTaxId, setClientTaxId] = useState('');

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Previous Client Autocomplete state
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Initialize values
  useEffect(() => {
    if (invoice) {
      setInvoiceNumber(invoice.invoiceNumber);
      setIssueDate(invoice.issueDate);
      setDueDate(invoice.dueDate);
      setStatus(invoice.status);
      setCurrency(invoice.currency);
      setTaxRate(invoice.taxRate);
      setDiscount(invoice.discount);
      setNotes(invoice.notes);
      setTerms(invoice.terms);

      setSenderName(invoice.sender.name);
      setSenderEmail(invoice.sender.email);
      setSenderPhone(invoice.sender.phone);
      setSenderAddress(invoice.sender.address);
      setSenderTaxId(invoice.sender.taxId);

      setClientName(invoice.client.name);
      setClientEmail(invoice.client.email);
      setClientPhone(invoice.client.phone);
      setClientAddress(invoice.client.address);
      setClientTaxId(invoice.client.taxId);

      setItems(invoice.items);
    } else {
      // New Invoice standard settings
      const today = new Date().toISOString().split('T')[0];
      const standardDueDate = new Date();
      standardDueDate.setDate(standardDueDate.getDate() + 30);
      const due = standardDueDate.toISOString().split('T')[0];

      // Auto-increment placeholder
      const randNum = Math.floor(1000 + Math.random() * 9000);
      setInvoiceNumber(`INV-${new Date().getFullYear()}-${randNum}`);
      setIssueDate(today);
      setDueDate(due);
      setStatus('Draft');
      setCurrency(defaultCurrency || 'USD');
      setTaxRate(defaultTaxRate ?? 0);
      setDiscount(0);
      setNotes('');
      setTerms(defaultTerms || '');

      setSenderName(defaultSender.name);
      setSenderEmail(defaultSender.email);
      setSenderPhone(defaultSender.phone);
      setSenderAddress(defaultSender.address);
      setSenderTaxId(defaultSender.taxId);

      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setClientAddress('');
      setClientTaxId('');

      setItems([{ id: '1', description: 'Consulting Services', quantity: 1, unitPrice: 500 }]);
    }
  }, [invoice, defaultSender, defaultTaxRate, defaultCurrency, defaultTerms]);

  // Handle Add Item
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    setItems([...items, newItem]);
  };

  // Handle Remove Item
  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  // Handle Update Item properties
  const handleUpdateItem = (id: string, key: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [key]: value };
        }
        return item;
      })
    );
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = Math.max(0, subtotal + taxAmount - discount);

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceNumber.trim()) {
      alert('Invoice number is required');
      return;
    }
    if (!clientName.trim()) {
      alert('Billing Contact / Client name is required');
      return;
    }
    if (items.some((item) => !item.description.trim())) {
      alert('All item descriptions are required');
      return;
    }

    const savedInvoice: Invoice = {
      id: invoice?.id || Date.now().toString(),
      invoiceNumber: invoiceNumber.trim(),
      issueDate,
      dueDate,
      status,
      sender: {
        name: senderName.trim(),
        email: senderEmail.trim(),
        phone: senderPhone.trim(),
        address: senderAddress.trim(),
        taxId: senderTaxId.trim(),
      },
      client: {
        name: clientName.trim(),
        email: clientEmail.trim(),
        phone: clientPhone.trim(),
        address: clientAddress.trim(),
        taxId: clientTaxId.trim(),
      },
      items,
      taxRate: Number(taxRate),
      discount: Number(discount),
      notes: notes.trim(),
      terms: terms.trim(),
      currency,
    };

    onSave(savedInvoice);
  };

  // Pre-populate Client details
  const handleSelectClient = (client: ContactInfo) => {
    setClientName(client.name);
    setClientEmail(client.email);
    setClientPhone(client.phone);
    setClientAddress(client.address);
    setClientTaxId(client.taxId);
    setShowClientDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-start overflow-y-auto p-4 z-50 animate-fade-in" id="invoice-form-backdrop">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-4xl w-full my-8 overflow-hidden flex flex-col" id="invoice-form-card">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50" id="form-header">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{invoice ? 'Edit Invoice' : 'Create New Invoice'}</h2>
            <p className="text-xs text-slate-400 mt-1">Fill in the contact details, add line items, and adjust tax rates.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close Form"
            id="close-form-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto" id="invoice-form-element">
          {/* Section 1: Settings & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="form-section-details">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Invoice #</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                placeholder="e.g. INV-2026-001"
                required
                id="input-invoice-number"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 bg-white"
                id="select-status"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                required
                id="input-issue-date"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                required
                id="input-due-date"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="form-section-contacts">
            {/* Sender / From */}
            <div className="space-y-4" id="sender-container">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-100">Sender (Your Business)</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Company / Your Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                    placeholder="My Company LLC"
                    required
                    id="input-sender-name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                      placeholder="billing@myco.com"
                      id="input-sender-email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Phone</label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                      placeholder="+1 (555) 019-2834"
                      id="input-sender-phone"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Address</label>
                  <textarea
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 h-16 resize-none"
                    placeholder="123 Business Rd, Suite 100&#10;New York, NY 10001"
                    id="input-sender-address"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tax ID / VAT Number</label>
                  <input
                    type="text"
                    value={senderTaxId}
                    onChange={(e) => setSenderTaxId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                    placeholder="Tax/VAT ID (e.g. US1234567)"
                    id="input-sender-taxid"
                  />
                </div>
              </div>
            </div>

            {/* Client / To */}
            <div className="space-y-4" id="client-container">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Bill To (Client)</h3>
                
                {/* Autocomplete previous clients if they exist */}
                {existingClients.length > 0 && (
                  <div className="relative" id="client-selector-container">
                    <button
                      type="button"
                      onClick={() => setShowClientDropdown(!showClientDropdown)}
                      className="text-xs text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                      id="select-existing-client-btn"
                    >
                      <span>Choose Existing</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {showClientDropdown && (
                      <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden" id="client-dropdown">
                        <div className="px-3 py-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider border-b border-slate-100">Previous Clients</div>
                        <div className="max-h-48 overflow-y-auto">
                          {existingClients.map((c, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectClient(c)}
                              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex flex-col gap-0.5 border-b border-slate-50 last:border-none"
                            >
                              <span className="font-semibold text-slate-800">{c.name}</span>
                              {c.email && <span className="text-slate-400 text-[10px]">{c.email}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                    placeholder="Acme Corporation"
                    required
                    id="input-client-name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                      placeholder="finance@acme.com"
                      id="input-client-email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Phone</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                      placeholder="+1 (555) 011-4920"
                      id="input-client-phone"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Address</label>
                  <textarea
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 h-16 resize-none"
                    placeholder="456 Innovation Way&#10;San Francisco, CA 94105"
                    id="input-client-address"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tax ID / VAT Number</label>
                  <input
                    type="text"
                    value={clientTaxId}
                    onChange={(e) => setClientTaxId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                    placeholder="Client's Tax/VAT ID"
                    id="input-client-taxid"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Line Items */}
          <div className="space-y-4 animate-fade-in" id="items-container">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Line Items</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{items.length} item(s)</span>
              </div>
            </div>

            <div className="space-y-3" id="items-list">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-end bg-slate-50/50 p-3 rounded-xl border border-slate-100" id={`item-row-${index}`}>
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      placeholder="Description of service/product"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 bg-white"
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 bg-white"
                      required
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Unit Price</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">$</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-full pl-6 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 bg-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-3 md:col-span-1.5 text-right font-mono text-sm text-slate-700 py-2.5 pr-2">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                  <div className="col-span-1 md:col-span-0.5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length === 1}
                      className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 rounded-lg transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-2 w-full py-2.5 border border-dashed border-slate-200 hover:border-blue-400 rounded-xl text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center justify-center gap-1.5 bg-slate-50/20 cursor-pointer hover:bg-blue-50/10 transition-colors"
              id="add-item-row-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Add Line Item</span>
            </button>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: Totals & Tax Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="form-section-totals">
            {/* Notes & Terms */}
            <div className="space-y-4" id="notes-terms-form">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Terms</label>
                <input
                  type="text"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
                  placeholder="e.g. Net 30, Due on Receipt"
                  id="input-terms"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Memo / Notes to Client</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 h-24 resize-none"
                  placeholder="Thank you for your business! Please include the invoice number on your payment."
                  id="input-notes"
                />
              </div>
            </div>

            {/* Calculations Panel */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between" id="calcs-panel">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold font-mono text-slate-700">${subtotal.toFixed(2)}</span>
                </div>

                {/* Currency selector and Tax Rate Input */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-hidden"
                      id="select-currency"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden"
                      id="input-tax-rate-field"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-slate-500 pt-1">
                  <span>Tax Collected ({taxRate}%)</span>
                  <span className="font-semibold font-mono text-slate-700">${taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-sm text-slate-500 pb-1">
                  <span className="flex items-center gap-1.5">
                    <span>Discount / Credit</span>
                  </span>
                  <div className="relative w-28">
                    <span className="absolute left-2 top-1 text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full pl-5 pr-2 py-0.5 border border-slate-200 rounded-md text-xs text-right font-mono text-slate-800 focus:outline-hidden bg-white"
                      id="input-discount-field"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between items-center" id="grand-total-row">
                <span className="text-base font-bold text-slate-800">Total Invoice Amount</span>
                <span className="text-xl font-black font-sans text-blue-600">
                  {currency} {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50" id="form-footer-actions">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            id="cancel-invoice-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            id="save-invoice-btn"
          >
            <Check className="w-4 h-4" />
            <span>Save Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
}
