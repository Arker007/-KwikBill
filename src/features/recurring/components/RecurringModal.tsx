import { SideModal, Button, Input, Select, Checkbox, DatePicker } from "@/shared/components/ui";
import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { INVOICE_TYPES } from '@/features/invoices/constants';
import { toast } from '@/shared/components/feedback/Toast';
import { RecurringTemplate, RecurringFormData, RecurringItem } from '../types';

export const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const emptyForm: RecurringFormData = {
  clientName: '',
  clientState: '',
  clientGstin: '',
  clientAddress: '',
  frequency: 'monthly',
  invoiceType: 'tax-invoice',
  items: [{ name: '', hsn: '', quantity: 1, rate: '', taxPercent: 18, discount: 0 }],
  notes: '',
  nextDate: '',
  active: true,
};

interface RecurringModalProps {
  isOpen: boolean;
  editingTemplate: RecurringTemplate | null;
  clients: any[];
  ownerProfile: any;
  onClose: () => void;
  onSave: (templateData: RecurringTemplate) => Promise<void>;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  editingTemplate,
  clients,
  ownerProfile,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<RecurringFormData>({ ...emptyForm });

  useEffect(() => {
    if (editingTemplate) {
      setForm({
        clientName: editingTemplate.clientName || '',
        clientState: editingTemplate.clientState || '',
        clientGstin: editingTemplate.clientGstin || '',
        clientAddress: editingTemplate.clientAddress || '',
        frequency: editingTemplate.frequency || 'monthly',
        invoiceType: editingTemplate.invoiceType || 'tax-invoice',
        items:
          editingTemplate.items && editingTemplate.items.length > 0
            ? editingTemplate.items.map(i => ({
                ...i,
                name: i.name || (i as any).description || '',
              }))
            : [{ name: '', hsn: '', quantity: 1, rate: '', taxPercent: 18, discount: 0 }],
        notes: editingTemplate.notes || '',
        nextDate: editingTemplate.nextDate || '',
        active: editingTemplate.active !== false,
      });
    } else {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      setForm({
        ...emptyForm,
        nextDate: nextMonth.toISOString().split('T')[0],
      });
    }
  }, [editingTemplate, isOpen]);

  if (!isOpen) return null;

  const updateField = (field: keyof RecurringFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateItem = (index: number, field: keyof RecurringItem, value: any) => {
    setForm(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { name: '', hsn: '', quantity: 1, rate: '', taxPercent: 18, discount: 0 },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const selectClient = (cli: any) => {
    setForm(prev => ({
      ...prev,
      clientName: cli.name || '',
      clientState: cli.state || '',
      clientGstin: cli.gstin || '',
      clientAddress: cli.address || '',
    }));
  };

  const handleSubmit = async () => {
    if (!form.clientName.trim()) {
      toast('Client name required', 'warning');
      return;
    }
    if (!form.items.some(i => i.name && i.rate)) {
      toast('Add at least one item with description and rate', 'warning');
      return;
    }

    const tpl: RecurringTemplate = {
      ...(editingTemplate?.id ? { id: editingTemplate.id } : {}),
      ...form,
      items: form.items.filter(i => i.name),
      ownerGstin: ownerProfile?.gstin || '',
      ownerName: ownerProfile?.businessName || '',
    };

    await onSave(tpl);
  };

  return (
    <SideModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTemplate ? 'Edit Template' : 'New Recurring Invoice'}
      maxWidthClass="max-w-2xl"
      actions={
        <Button variant="primary" icon={<Save size={16} />} onClick={handleSubmit}>
          {editingTemplate ? 'Update Template' : 'Save Template'}
        </Button>
      }
    >
      <div className="p-6 overflow-y-auto flex-1">
        {!editingTemplate && clients.length > 0 && !form.clientName && (
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Quick Select Client</label>
            <div className="client-picker">
              {clients.map(cli => (
                <button
                  key={cli.id}
                  className="client-picker-item"
                  onClick={() => selectClient(cli)}
                >
                  <strong>{cli.name}</strong>
                  <span>
                    {cli.state}
                    {cli.gstin ? ` | ${cli.gstin}` : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
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
            <label className="form-label">Client GSTIN</label>
            <input
              type="text"
              className="form-input"
              value={form.clientGstin}
              onChange={e => updateField('clientGstin', e.target.value)}
              maxLength={15}
            />
          </div>
          <div className="form-group">
            <Select
              label="Frequency"
              value={form.frequency}
              onChange={e => updateField('frequency', e.target.value)}
              options={FREQUENCIES}
            />
          </div>
          <div className="form-group">
            <Select
              label="Invoice Type"
              value={form.invoiceType}
              onChange={e => updateField('invoiceType', e.target.value)}
              options={Object.entries(INVOICE_TYPES).map(([k, v]: [string, any]) => ({ value: k, label: v.label }))}
            />
          </div>
          <div className="form-group">
            <DatePicker
              label="Next Invoice Date"
              value={form.nextDate}
              onChange={e => updateField('nextDate', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Client State</label>
            <input
              type="text"
              className="form-input"
              value={form.clientState}
              onChange={e => updateField('clientState', e.target.value)}
              placeholder="e.g. Maharashtra"
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
          />
        </div>

        {/* Items */}
        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
          Items
        </h4>
        {form.items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            <div className="form-group" style={{ flex: 2, margin: 0 }}>
              {idx === 0 && <label className="form-label">Item Description</label>}
              <input
                type="text"
                className="form-input"
                value={item.name}
                onChange={e => updateItem(idx, 'name', e.target.value)}
                placeholder="e.g. Monthly AMC / Retainer"
              />
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              {idx === 0 && <label className="form-label">HSN/SAC</label>}
              <input
                type="text"
                className="form-input"
                value={item.hsn || ''}
                onChange={e => updateItem(idx, 'hsn', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 0.8, margin: 0 }}>
              {idx === 0 && <label className="form-label">Qty</label>}
              <input
                type="number"
                className="form-input"
                value={item.quantity}
                min="1"
                onChange={e => updateItem(idx, 'quantity', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              {idx === 0 && <label className="form-label">Rate (₹)</label>}
              <input
                type="number"
                className="form-input"
                value={item.rate}
                onChange={e => updateItem(idx, 'rate', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 0.8, margin: 0 }}>
              <Select
                label={idx === 0 ? "GST %" : undefined}
                value={String(item.taxPercent)}
                onChange={e => updateItem(idx, 'taxPercent', e.target.value)}
                options={[
                  { value: '0', label: '0%' },
                  { value: '5', label: '5%' },
                  { value: '12', label: '12%' },
                  { value: '18', label: '18%' },
                  { value: '28', label: '28%' },
                ]}
                selectSize="sm"
              />
            </div>
            <div style={{ flex: '0 0 auto' }}>
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

        <div className="form-group mt-3">
          <label className="form-label">Notes (optional)</label>
          <input
            type="text"
            className="form-input"
            value={form.notes}
            onChange={e => updateField('notes', e.target.value)}
            placeholder="Appears on generated invoice"
          />
        </div>

      </div>
    </SideModal>
  );
};
