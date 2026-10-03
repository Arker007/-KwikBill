import React, { useRef } from 'react';
import { Palette, Image as ImageIcon, Shield, Award, Landmark, Upload, Trash2, Sliders } from 'lucide-react';
import { Switch, Select, Slider } from '@/shared/components/ui';
import { getActiveAccounts, getAccountById } from '@/shared/utils';
import { toast } from '@/shared/components/feedback/Toast';

interface BrandingSettingsTabProps {
  invoiceOptions: any;
  setInvoiceOptions: React.Dispatch<React.SetStateAction<any>>;
  profile: any;
}

const ACCENT_PRESETS = [
  { color: '#1e40af', label: 'Classic Blue' },
  { color: '#2563eb', label: 'Electric Blue' },
  { color: '#7c3aed', label: 'Royal Purple' },
  { color: '#0f766e', label: 'Deep Teal' },
  { color: '#be123c', label: 'Ruby Red' },
  { color: '#c2410c', label: 'Sunset Orange' },
  { color: '#15803d', label: 'Emerald Green' },
  { color: '#0369a1', label: 'Ocean Sky' },
  { color: '#1e293b', label: 'Slate Dark' },
];

const WATERMARK_PRESETS = ['PAID', 'DUPLICATE', 'DRAFT', 'OVERDUE', 'SAMPLE', 'ORIGINAL'];

export const BrandingSettingsTab: React.FC<BrandingSettingsTabProps> = ({
  invoiceOptions,
  setInvoiceOptions,
  profile,
}) => {
  const accounts = getActiveAccounts(profile);
  const resolvedAccount = getAccountById(profile, invoiceOptions.selectedAccountId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentLogo = invoiceOptions.logo ?? profile?.logo ?? '';
  const showLogo = invoiceOptions.showLogo !== false;
  const currentLogoHeight = invoiceOptions.logoHeight ?? profile?.logoHeight ?? 48;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setInvoiceOptions((prev: any) => ({
        ...prev,
        logo: base64,
        showLogo: true,
      }));
      toast.success('Brand logo updated for this document!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setInvoiceOptions((prev: any) => ({
      ...prev,
      logo: '',
      showLogo: false,
    }));
    toast.info('Logo removed from this document.');
  };

  return (
    <div className="space-y-6">
      {/* Brand Logo Section */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Business Logo</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Display your company or brand logo in invoice headers &amp; thermal prints
              </p>
            </div>
          </div>
          <Switch
            checked={showLogo}
            onChange={(val) =>
              setInvoiceOptions((prev: any) => ({ ...prev, showLogo: val }))
            }
            size="sm"
          />
        </div>

        {showLogo && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />

            {currentLogo ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-2xs"
                    style={{ minWidth: '80px', maxWidth: '140px', height: '60px' }}
                  >
                    <img
                      src={currentLogo}
                      alt="Brand Logo Preview"
                      style={{ maxHeight: `${Math.min(currentLogoHeight, 52)}px`, maxWidth: '120px', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Active Logo
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Height: {currentLogoHeight}px
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload size={13} />
                    <span>Change Logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Remove Logo"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Upload size={18} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Upload Business Logo
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    PNG, JPG, SVG, or WebP (recommended 400×200 transparent)
                  </span>
                </div>
              </div>
            )}

            {currentLogo && (
              <div>
                <Slider
                  label="Logo Height (px)"
                  min={24}
                  max={100}
                  step={2}
                  value={currentLogoHeight}
                  onChange={(e: any) => {
                    const val = typeof e === 'number' ? e : parseInt(e?.target?.value || '48', 10);
                    setInvoiceOptions((prev: any) => ({
                      ...prev,
                      logoHeight: val,
                    }));
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accent Color Harmony */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <Palette size={16} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Accent Color</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select primary theme color for headings, table borders, and highlight bars
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setInvoiceOptions((prev: any) => ({ ...prev, accentColor: '' }))}
              className="px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              style={{
                borderColor: !invoiceOptions.accentColor ? 'var(--primary)' : '#cbd5e1',
                background: !invoiceOptions.accentColor ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
              }}
            >
              <span
                className="w-4 h-4 rounded-full border border-slate-300"
                style={{
                  background: 'conic-gradient(#1e40af, #7c3aed, #0f766e, #be123c, #1e40af)',
                }}
              />
              <span>Auto (Type Default)</span>
            </button>

            {ACCENT_PRESETS.map((p) => {
              const isSelected = invoiceOptions.accentColor === p.color;
              return (
                <button
                  key={p.color}
                  type="button"
                  title={p.label}
                  onClick={() => setInvoiceOptions((prev: any) => ({ ...prev, accentColor: p.color }))}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-800 bg-slate-100 dark:border-slate-200 dark:bg-slate-800 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-2xs"
                    style={{ backgroundColor: p.color }}
                  />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Custom Hex Color:
            </label>
            <input
              type="color"
              value={invoiceOptions.accentColor || '#1e40af'}
              onChange={(e) => setInvoiceOptions((prev: any) => ({ ...prev, accentColor: e.target.value }))}
              className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700"
            />
            <input
              type="text"
              value={invoiceOptions.accentColor || ''}
              onChange={(e) => setInvoiceOptions((prev: any) => ({ ...prev, accentColor: e.target.value }))}
              placeholder="#1e40af"
              className="form-input text-xs w-28 uppercase"
            />
          </div>
        </div>
      </div>

      {/* Payment Account on this Invoice */}
      {accounts.length > 0 && (
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <Landmark size={16} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Payment Account &amp; UPI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose the destination bank account and UPI payment details for this invoice
              </p>
            </div>
          </div>

          <Select
            label="Selected Settlement Account"
            value={resolvedAccount?.id || ''}
            onChange={(e) => {
              const newId = e.target.value || null;
              const newSnap = newId ? getAccountById(profile, newId) : null;
              setInvoiceOptions((prev: any) => ({
                ...prev,
                selectedAccountId: newId,
                paymentAccountSnapshot: newSnap,
              }));
            }}
            options={accounts.map((a: any) => ({
              value: a.id,
              label: `${a.isDefault ? '⭐ ' : ''}${a.label || a.bankName || 'Untitled Account'}${
                a.accountNumber ? ` (••• ${String(a.accountNumber).slice(-4)})` : ''
              }`,
            }))}
            selectSize="sm"
          />
        </div>
      )}

      {/* Watermark Configuration */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Document Watermark</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Diagonal background watermark stamp across generated PDF pages
              </p>
            </div>
          </div>
          <Switch
            checked={!!invoiceOptions.watermarkEnabled}
            onChange={(val) =>
              setInvoiceOptions((prev: any) => ({ ...prev, watermarkEnabled: val }))
            }
            size="sm"
          />
        </div>

        {invoiceOptions.watermarkEnabled && (
          <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Watermark Text
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={invoiceOptions.watermarkText || 'DUPLICATE'}
                  onChange={(e) =>
                    setInvoiceOptions((prev: any) => ({
                      ...prev,
                      watermarkText: e.target.value.toUpperCase(),
                    }))
                  }
                  className="form-input text-xs flex-1 uppercase"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {WATERMARK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setInvoiceOptions((prev: any) => ({ ...prev, watermarkText: preset }))
                    }
                    className="text-[11px] font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Slider
                label="Opacity"
                min={5}
                max={50}
                value={invoiceOptions.watermarkOpacity ?? 15}
                onChange={(e: any) => {
                  const val = typeof e === 'number' ? e : parseInt(e?.target?.value || '15', 10);
                  setInvoiceOptions((prev: any) => ({
                    ...prev,
                    watermarkOpacity: val,
                  }));
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandingSettingsTab;
