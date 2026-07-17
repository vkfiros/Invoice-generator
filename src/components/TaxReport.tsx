import React, { useState } from 'react';
import { Download, Calendar, DollarSign, Users, Award, ShieldAlert } from 'lucide-react';
import { Invoice } from '../types';

interface TaxReportProps {
  invoices: Invoice[];
  currencySymbol: string;
}

export default function TaxReport({ invoices, currencySymbol }: TaxReportProps) {
  // Years & Months selections
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>('All'); // 'All' or '01' through '12'

  const months = [
    { name: 'January', value: '01' },
    { name: 'February', value: '02' },
    { name: 'March', value: '03' },
    { name: 'April', value: '04' },
    { name: 'May', value: '05' },
    { name: 'June', value: '06' },
    { name: 'July', value: '07' },
    { name: 'August', value: '08' },
    { name: 'September', value: '09' },
    { name: 'October', value: '10' },
    { name: 'November', value: '11' },
    { name: 'December', value: '12' },
  ];

  // Helper calculations
  const getInvoiceAmounts = (inv: Invoice) => {
    const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * (inv.taxRate / 100);
    const discount = inv.discount || 0;
    const total = Math.max(0, subtotal + tax - discount);
    return { subtotal, tax, discount, total };
  };

  // Filter invoices based on selected year/month
  const filteredInvoices = invoices.filter((inv) => {
    if (!inv.issueDate) return false;
    const date = new Date(inv.issueDate);
    const yearMatch = date.getFullYear() === selectedYear;

    let monthMatch = true;
    if (selectedMonth !== 'All') {
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      monthMatch = monthStr === selectedMonth;
    }

    return yearMatch && monthMatch;
  });

  // Calculate high-level aggregates
  const aggregates = filteredInvoices.reduce(
    (acc, inv) => {
      const { subtotal, tax, discount, total } = getInvoiceAmounts(inv);

      acc.totalSales += subtotal;
      acc.totalDiscounts += discount;
      acc.grandTotal += total;

      if (inv.status === 'Paid') {
        acc.taxCollected += tax;
        acc.paidAmount += total;
      } else {
        acc.taxPending += tax;
        acc.unpaidAmount += total;
      }

      return acc;
    },
    { totalSales: 0, totalDiscounts: 0, grandTotal: 0, taxCollected: 0, taxPending: 0, paidAmount: 0, unpaidAmount: 0 }
  );

  // Group by Customer
  const customerSummaries = filteredInvoices.reduce((acc, inv) => {
    const clientName = inv.client.name || 'Unknown Client';
    const clientEmail = inv.client.email || 'N/A';
    const { subtotal, tax, discount, total } = getInvoiceAmounts(inv);

    if (!acc[clientName]) {
      acc[clientName] = {
        name: clientName,
        email: clientEmail,
        invoiceCount: 0,
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        paid: 0,
        unpaid: 0,
      };
    }

    acc[clientName].invoiceCount += 1;
    acc[clientName].subtotal += subtotal;
    acc[clientName].tax += tax;
    acc[clientName].discount += discount;
    acc[clientName].total += total;

    if (inv.status === 'Paid') {
      acc[clientName].paid += total;
    } else {
      acc[clientName].unpaid += total;
    }

    return acc;
  }, {} as Record<string, any>);

  const customersList = Object.values(customerSummaries);

  // Export Customer monthly tax summary to CSV file
  const handleExportCSV = () => {
    const headers = [
      'Customer Name',
      'Client Email',
      'Invoices Count',
      'Net Subtotal Sales',
      'Discount Applied',
      'Tax Amount',
      'Grand Total',
      'Amount Paid',
      'Outstanding Balance',
    ];

    const rows = customersList.map((c: any) => [
      `"${c.name.replace(/"/g, '""')}"`,
      c.email,
      c.invoiceCount,
      c.subtotal.toFixed(2),
      c.discount.toFixed(2),
      c.tax.toFixed(2),
      c.total.toFixed(2),
      c.paid.toFixed(2),
      c.unpaid.toFixed(2),
    ]);

    const csvContent = [
      `Monthly Tax Report - Year: ${selectedYear} Month: ${selectedMonth}`,
      `Generated on: ${new Date().toLocaleDateString()}`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Monthly_Tax_Report_${selectedYear}_${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatAmount = (val: number) => {
    return `${currencySymbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 animate-fade-in" id="tax-report-panel">
      {/* Filters Toolbar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="tax-report-filters">
        <div className="flex items-center gap-3" id="tax-period-picker">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tax Period Report</h3>
            <p className="text-xs text-slate-500">Summarize tax liabilities & customer metrics</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3" id="tax-selectors">
          {/* Month Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Month:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-hidden cursor-pointer"
              id="select-report-month"
            >
              <option value="All">All Months</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-hidden cursor-pointer"
              id="select-report-year"
            >
              {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Export to CSV Button */}
          {customersList.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-700/50"
              id="export-csv-report-btn"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Highlights Financial summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="tax-totals-grid">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Sales (Before Tax)</span>
          <h4 className="text-xl font-extrabold font-mono text-slate-900 mt-2">{formatAmount(aggregates.totalSales)}</h4>
          <span className="text-[10px] text-slate-500 mt-1">Excludes discounts: {formatAmount(aggregates.totalDiscounts)}</span>
        </div>

        {/* Taxes Collected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Tax Collected (Paid)</span>
          <h4 className="text-xl font-extrabold font-mono text-emerald-600 mt-2">{formatAmount(aggregates.taxCollected)}</h4>
          <span className="text-[10px] text-slate-500 mt-1">Ready for quarterly filing</span>
        </div>

        {/* Taxes Pending */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Tax Pending (Unpaid)</span>
          <h4 className="text-xl font-extrabold font-mono text-amber-600 mt-2">{formatAmount(aggregates.taxPending)}</h4>
          <span className="text-[10px] text-slate-500 mt-1">From draft & sent invoices</span>
        </div>

        {/* Total Tax Liability */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Combined Tax</span>
          <h4 className="text-xl font-extrabold font-mono text-slate-900 mt-2">{formatAmount(aggregates.taxCollected + aggregates.taxPending)}</h4>
          <span className="text-[10px] text-slate-500 mt-1">Total across {filteredInvoices.length} invoices</span>
        </div>
      </div>

      {/* Customer Summaries Tables */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="customer-summaries-card">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/40" id="customer-summaries-header">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tax Summaries by Client / Customer</h4>
          <span className="text-xs text-slate-500 font-medium">{customersList.length} customer(s) billed in this period</span>
        </div>

        {customersList.length > 0 ? (
          <div className="overflow-x-auto" id="customer-report-table-wrapper">
            <table className="w-full text-left border-collapse" id="customer-tax-report-table">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                  <th className="py-3 px-6">Customer Name</th>
                  <th className="py-3 px-6">Invoices</th>
                  <th className="py-3 px-6">Billed Subtotal</th>
                  <th className="py-3 px-6">VAT / Tax</th>
                  <th className="py-3 px-6">Grand Total</th>
                  <th className="py-3 px-6">Amount Collected</th>
                  <th className="py-3 px-6 text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {customersList.map((c: any, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-slate-500 text-[11px]">{c.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">{c.invoiceCount}</td>
                    <td className="py-4 px-6 font-mono text-slate-900">{formatAmount(c.subtotal)}</td>
                    <td className="py-4 px-6 font-mono text-slate-600">{formatAmount(c.tax)}</td>
                    <td className="py-4 px-6 font-bold font-mono text-slate-900">{formatAmount(c.total)}</td>
                    <td className="py-4 px-6 font-mono text-emerald-600 font-bold">{formatAmount(c.paid)}</td>
                    <td className="py-4 px-6 font-mono text-right text-rose-600 font-bold">
                      {c.unpaid > 0 ? formatAmount(c.unpaid) : <span className="text-slate-300 font-normal">None</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center" id="empty-customer-summaries">
            <div className="inline-flex p-3 bg-slate-50 text-slate-400 rounded-xl mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-bold text-slate-700">No client data found for this period</h5>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Try changing your month or year filters above, or record some invoices with that issue date.</p>
          </div>
        )}
      </div>
    </div>
  );
}
