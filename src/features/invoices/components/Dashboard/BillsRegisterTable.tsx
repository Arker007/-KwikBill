import React, { useState, useMemo } from 'react';
import { Select, StatusBadge } from '@/shared/components/ui';
import {
  FileText,
  Plus,
  StickyNote,
  Edit3,
  Copy,
  IndianRupee,
  MessageCircle,
  Send,
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { INVOICE_TYPES } from '../../constants';
import { DashboardBill, DashboardVisibleColumns, STATUS_CONFIG } from './types';

interface BillsRegisterTableProps {
  bills: DashboardBill[];
  filtered: DashboardBill[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAllVisible: () => void;
  visibleColumns: DashboardVisibleColumns;
  bulkBusy: boolean;
  onBulkMarkStatus: (status: string) => void;
  onBulkExportJSON: () => void;
  onBulkExportPDF: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  onNew?: () => void;
  onView: (bill: DashboardBill) => void;
  onDuplicate?: (bill: DashboardBill) => void;
  onConvert?: (bill: DashboardBill) => void;
  onOpenPaymentModal: (bill: DashboardBill) => void;
  onShareWhatsApp: (bill: DashboardBill) => void;
  onSendReminder: (bill: DashboardBill & { clientPhone?: string }) => void;
  onShareEmail: (bill: DashboardBill) => void;
  onDelete: (bill: DashboardBill) => void;
  onChangeStatus: (bill: DashboardBill, newStatus: string) => void;
  getClientPhone: (bill: DashboardBill) => string;
}

export const BillsRegisterTable: React.FC<BillsRegisterTableProps> = ({
  bills,
  filtered,
  selectedIds,
  onToggleSelect,
  onToggleSelectAllVisible,
  visibleColumns,
  bulkBusy,
  onBulkMarkStatus,
  onBulkExportJSON,
  onBulkExportPDF,
  onBulkDelete,
  onClearSelection,
  onNew,
  onView,
  onDuplicate,
  onConvert,
  onOpenPaymentModal,
  onShareWhatsApp,
  onSendReminder,
  onShareEmail,
  onDelete,
  onChangeStatus,
  getClientPhone,
}) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const sortedBills = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.invoiceDate).getTime() || 0;
      const timeB = new Date(b.invoiceDate).getTime() || 0;
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [filtered, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  return (
    <>
      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div
          id="bulk-action-toolbar"
          className="flex items-center gap-2 flex-wrap p-2.5 mb-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs animate-in fade-in duration-150"
        >
          <strong className="text-xs sm:text-sm font-semibold mr-1">
            {selectedIds.size} selected
          </strong>
          <button
            id="btn-bulk-mark-paid"
            type="button"
            className="btn btn-secondary px-2.5 py-1 text-xs"
            disabled={bulkBusy}
            onClick={() => onBulkMarkStatus('paid')}
          >
            <CheckCircle size={13} className="text-emerald-500" /> Mark paid
          </button>
          <button
            id="btn-bulk-mark-unpaid"
            type="button"
            className="btn btn-secondary px-2.5 py-1 text-xs"
            disabled={bulkBusy}
            onClick={() => onBulkMarkStatus('unpaid')}
          >
            <Clock size={13} className="text-amber-500" /> Mark unpaid
          </button>
          <button
            id="btn-bulk-mark-overdue"
            type="button"
            className="btn btn-secondary px-2.5 py-1 text-xs"
            disabled={bulkBusy}
            onClick={() => onBulkMarkStatus('overdue')}
          >
            <AlertTriangle size={13} className="text-rose-500" /> Mark overdue
          </button>
          <button
            id="btn-bulk-export-json"
            type="button"
            className="btn btn-secondary px-2.5 py-1 text-xs"
            disabled={bulkBusy}
            onClick={onBulkExportJSON}
          >
            <FileText size={13} className="text-purple-500" /> Export JSON
          </button>
          <button
            id="btn-bulk-export-pdf"
            type="button"
            className="btn btn-secondary px-2.5 py-1 text-xs"
            disabled={bulkBusy}
            onClick={onBulkExportPDF}
          >
            Export PDF
          </button>
          <button
            id="btn-bulk-delete"
            type="button"
            className="btn btn-danger px-2.5 py-1 text-xs"
            disabled={bulkBusy}
            onClick={onBulkDelete}
          >
            <Trash2 size={13} /> Delete
          </button>
          <button
            id="btn-bulk-clear-selection"
            type="button"
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 ml-auto text-xs px-2 py-1"
            onClick={onClearSelection}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Empty State vs Table */}
      {sortedBills.length === 0 ? (
        <div
          id="dashboard-empty-state"
          className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-slate-800"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 shadow-xs">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            {bills.length === 0 ? 'No invoices yet' : 'No invoices match your filters'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
            {bills.length === 0
              ? 'Create your first invoice to get started.'
              : 'Try adjusting your search query, status tabs, or date range.'}
          </p>
          {bills.length === 0 && onNew && (
            <button
              id="btn-empty-new-invoice"
              type="button"
              className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm"
              onClick={onNew}
            >
              <Plus size={18} /> Create Invoice
            </button>
          )}
        </div>
      ) : (
        <div id="bills-register-table-scroll" className="table-scroll rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#141414]">
          <table id="bills-register-table" className="data-table w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                <th style={{ width: '36px', padding: '0.65rem 0.5rem 0.65rem 0.85rem' }}>
                  <input
                    id="checkbox-select-all-visible"
                    type="checkbox"
                    checked={sortedBills.length > 0 && sortedBills.every((b) => selectedIds.has(b.id))}
                    onChange={onToggleSelectAllVisible}
                    title="Select all visible"
                    style={{ width: 15, height: 15, accentColor: '#1677ff', cursor: 'pointer' }}
                  />
                </th>
                {visibleColumns.invoice && <th>Invoice No.</th>}
                {visibleColumns.client && <th>Client</th>}
                {visibleColumns.date && (
                  <th>
                    <button
                      type="button"
                      onClick={toggleSortOrder}
                      className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      <span>Date</span>
                      {sortOrder === 'desc' ? (
                        <ArrowDown size={14} className="text-[#1677ff]" />
                      ) : (
                        <ArrowUp size={14} className="text-[#1677ff]" />
                      )}
                    </button>
                  </th>
                )}
                {visibleColumns.type && <th>Type</th>}
                {visibleColumns.amount && <th>Amount</th>}
                {visibleColumns.currency && <th>Currency</th>}
                {visibleColumns.status && <th>Status</th>}
                {visibleColumns.dueDate && <th>Due Date</th>}
                {visibleColumns.printed && <th>Printed</th>}
                <th>Paid</th>
                {visibleColumns.actions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {sortedBills.map((bill) => {
                const status = bill.status || 'unpaid';
                const isOverdue =
                  status !== 'paid' &&
                  bill.data?.details?.dueDate &&
                  new Date(bill.data.details.dueDate) < new Date();
                const daysOverdue =
                  isOverdue && bill.data?.details?.dueDate
                    ? Math.floor(
                        (Date.now() - new Date(bill.data.details.dueDate).getTime()) / 86400000
                      )
                    : 0;
                const billCurrency =
                  bill.currency || bill.data?.invoiceOptions?.currency || 'INR';

                return (
                  <tr
                    key={bill.id}
                    id={`bill-row-${bill.id}`}
                    className={`hover:bg-slate-50/60 dark:hover:bg-[#1a1a1a]/60 transition-colors ${
                      isOverdue || status === 'overdue' ? 'row-overdue bg-rose-50/20 dark:bg-rose-950/10' : ''
                    }`}
                    style={selectedIds.has(bill.id) ? { background: 'var(--info-bg)' } : undefined}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '0.65rem 0.5rem 0.65rem 0.85rem' }}>
                      <input
                        id={`checkbox-select-bill-${bill.id}`}
                        type="checkbox"
                        checked={selectedIds.has(bill.id)}
                        onChange={() => onToggleSelect(bill.id)}
                        style={{ width: 15, height: 15, accentColor: '#1677ff', cursor: 'pointer' }}
                      />
                    </td>

                    {/* Invoice No. */}
                    {visibleColumns.invoice && (
                      <td>
                        <button
                          type="button"
                          onClick={() => onView(bill)}
                          className="font-bold text-[#1677ff] dark:text-[#4096ff] hover:underline text-left cursor-pointer"
                        >
                          {bill.invoiceNumber}
                        </button>
                      </td>
                    )}

                    {/* Client */}
                    {visibleColumns.client && (
                      <td className="font-medium text-slate-800 dark:text-slate-200" title={bill.clientName}>
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[180px]">{bill.clientName}</span>
                          {bill.data?.internalNote && (
                            <span
                              title={bill.data.internalNote}
                              className="cursor-help inline-flex text-amber-500 shrink-0"
                            >
                              <StickyNote size={13} />
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Date */}
                    {visibleColumns.date && (
                      <td className="text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">
                        {new Date(bill.invoiceDate).toLocaleDateString('en-IN')}
                      </td>
                    )}

                    {/* Type */}
                    {visibleColumns.type && (
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {((INVOICE_TYPES as any)[bill.invoiceType || 'tax-invoice'])?.label || 'Invoice'}
                        </span>
                      </td>
                    )}

                    {/* Amount */}
                    {visibleColumns.amount && (
                      <td className="font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap tabular-nums">
                        {formatCurrency(bill.totalAmount, billCurrency)}
                        {billCurrency !== 'INR' && !visibleColumns.currency && (
                          <span className="ml-1 text-[10px] px-1 py-0.2 bg-slate-100 dark:bg-slate-800 rounded font-normal text-slate-500">
                            {billCurrency}
                          </span>
                        )}
                      </td>
                    )}

                    {/* Currency */}
                    {visibleColumns.currency && (
                      <td className="text-slate-500 dark:text-slate-400">{billCurrency}</td>
                    )}

                    {/* Status */}
                    {visibleColumns.status && (
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Select
                            id={`select-status-${bill.id}`}
                            value={isOverdue && status !== 'overdue' ? 'overdue' : status}
                            onChange={(e) => onChangeStatus(bill, e.target.value)}
                            options={Object.entries(STATUS_CONFIG).map(([key, val]) => ({
                              value: key,
                              label: val.label,
                            }))}
                            selectSize="sm"
                            fullWidth={false}
                            containerClassName="mb-0 w-[100px]"
                          />
                          {daysOverdue > 0 && (
                            <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded tabular-nums">
                              {daysOverdue}d overdue
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Due Date */}
                    {visibleColumns.dueDate && (
                      <td className="text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">
                        {bill.data?.details?.dueDate ? (
                          new Date(bill.data.details.dueDate).toLocaleDateString('en-IN')
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>
                    )}

                    {/* Printed */}
                    {visibleColumns.printed && (
                      <td className="text-slate-500 dark:text-slate-400 text-center tabular-nums">
                        {Number(bill.printedCount) || 0}×
                      </td>
                    )}

                    {/* Paid */}
                    <td className="text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">
                      {(bill.paidAmount || 0) > 0 ? (
                        formatCurrency(bill.paidAmount, billCurrency)
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    {visibleColumns.actions && (
                      <td>
                        <div className="table-actions flex items-center gap-1">
                          <button
                            id={`btn-edit-bill-${bill.id}`}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#1677ff] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            onClick={() => onView(bill)}
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                          {onDuplicate && (
                            <button
                              id={`btn-duplicate-bill-${bill.id}`}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#1677ff] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                              onClick={() => onDuplicate(bill)}
                              title="Duplicate"
                            >
                              <Copy size={15} />
                            </button>
                          )}
                          {(bill.invoiceType === 'proforma' || bill.invoiceType === 'delivery-challan') &&
                            onConvert && (
                              <button
                                id={`btn-convert-bill-${bill.id}`}
                                className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                                onClick={() => onConvert(bill)}
                                title="Convert to Tax Invoice"
                              >
                                <FileText size={15} />
                              </button>
                            )}
                          <button
                            id={`btn-payment-bill-${bill.id}`}
                            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            onClick={() => onOpenPaymentModal(bill)}
                            title="Record Payment"
                          >
                            <IndianRupee size={15} />
                          </button>
                          <button
                            id={`btn-whatsapp-bill-${bill.id}`}
                            className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            onClick={() => onShareWhatsApp(bill)}
                            title="Share via WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </button>
                          {(isOverdue || status === 'overdue' || status === 'unpaid' || status === 'partial') &&
                            (bill.totalAmount || 0) - (bill.paidAmount || 0) > 0.01 && (
                              <button
                                id={`btn-remind-bill-${bill.id}`}
                                className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                                onClick={() => onSendReminder({ ...bill, clientPhone: getClientPhone(bill) })}
                                title={
                                  status === 'partial'
                                    ? 'Send reminder — partial pending'
                                    : status === 'overdue' || isOverdue
                                    ? 'Send reminder — overdue'
                                    : 'Send reminder — unpaid'
                                }
                              >
                                <Send size={15} />
                              </button>
                            )}
                          <button
                            id={`btn-email-bill-${bill.id}`}
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            onClick={() => onShareEmail(bill)}
                            title="Email"
                          >
                            <Mail size={15} />
                          </button>
                          <button
                            id={`btn-delete-bill-${bill.id}`}
                            className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            onClick={() => onDelete(bill)}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default BillsRegisterTable;
