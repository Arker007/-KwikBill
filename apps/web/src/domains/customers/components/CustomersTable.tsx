import React from 'react';
import { Download, Trash2, Edit3, MessageCircle, Eye, FileText } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { openWhatsAppShare } from '@/shared/utils/share';
import { Client, ClientStats } from '@/features/clients/types';
import { getAvatarColorPair, getCustomerInitials } from '@/features/clients/utils/avatarColors';
import { INVOICE_TYPES } from '@/features/invoices/constants';

export interface CustomersTableProps {
  paginatedClients: string[];
  clients: Client[];
  selectedIds: Set<string>;
  onToggleSelect: (clientName: string) => void;
  onToggleSelectAll: () => void;
  getClientStats: (name: string) => ClientStats;
  getClientBills: (name: string) => any[];
  expandedClient: string | null;
  setExpandedClient: React.Dispatch<React.SetStateAction<string | null>>;
  rowActionMenu: {
    clientName: string;
    savedClient?: Client;
    isExpanded: boolean;
    rect: { top: number; right: number; bottom: number; left: number };
  } | null;
  setRowActionMenu: React.Dispatch<
    React.SetStateAction<{
      clientName: string;
      savedClient?: Client;
      isExpanded: boolean;
      rect: { top: number; right: number; bottom: number; left: number };
    } | null>
  >;
  sortField: 'balance' | 'name';
  toggleSort: (field: 'balance' | 'name') => void;
  handleClientStatement: (name: string) => void;
  handleAgingReport: (name: string) => void;
  handleDeleteClient: (idOrName: string) => void;
  handleDeleteBill: (id: string) => void;
  openEditClient: (client: Client) => void;
  openAddClient: (prefill?: Partial<Client>) => void;
  onEdit?: (bill: any) => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  paginatedClients,
  clients,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  getClientStats,
  getClientBills,
  expandedClient,
  setExpandedClient,
  rowActionMenu,
  setRowActionMenu,
  sortField,
  toggleSort,
  handleClientStatement,
  handleAgingReport,
  handleDeleteClient,
  handleDeleteBill,
  openEditClient,
  openAddClient,
  onEdit,
}) => {
  const formatNoteDate = (client: Client | undefined) => {
    if ((client as any)?.createdAt) {
      try {
        const d = new Date((client as any).createdAt);
        return `Created: ${d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}`;
      } catch {
        return 'Active customer';
      }
    }
    if (client?.gstin) {
      return `GSTIN: ${client.gstin}`;
    }
    return 'Created: Recently';
  };

  const shareWhatsApp = (bill: any) => {
    const msg = `*Invoice ${bill.invoiceNumber}*\nAmount: ${formatCurrency(bill.totalAmount)}\nDate: ${new Date(
      bill.invoiceDate
    ).toLocaleDateString('en-IN')}\nStatus: ${(bill.status || 'unpaid').toUpperCase()}`;
    openWhatsAppShare(bill.clientPhone, msg);
  };

  return (
    <div className="overflow-x-auto relative">
      {/* Floating 3-dots Row Action Menu Dropdown */}
      {rowActionMenu && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={(e) => {
              e.stopPropagation();
              setRowActionMenu(null);
            }}
          />
          <div
            className="fixed bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 py-1 text-xs text-left w-48"
            style={{
              top: `${rowActionMenu.rect.bottom + 4}px`,
              right: `${Math.max(12, window.innerWidth - rowActionMenu.rect.right)}px`,
            }}
          >
            <button
              type="button"
              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 text-slate-700 dark:text-slate-200 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const targetName = rowActionMenu.clientName;
                setRowActionMenu(null);
                setExpandedClient((prev) => (prev === targetName ? null : targetName));
              }}
            >
              <Eye size={13} className="text-slate-500 dark:text-slate-400" />
              <span>{rowActionMenu.isExpanded ? 'Hide Ledger' : 'View Ledger'}</span>
            </button>

            <button
              type="button"
              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 text-slate-700 dark:text-slate-200 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const saved = rowActionMenu.savedClient;
                const name = rowActionMenu.clientName;
                setRowActionMenu(null);
                if (saved) openEditClient(saved);
                else openAddClient({ name });
              }}
            >
              <Edit3 size={13} className="text-slate-500 dark:text-slate-400" />
              <span>Edit Customer</span>
            </button>

            <button
              type="button"
              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 text-slate-700 dark:text-slate-200 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const name = rowActionMenu.clientName;
                setRowActionMenu(null);
                handleClientStatement(name);
              }}
            >
              <Download size={13} className="text-slate-500 dark:text-slate-400" />
              <span>Statement PDF</span>
            </button>

            <button
              type="button"
              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 text-slate-700 dark:text-slate-200 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const name = rowActionMenu.clientName;
                setRowActionMenu(null);
                handleAgingReport(name);
              }}
            >
              <FileText size={13} className="text-slate-500 dark:text-slate-400" />
              <span>Aging Report PDF</span>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

            <button
              type="button"
              className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2 text-rose-600 dark:text-rose-400 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const saved = rowActionMenu.savedClient;
                const name = rowActionMenu.clientName;
                setRowActionMenu(null);
                if (saved?.id) {
                  handleDeleteClient(saved.id);
                } else {
                  handleDeleteClient(name);
                }
              }}
            >
              <Trash2 size={13} />
              <span>Delete Customer</span>
            </button>
          </div>
        </>
      )}

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <th className="py-2.5 px-3 w-[4%]">
              <input
                type="checkbox"
                checked={paginatedClients.length > 0 && paginatedClients.every((name) => selectedIds.has(name))}
                onChange={onToggleSelectAll}
                title="Select all visible customers"
                className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
              />
            </th>
            <th className="py-2.5 px-4 w-[34%] font-medium">
              <div
                className="flex items-center space-x-1 cursor-pointer select-none"
                onClick={() => toggleSort('name')}
                title="Sort by Name"
              >
                <span>Name</span>
                <svg
                  className={`w-3 h-3 ${sortField === 'name' ? 'text-blue-600' : 'text-slate-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </th>
            <th className="py-2.5 px-4 w-[22%] font-medium">Contact Info</th>
            <th className="py-2.5 px-4 w-[16%] font-medium">
              <div
                className="flex items-center space-x-1 cursor-pointer select-none"
                onClick={() => toggleSort('balance')}
                title="Sort by Closing Balance"
              >
                <span>Closing Balance</span>
                <svg
                  className={`w-3 h-3 ${sortField === 'balance' ? 'text-blue-600' : 'text-slate-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </th>
            <th className="py-2.5 px-4 w-[14%] font-medium">Notes</th>
            <th className="py-2.5 px-4 w-[10%] text-right font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {paginatedClients.map((clientName) => {
            const stats = getClientStats(clientName);
            const savedClient = clients.find((c) => c.name === clientName);
            const isExpanded = expandedClient === clientName;
            const clientBills = isExpanded ? getClientBills(clientName) : [];
            const pair = getAvatarColorPair(clientName);
            const initials = getCustomerInitials(clientName);
            const isSelected = selectedIds.has(clientName);

            return (
              <React.Fragment key={clientName}>
                <tr
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group ${
                    isSelected ? 'bg-blue-50/50 dark:bg-blue-950/40' : isExpanded ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  <td className="py-2.5 px-3 align-middle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(clientName)}
                      className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
                    />
                  </td>

                  {/* Name Column */}
                  <td className="py-2.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-7 h-7 rounded-full ${pair.bg} ${pair.text} font-semibold text-[11px] flex items-center justify-center flex-shrink-0 shadow-2xs`}
                      >
                        {initials}
                      </div>
                      <div className="leading-tight min-w-0">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 truncate block">
                          {clientName}
                        </span>
                        {(savedClient as any)?.companyName && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight truncate">
                            {(savedClient as any).companyName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact Info Column */}
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                    <div className="leading-tight">
                      {savedClient?.phone ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="tabular-nums">{savedClient.phone}</span>
                          <button
                            type="button"
                            title="Chat on WhatsApp"
                            onClick={() => openWhatsAppShare(savedClient.phone, `Hello ${clientName},`)}
                            className="hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center"
                          >
                            <svg className="w-3.5 h-3.5 text-emerald-500 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                      {savedClient?.email && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {savedClient.email}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Closing Balance Column with Tabular Numbers */}
                  <td className="py-2.5 px-4 font-normal text-slate-800 dark:text-slate-200 tabular-nums">
                    {stats.unpaid > 0.005 ? (
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(stats.unpaid)}
                      </span>
                    ) : stats.unpaid < -0.005 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatCurrency(Math.abs(stats.unpaid))} (Cr)
                      </span>
                    ) : (
                      <span>₹ 0.00</span>
                    )}
                  </td>

                  {/* Notes Column */}
                  <td className="py-2.5 px-4 text-slate-400 dark:text-slate-500">
                    <span>{formatNoteDate(savedClient)}</span>
                  </td>

                  {/* Actions Column */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="inline-flex items-center space-x-1.5 relative">
                      <button
                        type="button"
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded text-[11px] font-medium flex items-center space-x-1 transition-colors shadow-2xs cursor-pointer"
                        onClick={() => {
                          setExpandedClient((prev) => (prev === clientName ? null : clientName));
                        }}
                        title="View Customer Ledger & Invoices"
                      >
                        <svg
                          className="w-3 h-3 text-slate-500 dark:text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                          <path
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                        <span>Ledger</span>
                      </button>
                      <button
                        type="button"
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded text-[11px] font-medium flex items-center space-x-1 transition-colors shadow-2xs cursor-pointer"
                        onClick={() => {
                          if (savedClient) openEditClient(savedClient);
                          else openAddClient({ name: clientName });
                        }}
                        title="Edit Customer"
                      >
                        <svg
                          className="w-3 h-3 text-slate-500 dark:text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          />
                        </svg>
                        <span>Edit</span>
                      </button>

                      {/* 3 Dots Menu Button */}
                      <button
                        type="button"
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          rowActionMenu?.clientName === clientName
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const btnRect = e.currentTarget.getBoundingClientRect();
                          if (rowActionMenu?.clientName === clientName) {
                            setRowActionMenu(null);
                          } else {
                            setRowActionMenu({
                              clientName,
                              savedClient,
                              isExpanded,
                              rect: {
                                top: btnRect.top,
                                right: btnRect.right,
                                bottom: btnRect.bottom,
                                left: btnRect.left,
                              },
                            });
                          }
                        }}
                        title="More Actions"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="19" cy="12" r="2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expandable Ledger Sub-table */}
                {isExpanded && (
                  <tr>
                    <td colSpan={5} className="bg-slate-50/70 dark:bg-slate-950/40 p-4 border-b border-slate-200 dark:border-slate-800">
                      <div className="space-y-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                          <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                            {clientName} — Customer Ledger & Invoice History
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium flex items-center space-x-1 cursor-pointer"
                              onClick={() => handleClientStatement(clientName)}
                            >
                              <Download size={12} />
                              <span>Statement PDF</span>
                            </button>
                            <button
                              type="button"
                              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium flex items-center space-x-1 cursor-pointer"
                              onClick={() => handleAgingReport(clientName)}
                            >
                              <Download size={12} />
                              <span>Aging PDF</span>
                            </button>
                            <button
                              type="button"
                              className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded text-xs font-medium flex items-center space-x-1 cursor-pointer"
                              onClick={() => handleDeleteClient(savedClient?.id || clientName)}
                            >
                              <Trash2 size={12} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Address & Contact details */}
                        {savedClient && (
                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded">
                            {savedClient.phone && (
                              <div>
                                <strong className="text-slate-700 dark:text-slate-200">Phone:</strong> {savedClient.phone}
                              </div>
                            )}
                            {savedClient.email && (
                              <div>
                                <strong className="text-slate-700 dark:text-slate-200">Email:</strong> {savedClient.email}
                              </div>
                            )}
                            {savedClient.gstin && (
                              <div>
                                <strong className="text-slate-700 dark:text-slate-200">GSTIN:</strong> {savedClient.gstin}
                              </div>
                            )}
                            {savedClient.address && (
                              <div>
                                <strong className="text-slate-700 dark:text-slate-200">Address:</strong> {savedClient.address}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Transactions table */}
                        {clientBills.length === 0 ? (
                          <div className="p-4 text-center text-slate-400 text-xs">
                            No invoices recorded for this customer yet.
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium text-[11px]">
                                  <th className="py-1.5 px-2">Date</th>
                                  <th className="py-1.5 px-2">Invoice #</th>
                                  <th className="py-1.5 px-2">Type</th>
                                  <th className="py-1.5 px-2 text-right">Amount</th>
                                  <th className="py-1.5 px-2">Status</th>
                                  <th className="py-1.5 px-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {clientBills.map((bill: any) => (
                                  <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <td className="py-1.5 px-2 text-slate-600 dark:text-slate-300">
                                      {new Date(bill.invoiceDate).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="py-1.5 px-2 font-mono font-medium text-slate-900 dark:text-slate-100">
                                      {bill.invoiceNumber}
                                    </td>
                                    <td className="py-1.5 px-2 text-slate-500 dark:text-slate-400">
                                      {(INVOICE_TYPES as any)[bill.invoiceType || 'tax-invoice']?.label || 'Tax Invoice'}
                                    </td>
                                    <td className="py-1.5 px-2 text-right font-medium text-slate-900 dark:text-slate-100">
                                      {formatCurrency(bill.totalAmount)}
                                    </td>
                                    <td className="py-1.5 px-2">
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                          bill.status === 'paid'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                            : bill.status === 'partial'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                        }`}
                                      >
                                        {bill.status || 'unpaid'}
                                      </span>
                                    </td>
                                    <td className="py-1.5 px-2 text-right">
                                      <div className="flex items-center justify-end space-x-1">
                                        {onEdit && (
                                          <button
                                            type="button"
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded cursor-pointer"
                                            onClick={() => onEdit(bill)}
                                            title="Edit Invoice"
                                          >
                                            <Edit3 size={12} />
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          className="p-1 hover:bg-emerald-100 text-emerald-600 rounded cursor-pointer"
                                          onClick={() => shareWhatsApp(bill)}
                                          title="Share via WhatsApp"
                                        >
                                          <MessageCircle size={12} />
                                        </button>
                                        <button
                                          type="button"
                                          className="p-1 hover:bg-rose-100 text-rose-600 rounded cursor-pointer"
                                          onClick={() => handleDeleteBill(bill.id)}
                                          title="Delete Invoice"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersTable;
