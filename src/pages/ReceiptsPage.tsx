import React, { useState, useRef, useMemo } from 'react';
import { Receipt as ReceiptIcon, Plus, Trash2, Search, Printer, Pencil, IndianRupee, Layers, Users, X } from 'lucide-react';
import { toast } from '../shared/components/feedback/Toast';
import { confirmAction } from '../shared/components/feedback/ConfirmModal';
import { formatCurrency } from '../shared/utils';
import { Input, StatCard } from '../shared/components/ui';
import { PageHeader } from '../shared/components/layout';
import {
  useReceipts,
  Receipt,
  ReceiptFormData,
  ReceiptModal,
  ReceiptPrintTemplate,
  getNextReceiptNo,
  saveReceiptVoucher,
  deleteReceiptVoucher,
} from '../features/receipts';

export const ReceiptsPage: React.FC = () => {
  const { receipts, bills, profile, unpaidBills, reload } = useReceipts();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [nextReceiptNo, setNextReceiptNo] = useState('');
  const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return receipts;
    const q = search.toLowerCase();
    return receipts.filter(
      r =>
        (r.clientName || '').toLowerCase().includes(q) ||
        (r.receiptNo || '').toLowerCase().includes(q) ||
        (r.paymentMode || '').toLowerCase().includes(q) ||
        (r.againstInvoice || '').toLowerCase().includes(q)
    );
  }, [receipts, search]);

  const totalAmount = useMemo(() => {
    return filtered.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
  }, [filtered]);

  const distinctClients = useMemo(() => {
    return new Set(filtered.map(r => r.clientName).filter(Boolean)).size;
  }, [filtered]);

  const openAdd = async () => {
    const nextNo = await getNextReceiptNo(receipts.length);
    setNextReceiptNo(nextNo);
    setEditingReceipt(null);
    setShowForm(true);
  };

  const openEdit = (rcp: Receipt) => {
    setEditingReceipt(rcp);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingReceipt(null);
  };

  const handleSaveReceipt = async (formData: ReceiptFormData) => {
    try {
      await saveReceiptVoucher(formData, editingReceipt?.id || null, bills, receipts);
      toast('Receipt saved', 'success');
      closeForm();
      reload();
    } catch {
      toast('Failed to save', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (
      await confirmAction({
        title: 'Delete this receipt?',
        message:
          'The receipt voucher is removed from your records. The underlying invoice payment (if this was linked to one) stays intact.',
        confirmLabel: 'Delete',
        tone: 'danger',
      })
    ) {
      try {
        await deleteReceiptVoucher(id);
        toast('Deleted', 'success');
        reload();
      } catch {
        toast('Failed to delete', 'error');
      }
    }
  };

  const printReceipt = (receipt: Receipt) => {
    setPreviewReceipt(receipt);
    setTimeout(() => {
      const el = receiptRef.current;
      if (!el) return;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
        <html><head><title>Receipt ${receipt.receiptNo}</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 2rem; color: #1a1a2e; }
          .receipt-box { max-width: 600px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 8px; padding: 2rem; }
          .receipt-header { text-align: center; margin-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; }
          .receipt-title { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0; }
          .receipt-subtitle { font-size: 0.8rem; color: #64748b; margin: 0.25rem 0 0; }
          .receipt-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.9rem; border-bottom: 1px solid #f1f5f9; }
          .receipt-label { color: #64748b; font-weight: 500; }
          .receipt-value { color: #1e293b; font-weight: 600; }
          .receipt-amount { font-size: 1.5rem; font-weight: 800; color: #1e40af; text-align: center; margin: 1.5rem 0; padding: 1rem; background: #eff6ff; border-radius: 8px; }
          .receipt-words { font-size: 0.85rem; color: #334155; font-style: italic; text-align: center; margin-bottom: 1.5rem; }
          .receipt-footer { display: flex; justify-content: space-between; margin-top: 3rem; padding-top: 1rem; }
          .receipt-sig { text-align: center; }
          .receipt-sig-line { width: 180px; border-bottom: 1.5px solid #1e293b; margin-bottom: 0.25rem; }
          .receipt-sig-label { font-size: 0.75rem; color: #64748b; }
          .business-name { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem; }
          .business-details { font-size: 0.75rem; color: #64748b; }
          @media print { body { margin: 0; } .receipt-box { border: none; } }
        </style></head><body>
        ${el.innerHTML}
        <script>window.print(); window.close();</script>
        </body></html>
      `);
      printWindow.document.close();
      setPreviewReceipt(null);
    }, 100);
  };

  return (
    <div className="dashboard-container max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-5">
      <PageHeader
        icon={<ReceiptIcon size={20} />}
        title="Payment Receipts"
        subtitle="Generate, track, and print formal payment vouchers for clients"
        meta={`${filtered.length} Vouchers`}
      >
        <button className="btn btn-primary" onClick={openAdd} id="btn-create-receipt">
          <Plus size={18} /> New Receipt
        </button>
      </PageHeader>

      <ReceiptModal
        isOpen={showForm}
        editingReceipt={editingReceipt}
        unpaidBills={unpaidBills}
        nextReceiptNo={nextReceiptNo}
        onClose={closeForm}
        onSave={handleSaveReceipt}
      />

      {previewReceipt && (
        <ReceiptPrintTemplate ref={receiptRef} receipt={previewReceipt} profile={profile} />
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalAmount)}
          subtitle="Total receipt amount"
          icon={<IndianRupee size={20} />}
          variant="success"
        />
        <StatCard
          title="Receipts Issued"
          value={filtered.length}
          subtitle="Across all clients"
          icon={<Layers size={20} />}
          variant="primary"
        />
        <StatCard
          title="Clients"
          value={distinctClients}
          subtitle="Distinct client receipts"
          icon={<Users size={20} />}
          variant="purple"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#141414] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] rounded-[8px] p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: '360px' }}>
            <Input
              type="text"
              placeholder="Search by receipt no, client, or invoice..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              prefix={<Search size={16} className="text-[#8c8c8c]" />}
              inputSize="md"
              containerClassName="mb-0"
              allowClear
            />
          </div>
        </div>
      </div>

      {/* Receipts Table Card */}
      <div className="bg-white dark:bg-[#141414] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] rounded-[8px] overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
        <div className="px-5 py-3.5 border-b border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#141414] dark:text-[#ffffff] m-0">
            Payment Receipts Register
          </h3>
          <span className="text-xs text-[#8c8c8c]">
            {filtered.length} {filtered.length === 1 ? 'voucher' : 'vouchers'}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#f5f5f5] dark:bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[#8c8c8c] mb-3">
              <ReceiptIcon size={24} />
            </div>
            <p className="text-sm font-medium text-[#262626] dark:text-[#d9d9d9] mb-1">
              {receipts.length === 0
                ? 'No receipts generated yet.'
                : 'No receipts match your search.'}
            </p>
            <p className="text-xs text-[#8c8c8c] max-w-sm mb-4">
              {receipts.length === 0
                ? 'Generate formal receipt vouchers with print templates to acknowledge client payments.'
                : 'Try searching with a different keyword or clear the search input.'}
            </p>
            {receipts.length === 0 && (
              <button className="btn btn-primary" onClick={openAdd}>
                <Plus size={18} /> Create Receipt
              </button>
            )}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: '700px' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Receipt No</th>
                  <th>Client</th>
                  <th>Against Invoice</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Mode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rcp => (
                  <tr key={rcp.id}>
                    <td className="text-muted tabular-nums">
                      {rcp.date ? new Date(rcp.date).toLocaleDateString('en-IN') : ''}
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#e6f4ff] dark:bg-[rgba(22,119,255,0.15)] text-[#1677ff] dark:text-[#69b1ff] border border-[#91caff] dark:border-[rgba(22,119,255,0.3)] tabular-nums">
                        {rcp.receiptNo}
                      </span>
                    </td>
                    <td className="font-medium text-[#141414] dark:text-[#f0f0f0]">{rcp.clientName}</td>
                    <td className="text-muted tabular-nums">{rcp.againstInvoice || '-'}</td>
                    <td style={{ textAlign: 'right' }} className="font-bold text-[#141414] dark:text-[#ffffff] tabular-nums">
                      {formatCurrency(rcp.amount)}
                    </td>
                    <td className="text-muted">{rcp.paymentMode}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-btn icon-btn-blue"
                          onClick={() => printReceipt(rcp)}
                          title="Print"
                          aria-label="Print receipt"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => openEdit(rcp)}
                          title="Edit"
                          aria-label="Edit receipt"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-btn icon-btn-red"
                          onClick={() => rcp.id && handleDelete(rcp.id)}
                          title="Delete"
                          aria-label="Delete receipt"
                        >
                          <Trash2 size={15} />
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
    </div>
  );
};

export default ReceiptsPage;
