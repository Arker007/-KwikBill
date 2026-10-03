import { SideModal, Button, Input, Select, Checkbox, DatePicker } from "@/shared/components/ui";
import React, { useState, useEffect, useMemo } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { promptAction } from '@/shared/components/feedback/ConfirmModal';
import { toast } from '@/shared/components/feedback/Toast';
import { Purchase, PurchaseFormData, PurchaseItem } from '../types';
import { calcPurchaseTotal } from '../services/purchaseService';

const PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Partial'];

const emptyItem: PurchaseItem = {
  name: '',
  hsn: '',
  quantity: 1,
  rate: 0,
  taxPercent: 18,
  cessPercent: 0,
};

const emptyForm: PurchaseFormData = {
  date: new Date().toISOString().split('T')[0],
  supplierName: '',
  supplierAddress: '',
  supplierGstin: '',
  invoiceNumber: '',
  items: [{ ...emptyItem }],
  paymentStatus: 'Unpaid',
  interstate: false,
  applyRoundOff: false,
  note: '',
};

interface PurchaseModalProps {
  isOpen: boolean;
  editingPurchase: Purchase | null;
  purchasesHistory: Purchase[];
  productsMaster: any[];
  ownerProfile: any;
  onClose: () => void;
  onSave: (purchase: Purchase) => Promise<void>;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  editingPurchase,
  purchasesHistory,
  productsMaster,
  ownerProfile,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<PurchaseFormData>({ ...emptyForm });

  useEffect(() => {
    if (editingPurchase) {
      setForm({
        date: editingPurchase.date || '',
        supplierName: editingPurchase.supplierName || '',
        supplierAddress: editingPurchase.supplierAddress || '',
        supplierGstin: editingPurchase.supplierGstin || '',
        invoiceNumber: editingPurchase.invoiceNumber || '',
        items:
          editingPurchase.items && editingPurchase.items.length > 0
            ? editingPurchase.items.map(i => ({ ...i }))
            : [{ ...emptyItem }],
        paymentStatus: editingPurchase.paymentStatus || 'Unpaid',
        interstate: !!editingPurchase.interstate,
        applyRoundOff:
          !!editingPurchase.applyRoundOff ||
          (typeof editingPurchase.roundOff === 'number' && editingPurchase.roundOff !== 0),
        note: editingPurchase.note || '',
      });
    } else {
      setForm({ ...emptyForm, items: [{ ...emptyItem }] });
    }
  }, [editingPurchase, isOpen]);

  const supplierHistory = useMemo(() => {
    const seen = new Map<string, any>();
    for (const p of purchasesHistory) {
      const name = (p.supplierName || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, {
          name,
          gstin: (p.supplierGstin || '').trim(),
          address: (p.supplierAddress || '').trim(),
          interstate: !!p.interstate,
        });
      }
    }
    return [...seen.values()];
  }, [purchasesHistory]);

  const itemHistory = useMemo(() => {
    const seen = new Map<string, any>();
    for (const pr of productsMaster) {
      const name = (pr.name || '').trim();
      if (!name) continue;
      seen.set(name.toLowerCase(), {
        name,
        hsn: (pr.hsn || '').trim(),
        rate: Number(pr.purchasePrice) || Number(pr.rate) || 0,
        taxPercent: Number(pr.taxPercent) || 0,
        cessPercent: Number(pr.cessPercent) || 0,
      });
    }

    for (const p of purchasesHistory) {
      for (const it of p.items || []) {
        const name = (it.name || '').trim();
        if (!name) continue;
        const key = name.toLowerCase();
        if (!seen.has(key)) {
          seen.set(key, {
            name,
            hsn: (it.hsn || '').trim(),
            rate: Number(it.rate) || 0,
            taxPercent: Number(it.taxPercent) || 0,
            cessPercent: Number(it.cessPercent) || 0,
          });
        }
      }
    }
    return [...seen.values()];
  }, [productsMaster, purchasesHistory]);

  if (!isOpen) return null;

  const updateField = (field: keyof PurchaseFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateSupplierName = (nameVal: string) => {
    setForm(prev => {
      const next = { ...prev, supplierName: nameVal };
      const match = supplierHistory.find(
        s => s.name.toLowerCase() === nameVal.trim().toLowerCase()
      );
      if (match) {
        if (!prev.supplierGstin) next.supplierGstin = match.gstin;
        if (!prev.supplierAddress) next.supplierAddress = match.address;
        if (typeof match.interstate === 'boolean') next.interstate = match.interstate;
      }
      return next;
    });
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    setForm(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const updateItemName = (index: number, nameVal: string) => {
    setForm(prev => {
      const items = [...prev.items];
      const nextItem = { ...items[index], name: nameVal };
      const match = itemHistory.find(
        i => i.name.toLowerCase() === nameVal.trim().toLowerCase()
      );
      if (match) {
        if (!nextItem.hsn) nextItem.hsn = match.hsn;
        if (!nextItem.rate) nextItem.rate = match.rate;
        if (match.taxPercent !== undefined) nextItem.taxPercent = match.taxPercent;
        if (match.cessPercent !== undefined) nextItem.cessPercent = match.cessPercent;
      }
      items[index] = nextItem;
      return { ...prev, items };
    });
  };

  const addItem = () => {
    const focusKey = 'new-' + Date.now();
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { ...emptyItem, _focusKey: focusKey } as any],
    }));
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLInputElement>(
        `[data-focus-key="${focusKey}"] input.form-input`
      );
      if (el) el.focus();
    });
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const formTotals = calcPurchaseTotal(form.items, form.applyRoundOff);

  const handleSubmit = async () => {
    if (!form.supplierName.trim()) {
      toast('Supplier name is required', 'warning');
      return;
    }
    if (!form.invoiceNumber.trim()) {
      toast('Invoice number is required', 'warning');
      return;
    }
    if (
      !form.items.some(
        i => (i.name || '').trim() && (parseFloat(String(i.quantity)) || 0) * (parseFloat(String(i.rate)) || 0) > 0
      )
    ) {
      toast('Add at least one item with a quantity and rate', 'warning');
      return;
    }

    const purchase: Purchase = {
      ...(editingPurchase?.id ? { id: editingPurchase.id } : {}),
      date: form.date,
      supplierName: form.supplierName.trim(),
      supplierAddress: (form.supplierAddress || '').trim(),
      supplierGstin: form.supplierGstin.trim(),
      invoiceNumber: form.invoiceNumber.trim(),
      ownerGstin: ownerProfile?.gstin || '',
      ownerName: ownerProfile?.businessName || '',
      items: form.items.map(i => ({
        name: (i.name || '').trim(),
        hsn: (i.hsn || '').trim(),
        quantity: parseFloat(String(i.quantity)) || 0,
        rate: parseFloat(String(i.rate)) || 0,
        taxPercent: parseFloat(String(i.taxPercent)) || 0,
        cessPercent: parseFloat(String(i.cessPercent)) || 0,
      })),
      totalAmount: formTotals.finalTotal,
      totalTax: formTotals.tax,
      taxableAmount: formTotals.taxable,
      applyRoundOff: !!form.applyRoundOff,
      roundOff: formTotals.roundOff,
      paymentStatus: form.paymentStatus,
      interstate: !!form.interstate,
      note: form.note.trim(),
    };

    await onSave(purchase);
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPurchase ? 'Edit Purchase Bill' : 'Add Purchase Bill'}
      maxWidthClass="max-w-3xl"
      actions={
        <Button variant="primary" icon={<Save size={16} />} onClick={handleSubmit}>
          {editingPurchase ? 'Update' : 'Save'}
        </Button>
      }
    >
      <div className="p-6 overflow-y-auto flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <DatePicker
              label="Date *"
              value={form.date}
              onChange={e => updateField('date', e.target.value)}
            />
          </div>
          <div className="form-group">
            <Select
              label="Payment Status"
              value={form.paymentStatus}
              onChange={e => updateField('paymentStatus', e.target.value)}
              options={PAYMENT_STATUSES.map(s => ({ value: s, label: s }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Supplier Name *</label>
            <input
              type="text"
              className="form-input"
              value={form.supplierName}
              list="fgsb-supplier-history"
              autoComplete="off"
              onChange={e => updateSupplierName(e.target.value)}
              placeholder={
                supplierHistory.length
                  ? 'Type or pick a previous supplier'
                  : 'Vendor / Supplier name'
              }
            />
            <datalist id="fgsb-supplier-history">
              {supplierHistory.map(s => (
                <option key={s.name} value={s.name} />
              ))}
            </datalist>
          </div>
          <div className="form-group">
            <label className="form-label">Supplier GSTIN</label>
            <input
              type="text"
              className="form-input"
              value={form.supplierGstin}
              onChange={e => updateField('supplierGstin', e.target.value)}
              placeholder="15-digit GSTIN"
              maxLength={15}
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Supplier Address (optional)</label>
            <input
              type="text"
              className="form-input"
              value={form.supplierAddress || ''}
              onChange={e => updateField('supplierAddress', e.target.value)}
              placeholder="Street, City, State — printed on the Purchase Bill PDF"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Invoice Number *</label>
            <input
              type="text"
              className="form-input"
              value={form.invoiceNumber}
              onChange={e => updateField('invoiceNumber', e.target.value)}
              placeholder="Supplier invoice no."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <input
              type="text"
              className="form-input"
              value={form.note}
              onChange={e => updateField('note', e.target.value)}
              placeholder="Any note..."
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <Checkbox
              checked={!!form.interstate}
              onChange={e => updateField('interstate', e.target.checked)}
              label={
                <span>
                  <strong>Inter-state purchase</strong> — supplier charged IGST (different state)
                </span>
              }
              description="Routes ITC to IGST in GSTR-3B instead of CGST + SGST. Tip: first 2 digits of supplier GSTIN = their state code."
            />
          </div>
        </div>

        {/* Items */}
        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
          Items
        </h4>
        <datalist id="fgsb-item-history">
          {itemHistory.map(i => (
            <option key={i.name} value={i.name} />
          ))}
        </datalist>
        {form.items.map((item, idx) => (
          <div
            key={idx}
            data-focus-key={(item as any)._focusKey}
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            <div className="form-group" style={{ flex: 2, margin: 0 }}>
              {idx === 0 && <label className="form-label">Name</label>}
              <input
                type="text"
                className="form-input"
                value={item.name}
                list="fgsb-item-history"
                autoComplete="off"
                onChange={e => updateItemName(idx, e.target.value)}
                placeholder={itemHistory.length ? 'Type or pick a previous item' : 'Item name'}
              />
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              {idx === 0 && <label className="form-label">HSN</label>}
              <input
                type="text"
                className="form-input"
                value={item.hsn}
                onChange={e => updateItem(idx, 'hsn', e.target.value)}
                placeholder="HSN"
              />
            </div>
            <div className="form-group" style={{ flex: 0.7, margin: 0 }}>
              {idx === 0 && <label className="form-label">Qty</label>}
              <input
                type="number"
                className="form-input"
                value={item.quantity}
                min="0"
                step="any"
                onChange={e => updateItem(idx, 'quantity', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              {idx === 0 && <label className="form-label">Rate</label>}
              <input
                type="number"
                className="form-input"
                value={item.rate}
                min="0"
                step="any"
                onChange={e => updateItem(idx, 'rate', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 0.75, margin: 0 }}>
              <Select
                label={idx === 0 ? "Tax %" : undefined}
                value={
                  ['0', '0.1', '0.25', '3', '5', '12', '18', '28'].includes(String(item.taxPercent))
                    ? String(item.taxPercent)
                    : '__custom__'
                }
                onChange={async e => {
                  if (e.target.value === '__custom__') {
                    const v = await promptAction({
                      title: 'Custom tax rate',
                      message: 'Enter a GST rate between 0% and 100% (up to 2 decimals).',
                      defaultValue: String(item.taxPercent || 0),
                      placeholder: 'e.g. 7.5',
                      inputType: 'number',
                      confirmLabel: 'Apply rate',
                    });
                    const n = parseFloat(v);
                    if (Number.isFinite(n) && n >= 0 && n <= 100) updateItem(idx, 'taxPercent', n);
                  } else {
                    updateItem(idx, 'taxPercent', e.target.value);
                  }
                }}
                options={[
                  { value: '0', label: '0%' },
                  { value: '0.1', label: '0.1%' },
                  { value: '0.25', label: '0.25%' },
                  { value: '3', label: '3%' },
                  { value: '5', label: '5%' },
                  { value: '12', label: '12%' },
                  { value: '18', label: '18%' },
                  { value: '28', label: '28%' },
                  {
                    value: '__custom__',
                    label: `Other…${['0', '0.1', '0.25', '3', '5', '12', '18', '28'].includes(String(item.taxPercent)) ? '' : ` (${item.taxPercent}%)`}`
                  }
                ]}
                selectSize="sm"
              />
            </div>
            <div className="form-group" style={{ flex: 0.7, margin: 0 }}>
              {idx === 0 && (
                <label
                  className="form-label"
                  title="Compensation Cess — for tobacco, aerated, motor vehicles, coal, etc."
                >
                  Cess %
                </label>
              )}
              <input
                type="number"
                className="form-input"
                value={item.cessPercent ?? 0}
                min="0"
                step="any"
                onChange={e => updateItem(idx, 'cessPercent', e.target.value)}
              />
            </div>
            <div style={{ flex: '0 0 auto', marginBottom: idx === 0 ? 0 : 0 }}>
              {form.items.length > 1 && (
                <button
                  className="icon-btn icon-btn-red"
                  onClick={() => removeItem(idx)}
                  title="Remove"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', marginTop: '0.25rem' }}
          onClick={addItem}
        >
          <Plus size={14} /> Add Item
        </button>

        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'var(--bg-secondary)',
            borderRadius: 8,
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>
              Taxable: <strong>{formatCurrency(formTotals.taxable)}</strong>
            </span>
            <span>
              Tax: <strong>{formatCurrency(formTotals.tax)}</strong>
            </span>
            {formTotals.cess > 0 && (
              <span>
                Cess: <strong>{formatCurrency(formTotals.cess)}</strong>
              </span>
            )}
            {form.applyRoundOff && (
              <span style={{ color: '#475569' }}>
                Round-off:{' '}
                <strong>
                  {(formTotals.roundOff >= 0 ? '+' : '') + formatCurrency(formTotals.roundOff)}
                </strong>
              </span>
            )}
            <span>
              Total: <strong>{formatCurrency(formTotals.finalTotal)}</strong>
            </span>
          </div>
          <div style={{ marginTop: '0.6rem' }}>
            <Checkbox
              checked={!!form.applyRoundOff}
              onChange={e => updateField('applyRoundOff', e.target.checked)}
              label={<strong>Apply round-off</strong>}
              description="Round the grand total to the nearest rupee. Use when the supplier's bill is rounded (e.g. ₹1,234.56 → ₹1,235). Off by default — most suppliers' totals already match what's calculated from line items."
            />
          </div>
        </div>

      </div>
    </SideModal>
  );
};
