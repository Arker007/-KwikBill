import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, AlertTriangle, Send, Package } from 'lucide-react';
import PageHeader from '../shared/components/layout/PageHeader';
import HelpButton from '../shared/components/feedback/HelpButton';
import { toast } from '../shared/components/feedback/Toast';
import { confirmAction } from '../shared/components/feedback/ConfirmModal';
import { AlertBanner } from '../shared/components/feedback/AlertBanner';
import { openWhatsAppShare } from '../shared/utils/share';
import { formatCurrency, getFYOptions, belongsToProfile } from '../shared/utils';
import {
  getAllBills,
  deleteBill,
  saveBill,
  getAllProducts,
  saveProduct,
  getProfile,
  getAllClients,
  getStockAlertSettings,
  saveReceipt,
  deleteReceipt,
  getAllReceipts,
} from '../store';

import {
  DashboardBill,
  DashboardStats,
  DashboardVisibleColumns,
  ReceiptModalTarget,
  EditPaymentModalState,
  MetricCards,
  RegisterFilters,
  BillsRegisterTable,
  ReceiptModal,
  PaymentModal,
  EditPaymentModal,
  RemindAllModal,
  STATUS_CONFIG,
} from '../features/invoices/components/Dashboard';

export interface DashboardPageProps {
  onNew?: () => void;
  onEdit?: (bill: any) => void;
  onDuplicate?: (bill: any) => void;
  onConvert?: (bill: any) => void;
  onOpenProducts?: () => void;
  activeProfile?: any;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNew,
  onEdit,
  onDuplicate,
  onConvert,
  onOpenProducts,
  activeProfile,
}) => {
  const [allBills, setBills] = useState<DashboardBill[]>([]);
  const [profileState, setProfileState] = useState<any>(null);

  const profile = activeProfile ?? profileState;

  const bills = useMemo(
    () => allBills.filter(b => belongsToProfile(b, profile)),
    [allBills, profile],
  );

  const [filtered, setFiltered] = useState<DashboardBill[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ byCurrency: {}, count: 0 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fyFilter, setFyFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [visibleColumns, setVisibleColumns] = useState<DashboardVisibleColumns>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gst_dashboardColumns') || 'null');
      if (saved && typeof saved === 'object') return saved;
    } catch {
      /* ignore */
    }
    return {
      date: true,
      invoice: true,
      type: true,
      client: true,
      amount: true,
      status: true,
      actions: true,
      printed: false,
      currency: false,
      dueDate: false,
    };
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('gst_dashboardColumns', JSON.stringify(visibleColumns));
    } catch {
      /* ignore */
    }
  }, [visibleColumns]);

  const [bulkBusy, setBulkBusy] = useState(false);
  const [paymentModal, setPaymentModal] = useState<DashboardBill | null>(null);
  const [receiptTarget, setReceiptTarget] = useState<ReceiptModalTarget | null>(null);
  const [editPaymentModal, setEditPaymentModal] = useState<EditPaymentModalState | null>(null);
  const [paymentInput, setPaymentInput] = useState({
    amount: '',
    date: '',
    mode: 'bank-transfer',
    note: '',
  });
  const [showRemindAll, setShowRemindAll] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);

  const fyOptions = useMemo(() => getFYOptions(), []);

  const loadBills = async () => {
    try {
      const data = (await getAllBills()) as DashboardBill[];
      const today = new Date().toISOString().split('T')[0];

      // Orphaned-payment reconciliation
      let reconciled = 0;
      try {
        const receipts = await getAllReceipts().catch(() => []);
        const receiptsByBillKey = new Map<string, any[]>();
        for (const r of receipts) {
          const key = r.billId || r.againstInvoice;
          if (!key) continue;
          if (!receiptsByBillKey.has(key)) receiptsByBillKey.set(key, []);
          receiptsByBillKey.get(key)!.push(r);
        }
        const reconcileWrites: Promise<any>[] = [];
        for (const bill of data) {
          const rcpts = receiptsByBillKey.get(bill.id) || receiptsByBillKey.get(bill.invoiceNumber) || [];
          if (!rcpts.length) continue;
          const currentPayments = Array.isArray(bill.payments) ? bill.payments : [];
          const missing = rcpts.filter(r => {
            return !currentPayments.some(p =>
              (r.receiptNo && p.receiptNo === r.receiptNo) ||
              (Math.abs((Number(p.amount) || 0) - (Number(r.amount) || 0)) < 0.005 &&
                p.date === r.date &&
                (p.mode || '').toLowerCase() === (r.paymentMode || '').toLowerCase().replace(' ', '-'))
            );
          });
          if (!missing.length) continue;
          const modeMap: Record<string, string> = {
            'Bank Transfer': 'bank-transfer',
            UPI: 'upi',
            Cash: 'cash',
            Cheque: 'cheque',
            Card: 'card',
            Other: 'other',
          };
          const merged = [
            ...currentPayments,
            ...missing.map(r => ({
              id: r.id || ('pay_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)),
              amount: Number(r.amount) || 0,
              date: r.date,
              mode: modeMap[r.paymentMode] || (r.paymentMode || 'other').toLowerCase().replace(' ', '-'),
              note: r.note || (r.receiptNo ? `Reconciled from receipt ${r.receiptNo}` : 'Reconciled from orphaned receipt'),
              recordedAt: r.recordedAt || new Date().toISOString(),
              receiptNo: r.receiptNo,
            })),
          ];
          const totalPaid = merged.reduce((s, p) => s + (Number(p.amount) || 0), 0);
          const billTotal = Number(bill.totalAmount) || 0;
          const nextStatus =
            totalPaid >= billTotal && billTotal > 0
              ? 'paid'
              : totalPaid > 0
              ? 'partial'
              : 'unpaid';

          bill.payments = merged;
          bill.paidAmount = totalPaid;
          bill.status = nextStatus;
          reconciled += missing.length;
          reconcileWrites.push(saveBill(bill, { overwrite: true }).catch(() => null));
        }
        if (reconcileWrites.length) await Promise.allSettled(reconcileWrites);
      } catch {
        /* non-fatal */
      }
      if (reconciled > 0) {
        toast(
          `Reconciled ${reconciled} orphaned payment${reconciled === 1 ? '' : 's'} against ${reconciled === 1 ? 'its' : 'their'} invoice${reconciled === 1 ? '' : 's'}`,
          'success',
          6000
        );
      }

      // Auto-detect overdue
      const dirty = data.filter(bill => {
        const dueDate = bill.data?.details?.dueDate;
        return dueDate && dueDate < today && bill.status !== 'paid' && bill.status !== 'overdue';
      });
      if (dirty.length > 0) {
        const updates = dirty.map(bill => {
          bill.status = 'overdue';
          return saveBill(bill, { overwrite: true });
        });
        await Promise.allSettled(updates);
      }

      setBills(data);

      // Group totals by currency
      const byCurrency: Record<string, { total: number; tax: number; unpaid: number }> = {};
      for (const b of data) {
        const cur = b.currency || b.data?.invoiceOptions?.currency || 'INR';
        if (!byCurrency[cur]) byCurrency[cur] = { total: 0, tax: 0, unpaid: 0 };
        byCurrency[cur].total += b.totalAmount || 0;
        byCurrency[cur].tax += b.totalTaxAmount || 0;
        if (b.status !== 'paid') {
          byCurrency[cur].unpaid += (b.totalAmount || 0) - (b.paidAmount || 0);
        }
      }
      setStats({ byCurrency, count: data.length });
    } catch {
      toast('Failed to load invoices', 'error');
    }
  };

  useEffect(() => {
    loadBills();
    getProfile().then(p => setProfileState(p)).catch(() => {});
    getAllClients().then(c => setClients(c)).catch(() => {});
    Promise.all([
      getAllProducts().catch(() => []),
      getStockAlertSettings().catch(() => ({ enabled: true, threshold: 5 })),
    ]).then(([prods, cfg]) => {
      if (cfg?.enabled === false) {
        setLowStockProducts([]);
        return;
      }
      const threshold = Number(cfg?.threshold ?? 5);
      setLowStockProducts(prods.filter((p: any) => (p.stock ?? 0) <= threshold));
    });
  }, []);

  useEffect(() => {
    let result = bills;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        b =>
          (b.clientName || '').toLowerCase().includes(q) ||
          (b.invoiceNumber || '').toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') result = result.filter(b => (b.invoiceType || 'tax-invoice') === typeFilter);
    if (statusFilter !== 'all') result = result.filter(b => (b.status || 'unpaid') === statusFilter);
    if (fyFilter !== 'all') {
      const fy = fyOptions.find((f: any) => f.value === fyFilter);
      if (fy) result = result.filter(b => b.invoiceDate >= fy.from && b.invoiceDate <= fy.to);
    }
    if (dateFrom) result = result.filter(b => b.invoiceDate >= dateFrom);
    if (dateTo) result = result.filter(b => b.invoiceDate <= dateTo);
    setFiltered(result);
  }, [bills, search, typeFilter, statusFilter, fyFilter, dateFrom, dateTo]);

  const handleDelete = async (bill: DashboardBill) => {
    const ok = await confirmAction({
      title: 'Delete this invoice?',
      message: `Invoice ${bill.invoiceNumber} for ${bill.clientName} will be soft-deleted (moved to Trash for 30 days). Stock will be restored for any products in this invoice.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (ok) {
      try {
        if (bill.data?.items) {
          const products = await getAllProducts();
          for (const item of bill.data.items) {
            if (!item.productId) continue;
            const product = products.find((p: any) => p.id === item.productId);
            if (!product) continue;
            await saveProduct({ ...product, stock: (product.stock || 0) + (item.quantity || 0) });
          }
        }
        await deleteBill(bill.id);

        const prefix: Record<string, string> = {
          'tax-invoice': 'INV',
          proforma: 'PRO',
          'credit-note': 'CN',
          'bill-of-supply': 'BOS',
          'delivery-challan': 'DC',
        };
        const pfx = prefix[bill.invoiceType || 'tax-invoice'] || 'INV';
        const pdfName = `${pfx}_${(bill.invoiceNumber || '').replace(/\//g, '-')}.pdf`;
        const clientName = bill.clientName || bill.data?.client?.name || 'General';
        fetch('/api/trash-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: pdfName, clientName }),
        }).catch(err => console.warn('Could not trash PDF:', err));

        toast('Invoice deleted & stock restored', 'success');
        loadBills();
      } catch {
        toast('Failed to delete', 'error');
      }
    }
  };

  const handleView = (bill: DashboardBill) => {
    if (bill.data && onEdit) onEdit(bill);
    else toast('No editable data saved for this invoice', 'warning');
  };

  const changeStatus = async (bill: DashboardBill, newStatus: string) => {
    const updated = { ...bill, status: newStatus };
    if (newStatus === 'paid') {
      updated.paidAmount = bill.totalAmount;
      const already = (bill.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
      const outstanding = Math.max(0, Number(bill.totalAmount) - already);
      if (outstanding > 0) {
        updated.payments = [
          ...(bill.payments || []),
          {
            amount: outstanding,
            date: new Date().toISOString().split('T')[0],
            mode: 'other',
            note: 'Marked paid',
            recordedAt: new Date().toISOString(),
          },
        ];
      }
    }
    await saveBill(updated, { overwrite: true });
    toast(`Marked as ${STATUS_CONFIG[newStatus]?.label || newStatus}`, 'info');
    loadBills();
  };

  const openPaymentModal = (bill: DashboardBill) => {
    setPaymentModal(bill);
    setPaymentInput({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      mode: 'bank-transfer',
      note: '',
    });
  };

  const recordPayment = async () => {
    const amount = parseFloat(paymentInput.amount);
    if (!isFinite(amount) || amount <= 0) {
      toast('Enter a positive payment amount', 'warning');
      return;
    }
    if (!paymentModal) return;
    const bill = paymentModal;
    const billTotal = Number(bill.totalAmount) || 0;
    const alreadyPaid = Number(bill.paidAmount) || 0;
    const outstanding = Math.max(0, billTotal - alreadyPaid);
    if (amount > outstanding + 0.01) {
      const proceed = await confirmAction({
        title: 'Record as overpayment?',
        message: `This payment (${formatCurrency(amount, bill.currency)}) is more than the outstanding balance (${formatCurrency(outstanding, bill.currency)}).\n\nThe extra will be saved as client credit and can be applied to future invoices.`,
        confirmLabel: 'Yes, record overpayment',
        tone: 'warning',
      });
      if (!proceed) return;
    }
    const paymentEntry = {
      id: 'pay_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      amount,
      date: paymentInput.date,
      mode: paymentInput.mode,
      note: paymentInput.note,
      recordedAt: new Date().toISOString(),
    };
    const payments = [...(bill.payments || []), paymentEntry];
    const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const updatedBill: DashboardBill = {
      ...bill,
      payments,
      paidAmount: totalPaid,
      status: totalPaid >= billTotal ? 'paid' : 'partial',
    };
    await saveBill(updatedBill, { overwrite: true });
    try {
      await saveReceipt({
        id: paymentEntry.id,
        date: paymentEntry.date,
        receiptNo: `RCPT-${paymentEntry.id.replace('pay_', '').toUpperCase().slice(0, 10)}`,
        clientName: bill.data?.client?.name || bill.clientName || '',
        clientAddress: bill.data?.client?.address || '',
        amount: paymentEntry.amount,
        paymentMode: paymentEntry.mode,
        referenceNo: paymentEntry.note || '',
        againstInvoice: bill.invoiceNumber || bill.id || '',
        note: paymentEntry.note || '',
        currency: bill.currency || bill.data?.invoiceOptions?.currency || 'INR',
        source: 'auto-from-payment',
        billId: bill.id,
      });
    } catch {
      /* non-fatal */
    }
    toast(`Payment of ${formatCurrency(amount, bill.currency)} recorded`, 'success');
    setPaymentModal(null);
    setReceiptTarget({ bill: updatedBill, payment: paymentEntry, remaining: billTotal - totalPaid });
    loadBills();
  };

  const openReceiptFor = (bill: DashboardBill, payment: any) => {
    const totalPaid = (bill.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
    setReceiptTarget({ bill, payment, remaining: Number(bill.totalAmount || 0) - totalPaid });
  };

  const deletePaymentAt = async (bill: DashboardBill, idx: number) => {
    if (
      !(await confirmAction({
        title: 'Delete this payment?',
        message: 'The invoice will revert to unpaid/partial if the sum drops below the total.',
        confirmLabel: 'Delete payment',
        tone: 'danger',
      }))
    )
      return;
    const target = (bill.payments || [])[idx];
    const payments = (bill.payments || []).filter((_, i) => i !== idx);
    const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const total = Number(bill.totalAmount) || 0;
    const updated: DashboardBill = {
      ...bill,
      payments,
      paidAmount: totalPaid,
      status: totalPaid >= total && total > 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid',
    };
    await saveBill(updated, { overwrite: true });
    if (target?.id) {
      try {
        await deleteReceipt(target.id);
      } catch {
        /* ignore */
      }
    }
    toast('Payment deleted', 'success');
    setPaymentModal(updated);
    loadBills();
  };

  const editPaymentAt = (bill: DashboardBill, idx: number) => {
    const target = (bill.payments || [])[idx];
    if (!target) return;
    setEditPaymentModal({
      bill,
      idx,
      form: {
        amount: String(target.amount || ''),
        date: target.date || new Date().toISOString().split('T')[0],
        mode: target.mode || 'bank-transfer',
        note: target.note || '',
      },
    });
  };

  const saveEditedPayment = async () => {
    if (!editPaymentModal) return;
    const { bill, idx, form } = editPaymentModal;
    const newAmount = parseFloat(form.amount);
    if (!isFinite(newAmount) || newAmount <= 0) {
      toast('Enter a positive amount', 'warning');
      return;
    }
    const others = (bill.payments || []).filter((_, i) => i !== idx);
    const othersSum = others.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const newTotal = othersSum + newAmount;
    const billTotal = Number(bill.totalAmount) || 0;
    if (newTotal > billTotal + 0.01) {
      const ok = await confirmAction({
        title: 'Save as overpayment?',
        message: `This edit brings the total received (${formatCurrency(newTotal, bill.currency)}) above the invoice total (${formatCurrency(billTotal, bill.currency)}).`,
        confirmLabel: 'Save overpayment',
        tone: 'warning',
      });
      if (!ok) return;
    }
    const target = (bill.payments || [])[idx];
    const withId = target.id || ('pay_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
    const payments = (bill.payments || []).map((p, i) =>
      i === idx
        ? { ...p, id: withId, amount: newAmount, date: form.date, mode: form.mode, note: form.note }
        : p
    );
    const totalPaid = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const status = totalPaid >= billTotal && billTotal > 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
    const updated: DashboardBill = { ...bill, payments, paidAmount: totalPaid, status };
    await saveBill(updated, { overwrite: true });
    try {
      await saveReceipt({
        id: withId,
        date: form.date,
        receiptNo: `RCPT-${withId.replace('pay_', '').toUpperCase().slice(0, 10)}`,
        clientName: bill.data?.client?.name || bill.clientName || '',
        clientAddress: bill.data?.client?.address || '',
        amount: newAmount,
        paymentMode: form.mode,
        referenceNo: form.note || '',
        againstInvoice: bill.invoiceNumber || bill.id || '',
        note: form.note || '',
        currency: bill.currency || bill.data?.invoiceOptions?.currency || 'INR',
        source: 'auto-from-payment',
        billId: bill.id,
      });
    } catch {
      /* non-fatal */
    }
    toast('Payment updated', 'success');
    setPaymentModal(updated);
    setEditPaymentModal(null);
    loadBills();
  };

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAllVisible = () =>
    setSelectedIds(prev => {
      const allVisible = filtered.every(b => prev.has(b.id));
      if (allVisible) {
        const next = new Set(prev);
        filtered.forEach(b => next.delete(b.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach(b => next.add(b.id));
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());
  const getSelectedBills = () => bills.filter(b => selectedIds.has(b.id));

  const bulkMarkStatus = async (newStatus: string) => {
    const sel = getSelectedBills();
    if (sel.length === 0) return;
    if (
      !(await confirmAction({
        title: `Mark ${sel.length} invoice${sel.length !== 1 ? 's' : ''} as ${newStatus}?`,
        message:
          newStatus === 'paid'
            ? 'A synthetic payment will be recorded for each so payment history + cashflow stay consistent.'
            : 'The status change is reversible — you can flip it back any time.',
        confirmLabel: `Mark as ${newStatus}`,
      }))
    )
      return;
    setBulkBusy(true);
    try {
      const nowIso = new Date().toISOString();
      const today = nowIso.slice(0, 10);
      const updates = sel.map(b => {
        const patch: DashboardBill = { ...b, status: newStatus };
        if (newStatus === 'paid') {
          patch.paidAmount = b.totalAmount || 0;
          const already = (b.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
          const outstanding = Math.max(0, Number(b.totalAmount) - already);
          if (outstanding > 0) {
            patch.payments = [
              ...(b.payments || []),
              {
                amount: outstanding,
                date: today,
                mode: 'other',
                note: 'Marked paid (bulk)',
                recordedAt: nowIso,
              },
            ];
          }
        }
        return saveBill(patch, { overwrite: true });
      });
      const results = await Promise.allSettled(updates);
      const failed = results.filter(r => r.status === 'rejected').length;
      if (failed > 0) toast(`${sel.length - failed} updated, ${failed} failed`, 'warning');
      else toast(`Marked ${sel.length} as ${newStatus}`, 'success');
      clearSelection();
      loadBills();
    } catch (err: any) {
      toast('Bulk update failed: ' + err.message, 'error');
    }
    setBulkBusy(false);
  };

  const bulkDelete = async () => {
    const sel = getSelectedBills();
    if (sel.length === 0) return;
    if (
      !(await confirmAction({
        title: `Delete ${sel.length} invoice${sel.length !== 1 ? 's' : ''}?`,
        message:
          'The invoices will be moved to Trash for 30 days. The PDF copies in Saved Invoices/ stay untouched.',
        confirmLabel: `Delete ${sel.length}`,
        tone: 'danger',
      }))
    )
      return;
    setBulkBusy(true);
    try {
      const results = await Promise.allSettled(sel.map(b => deleteBill(b.id)));
      const failed = results.filter(r => r.status === 'rejected').length;
      if (failed > 0) toast(`${sel.length - failed} deleted, ${failed} failed`, 'warning');
      else toast(`Deleted ${sel.length} invoice${sel.length !== 1 ? 's' : ''}`, 'success');
      clearSelection();
      loadBills();
    } catch (err: any) {
      toast('Bulk delete failed: ' + err.message, 'error');
    }
    setBulkBusy(false);
  };

  const bulkExportJSON = () => {
    const sel = getSelectedBills();
    if (sel.length === 0) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            __freegstbill_backup: true,
            __selection: true,
            bills: sel,
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freegstbill-bills-${sel.length}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${sel.length} invoice${sel.length !== 1 ? 's' : ''} as JSON`, 'success');
  };

  const bulkExportPDF = async (billsOverride: DashboardBill[] | null = null) => {
    const sel = billsOverride || getSelectedBills();
    if (sel.length === 0) return;
    if (
      sel.length > 100 &&
      !(await confirmAction({
        title: `Export ${sel.length} invoices?`,
        message: `This may take a minute and produce a large PDF file.`,
        confirmLabel: 'Continue',
        tone: 'warning',
      }))
    )
      return;
    setBulkBusy(true);
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const InvoicePreviewMod = await import('../features/invoices/components/InvoicePreview/InvoicePreview');
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-99999px;top:0;width:794px;background:#fff;';
      document.body.appendChild(container);
      const root = createRoot(container);
      const capScale = Math.min(4, Math.max(2, Math.round((window.devicePixelRatio || 1) * 1.2)));
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch {
          /* non-fatal */
        }
      }
      (window as any).__fgsbBulkAbort = false;
      let ok = 0;
      for (let i = 0; i < sel.length; i++) {
        if ((window as any).__fgsbBulkAbort) break;
        const bill = sel[i];
        const data = bill.data || {};
        if (sel.length > 5 && i % 5 === 0) {
          toast(`Exporting ${i + 1} of ${sel.length}…`, 'info', 1500);
        }
        await new Promise(resolve => {
          root.render(
            React.createElement((InvoicePreviewMod as any).default, {
              profile: data.profile,
              client: data.client,
              details: data.details,
              items: data.items,
              totals: data.totals,
              invoiceType: data.invoiceType,
              customTerms: data.customTerms,
              customNotes: data.customNotes,
              extraSections: data.extraSections,
              options: data.invoiceOptions,
            })
          );
          requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100)));
        });
        try {
          const canvas = await html2canvas(container.firstElementChild as HTMLElement || container, {
            scale: capScale,
            backgroundColor: '#ffffff',
            useCORS: false,
            logging: false,
          });
          const img = canvas.toDataURL('image/jpeg', 0.92);
          const w = 210,
            h = (canvas.height * 210) / canvas.width;
          if (ok > 0) doc.addPage();
          doc.addImage(img, 'JPEG', 0, 0, w, Math.min(h, 297), undefined, 'FAST');
          ok++;
        } catch (e) {
          /* skip broken bill */
        }
        await new Promise(r => setTimeout(r, 0));
      }
      root.unmount();
      document.body.removeChild(container);
      if ((window as any).__fgsbBulkAbort) {
        toast(`Aborted after ${ok} of ${sel.length}`, 'warning');
      }
      (window as any).__fgsbBulkAbort = false;
      if (ok === 0) {
        toast('Could not generate any PDFs', 'error');
        return;
      }
      const filename = `freegstbill-invoices-${ok}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      toast(`Exported ${ok} of ${sel.length} invoices`, 'success');
    } catch (e) {
      toast('Bulk PDF export failed — see console', 'error');
      console.error('bulkExportPDF', e);
    }
    setBulkBusy(false);
  };

  const bulkPrintByFilter = async (filterKind: string) => {
    const targetBills =
      filterKind === 'all'
        ? filtered
        : filtered.filter(b => (filterKind === 'unpaid' ? (b.status || 'unpaid') === 'unpaid' : b.status === filterKind));
    if (targetBills.length === 0) {
      toast(`No ${filterKind === 'all' ? '' : filterKind + ' '}invoices to print`, 'warning');
      return;
    }
    await bulkExportPDF(targetBills);
  };

  const generateSingleBillPdfBlob = async (bill: DashboardBill): Promise<Blob> => {
    const data = bill.data || {};
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    const InvoicePreviewMod = await import('../features/invoices/components/InvoicePreview/InvoicePreview');
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-99999px;top:0;width:794px;background:#fff;';
    document.body.appendChild(container);
    const root = createRoot(container);
    try {
      await new Promise(resolve => {
        root.render(
          React.createElement((InvoicePreviewMod as any).default, {
            profile: data.profile,
            client: data.client,
            details: data.details,
            items: data.items,
            totals: data.totals,
            invoiceType: data.invoiceType,
            customTerms: data.customTerms,
            customNotes: data.customNotes,
            extraSections: data.extraSections,
            options: data.invoiceOptions,
          })
        );
        requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100)));
      });
      const capScale = Math.min(4, Math.max(2, Math.round((window.devicePixelRatio || 1) * 1.2)));
      const canvas = await html2canvas(container.firstElementChild as HTMLElement || container, {
        scale: capScale,
        backgroundColor: '#ffffff',
        useCORS: false,
        logging: false,
      });
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const img = canvas.toDataURL('image/jpeg', 0.92);
      const h = (canvas.height * 210) / canvas.width;
      doc.addImage(img, 'JPEG', 0, 0, 210, Math.min(h, 297), undefined, 'FAST');
      return doc.output('blob');
    } finally {
      root.unmount();
      document.body.removeChild(container);
    }
  };

  const buildShareMessage = (bill: DashboardBill): string => {
    const currency = bill.currency || bill.data?.invoiceOptions?.currency || 'INR';
    const fmt = (n: any) => formatCurrency(Number(n) || 0, currency);
    const total = Number(bill.totalAmount) || 0;
    const paidFromArr = (bill.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const paid = paidFromArr > 0 ? paidFromArr : Number(bill.paidAmount) || 0;
    const outstanding = total - paid;
    const dueDate = bill.data?.details?.dueDate
      ? new Date(bill.data.details.dueDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '';
    const invDate = bill.invoiceDate
      ? new Date(bill.invoiceDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '';
    const businessName = profile?.businessName || '';
    const status = (bill.status || 'unpaid').toUpperCase();

    let paymentLine: string;
    if (outstanding < -0.005) {
      paymentLine = `Paid: ${fmt(paid)}  (Overpaid by ${fmt(Math.abs(outstanding))})`;
    } else if (outstanding <= 0.005) {
      paymentLine = `Paid: ${fmt(paid)}  ✅ FULLY PAID`;
    } else if (paid > 0.005) {
      paymentLine = `Paid: ${fmt(paid)}  ·  *Outstanding: ${fmt(outstanding)}*`;
    } else {
      paymentLine = `*Amount Due: ${fmt(total)}*`;
    }

    const lines = [
      `*Invoice: ${bill.invoiceNumber}*`,
      `Date: ${invDate}${dueDate ? `   ·   Due: ${dueDate}` : ''}`,
      `Client: ${bill.clientName}`,
      `Total: ${fmt(total)}`,
      paymentLine,
      `Status: ${status}`,
    ];
    if (businessName) lines.push('', `— ${businessName}`);
    return lines.join('\n');
  };

  const shareWhatsApp = async (bill: DashboardBill) => {
    const msg = buildShareMessage(bill);
    if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
      try {
        toast('Preparing PDF for share…', 'info', 1500);
        const blob = await generateSingleBillPdfBlob(bill);
        const file = new File([blob], `${bill.invoiceNumber}.pdf`, { type: 'application/pdf' });
        const canShareFile =
          typeof (navigator as any).canShare === 'function' &&
          (navigator as any).canShare({ files: [file] });
        if (canShareFile) {
          await (navigator as any).share({
            title: `Invoice ${bill.invoiceNumber}`,
            text: msg,
            files: [file],
          });
          return;
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError') console.warn('Web Share failed, falling back to WhatsApp URL:', e);
        else return;
      }
    }
    try {
      if (!sessionStorage.getItem('fgsb_whatsappDesktopExplained')) {
        toast(
          "Desktop browsers can't attach PDF to WhatsApp Web (a browser security rule). Sharing invoice details as text — download PDF and drop it into WhatsApp Web manually if you need the file. On phone the PDF attaches automatically.",
          'info',
          7000
        );
        sessionStorage.setItem('fgsb_whatsappDesktopExplained', '1');
      }
    } catch {
      /* sessionStorage sandboxed */
    }
    openWhatsAppShare(getClientPhone(bill), msg);
  };

  const shareEmail = (bill: DashboardBill) => {
    const subject = `Invoice ${bill.invoiceNumber} - ${formatCurrency(bill.totalAmount, bill.currency)}`;
    const richBody = buildShareMessage(bill).replace(/\*/g, '');
    const body = `Dear ${bill.clientName},\n\n${richBody}\n\nRegards`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStatusFilter('all');
    setFyFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasFilters = useMemo(
    () =>
      Boolean(
        search ||
          typeFilter !== 'all' ||
          statusFilter !== 'all' ||
          fyFilter !== 'all' ||
          dateFrom ||
          dateTo
      ),
    [search, typeFilter, statusFilter, fyFilter, dateFrom, dateTo]
  );

  const sendReminder = (bill: DashboardBill & { clientPhone?: string }) => {
    const clientPhone = bill.clientPhone || bill.data?.client?.phone || '';
    const clientName = bill.clientName || 'Sir/Madam';
    const dueDate = bill.data?.details?.dueDate
      ? new Date(bill.data.details.dueDate).toLocaleDateString('en-IN')
      : 'N/A';
    const businessName = profile?.businessName || 'Our Company';
    const outstanding = (bill.totalAmount || 0) - (bill.paidAmount || 0);
    if (outstanding <= 0.005) {
      toast('This invoice has no outstanding balance — no reminder to send.', 'info');
      return;
    }
    const outstandingStr = formatCurrency(outstanding, bill.currency);
    const totalStr = formatCurrency(bill.totalAmount || 0, bill.currency);
    const isPartial = (bill.paidAmount || 0) > 0.01 && outstanding > 0.01;
    const isOverdueDate =
      bill.data?.details?.dueDate && new Date(bill.data.details.dueDate) < new Date();
    const msg = isPartial
      ? `Hi ${clientName}, this is a gentle reminder that a balance of ${outstandingStr} is pending on Invoice ${bill.invoiceNumber} (total ${totalStr}). Kindly clear the remaining amount at your earliest convenience. Thank you! - ${businessName}`
      : isOverdueDate
      ? `Hi ${clientName}, this is a gentle reminder that Invoice ${bill.invoiceNumber} for ${outstandingStr} was due on ${dueDate}. Kindly arrange the payment at your earliest convenience. Thank you! - ${businessName}`
      : `Hi ${clientName}, this is a gentle reminder about the pending payment of ${outstandingStr} on Invoice ${bill.invoiceNumber}. Kindly arrange the payment at your earliest convenience. Thank you! - ${businessName}`;
    openWhatsAppShare(clientPhone, msg);
  };

  const getClientPhone = (bill: DashboardBill): string => {
    if (bill.clientPhone) return bill.clientPhone;
    if (bill.data?.client?.phone) return bill.data.client.phone;
    const savedClient = clients.find(c => c.name === bill.clientName);
    return savedClient?.phone || '';
  };

  const overdueBills = useMemo(() => bills.filter(b => b.status === 'overdue'), [bills]);
  const overdueByCurrency = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const b of overdueBills) {
      const cur = b.currency || b.data?.invoiceOptions?.currency || 'INR';
      acc[cur] = (acc[cur] || 0) + (b.totalAmount || 0) - (b.paidAmount || 0);
    }
    return acc;
  }, [overdueBills]);
  const overdueStr = Object.entries(overdueByCurrency)
    .map(([cur, amt]) => formatCurrency(amt as number, cur))
    .join(' + ');

  return (
    <div id="dashboard-page-container" className="dashboard-container max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-5">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-1">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Overview of your invoicing and tax activity.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              {new Date().getHours() < 12
                ? 'Good morning!'
                : new Date().getHours() < 17
                ? 'Good afternoon!'
                : 'Good evening!'}
            </div>
          </div>

          <HelpButton title="Dashboard — how to use">
            <ul style={{ paddingLeft: '1.1rem', margin: 0 }}>
              <li>
                <strong>New Invoice</strong> — start a fresh tax invoice / proforma / credit note / bill of supply / delivery challan.
              </li>
              <li>
                <strong>Filter row</strong> — search by client name, invoice #, or GSTIN; filter by type / status / financial year / date range.
              </li>
              <li>
                <strong>Row actions</strong> — Edit opens the invoice; MessageCircle sends via WhatsApp; Mail opens your email client; Record Payment logs a receipt; Trash soft-deletes for 30 days.
              </li>
              <li>
                <strong>WhatsApp share — mobile vs. desktop:</strong> on Android / iPhone the PDF attaches automatically via the OS share sheet.
              </li>
              <li>
                <strong>Bulk actions</strong> — select rows to export as one PDF or delete in a batch.
              </li>
              <li>
                <strong>Overdue banner</strong> — click it to jump to overdue invoices with one tap.
              </li>
              <li>
                <strong>Low-stock alert</strong> — appears when any product is at or below your threshold.
              </li>
            </ul>
          </HelpButton>

          {onNew && (
            <button
              id="btn-dashboard-new-invoice"
              className="btn btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all"
              onClick={onNew}
            >
              <Plus size={16} /> New Invoice
            </button>
          )}
        </div>
      </div>

      {/* Overdue Invoices Alert Banner */}
      {overdueBills.length > 0 && (
        <AlertBanner
          id="banner-overdue-invoices"
          type="error"
          title={`${overdueBills.length} overdue invoice${overdueBills.length > 1 ? 's' : ''}`}
          action={{
            label: 'Remind All',
            onClick: () => setShowRemindAll(true),
          }}
          className="cursor-pointer"
        >
          <span
            onClick={() => setStatusFilter('overdue')}
            className="hover:underline"
          >
            — {overdueStr} outstanding. Tap to view and send instant reminders.
          </span>
        </AlertBanner>
      )}

      {/* Remind All Modal */}
      <RemindAllModal
        show={showRemindAll}
        onClose={() => setShowRemindAll(false)}
        overdueBills={overdueBills}
        getClientPhone={getClientPhone}
        onSendReminder={sendReminder}
      />

      {/* Metric KPI Cards */}
      <MetricCards
        stats={stats}
        totalInvoicesCount={bills.length}
        unpaidCount={bills.filter(b => (b.status || 'unpaid') === 'unpaid').length}
        overdueCount={overdueBills.length}
        paidCount={bills.filter(b => b.status === 'paid').length}
        onFilterStatus={status => setStatusFilter(status)}
      />

      {/* Low Stock Alerts Banner */}
      {lowStockProducts.length > 0 && (
        <AlertBanner
          id="low-stock-alert-panel"
          type="warning"
          title={`Low Stock Alert (${lowStockProducts.length} item${lowStockProducts.length > 1 ? 's' : ''})`}
          action={onOpenProducts ? { label: 'Manage Products', onClick: onOpenProducts } : undefined}
        >
          <div className="flex flex-wrap gap-2 mt-1">
            {lowStockProducts.map(p => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100/60 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-800"
              >
                <strong>{p.name}</strong>
                <span>({(p.stock ?? 0) <= 0 ? 'Out of Stock' : `Stock: ${p.stock}`})</span>
              </span>
            ))}
          </div>
        </AlertBanner>
      )}

      {/* Main Table Glass Panel */}
      <div id="bills-register-panel" className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <RegisterFilters
          search={search}
          onSearchChange={setSearch}
          fyFilter={fyFilter}
          onFyFilterChange={setFyFilter}
          fyOptions={fyOptions}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          showColumnPicker={showColumnPicker}
          onToggleColumnPicker={() => setShowColumnPicker(v => !v)}
          visibleColumns={visibleColumns}
          onToggleColumn={(key, checked) => setVisibleColumns(prev => ({ ...prev, [key]: checked }))}
          bulkBusy={bulkBusy}
          filteredCount={filtered.length}
          totalCount={bills.length}
          unpaidCount={bills.filter(b => (b.status || 'unpaid') === 'unpaid').length}
          overdueCount={overdueBills.length}
          paidCount={bills.filter(b => b.status === 'paid').length}
          onBulkPrintByFilter={bulkPrintByFilter}
          onBulkExportJSON={bulkExportJSON}
        />

        <BillsRegisterTable
          bills={bills}
          filtered={filtered}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAllVisible={toggleSelectAllVisible}
          visibleColumns={visibleColumns}
          bulkBusy={bulkBusy}
          onBulkMarkStatus={bulkMarkStatus}
          onBulkExportJSON={bulkExportJSON}
          onBulkExportPDF={bulkExportPDF}
          onBulkDelete={bulkDelete}
          onClearSelection={clearSelection}
          onNew={onNew}
          onView={handleView}
          onDuplicate={onDuplicate}
          onConvert={onConvert}
          onOpenPaymentModal={openPaymentModal}
          onShareWhatsApp={shareWhatsApp}
          onSendReminder={sendReminder}
          onShareEmail={shareEmail}
          onDelete={handleDelete}
          onChangeStatus={changeStatus}
          getClientPhone={getClientPhone}
        />
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <PaymentModal
          bill={paymentModal}
          paymentInput={paymentInput}
          onClose={() => setPaymentModal(null)}
          onInputChange={(field, value) => setPaymentInput(prev => ({ ...prev, [field]: value }))}
          onRecordPayment={recordPayment}
          onOpenReceipt={openReceiptFor}
          onEditPayment={editPaymentAt}
          onDeletePayment={deletePaymentAt}
        />
      )}

      {/* Edit Payment Modal */}
      {editPaymentModal && (
        <EditPaymentModal
          modalState={editPaymentModal}
          onClose={() => setEditPaymentModal(null)}
          onFormChange={updater => setEditPaymentModal(prev => (prev ? updater(prev) : null))}
          onSave={saveEditedPayment}
        />
      )}

      {/* Receipt Modal */}
      {receiptTarget && (
        <ReceiptModal
          target={receiptTarget}
          onClose={() => setReceiptTarget(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
