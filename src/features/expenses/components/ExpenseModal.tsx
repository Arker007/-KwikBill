import { SideModal, Button, Input, Select, Checkbox, DatePicker } from "@/shared/components/ui";
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { CATEGORY_NAMES, PAYMENT_MODES } from '../services/expenseService';
import { formatCurrency } from '@/shared/utils';
import { Expense, ExpenseFormData } from '../types';

export interface ExpenseModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (formData: ExpenseFormData) => void;
  editingId: string | null;
  expense?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  show,
  onClose,
  onSave,
  editingId,
  expense,
}) => {
  const emptyForm: ExpenseFormData = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Other',
    amount: '',
    gstAmount: '',
    gstPercent: '',
    interstate: false,
    vendorName: '',
    vendorGstin: '',
    invoiceNo: '',
    paymentMode: 'Bank Transfer',
    note: '',
  };

  const [form, setForm] = useState<ExpenseFormData>({ ...emptyForm });

  useEffect(() => {
    if (show && expense) {
      setForm({
        date: expense.date || '',
        description: expense.description || '',
        category: expense.category || 'Other',
        amount: expense.amount !== undefined && expense.amount !== null ? String(expense.amount) : '',
        gstAmount: expense.gstAmount !== undefined && expense.gstAmount !== null ? String(expense.gstAmount) : '',
        gstPercent: expense.gstPercent !== undefined && expense.gstPercent !== null ? String(expense.gstPercent) : '',
        vendorName: expense.vendorName || '',
        vendorGstin: expense.vendorGstin || '',
        invoiceNo: expense.invoiceNo || '',
        paymentMode: expense.paymentMode || 'Bank Transfer',
        interstate: !!expense.interstate,
        note: expense.note || '',
      });
    } else if (show) {
      setForm({ ...emptyForm });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, expense]);

  if (!show) return null;

  const updateField = (field: keyof ExpenseFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGSTCalc = (val: string) => {
    updateField('gstPercent', val);
    if (val && form.amount) {
      const base = parseFloat(form.amount);
      const gst = (base * parseFloat(val)) / (100 + parseFloat(val));
      updateField('gstAmount', Math.round(gst * 100) / 100);
    }
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <SideModal
      isOpen={show}
      onClose={onClose}
      title={editingId ? 'Edit Expense' : 'Add Expense'}
      maxWidthClass="max-w-xl"
      actions={
        <Button variant="primary" icon={<Save size={16} />} onClick={handleSave}>
          {editingId ? 'Update' : 'Save'}
        </Button>
      }
    >
      <div className="p-6 overflow-y-auto flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <DatePicker
              label="Date *"
              value={form.date}
              onChange={(e) => updateField('date', e.target.value)}
            />
          </div>
          <div className="form-group">
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              options={CATEGORY_NAMES.map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Description *</label>
            <input
              type="text"
              className="form-input"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="e.g. AWS Hosting - March"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount (incl. GST) *</label>
            <input
              type="number"
              className="form-input"
              value={form.amount}
              onChange={(e) => {
                updateField('amount', e.target.value);
                if (form.gstPercent) handleGSTCalc(String(form.gstPercent));
              }}
              placeholder="0.00"
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">GST % (for ITC)</label>
            <input
              type="number"
              className="form-input"
              value={form.gstPercent}
              onChange={(e) => handleGSTCalc(e.target.value)}
              placeholder="18"
              min="0"
              max="28"
            />
            {Number(form.gstAmount) > 0 && (
              <p className="field-hint">GST: {formatCurrency(Number(form.gstAmount))}</p>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Vendor Name</label>
            <input
              type="text"
              className="form-input"
              value={form.vendorName}
              onChange={(e) => updateField('vendorName', e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Vendor GSTIN</label>
            <input
              type="text"
              className="form-input"
              value={form.vendorGstin}
              onChange={(e) => updateField('vendorGstin', e.target.value)}
              placeholder="For ITC claim"
              maxLength={15}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Invoice / Bill No</label>
            <input
              type="text"
              className="form-input"
              value={form.invoiceNo}
              onChange={(e) => updateField('invoiceNo', e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="form-group">
            <Select
              label="Payment Mode"
              value={form.paymentMode}
              onChange={(e) => updateField('paymentMode', e.target.value)}
              options={PAYMENT_MODES.map((m) => ({ value: m, label: m }))}
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <Checkbox
              checked={!!form.interstate}
              onChange={(e) => updateField('interstate', e.target.checked)}
              label={
                <span>
                  <strong>Inter-state expense</strong> — vendor charged IGST (different state)
                </span>
              }
              description="Routes ITC to IGST in GSTR-3B. Common: AWS / Google / Adobe / SaaS billed from an out-of-state office. Tip: check the vendor's GSTIN — first 2 digits are their state code."
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Note (optional)</label>
            <input
              type="text"
              className="form-input"
              value={form.note}
              onChange={(e) => updateField('note', e.target.value)}
              placeholder="Any additional note..."
            />
          </div>
        </div>
      </div>
    </SideModal>
  );
};

export default ExpenseModal;
