import React, { useState, useMemo } from 'react';
import { Search, Info, Shield, Truck, AlertCircle } from 'lucide-react';
import { Switch, Select } from '@/shared/components/ui';
import { TCS_SECTIONS, TDS_SECTIONS } from '@/features/invoices/constants';

interface DisplaySettingsTabProps {
  invoiceOptions: any;
  setInvoiceOptions: React.Dispatch<React.SetStateAction<any>>;
  toggleOption: (key: string) => void;
  profile: any;
  searchQuery: string;
}

interface DisplayToggleConfig {
  key: string;
  label: string;
  description: string;
  defaultValue?: boolean;
}

export const DisplaySettingsTab: React.FC<DisplaySettingsTabProps> = ({
  invoiceOptions,
  setInvoiceOptions,
  toggleOption,
  profile,
  searchQuery,
}) => {
  const generalToggles: DisplayToggleConfig[] = [
    {
      key: 'showImages',
      label: 'Show Images',
      description: 'Show product images on PDFs (up to 10) when you add them.',
      defaultValue: false,
    },
    {
      key: 'autoApplyClientCredit',
      label: 'Show Net Balance',
      description: 'Show what the customer owes (receivable balance).',
      defaultValue: false,
    },
    {
      key: 'showDueDate',
      label: 'Show Due Date',
      description: 'Show due date on PDFs.',
      defaultValue: true,
    },
    {
      key: 'showClientAddress',
      label: 'Show Dispatch Address',
      description: 'Show dispatch & delivery address on PDFs.',
      defaultValue: true,
    },
    {
      key: 'showBankDetails',
      label: 'Show Payments',
      description: 'Show how and when they paid on PDFs (bank & payment instructions).',
      defaultValue: true,
    },
    {
      key: 'showRoundOff',
      label: 'Show Round Off',
      description: 'Show round-off on PDFs.',
      defaultValue: false,
    },
    {
      key: 'securePdf',
      label: 'Secure PDF',
      description: 'When enabled, PDF metadata is hardened against editing tools.',
      defaultValue: false,
    },
    {
      key: 'showReceiverSignature',
      label: "Show Receiver's Signature",
      description: 'Show receiver sign-off line on PDFs.',
      defaultValue: false,
    },
    {
      key: 'showUPI',
      label: 'Show UPI QR Code',
      description: 'Dynamic UPI QR code for instant mobile scan-to-pay.',
      defaultValue: true,
    },
    {
      key: 'showAmountWords',
      label: 'Show Amount in Words',
      description: 'Display grand total transcribed in words (e.g. Rupees only).',
      defaultValue: true,
    },
    {
      key: 'showTerms',
      label: 'Show Terms & Conditions',
      description: 'Display custom or default business terms in the footer.',
      defaultValue: true,
    },
    {
      key: 'showNotes',
      label: 'Show Notes & Remarks',
      description: 'Display customer notes or shipment instructions.',
      defaultValue: true,
    },
    {
      key: 'showSignature',
      label: 'Show Authorized Signature',
      description: 'Display signature box or digital stamp for business authorization.',
      defaultValue: true,
    },
    {
      key: 'showSignatoryText',
      label: "Show 'Authorized Signatory' Text",
      description: 'Display formal designation text under signature area.',
      defaultValue: true,
    },
    {
      key: 'showSubtotal',
      label: 'Show Subtotal Row',
      description: 'Display intermediate item subtotal before taxes and discounts.',
      defaultValue: true,
    },
    {
      key: 'showRateColumn',
      label: 'Show Rate Column',
      description: 'Display per-unit price / rate column on items table.',
      defaultValue: true,
    },
    {
      key: 'showDiscount',
      label: 'Show Discount Column',
      description: 'Display discount column on items table.',
      defaultValue: true,
    },
    {
      key: 'showGSTIN',
      label: 'Show Tax ID (GSTIN/VAT)',
      description: 'Show business and customer tax registration numbers.',
      defaultValue: true,
    },
    {
      key: 'showPlaceOfSupply',
      label: 'Show Place of Supply',
      description: 'Display state code and place of supply for interstate GST.',
      defaultValue: true,
    },
    {
      key: 'showHSN',
      label: 'Show HSN/SAC Column',
      description: 'Display HSN (Goods) or SAC (Services) commodity code column.',
      defaultValue: true,
    },
    {
      key: 'showItemQty',
      label: 'Show Quantity & Unit',
      description: 'Display item quantities and measurement unit codes.',
      defaultValue: true,
    },
    {
      key: 'showBusinessPhone',
      label: 'Show Business Phone & Email',
      description: 'Display business contact numbers and email address in the header.',
      defaultValue: true,
    },
  ];

  const q = searchQuery.trim().toLowerCase();

  const filteredGeneral = useMemo(() => {
    if (!q) return generalToggles;
    return generalToggles.filter(
      (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  }, [generalToggles, q]);

  const isChecked = (key: string, defVal: boolean = true) => {
    if (key === 'showRoundOff' || key === 'securePdf' || key === 'showReceiverSignature' || key === 'showImages' || key === 'autoApplyClientCredit') {
      return !!invoiceOptions[key];
    }
    return invoiceOptions[key] !== false;
  };

  const setOption = (key: string, val: boolean) => {
    setInvoiceOptions((prev: any) => ({
      ...prev,
      [key]: val,
    }));
  };

  return (
    <div className="space-y-6">
      {/* General Section */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">General</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control what elements and metadata appear on your PDF and print copies
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setInvoiceOptions((prev: any) => {
                  const updated = { ...prev };
                  generalToggles.forEach((t) => {
                    updated[t.key] = true;
                  });
                  return updated;
                });
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => {
                setInvoiceOptions((prev: any) => {
                  const updated = { ...prev };
                  generalToggles.forEach((t) => {
                    updated[t.key] = false;
                  });
                  return updated;
                });
              }}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Deselect all
            </button>
          </div>
        </div>

        {filteredGeneral.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No settings found matching "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {filteredGeneral.map((toggle) => (
              <div
                key={toggle.key}
                className="flex items-start justify-between gap-4 py-2 border-b border-slate-100/60 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{toggle.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                    {toggle.description}
                  </div>
                </div>
                <div className="shrink-0 pt-0.5">
                  <Switch
                    checked={isChecked(toggle.key, toggle.defaultValue)}
                    onChange={(val) => setOption(toggle.key, val)}
                    size="sm"
                    id={`fgsb-drawer-${toggle.key}`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ewaybill & Statutory Compliance Options */}
      {(!q || 'ewaybill reverse charge tcs tds cess'.includes(q)) && (
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <Truck size={16} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Ewaybill &amp; Statutory Compliance Options
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Indian GST statutory provisions, RCM flags, TCS, TDS, and special cess
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Reverse Charge */}
            <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Reverse Charge Mechanism (RCM)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Applies when recipient is liable to discharge GST under Section 9(3) or Section 9(4).
                </div>
              </div>
              <Switch
                checked={!!invoiceOptions.reverseCharge}
                onChange={(val) => setOption('reverseCharge', val)}
                size="sm"
              />
            </div>

            {/* GST Cess */}
            <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Show GST Compensation Cess Column
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Enable additional Cess column in the items table for tobacco, automobiles, aerated drinks, or coal.
                </div>
              </div>
              <Switch
                checked={!!invoiceOptions.showCess}
                onChange={(val) => setOption('showCess', val)}
                size="sm"
              />
            </div>

            {/* TCS Section 206C(1H) */}
            <div className="p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    TCS — Tax Collected at Source
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Collect TCS on sales exceeding ₹50L aggregate turnover under Sec 206C(1H)
                  </div>
                </div>
                <Switch
                  checked={!!invoiceOptions.showTCS}
                  onChange={(val) => setOption('showTCS', val)}
                  size="sm"
                />
              </div>

              {invoiceOptions.showTCS && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/50 dark:border-amber-900/30">
                  <Select
                    label="TCS Section"
                    value={invoiceOptions.tcsSection || '206C(1H)'}
                    onChange={(e) => {
                      const code = e.target.value;
                      const s = TCS_SECTIONS.find((x) => x.code === code);
                      setInvoiceOptions((prev: any) => ({
                        ...prev,
                        tcsSection: code,
                        tcsRate: code === 'custom' ? prev.tcsRate : s?.rate ?? prev.tcsRate,
                      }));
                    }}
                    options={TCS_SECTIONS.map((s) => ({ value: s.code, label: s.label }))}
                    selectSize="sm"
                  />
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      TCS Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="100"
                      value={invoiceOptions.tcsRate ?? 0.1}
                      onChange={(e) => setInvoiceOptions((prev: any) => ({ ...prev, tcsRate: parseFloat(e.target.value) || 0 }))}
                      className="form-input text-xs w-full"
                      placeholder="e.g. 0.1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* TDS Section 194Q */}
            <div className="p-3.5 rounded-xl border border-blue-200/70 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    TDS — Tax Deducted at Source (Informational)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Informational advisory to buyer regarding Sec 194Q / 194C / 194J deduction
                  </div>
                </div>
                <Switch
                  checked={!!invoiceOptions.showTDS}
                  onChange={(val) => setOption('showTDS', val)}
                  size="sm"
                />
              </div>

              {invoiceOptions.showTDS && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-200/50 dark:border-blue-900/30">
                  <Select
                    label="TDS Section"
                    value={invoiceOptions.tdsSection || '194Q'}
                    onChange={(e) => {
                      const code = e.target.value;
                      const s = TDS_SECTIONS.find((x) => x.code === code);
                      setInvoiceOptions((prev: any) => ({
                        ...prev,
                        tdsSection: code,
                        tdsRate: code === 'custom' ? prev.tdsRate : s?.rate ?? prev.tdsRate,
                      }));
                    }}
                    options={TDS_SECTIONS.map((s) => ({ value: s.code, label: s.label }))}
                    selectSize="sm"
                  />
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      TDS Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="100"
                      value={invoiceOptions.tdsRate ?? 0.1}
                      onChange={(e) => setInvoiceOptions((prev: any) => ({ ...prev, tdsRate: parseFloat(e.target.value) || 0 }))}
                      className="form-input text-xs w-full"
                      placeholder="e.g. 0.1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
