import React from 'react';
import {
  Save,
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  PenTool,
} from 'lucide-react';
import { BusinessProfileData, InvoiceNumberSettings, PaymentAccount } from '../types';
import { getCountryConfig, getStatesForCountry, maskAccountNumber, isValidUpiId, getPaymentAccounts } from '../../../shared/utils';
import { NumberingSettingsTab } from './NumberingSettingsTab';
import { Slider, Select, Textarea } from '@/shared/components/ui';

interface ProfileSettingsTabProps {
  selectedSection?: string;
  profile: BusinessProfileData;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfileData>>;
  companyFormRef: React.RefObject<HTMLFormElement | null>;
  saving: boolean;
  handleSave: (e: React.FormEvent) => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  visibleCountries: Array<{ code: string; name: string }>;
  taxIdWarning: string;
  setTaxIdWarning: React.Dispatch<React.SetStateAction<string>>;
  handleTaxIdBlur: () => void;
  editingAccount: PaymentAccount | null;
  setEditingAccount: React.Dispatch<React.SetStateAction<PaymentAccount | null>>;
  accountUpiWarning: string;
  setAccountUpiWarning: React.Dispatch<React.SetStateAction<string>>;
  openAddAccount: () => void;
  openEditAccount: (account: PaymentAccount) => void;
  removeAccount: (account: PaymentAccount) => Promise<void>;
  cancelAccount: () => void;
  saveAccountForm: () => Promise<void>;
  markDefault: (account: PaymentAccount) => Promise<void>;
  moveAccountIdx: (fromIdx: number, direction: number) => Promise<void>;
  toggleAccountActive: (account: PaymentAccount) => Promise<void>;
  importLegacyAsAccount: () => Promise<void>;
  invNumSettings: InvoiceNumberSettings;
  setInvNumSettings: React.Dispatch<React.SetStateAction<InvoiceNumberSettings>>;
  handleInvNumChange: (field: keyof InvoiceNumberSettings, value: any) => void;
  handleSaveInvNumSettings: () => Promise<void>;
  invNumSaving: boolean;
  getInvNumPreview: () => string;
  handleImageUpload: (field: 'logo' | 'signature', e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (field: 'logo' | 'signature') => void;
  logoInputRef: React.RefObject<HTMLInputElement | null>;
  sigInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ProfileSettingsTab: React.FC<ProfileSettingsTabProps> = ({
  selectedSection,
  profile,
  setProfile,
  companyFormRef,
  saving,
  handleSave,
  handleChange,
  visibleCountries,
  taxIdWarning,
  setTaxIdWarning,
  handleTaxIdBlur,
  editingAccount,
  setEditingAccount,
  accountUpiWarning,
  setAccountUpiWarning,
  openAddAccount,
  openEditAccount,
  removeAccount,
  cancelAccount,
  saveAccountForm,
  markDefault,
  moveAccountIdx,
  toggleAccountActive,
  importLegacyAsAccount,
  invNumSettings,
  setInvNumSettings,
  handleInvNumChange,
  handleSaveInvNumSettings,
  invNumSaving,
  getInvNumPreview,
  handleImageUpload,
  removeImage,
  logoInputRef,
  sigInputRef,
}) => {
  if (selectedSection && selectedSection !== 'section-company') {
    return null;
  }

  const cc = getCountryConfig(profile.country);
  const isIndia = (profile.country || 'India') === 'India';
  const accounts = (profile.paymentAccounts || []).filter(a => a && a.id !== 'legacy');
  const hasLegacyFlat = !accounts.length && (profile.bankName || profile.accountNumber || profile.ifsc || (profile as any).swift || profile.upiId);

  return (
    <form id="section-company" onSubmit={handleSave} className="glass-panel p-6 mb-6" ref={companyFormRef} style={{ order: 1 }}>
      <h3 className="section-title">Company Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group full-width">
          <label className="form-label">Business Name *</label>
          <input required type="text" name="businessName" className="form-input" value={profile.businessName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <Select
            label="Country"
            name="country"
            value={profile.country || 'India'}
            onChange={e => handleChange(e as any)}
            options={[
              ...(profile.country && !visibleCountries.some(c => c.name === profile.country)
                ? [{ value: profile.country, label: profile.country }]
                : []),
              ...visibleCountries.map(c => ({ value: c.name, label: c.name })),
            ]}
          />
        </div>
        <div className="form-group full-width">
          <Textarea label="Address" rows={2} name="address" value={profile.address} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">City</label>
          <input type="text" name="city" className="form-input" value={profile.city || ''} onChange={handleChange} placeholder="e.g. Mumbai" />
        </div>
        <div className="form-group">
          <label className="form-label">{cc.postalLabel}</label>
          <input type="text" name="pincode" className="form-input" value={profile.pincode || ''} onChange={handleChange} placeholder={cc.postalLabel} />
        </div>
        <div className="form-group">
          {(() => {
            const stateOpts = getStatesForCountry(profile.country || 'India');
            return stateOpts.length > 0 ? (
              <Select
                label={cc.stateLabel}
                name="state"
                value={profile.state}
                onChange={e => handleChange(e as any)}
                placeholder={`Select ${cc.stateLabel}`}
                options={stateOpts.map(s => ({ value: s, label: s }))}
              />
            ) : (
              <>
                <label className="form-label">{cc.stateLabel}</label>
                <input type="text" name="state" className="form-input" value={profile.state || ''} onChange={handleChange} placeholder={cc.stateLabel} />
              </>
            );
          })()}
        </div>
        <div className="form-group">
          <label className="form-label">{cc.taxIdLabel}</label>
          <input
            type="text"
            name="gstin"
            className="form-input"
            style={taxIdWarning ? { borderColor: '#f59e0b' } : undefined}
            value={profile.gstin}
            onChange={(e) => { handleChange(e); if (taxIdWarning) setTaxIdWarning(''); }}
            onBlur={handleTaxIdBlur}
            placeholder={cc.taxIdPlaceholder}
            maxLength={20}
          />
          {taxIdWarning && <small style={{ color: '#d97706', fontSize: '0.7rem', display: 'block', marginTop: '0.2rem' }}>⚠ {taxIdWarning}</small>}
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-input" value={profile.email} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input type="text" name="phone" className="form-input" value={profile.phone} onChange={handleChange} />
        </div>

        {/* GST-specific fields: AATO band + turnover numbers */}
        {isIndia && (
          <div className="form-group full-width" style={{ background: 'var(--bg-secondary)', padding: '0.85rem 1rem', borderRadius: 8, border: '1px solid var(--border)' }}>
            <label className="form-label" style={{ marginBottom: 6 }}>GSTR filing details (used only for GSTR-1 / GSTR-3B JSON export)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 8 }}>
              <input
                type="checkbox"
                id="aato-above-5cr"
                name="aatoAbove5Cr"
                checked={!!(profile as any).aatoAbove5Cr}
                onChange={(e) => setProfile(p => ({ ...p, aatoAbove5Cr: e.target.checked } as any))}
              />
              <label htmlFor="aato-above-5cr" style={{ fontSize: '0.82rem', margin: 0 }}>
                Aggregate turnover (AATO) is <strong>above ₹5 crore</strong>
              </label>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0 0 0.6rem' }}>
              Drives HSN reporting rule — <strong>{(profile as any).aatoAbove5Cr ? '6-digit HSN' : '4-digit HSN'}</strong> minimum on every item. Since Jan 2025 the portal blocks GSTR-1 if any HSN falls short.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Previous FY aggregate turnover (₹) — sets JSON <code>gt</code></label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="prevFYTurnover"
                  className="form-input"
                  value={(profile as any).prevFYTurnover ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 5000000"
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem' }}>Current FY turnover so far (₹) — sets JSON <code>cur_gt</code></label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="currentFYTurnover"
                  className="form-input"
                  value={(profile as any).currentFYTurnover ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. 1200000"
                />
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
              Both are optional (default 0). The portal lets you edit these while filing — you're just avoiding a schema-validation reject on upload.
            </p>
          </div>
        )}
      </div>

      {/* ---- Payment Accounts ---- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.5rem', marginTop: '2rem' }}>
        <div>
          <h3 className="section-title" style={{ margin: 0 }}>Payment Accounts</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
            Multiple bank / UPI accounts per profile. Pick one per invoice in the Customize panel.
            The ⭐ default account is preselected on new invoices.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAddAccount}>
          <Plus size={16} /> Add account
        </button>
      </div>

      {/* Migration banner */}
      {hasLegacyFlat && (
        <div className="notice notice-warn" style={{ marginTop: '0.85rem' }}>
          <span className="notice-icon">📋</span>
          <div style={{ flex: 1 }}>
            <strong>Your existing bank details are still on this profile.</strong> Click below to import them as the first Payment Account, then add more.
            <div style={{ marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={importLegacyAsAccount} style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}>
                Import &amp; continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {accounts.length === 0 && !hasLegacyFlat && (
        <div className="surface-card" style={{ marginTop: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            No payment accounts yet. Add the first one — it's auto-marked ⭐ Primary.
          </p>
        </div>
      )}

      {/* Account list */}
      {accounts.length > 0 && (
        <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {accounts.map((a, idx) => (
            <div key={a.id} className="surface-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', opacity: a.isActive === false ? 0.55 : 1 }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {a.isDefault && <span title="Default account" style={{ fontSize: '0.95rem' }}>⭐</span>}
                  <strong style={{ fontSize: '0.92rem' }}>{a.label || a.bankName || 'Untitled account'}</strong>
                  {a.isActive === false && <span className="status-pill" style={{ '--pill-color': 'var(--text-muted)' } as any}>Inactive</span>}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.55 }}>
                  {a.bankName && <span>{a.bankName} · </span>}
                  {a.accountNumber && <span>A/C {maskAccountNumber(a.accountNumber)} · </span>}
                  {a.ifsc && <span>{cc.bankLabel || 'IFSC'} {a.ifsc}</span>}
                  {a.swift && <span> · SWIFT {a.swift}</span>}
                  {a.upiId && <span> · 📱 {a.upiId}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {!a.isDefault && (
                  <button type="button" className="icon-btn" onClick={() => markDefault(a)} title="Set as default">⭐</button>
                )}
                <button type="button" className="icon-btn" onClick={() => moveAccountIdx(idx, -1)} disabled={idx === 0} title="Move up">↑</button>
                <button type="button" className="icon-btn" onClick={() => moveAccountIdx(idx, 1)} disabled={idx === accounts.length - 1} title="Move down">↓</button>
                <button type="button" className="icon-btn" onClick={() => toggleAccountActive(a)} title={a.isActive === false ? 'Activate' : 'Deactivate'}>
                  {a.isActive === false ? '✓' : '∅'}
                </button>
                <button type="button" className="icon-btn icon-btn-blue" onClick={() => openEditAccount(a)} title="Edit"><Edit3 size={15} /></button>
                <button type="button" className="icon-btn icon-btn-red" onClick={() => removeAccount(a)} title="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAN sits OUTSIDE the accounts list */}
      {isIndia && (
        <div className="form-group" style={{ marginTop: '1rem', maxWidth: '300px' }}>
          <label className="form-label">PAN Number (business-level)</label>
          <input type="text" name="pan" className="form-input" value={profile.pan || ''} onChange={handleChange} placeholder="e.g. AAAAA1234A" maxLength={10} />
        </div>
      )}

      {/* Add/Edit modal */}
      {editingAccount && (
        <div className="modal-overlay" onClick={cancelAccount}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <h3 className="section-title" style={{ marginTop: 0 }}>
              {getPaymentAccounts(profile).some(a => a.id === editingAccount.id) ? 'Edit account' : 'Add account'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Label (shown in the dropdown)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingAccount.label}
                  onChange={e => setEditingAccount(a => a ? ({ ...a, label: e.target.value }) : null)}
                  placeholder="e.g. HDFC Current — 1234"
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">
                  Account Holder Name{' '}
                  <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    (name printed on the cheque / registered with the bank)
                  </span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={(editingAccount as any).accountHolderName || ''}
                  onChange={e => setEditingAccount(a => a ? ({ ...a, accountHolderName: e.target.value } as any) : null)}
                  placeholder={`Leave blank to use "${profile.businessName || 'Business Name'}"`}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bank Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingAccount.bankName}
                  onChange={e => setEditingAccount(a => a ? ({ ...a, bankName: e.target.value }) : null)}
                />
              </div>
              <div className="form-group">
                <Select
                  label="Account Type"
                  value={editingAccount.accountType || ''}
                  onChange={e => setEditingAccount(a => a ? ({ ...a, accountType: e.target.value }) : null)}
                  options={[
                    { value: '', label: '— Not specified —' },
                    { value: 'savings', label: 'Savings Account' },
                    { value: 'current', label: 'Current Account' },
                    { value: 'cc', label: 'Cash Credit (CC)' },
                    { value: 'od', label: 'Overdraft (OD)' },
                    { value: 'nre', label: 'NRE Account' },
                    { value: 'nro', label: 'NRO Account' },
                  ]}
                  selectSize="sm"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Account Number {!isIndia && '/ IBAN'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingAccount.accountNumber}
                  onChange={e => setEditingAccount(a => a ? ({ ...a, accountNumber: e.target.value }) : null)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{cc.bankLabel || 'IFSC Code'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingAccount.ifsc}
                  onChange={e => setEditingAccount(a => a ? ({ ...a, ifsc: e.target.value }) : null)}
                  placeholder={cc.bankLabel}
                />
              </div>
              <div className="form-group">
                <label className="form-label">SWIFT / BIC (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingAccount.swift}
                  onChange={e => setEditingAccount(a => a ? ({ ...a, swift: e.target.value }) : null)}
                  placeholder="e.g. HDFCINBB"
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">UPI ID (optional — drives the QR for this account)</label>
                <input
                  type="text"
                  className="form-input"
                  style={accountUpiWarning ? { borderColor: '#f59e0b' } : undefined}
                  value={editingAccount.upiId}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingAccount(a => a ? ({ ...a, upiId: val }) : null);
                    if (accountUpiWarning) setAccountUpiWarning('');
                  }}
                  onBlur={() => {
                    const v = (editingAccount.upiId || '').trim();
                    setAccountUpiWarning(v && !isValidUpiId(v) ? "Doesn't look like a UPI ID. Expected like merchant@hdfcbank or 9876543210@paytm." : '');
                  }}
                  placeholder="e.g. yourbusiness@hdfcbank"
                />
                {accountUpiWarning && <small style={{ color: '#d97706', fontSize: '0.7rem', display: 'block', marginTop: '0.2rem' }}>⚠ {accountUpiWarning}</small>}
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <Textarea
                  label="Internal notes (not printed on the PDF)"
                  rows={2}
                  value={editingAccount.notes}
                  onChange={e => setEditingAccount(a => a ? ({ ...a, notes: e.target.value }) : null)}
                  placeholder="e.g. Use for export clients only"
                />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!editingAccount.isDefault}
                    onChange={e => setEditingAccount(a => a ? ({ ...a, isDefault: e.target.checked }) : null)}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                  />
                  <span><strong>⭐ Set as default account</strong> — preselected on every new invoice</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" className="btn btn-secondary" onClick={cancelAccount}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={saveAccountForm}>
                <Save size={16} /> Save account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Number Format Sub-Tab */}
      <NumberingSettingsTab
        invNumSettings={invNumSettings}
        setInvNumSettings={setInvNumSettings}
        handleInvNumChange={handleInvNumChange}
        handleSaveInvNumSettings={handleSaveInvNumSettings}
        invNumSaving={invNumSaving}
        getInvNumPreview={getInvNumPreview}
      />

      {/* Logo & Signature Branding */}
      <h3 className="section-title mt-8">Branding</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Business Logo</label>
          <div className="upload-area">
            {profile.logo ? (
              <div className="logo-upload-section">
                <div className="logo-preview-box">
                  <img
                    src={profile.logo}
                    alt="Logo"
                    style={{ height: `${profile.logoHeight || 48}px`, maxWidth: '180px', objectFit: 'contain', display: 'block' }}
                  />
                  <button type="button" className="icon-btn icon-btn-red upload-remove" onClick={() => removeImage('logo')}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="logo-size-control">
                  <Slider
                    label="Logo Size on Invoice"
                    min={24}
                    max={80}
                    value={profile.logoHeight || 48}
                    onChange={(value) => setProfile(prev => ({
                      ...prev,
                      logoHeight: Number(typeof value === 'number' ? value : value.target.value),
                    }))}
                  />
                </div>
                <button type="button" className="upload-change-btn" onClick={() => logoInputRef.current?.click()}>Change Logo</button>
              </div>
            ) : (
              <button type="button" className="upload-btn" onClick={() => logoInputRef.current?.click()}>
                <ImageIcon size={20} />
                <span>Upload Logo</span>
                <span className="upload-hint">PNG or JPG, square or wide (max 500KB)</span>
              </button>
            )}
            <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload('logo', e)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Signature / Stamp</label>
          <div className="upload-area">
            {profile.signature ? (
              <div className="upload-preview">
                <img src={profile.signature} alt="Signature" className="upload-img" />
                <button type="button" className="icon-btn icon-btn-red upload-remove" onClick={() => removeImage('signature')}>
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button type="button" className="upload-btn" onClick={() => sigInputRef.current?.click()}>
                <PenTool size={20} />
                <span>Upload Signature</span>
                <span className="upload-hint">PNG, JPG (max 500KB)</span>
              </button>
            )}
            <input ref={sigInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload('signature', e)} />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};
