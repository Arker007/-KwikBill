import { SideModal, Button, Input, Select, Textarea, DatePicker } from "@/shared/components/ui";
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { toast } from '@/shared/components/feedback/Toast';
import { Receipt, ReceiptFormData } from '../types';
import { PAYMENT_MODES } from '../services/receiptService';

const emptyForm: ReceiptFormData = {
  date: new Date().toISOString().split('T')[0],
  receiptNo: '',
  clientName: '',
  clientAddress: '',
  amount: '',
  paymentMode: 'Bank Transfer',
  referenceNo: '',
  againstInvoice: '',
  note: '',
};

interface ReceiptModalProps {
  isOpen: boolean;
  editingReceipt: Receipt | null;
  unpaidBills: any[];
  nextReceiptNo: string;
  onClose: () => void;
  onSave: (formData: ReceiptFormData) => Promise<void>;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  editingReceipt,
  unpaidBills,
  nextReceiptNo,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<ReceiptFormData>({ ...emptyForm });

  useEffect(() => {
    if (editingReceipt) {
      setForm({
        date: editingReceipt.date || new Date().toISOString().split('T')[0],
        receiptNo: editingReceipt.receiptNo || '',
        clientName: editingReceipt.clientName || '',
        clientAddress: editingReceipt.clientAddress || '',
        amount: String(editingReceipt.amount ?? ''),
        paymentMode: editingReceipt.paymentMode || 'Bank Transfer',
        referenceNo: editingReceipt.referenceNo || '',
        againstInvoice: editingReceipt.againstInvoice || '',
        note: editingReceipt.note || '',
      });
    } else {
      setForm({ ...emptyForm, receiptNo: nextReceiptNo });
    }
  }, [editingReceipt, nextReceiptNo, isOpen]);

  if (!isOpen) return null;

  const updateField = (field: keyof ReceiptFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const selectInvoice = (bill: any) => {
    setForm(prev => ({
      ...prev,
      clientName: bill.clientName || '',
      clientAddress: bill.data?.client?.address || '',
      amount: String(Math.max(0, bill.totalAmount - (bill.paidAmount || 0))),
      againstInvoice: bill.invoiceNumber || '',
    }));
  };

  const handleSubmit = async () => {
    if (!form.clientName.trim()) {
      toast('Client name required', 'warning');
      return;
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast('Enter valid amount', 'warning');
      return;
    }

    await onSave(form);
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingReceipt ? 'Edit Payment Receipt' : 'New Payment Receipt'}
      maxWidthClass="max-w-xl"
      actions={
        <Button variant="primary" icon={<Save size={16} />} onClick={handleSubmit}>
          {editingReceipt ? 'Update' : 'Save'} Receipt
        </Button>
      }
    >
      <div className="p-6 overflow-y-auto flex-1">
        {unpaidBills.length > 0 && !form.againstInvoice && (
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Quick Select — Unpaid Invoices</label>
            <div className="client-picker" style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {unpaidBills.slice(0, 10).map(bill => (
                <button
                  key={bill.id}
                  className="client-picker-item"
                  onClick={() => selectInvoice(bill)}
                >
                  <div>
                    <strong>{bill.clientName}</strong>
                    <span
                      style={{
                        marginLeft: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {bill.invoiceNumber}
                    </span>
                  </div>
                  {bill.totalAmount - (bill.paidAmount || 0) > 0.005 && (
                    <span style={{ fontWeight: 600 }}>
                      {formatCurrency(bill.totalAmount - (bill.paidAmount || 0))}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Receipt No</label>
            <input
              type="text"
              className="form-input"
              value={form.receiptNo}
              onChange={e => updateField('receiptNo', e.target.value)}
            />
          </div>
          <div className="form-group">
            <DatePicker
              label="Date *"
              value={form.date}
              onChange={e => updateField('date', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input
              type="text"
              className="form-input"
              value={form.clientName}
              onChange={e => updateField('clientName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₹) *</label>
            <input
              type="number"
              className="form-input"
              value={form.amount}
              onChange={e => updateField('amount', e.target.value)}
              step="any"
              min="0"
            />
          </div>
          <div className="form-group">
            <Select
              label="Payment Mode"
              value={form.paymentMode}
              onChange={e => updateField('paymentMode', e.target.value)}
              options={PAYMENT_MODES.map(m => ({ value: m, label: m }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Ref / Cheque / UTR No</label>
            <input
              type="text"
              className="form-input"
              value={form.referenceNo}
              onChange={e => updateField('referenceNo', e.target.value)}
              placeholder="e.g. UTR12345678"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Against Invoice #</label>
            <input
              type="text"
              className="form-input"
              value={form.againstInvoice}
              onChange={e => updateField('againstInvoice', e.target.value)}
              placeholder="e.g. INV-2025-001"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <input
              type="text"
              className="form-input"
              value={form.note}
              onChange={e => updateField('note', e.target.value)}
              placeholder="Optional remarks"
            />
          </div>
        </div>

        <div className="form-group mt-2">
          <label className="form-label">Client Address</label>
          <input
            type="text"
            className="form-input"
            value={form.clientAddress}
            onChange={e => updateField('clientAddress', e.target.value)}
            placeholder="Address for receipt voucher"
          />
        </div>

      </div>
    </SideModal>
  );
};
