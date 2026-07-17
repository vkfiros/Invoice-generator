import React from 'react';
import { DollarSign, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Invoice } from '../types';

interface DashboardStatsProps {
  invoices: Invoice[];
  currencySymbol: string;
}

export default function DashboardStats({ invoices, currencySymbol }: DashboardStatsProps) {
  // Helper to calculate totals
  const calculateInvoiceTotal = (inv: Invoice) => {
    const subtotal = inv.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * (inv.taxRate / 100);
    return Math.max(0, subtotal + tax - inv.discount);
  };

  const totals = invoices.reduce(
    (acc, inv) => {
      const amt = calculateInvoiceTotal(inv);
      acc.total += amt;
      if (inv.status === 'Paid') {
        acc.paid += amt;
      } else if (inv.status === 'Sent') {
        acc.outstanding += amt;
      } else if (inv.status === 'Overdue') {
        acc.overdue += amt;
        acc.outstanding += amt;
      } else if (inv.status === 'Draft') {
        acc.draft += amt;
      }
      return acc;
    },
    { total: 0, paid: 0, outstanding: 0, overdue: 0, draft: 0 }
  );

  const statusCounts = invoices.reduce(
    (acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    },
    { Draft: 0, Sent: 0, Paid: 0, Overdue: 0 } as Record<string, number>
  );

  const formatAmount = (val: number) => {
    return `${currencySymbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Status progress percentages for visual representation
  const paidPercent = totals.total > 0 ? (totals.paid / totals.total) * 100 : 0;
  const outstandingPercent = totals.total > 0 ? (totals.outstanding / totals.total) * 100 : 0;
  const draftPercent = totals.total > 0 ? (totals.draft / totals.total) * 100 : 0;

  return (
    <div className="space-y-6" id="dashboard-stats-container">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {/* Total Collected */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-start justify-between" id="stat-collected">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Collected</span>
            <h3 className="text-2xl font-extrabold font-sans text-slate-900">{formatAmount(totals.paid)}</h3>
            <p className="text-xs text-slate-500">From {statusCounts.Paid} paid invoices</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-start justify-between" id="stat-outstanding">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Outstanding</span>
            <h3 className="text-2xl font-extrabold font-sans text-slate-900">{formatAmount(totals.outstanding)}</h3>
            <p className="text-xs text-slate-500">Pending {statusCounts.Sent} sent invoices</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-start justify-between" id="stat-overdue">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overdue</span>
            <h3 className="text-2xl font-extrabold font-sans text-rose-600">{formatAmount(totals.overdue)}</h3>
            <p className="text-xs text-rose-500">{statusCounts.Overdue} overdue payments</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Total Sales Created */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex items-start justify-between" id="stat-total-created">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales</span>
            <h3 className="text-2xl font-extrabold font-sans text-slate-900">{formatAmount(totals.total)}</h3>
            <p className="text-xs text-slate-500">Across {invoices.length} invoices total</p>
          </div>
          <div className="p-3 bg-slate-50 text-slate-600 rounded-lg shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual State Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm" id="revenue-breakdown-card">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Revenue Breakdown & Allocation</h3>
        <div className="space-y-4">
          {/* Stacked bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex" id="revenue-bar-track">
            {totals.total > 0 ? (
              <>
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${paidPercent}%` }}
                  title={`Collected: ${formatAmount(totals.paid)}`}
                />
                <div 
                  className="bg-blue-400 h-full transition-all duration-500" 
                  style={{ width: `${outstandingPercent}%` }}
                  title={`Outstanding: ${formatAmount(totals.outstanding)}`}
                />
                <div 
                  className="bg-slate-300 h-full transition-all duration-500" 
                  style={{ width: `${draftPercent}%` }}
                  title={`Draft: ${formatAmount(totals.draft)}`}
                />
              </>
            ) : (
              <div className="w-full bg-slate-100 text-slate-400 text-xs flex items-center justify-center font-medium">No sales recorded yet</div>
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs" id="revenue-legend">
            <div className="flex items-center space-x-2" id="legend-collected">
              <span className="w-3 h-3 rounded-full bg-emerald-500 block"></span>
              <span className="text-slate-500">Collected:</span>
              <span className="font-semibold text-slate-700">{formatAmount(totals.paid)}</span>
              <span className="text-slate-400">({paidPercent.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center space-x-2" id="legend-outstanding">
              <span className="w-3 h-3 rounded-full bg-blue-400 block"></span>
              <span className="text-slate-500">Outstanding:</span>
              <span className="font-semibold text-slate-700">{formatAmount(totals.outstanding)}</span>
              <span className="text-slate-400">({outstandingPercent.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center space-x-2" id="legend-draft">
              <span className="w-3 h-3 rounded-full bg-slate-300 block"></span>
              <span className="text-slate-500">Draft:</span>
              <span className="font-semibold text-slate-700">{formatAmount(totals.draft)}</span>
              <span className="text-slate-400">({draftPercent.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
