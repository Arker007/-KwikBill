import {
  getAllReceipts,
  saveReceipt,
  deleteReceipt,
  getAllBills,
  getProfile,
  getNextInvoiceNumber,
  saveBill,
} from '../../../store';
import { formatCurrency, numberToWords } from '@/shared/utils';
import { toast } from '@/shared/components/feedback/Toast';
import { Receipt, ReceiptFormData } from '../types';

export const PAYMENT_MODES = ['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Card', 'Other'];

export async function fetchReceipts(): Promise<Receipt[]> {
  return await getAllReceipts();
}

export async function fetchBillsForReceipts(): Promise<any[]> {
  return await getAllBills();
}

export async function getNextReceiptNo(receiptsLength: number): Promise<string> {
  try {
    return await getNextInvoiceNumber('RCP', { peek: true });
  } catch {
    const count = receiptsLength + 1;
    const now = new Date();
    const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `RCP/${fy}-${String(fy + 1).slice(-2)}/${String(count).padStart(4, '0')}`;
  }
}

export async function saveReceiptVoucher(
  formData: ReceiptFormData,
  editingId: string | null,
  bills: any[],
  receipts: Receipt[]
): Promise<void> {
  let receiptNo = formData.receiptNo;
  if (!editingId) {
    try {
      receiptNo = await getNextInvoiceNumber('RCP');
    } catch {
      /* fall back to peeked number */
    }
  }

  const receipt: Receipt = {
    ...formData,
    receiptNo,
    amount: parseFloat(formData.amount),
  };
  if (editingId) receipt.id = editingId;
  await saveReceipt(receipt);

  const modeMap: Record<string, string> = {
    'Bank Transfer': 'bank-transfer',
    UPI: 'upi',
    Cash: 'cash',
    Cheque: 'cheque',
    Card: 'card',
    Other: 'other',
  };
  const paidAmount = parseFloat(formData.amount);

  const stripReceiptFromBill = async (bill: any) => {
    if (!bill) return;
    const priorPayments = bill.payments || [];
    const kept = priorPayments.filter((p: any) => p.receiptNo !== receiptNo);
    if (kept.length === priorPayments.length) return;
    const newTotal = kept.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
    const nextStatus =
      newTotal >= (Number(bill.totalAmount) || 0)
        ? 'paid'
        : newTotal > 0
        ? 'partial'
        : 'unpaid';
    await saveBill(
      { ...bill, paidAmount: newTotal, status: nextStatus, payments: kept },
      { overwrite: true }
    );
  };

  if (editingId) {
    try {
      const original = receipts.find(r => r.id === editingId);
      const oldRef = original?.againstInvoice?.trim();
      const newRef = formData.againstInvoice?.trim();
      if (oldRef && oldRef !== newRef) {
        const oldBill = bills.find(b => b.invoiceNumber === oldRef || b.id === oldRef);
        await stripReceiptFromBill(oldBill);
      }
    } catch {
      /* non-fatal */
    }
  }

  if (formData.againstInvoice && formData.againstInvoice.trim()) {
    try {
      const bill = bills.find(
        b =>
          b.invoiceNumber === formData.againstInvoice.trim() ||
          b.id === formData.againstInvoice.trim()
      );
      if (bill) {
        const priorPayments = bill.payments || [];
        const priorIdx = priorPayments.findIndex((p: any) => p.receiptNo === receiptNo);
        const nextEntry = {
          amount: paidAmount,
          date: formData.date,
          mode: modeMap[formData.paymentMode] || 'other',
          note: `Receipt ${receiptNo}${
            formData.referenceNo ? ' · ref ' + formData.referenceNo : ''
          }`,
          recordedAt:
            priorIdx >= 0 ? priorPayments[priorIdx].recordedAt : new Date().toISOString(),
          receiptNo,
        };
        const nextPayments =
          priorIdx >= 0
            ? priorPayments.map((p: any, i: number) => (i === priorIdx ? nextEntry : p))
            : [...priorPayments, nextEntry];
        const newTotal = nextPayments.reduce(
          (s: number, p: any) => s + (Number(p.amount) || 0),
          0
        );
        const nextStatus =
          newTotal >= (Number(bill.totalAmount) || 0)
            ? 'paid'
            : newTotal > 0
            ? 'partial'
            : 'unpaid';
        await saveBill(
          { ...bill, paidAmount: newTotal, status: nextStatus, payments: nextPayments },
          { overwrite: true }
        );
      }
    } catch {
      /* non-fatal */
    }
  }
}

export async function deleteReceiptVoucher(id: string): Promise<void> {
  await deleteReceipt(id);
}
