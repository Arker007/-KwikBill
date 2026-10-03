import React, { useState, useEffect } from 'react';
import { SideModal, Button, Select } from '@/shared/components/ui';
import {
  getCountryConfig,
  getStatesForCountry,
  validateTaxId,
  detectCountryFromBrowser,
  getCountriesForRegion,
} from '@/shared/utils';
import { PAPER_SIZES } from '@/features/invoices/utils/printSettings';
import { getRegionMode } from '@/store';
import { Client, ClientFormData } from '@/features/clients/types';

export interface CustomerModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (formData: ClientFormData) => void;
  client?: Client | null;
  isEditing?: boolean;
  defaultCountry?: string;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  show,
  onClose,
  onSave,
  client,
  isEditing = false,
  defaultCountry,
}) => {
  const fallbackCountry = defaultCountry || detectCountryFromBrowser();
  const emptyForm: ClientFormData = {
    name: '',
    address: '',
    city: '',
    pin: '',
    state: '',
    gstin: '',
    email: '',
    phone: '',
    country: fallbackCountry,
    isSEZ: false,
    preferredPaperSize: '',
    preferredCurrency: '',
    autoPrint: false,
  };

  const [form, setForm] = useState<ClientFormData>({ ...emptyForm });
  const [taxIdWarning, setTaxIdWarning] = useState<string>('');

  useEffect(() => {
    if (show && client) {
      setForm({
        name: client.name || '',
        address: client.address || '',
        city: client.city || '',
        pin: client.pin || '',
        state: client.state || '',
        gstin: client.gstin || '',
        email: client.email || '',
        phone: client.phone || '',
        country: client.country || fallbackCountry,
        isSEZ: !!client.isSEZ,
        preferredPaperSize: client.preferredPaperSize || '',
        preferredCurrency: client.preferredCurrency || '',
        autoPrint: !!client.autoPrint,
      });
    } else if (show) {
      setForm({ ...emptyForm });
    }
    setTaxIdWarning('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, client]);

  if (!show) return null;

  const cc = getCountryConfig(form.country);
  const stateOptions = getStatesForCountry(form.country);

  const handleTaxIdBlur = () => {
    const result = validateTaxId(form.country, form.gstin);
    setTaxIdWarning(result.ok ? '' : result.message);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <SideModal
      isOpen={show}
      onClose={onClose}
      title={isEditing ? 'Edit Customer' : 'Add New Customer'}
      maxWidthClass="max-w-xl"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {isEditing ? 'Update Customer' : 'Save Customer'}
          </Button>
        </div>
      }
    >
      <form
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="p-6 overflow-y-auto flex-1"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Customer / Business Name *</label>
            <input
              type="text"
              name="cust_name_no_autofill"
              autoComplete="off"
              data-lpignore="true"
              className="form-input"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Address</label>
            <input
              type="text"
              name="cust_address_no_autofill"
              autoComplete="off"
              data-lpignore="true"
              className="form-input"
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Street address, locality"
            />
          </div>
          <div className="form-group">
            <Select
              label="Country"
              value={form.country}
              onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value, state: '' }))}
              options={(() => {
                const visible = getCountriesForRegion(getRegionMode() as any);
                const opts = [];
                if (form.country && !visible.some((c: any) => c.name === form.country)) {
                  opts.push({ value: form.country, label: form.country });
                }
                return opts.concat(visible.map((c: any) => ({ value: c.name, label: c.name })));
              })()}
            />
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              name="cust_city_no_autofill"
              autoComplete="off"
              data-lpignore="true"
              className="form-input"
              value={form.city}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              placeholder="e.g. Mumbai"
            />
          </div>
          <div className="form-group">
            <label className="form-label">{cc.postalLabel}</label>
            <input
              type="text"
              name="cust_pin_no_autofill"
              autoComplete="off"
              data-lpignore="true"
              className="form-input"
              value={form.pin}
              onChange={(e) => setForm((prev) => ({ ...prev, pin: e.target.value }))}
              placeholder={cc.postalLabel}
            />
          </div>
          <div className="form-group">
            {stateOptions.length > 0 ? (
              <Select
                label={cc.stateLabel}
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                placeholder={`Select ${cc.stateLabel}`}
                options={stateOptions.map((s: string) => ({ value: s, label: s }))}
              />
            ) : (
              <>
                <label className="form-label">{cc.stateLabel}</label>
                <input
                  type="text"
                  name="cust_state_no_autofill"
                  autoComplete="off"
                  data-lpignore="true"
                  className="form-input"
                  value={form.state}
                  onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder={cc.stateLabel}
                />
              </>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">{cc.taxIdLabel}</label>
            <input
              type="text"
              name="cust_taxid_no_autofill"
              autoComplete="off"
              data-lpignore="true"
              className="form-input"
              style={taxIdWarning ? { borderColor: '#f59e0b' } : undefined}
              value={form.gstin}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, gstin: e.target.value.toUpperCase() }));
                if (taxIdWarning) setTaxIdWarning('');
              }}
              onBlur={handleTaxIdBlur}
              placeholder={cc.taxIdPlaceholder}
              maxLength={20}
            />
            {taxIdWarning && (
              <small style={{ color: '#d97706', fontSize: '0.7rem', display: 'block', marginTop: '0.2rem' }}>
                ⚠ {taxIdWarning}
              </small>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="text"
              name="cust_email_no_autofill"
              autoComplete="off"
              data-lpignore="true"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="client@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="text"
              name="cust_phone_no_autofill"
              autoComplete="off"
              data-lpignore="true"
              className="form-input"
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
          </div>
          {form.country === 'India' && (
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!form.isSEZ}
                  onChange={(e) => setForm((prev) => ({ ...prev, isSEZ: e.target.checked }))}
                  style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                />
                <span>
                  <strong>SEZ unit / Developer</strong> — supplies will be charged IGST regardless of state (Section 16, IGST Act).
                </span>
              </label>
            </div>
          )}

          <div
            className="form-group"
            style={{
              gridColumn: 'span 2',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border)',
              marginTop: '0.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.35rem',
              }}
            >
              Print preferences (optional)
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
              Auto-applied when you create a new invoice for this customer. Leave blank to use app-wide defaults.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div>
                <Select
                  label="Preferred paper size"
                  value={form.preferredPaperSize}
                  onChange={(e) => setForm((prev) => ({ ...prev, preferredPaperSize: e.target.value }))}
                  placeholder="Use app default"
                  options={Object.entries(PAPER_SIZES).map(([key, ps]: [string, any]) => ({
                    value: key,
                    label: ps.label,
                  }))}
                  selectSize="sm"
                />
              </div>
              <div>
                <Select
                  label="Preferred currency"
                  value={form.preferredCurrency}
                  onChange={(e) => setForm((prev) => ({ ...prev, preferredCurrency: e.target.value }))}
                  placeholder="Use invoice default"
                  options={[
                    { value: 'INR', label: 'INR (₹)' },
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                    { value: 'AED', label: 'AED (د.إ)' },
                    { value: 'SGD', label: 'SGD (S$)' },
                    { value: 'AUD', label: 'AUD (A$)' },
                  ]}
                  selectSize="sm"
                />
              </div>
              <label
                style={{
                  gridColumn: 'span 2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginTop: '0.2rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={!!form.autoPrint}
                  onChange={(e) => setForm((prev) => ({ ...prev, autoPrint: e.target.checked }))}
                  style={{ width: 15, height: 15, accentColor: 'var(--primary)' }}
                />
                <span>
                  <strong>Auto-print on save for this customer</strong> — overrides global setting
                </span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </SideModal>
  );
};

export default CustomerModal;
