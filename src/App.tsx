import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  BarChart3, 
  Settings as SettingsIcon, 
  Plus, 
  TrendingUp,
  Building,
  Layers,
  Sparkles
} from 'lucide-react';
import { Invoice, BusinessSettings, ContactInfo, PaymentStatus } from './types';
import DashboardStats from './components/DashboardStats';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import TaxReport from './components/TaxReport';
import BusinessSettingsForm from './components/BusinessSettingsForm';

// Initial Defaults
const DEFAULT_BUSINESS_PROFILE: BusinessSettings = {
  sender: {
    name: 'Vortex Software Lab LLC',
    email: 'finance@vortexlab.io',
    phone: '+1 (555) 438-2045',
    address: '404 Grid Circle, Suite 700\nAustin, TX 78701',
    taxId: 'US-987654321',
  },
  currency: 'USD',
  taxRate: 10,
  terms: 'Due on Receipt',
};

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 'sample-1',
    invoiceNumber: 'INV-2026-001',
    issueDate: '2026-06-10',
    dueDate: '2026-07-10',
    status: 'Paid',
    sender: DEFAULT_BUSINESS_PROFILE.sender,
    client: {
      name: 'Acme Corporation Inc.',
      email: 'accounts@acmeco.org',
      phone: '+1 (555) 902-1249',
      address: '100 Roadrunner Way\nPhoenix, AZ 85001',
      taxId: 'ACME-99112',
    },
    items: [
      { id: 'itm-1', description: 'Enterprise Backend API Development', quantity: 1, unitPrice: 4500 },
      { id: 'itm-2', description: 'UI/UX Interactive Prototypes', quantity: 1, unitPrice: 1500 },
    ],
    taxRate: 10,
    discount: 500,
    notes: 'Thank you for choosing Vortex Software Lab. We appreciate your timely payment!',
    terms: 'Net 30 Days',
    currency: 'USD',
  },
  {
    id: 'sample-2',
    invoiceNumber: 'INV-2026-002',
    issueDate: '2026-07-02',
    dueDate: '2026-08-02',
    status: 'Sent',
    sender: DEFAULT_BUSINESS_PROFILE.sender,
    client: {
      name: 'Stark Industries LLC',
      email: 'billing@starkind.com',
      phone: '+1 (555) 3000-ARCM',
      address: '10880 Wilshire Blvd\nLos Angeles, CA 90024',
      taxId: 'IRON-4392',
    },
    items: [
      { id: 'itm-3', description: 'Advanced AI Prompt Orchestration Framework', quantity: 2, unitPrice: 3500 },
      { id: 'itm-4', description: 'Cloud Infrastructure Setup & Optimization', quantity: 12, unitPrice: 150 },
    ],
    taxRate: 12,
    discount: 0,
    notes: 'Please wire payments directly to the account details provided on our secure checkout portal.',
    terms: 'Net 30 Days',
    currency: 'USD',
  },
  {
    id: 'sample-3',
    invoiceNumber: 'INV-2026-003',
    issueDate: '2026-07-14',
    dueDate: '2026-07-28',
    status: 'Draft',
    sender: DEFAULT_BUSINESS_PROFILE.sender,
    client: {
      name: 'Wayne Enterprises Corp.',
      email: 'vendor-finance@waynecorp.com',
      phone: '+1 (555) 948-2910',
      address: '1007 Mountain Drive\nGotham City, NJ 07001',
      taxId: 'BAT-007',
    },
    items: [
      { id: 'itm-5', description: 'Next-Gen Cybersecurity Audit & Penetration Testing', quantity: 1, unitPrice: 12500 },
    ],
    taxRate: 10,
    discount: 1000,
    notes: 'Special vendor rate negotiated for Q3 cycles.',
    terms: 'Due on Receipt',
    currency: 'USD',
  },
  {
    id: 'sample-4',
    invoiceNumber: 'INV-2026-004',
    issueDate: '2026-05-18',
    dueDate: '2026-06-18',
    status: 'Overdue',
    sender: DEFAULT_BUSINESS_PROFILE.sender,
    client: {
      name: 'LexCorp International',
      email: 'procurement@lexcorp.net',
      phone: '+1 (555) 193-4920',
      address: 'LexCorp Tower, Metropolis',
      taxId: 'LEX-666',
    },
    items: [
      { id: 'itm-6', description: 'Quantum Materials Database Integration', quantity: 3, unitPrice: 4000 },
    ],
    taxRate: 15,
    discount: 0,
    notes: 'Urgent: Payment is past due. Late fees may apply at 1.5% monthly compound interest.',
    terms: 'Net 30 Days',
    currency: 'USD',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'tax-report' | 'settings'>('dashboard');
  
  // Storage states
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_PROFILE);

  // Modal / Interaction states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Load Invoices & Settings from LocalStorage
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoice_billing_invoices_v1');
    const savedSettings = localStorage.getItem('invoice_billing_settings_v1');

    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    } else {
      setInvoices(SAMPLE_INVOICES);
      localStorage.setItem('invoice_billing_invoices_v1', JSON.stringify(SAMPLE_INVOICES));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    } else {
      setSettings(DEFAULT_BUSINESS_PROFILE);
      localStorage.setItem('invoice_billing_settings_v1', JSON.stringify(DEFAULT_BUSINESS_PROFILE));
    }
  }, []);

  // Helper to save invoices state and sync with LocalStorage
  const saveInvoicesState = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
    localStorage.setItem('invoice_billing_invoices_v1', JSON.stringify(newInvoices));
  };

  // Helper to save settings state and sync with LocalStorage
  const handleSaveSettings = (updatedSettings: BusinessSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem('invoice_billing_settings_v1', JSON.stringify(updatedSettings));

    // Propagate updated business details to any existing "Draft" invoices for convenience
    const updatedInvoices = invoices.map(inv => {
      if (inv.status === 'Draft') {
        return {
          ...inv,
          sender: updatedSettings.sender,
          currency: updatedSettings.currency,
          taxRate: updatedSettings.taxRate,
        };
      }
      return inv;
    });
    saveInvoicesState(updatedInvoices);
  };

  // Currency utility mapper
  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      case 'JPY': return '¥';
      case 'INR': return '₹';
      case 'USD':
      default: return '$';
    }
  };

  const currencySymbol = getCurrencySymbol(settings.currency);

  // Handle invoice persistence (Create or Update)
  const handleSaveInvoice = (invoice: Invoice) => {
    const exists = invoices.some((i) => i.id === invoice.id);
    let newInvoices: Invoice[];

    if (exists) {
      newInvoices = invoices.map((i) => (i.id === invoice.id ? invoice : i));
    } else {
      newInvoices = [invoice, ...invoices];
    }

    saveInvoicesState(newInvoices);
    setIsFormOpen(false);
    setEditingInvoice(null);
  };

  // Handle invoice deletion
  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('Are you absolutely sure you want to delete this invoice? This cannot be undone.')) {
      const newInvoices = invoices.filter((i) => i.id !== id);
      saveInvoicesState(newInvoices);
    }
  };

  // Handle invoice status change directly from dropdown
  const handleStatusChange = (id: string, newStatus: PaymentStatus) => {
    const newInvoices = invoices.map((inv) => {
      if (inv.id === id) {
        return { ...inv, status: newStatus };
      }
      return inv;
    });
    saveInvoicesState(newInvoices);
  };

  // Handle invoice duplication (for speed drafting repetitive client works)
  const handleDuplicateInvoice = (inv: Invoice) => {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const duplicated: Invoice = {
      ...inv,
      id: Date.now().toString(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${randNum}`,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
    };
    saveInvoicesState([duplicated, ...invoices]);
    alert(`Duplicated to new Draft invoice: ${duplicated.invoiceNumber}`);
  };

  // Extract previous client details for autofill autocomplete
  const existingClientsList = invoices.reduce((acc, inv) => {
    if (inv.client && inv.client.name) {
      const alreadyPresent = acc.some(c => c.name.toLowerCase() === inv.client.name.toLowerCase());
      if (!alreadyPresent) {
        acc.push(inv.client);
      }
    }
    return acc;
  }, [] as ContactInfo[]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row antialiased" id="app-root-viewport">
      
      {/* Sidebar navigation for Professional Polish theme */}
      <aside className="w-full md:w-64 bg-slate-900 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 shrink-0 text-white no-print" id="navigation-sidebar">
        {/* Brand / Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3" id="sidebar-branding">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-base text-white shadow-sm shadow-blue-500/20 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>Invoice Gen</span>
              <span className="text-[9px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-400 px-1 py-0.2 rounded border border-blue-500/30">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium truncate">Offline Billing Software</p>
          </div>
        </div>

        {/* Tab buttons */}
        <nav className="p-4 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0 md:flex-1" id="tab-navigation">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 md:space-x-3 px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
            }`}
            id="tab-btn-dashboard"
          >
            <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center space-x-2 md:space-x-3 px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'invoices'
                ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
            }`}
            id="tab-btn-invoices"
          >
            <FileText className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('tax-report')}
            className={`flex items-center space-x-2 md:space-x-3 px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'tax-report'
                ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
            }`}
            id="tab-btn-tax-report"
          >
            <BarChart3 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Tax Summaries</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 md:space-x-3 px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-medium rounded-lg cursor-pointer transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-blue-600/25 text-blue-400 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent'
            }`}
            id="tab-btn-settings"
          >
            <SettingsIcon className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Business Profile</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="hidden md:block p-4 border-t border-slate-800 text-center text-[10px] text-slate-500" id="sidebar-footer">
          <p className="font-semibold text-slate-400">Offline Secure Sandboxed</p>
          <p className="mt-1">All data resides in your browser cache.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0" id="main-scrollable-container">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 no-print overflow-y-auto" id="main-content-viewport">
          {/* Page header section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 no-print" id="viewport-welcome-banner">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight" id="view-title">
                {activeTab === 'dashboard' && 'Financial Overview'}
                {activeTab === 'invoices' && 'Billing Ledger'}
                {activeTab === 'tax-report' && 'Tax Calculations & Reporting'}
                {activeTab === 'settings' && 'Billing Profile Defaults'}
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1" id="view-desc">
                {activeTab === 'dashboard' && `Overview of ${settings.sender.name}'s invoices and outstanding collections.`}
                {activeTab === 'invoices' && 'Search, filter, view details, change statuses, edit, or copy previous transactions.'}
                {activeTab === 'tax-report' && 'Monthly breakdown of gross sales, discounts, and pending liabilities.'}
                {activeTab === 'settings' && 'Your default billing details are automatically stamped onto any invoice you print.'}
              </p>
            </div>

            {/* Primary Quick Create Action */}
            {activeTab !== 'settings' && (
              <button
                onClick={() => {
                  setEditingInvoice(null);
                  setIsFormOpen(true);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-98 border border-blue-700/50"
                id="primary-create-invoice-btn"
              >
                <Plus className="w-4 h-4" />
                <span>Create Invoice</span>
              </button>
            )}
          </div>

          {/* Dynamic content wrapper based on active tab selection */}
          <div id="dynamic-tab-wrapper">
            {activeTab === 'dashboard' && (
              <div className="space-y-6" id="dashboard-tab-content">
                {/* Stats & stack breakdown visualizer */}
                <DashboardStats invoices={invoices} currencySymbol={currencySymbol} />
                
                {/* Quick LEDGER preview containing recent 4 invoices */}
                <div className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4" id="recent-invoices-section">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3" id="recent-header">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Transactions</h3>
                    <button
                      onClick={() => setActiveTab('invoices')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer flex items-center gap-1"
                      id="view-all-invoices-shortcut"
                    >
                      View All Ledger Invoices &rarr;
                    </button>
                  </div>
                  
                  {/* Embedded Invoice List (with slice of recent 4) */}
                  <InvoiceList
                    invoices={invoices.slice(0, 4)}
                    onView={(inv) => setViewingInvoice(inv)}
                    onEdit={(inv) => {
                      setEditingInvoice(inv);
                      setIsFormOpen(true);
                    }}
                    onDelete={handleDeleteInvoice}
                    onDuplicate={handleDuplicateInvoice}
                    onStatusChange={handleStatusChange}
                    onAddNew={() => setIsFormOpen(true)}
                    currencySymbol={currencySymbol}
                  />
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div id="invoices-tab-content">
                <InvoiceList
                  invoices={invoices}
                  onView={(inv) => setViewingInvoice(inv)}
                  onEdit={(inv) => {
                    setEditingInvoice(inv);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDeleteInvoice}
                  onDuplicate={handleDuplicateInvoice}
                  onStatusChange={handleStatusChange}
                  onAddNew={() => setIsFormOpen(true)}
                  currencySymbol={currencySymbol}
                />
              </div>
            )}

            {activeTab === 'tax-report' && (
              <div id="tax-report-tab-content">
                <TaxReport invoices={invoices} currencySymbol={currencySymbol} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div id="settings-tab-content">
                <BusinessSettingsForm settings={settings} onSave={handleSaveSettings} />
              </div>
            )}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="py-6 border-t border-slate-200 bg-white/50 text-center text-xs text-slate-500 no-print mt-auto" id="system-footer">
          <div className="max-w-7xl mx-auto px-4" id="footer-inner-text">
            <p className="font-medium text-slate-600">© 2026 Invoice Generator Applet. Professional Grade Local Sandbox.</p>
            <p className="mt-1 text-[11px] text-slate-400">All computations are securely maintained offline in your local browser storage cache.</p>
          </div>
        </footer>
      </div>

      {/* Invoice FORM modal (Creation & Editing) */}
      {isFormOpen && (
        <InvoiceForm
          invoice={editingInvoice}
          onSave={handleSaveInvoice}
          onClose={() => {
            setIsFormOpen(false);
            setEditingInvoice(null);
          }}
          defaultSender={settings.sender}
          defaultTaxRate={settings.taxRate}
          defaultCurrency={settings.currency}
          defaultTerms={settings.terms}
          existingClients={existingClientsList}
        />
      )}

      {/* Invoice PREVIEW modal (Printing & PDF exporting view) */}
      {viewingInvoice && (
        <InvoicePreview
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          currencySymbol={getCurrencySymbol(viewingInvoice.currency)}
        />
      )}
    </div>
  );
}
