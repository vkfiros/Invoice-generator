import React, { useState } from 'react';
import { Search, Filter, Eye, Edit2, Copy, Trash2, Calendar, FileText, ChevronDown, RefreshCw } from 'lucide-react';
import { Invoice, PaymentStatus } from '../types';

interface InvoiceListProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onDuplicate: (invoice: Invoice) => void;
  onStatusChange: (id: string, newStatus: PaymentStatus) => void;
  onAddNew: () => void;
  currencySymbol: string;
}

export default function InvoiceList({
  invoices,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  onAddNew,
  currencySymbol,
}: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'number' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculates single invoice total amount
  const calculateTotal = (inv: Invoice) => {
    const subtotal = inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = subtotal * (inv.taxRate / 100);
    return Math.max(0, subtotal + tax - inv.discount);
  };

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter((inv) => {
      const matchSearch =
        inv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.client.email && inv.client.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
      } else if (sortBy === 'number') {
        comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
      } else if (sortBy === 'amount') {
        comparison = calculateTotal(a) - calculateTotal(b);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            ● Paid
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            ● Sent
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            ● Overdue
          </span>
        );
      case 'Draft':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
            ● Draft
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="invoice-list-container">
      {/* Filters and Search Bar */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40" id="list-toolbar">
        {/* Search */}
        <div className="relative flex-1" id="search-input-wrapper">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, email, or invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 bg-white"
            id="search-invoices-input"
          />
        </div>

        {/* Filters/Sort controls */}
        <div className="flex flex-wrap items-center gap-3" id="toolbar-filters">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5" id="status-filter-wrapper">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-hidden cursor-pointer"
              id="select-status-filter"
            >
              <option value="All">All Invoices</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5" id="sort-filter-wrapper">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-hidden cursor-pointer"
              id="select-sort-by"
            >
              <option value="date">Issue Date</option>
              <option value="number">Invoice #</option>
              <option value="amount">Total Amount</option>
            </select>
          </div>

          {/* Asc/Desc toggler */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Toggle Sort Order"
            id="toggle-sort-order-btn"
          >
            {sortOrder === 'desc' ? 'Desc' : 'Asc'}
          </button>
        </div>
      </div>

      {/* Main Invoices Table */}
      {filteredInvoices.length > 0 ? (
        <div className="overflow-x-auto" id="invoices-table-container">
          <table className="w-full text-left border-collapse" id="invoices-table">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                <th className="py-3 px-6">Invoice #</th>
                <th className="py-3 px-6">Client / Bill To</th>
                <th className="py-3 px-6">Issue Date</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6">Total Amount</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const totalAmount = calculateTotal(inv);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 group transition-colors" id={`invoice-row-${inv.id}`}>
                    {/* Invoice Number */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        <span className="font-bold text-slate-900 text-xs">{inv.invoiceNumber}</span>
                      </div>
                    </td>

                    {/* Client Name & Email */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs">{inv.client.name}</div>
                        {inv.client.email && <div className="text-slate-500 text-[11px]">{inv.client.email}</div>}
                      </div>
                    </td>

                    {/* Issue Date */}
                    <td className="py-4 px-6 text-slate-600 text-xs">
                      {formatDate(inv.issueDate)}
                    </td>

                    {/* Due Date */}
                    <td className="py-4 px-6 text-slate-600 text-xs">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(inv.dueDate)}</span>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-slate-900 font-mono text-xs">
                        {inv.currency} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Status Select Badge */}
                    <td className="py-4 px-6">
                      <div className="relative inline-block text-left" id={`status-dropdown-${inv.id}`}>
                        <select
                          value={inv.status}
                          onChange={(e) => onStatusChange(inv.id, e.target.value as PaymentStatus)}
                          className={`appearance-none font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md cursor-pointer pr-6 bg-white border outline-hidden transition-all ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                              : inv.status === 'Sent'
                              ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                              : inv.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Paid">Paid</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onView(inv)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="View / Print PDF"
                          id={`view-invoice-${inv.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(inv)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Invoice"
                          id={`edit-invoice-${inv.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicate(inv)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Duplicate Invoice"
                          id={`duplicate-invoice-${inv.id}`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Invoice"
                          id={`delete-invoice-${inv.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        // Empty State
        <div className="py-16 px-6 text-center" id="empty-invoices-state">
          <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-2xl mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">No invoices found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchTerm || statusFilter !== 'All'
              ? "We couldn't find any invoices matching your search or filters. Try adjusting your selections."
              : "Create your first professional bill to send to customers, track payment dates, and export as PDF."}
          </p>
          {!searchTerm && statusFilter === 'All' && (
            <button
              onClick={onAddNew}
              className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm text-xs cursor-pointer transition-colors"
              id="empty-create-invoice-btn"
            >
              Create First Invoice
            </button>
          )}
        </div>
      )}
    </div>
  );
}
