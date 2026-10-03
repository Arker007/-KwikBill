import React, { useState, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
  UploadCloud,
  FileText,
  X,
  Lock,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { getActiveAccounts, getDefaultAccount } from '@/shared/utils';
import { Select, Checkbox, Switch, Input, Button } from '@/shared/components/ui';

interface TwoColumnDetailsSectionProps {
  totals: any;
  invoiceOptions: any;
  setInvoiceOptions: React.Dispatch<React.SetStateAction<any>>;
  customNotes: string;
  setCustomNotes: React.Dispatch<React.SetStateAction<string>>;
  customTerms: string;
  setCustomTerms: (terms: string) => void;
  termsTemplates: any[];
  selectedTermsId: string;
  setSelectedTermsId: (id: string) => void;
  handleTermsSelect: (id: string) => void;
  profile: any;
  formatCurrency: (amount: number, currency: string) => string;
  onOpenSettings?: () => void;
  onSaveDraft?: () => void;
  onSavePrint?: () => void;
  onSave?: () => void;
  shareWhatsApp?: () => void;
  exportEWayBill?: () => void;
  clampNonNeg: (val: any) => number;
}

export function TwoColumnDetailsSection({
  totals,
  invoiceOptions,
  setInvoiceOptions,
  customNotes,
  setCustomNotes,
  customTerms,
  setCustomTerms,
  termsTemplates = [],
  selectedTermsId,
  setSelectedTermsId,
  handleTermsSelect,
  profile,
  formatCurrency,
  onOpenSettings,
  onSaveDraft,
  onSavePrint,
  onSave,
  shareWhatsApp,
  exportEWayBill,
  clampNonNeg,
}: TwoColumnDetailsSectionProps) {
  const [notesOpen, setNotesOpen] = useState(true);
  const [termsOpen, setTermsOpen] = useState(true);
  const [createEWaybill, setCreateEWaybill] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [roundOffEnabled, setRoundOffEnabled] = useState(invoiceOptions?.enableRoundOff ?? true);
  const [hideTotals, setHideTotals] = useState(invoiceOptions?.hideTotals ?? false);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedSigId, setSelectedSigId] = useState<string>('default');
  const [showPrintSplit, setShowPrintSplit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeAccounts = getActiveAccounts(profile);
  const defaultAcc = getDefaultAccount(profile);

  const currency = profile?.currency || 'INR';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 5 - attachedFiles.length);
      setAttachedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Calculations from totals
  const subTotal = totals?.taxableAmount ?? totals?.subtotal ?? totals?.subTotal ?? 0;
  const totalTax =
    totals?.totalTaxAmount ??
    totals?.totalTaxCollected ??
    totals?.totalTax ??
    totals?.taxTotal ??
    ((Number(totals?.cgst) || 0) +
      (Number(totals?.sgst) || 0) +
      (Number(totals?.utgst) || 0) +
      (Number(totals?.igst) || 0) +
      (Number(totals?.cess) || 0));
  const lineDiscounts = totals?.totalDiscount || 0;

  // Extra discount
  const extraDiscType = invoiceOptions?.invoiceDiscountType || 'fixed';
  const extraDiscVal = parseFloat(invoiceOptions?.invoiceDiscountValue) || 0;
  const extraDiscAmount =
    totals?.invoiceDiscountAmount !== undefined
      ? totals.invoiceDiscountAmount
      : extraDiscType === 'percent'
      ? (subTotal * extraDiscVal) / 100
      : extraDiscVal;

  const totalCalculatedDiscount = lineDiscounts + extraDiscAmount;
  const preRoundAmount = Math.max(
    0,
    subTotal + totalTax + (Number(totals?.tcsAmount) || 0) - extraDiscAmount
  );
  const roundedAmount =
    totals?.total !== undefined
      ? totals.total
      : roundOffEnabled
      ? Math.round(preRoundAmount)
      : preRoundAmount;
  const roundOffDiff =
    totals?.roundOff !== undefined ? totals.roundOff : roundedAmount - preRoundAmount;

  return (
    <>
      {/* Section 3: Two Column Details Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start" id="invoice-details-two-columns">
        {/* Left Column: Notes, Terms, E-way, Attachments (Col 7) */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-[11px] font-semibold text-slate-600">Notes, terms &amp; more...</h3>

          {/* Notes Card */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div
              onClick={() => setNotesOpen((v) => !v)}
              className="p-3 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50 transition"
            >
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-xs text-slate-700">Notes</span>
                {notesOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomNotes('');
                  setNotesOpen(true);
                }}
                className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center space-x-0.5"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>New Notes</span>
              </button>
            </div>

            {notesOpen && (
              <div className="p-3 relative">
                <textarea
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white placeholder-slate-400 resize-none h-20 bg-white"
                  placeholder="Notes (Optional) — notes will appear on the bottom of the invoice..."
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!customNotes) {
                      setCustomNotes('Thank you for your business! Please remit payment at your earliest convenience.');
                    } else {
                      setCustomNotes((prev) => `${prev}\nGoods once sold will not be taken back without original receipt.`);
                    }
                  }}
                  className="absolute right-5 bottom-5 text-blue-600 hover:text-blue-700 font-medium text-[11px] flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-xs"
                  title="Generate smart AI notes"
                >
                  <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                  <span>AI</span>
                </button>
              </div>
            )}
          </div>

          {/* Terms & Conditions Card */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div
              onClick={() => setTermsOpen((v) => !v)}
              className="p-3 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none bg-slate-50/50 hover:bg-slate-50 transition"
            >
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-xs text-slate-700">Terms &amp; Conditions</span>
                {termsOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
              </div>
              <span className="text-[10px] text-slate-400">Printed on bill</span>
            </div>

            {termsOpen && (
              <div className="p-3 space-y-2">
                {termsTemplates.length > 0 && (
                  <Select
                    containerClassName="!mb-0 mb-0"
                    value={selectedTermsId}
                    onChange={(e: any) => {
                      const val = typeof e === 'object' && e?.target ? e.target.value : e;
                      handleTermsSelect(val);
                    }}
                    options={[
                      { value: '', label: 'Default Terms' },
                      ...termsTemplates.map((t: any) => ({
                        value: t.id,
                        label: t.name,
                      })),
                    ]}
                  />
                )}

                <textarea
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white placeholder-slate-400 resize-none h-24 bg-white"
                  placeholder="Terms &amp; Conditions (e.g. 1. 50% advance payment required. 2. Subject to local jurisdiction.)"
                  value={customTerms}
                  onChange={(e) => setCustomTerms(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Create E-Waybill Switch */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Create E-Waybill</span>
              <span className="text-[10px] text-slate-400">Generate compliance document</span>
            </div>
            <Switch
              size="sm"
              checked={createEWaybill}
              onChange={(checked) => {
                setCreateEWaybill(checked);
                if (checked && exportEWayBill) {
                  exportEWayBill();
                }
              }}
            />
          </div>

          {/* Attach Files Dropzone */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Attach Files</span>
              <span className="text-[10px] text-slate-400">(Max: 5 files)</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-lg p-4 text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20"
            >
              <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <div className="text-xs text-slate-600 font-medium">
                Click to upload or drag &amp; drop
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                PDF, PNG, JPG up to 5MB each
              </div>
            </div>

            {attachedFiles.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2 py-1 bg-slate-100 rounded text-xs text-slate-700"
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-slate-400 hover:text-red-500 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Totals & Bank & Signature (Col 5) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Totals & Calculations Box */}
          <div className="bg-[#f0fdf4]/30 border border-slate-200 rounded-lg p-4 space-y-2.5 shadow-sm" id="invoice-totals-box">
            {/* Extra Discount */}
            <div className="flex items-center justify-between text-xs min-h-[28px]">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Extra Discount</span>
              <div className="flex items-center space-x-1.5">
                <div className="w-14 h-6 flex items-center">
                  <Select
                    selectSize="sm"
                    containerClassName="!mb-0 mb-0 w-full"
                    value={extraDiscType}
                    onChange={(e: any) => {
                      const val = typeof e === 'object' && e?.target ? e.target.value : e;
                      setInvoiceOptions((prev: any) => ({ ...prev, invoiceDiscountType: val }));
                    }}
                    options={[
                      { value: 'percent', label: '%' },
                      { value: 'fixed', label: '₹' },
                    ]}
                  />
                </div>
                <div className="w-16">
                  <Input
                    type="number"
                    inputSize="sm"
                    containerClassName="!mb-0 mb-0"
                    min="0"
                    step="any"
                    value={invoiceOptions?.invoiceDiscountValue || ''}
                    onChange={(e: any) => {
                      const val = typeof e === 'object' && e?.target ? e.target.value : e;
                      setInvoiceOptions((prev: any) => ({
                        ...prev,
                        invoiceDiscountValue: clampNonNeg(val),
                      }));
                    }}
                    placeholder="0"
                    className="text-right font-mono"
                  />
                </div>
                <span className="font-mono text-slate-700 dark:text-slate-300 w-16 text-right leading-none">
                  -{formatCurrency(extraDiscAmount, currency)}
                </span>
              </div>
            </div>

            {/* Taxable Amount */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Taxable Amount</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                {formatCurrency(subTotal, currency)}
              </span>
            </div>

            {/* Total Tax */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Total Tax</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                {formatCurrency(totalTax, currency)}
              </span>
            </div>

            {/* Individual Tax Breakdown Lines */}
            {Number(totals?.cgst) > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pl-2">
                <span>CGST</span>
                <span className="font-mono">{formatCurrency(Number(totals.cgst), currency)}</span>
              </div>
            )}
            {Number(totals?.sgst) > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pl-2">
                <span>SGST</span>
                <span className="font-mono">{formatCurrency(Number(totals.sgst), currency)}</span>
              </div>
            )}
            {Number(totals?.utgst) > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pl-2">
                <span>UTGST</span>
                <span className="font-mono">{formatCurrency(Number(totals.utgst), currency)}</span>
              </div>
            )}
            {Number(totals?.igst) > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pl-2">
                <span>IGST</span>
                <span className="font-mono">{formatCurrency(Number(totals.igst), currency)}</span>
              </div>
            )}
            {Number(totals?.cess) > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pl-2">
                <span>GST Cess</span>
                <span className="font-mono">{formatCurrency(Number(totals.cess), currency)}</span>
              </div>
            )}
            {Number(totals?.tcsAmount) > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pl-2">
                <span>TCS</span>
                <span className="font-mono">{formatCurrency(Number(totals.tcsAmount), currency)}</span>
              </div>
            )}

            {/* Round Off */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Round Off</span>
                <Checkbox
                  containerClassName="!mb-0 mb-0"
                  checked={roundOffEnabled}
                  onChange={(e: any) => {
                    const checked = typeof e === 'object' && 'target' in e ? e.target.checked : Boolean(e);
                    setRoundOffEnabled(checked);
                    setInvoiceOptions((prev: any) => ({ ...prev, enableRoundOff: checked }));
                  }}
                />
              </div>
              <span className="font-mono text-slate-500 text-[11px]">
                {roundOffDiff >= 0 ? `+${roundOffDiff.toFixed(2)}` : roundOffDiff.toFixed(2)}
              </span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>

            {/* Total Amount */}
            <div className="flex items-center justify-between text-sm pt-1">
              <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-base">
                {formatCurrency(roundedAmount, currency)}
              </span>
            </div>

            {/* Total Discount */}
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Total Discount</span>
              <span className="font-mono text-emerald-600 font-medium">
                {formatCurrency(totalCalculatedDiscount, currency)}
              </span>
            </div>

            {/* Hide Totals Checkbox */}
            <div className="pt-1 flex items-center space-x-1.5 text-[11px] text-slate-500">
              <Checkbox
                containerClassName="!mb-0 mb-0"
                checked={hideTotals}
                onChange={(e: any) => {
                  const checked = typeof e === 'object' && 'target' in e ? e.target.checked : Boolean(e);
                  setHideTotals(checked);
                  setInvoiceOptions((prev: any) => ({ ...prev, hideTotals: checked }));
                }}
              />
              <span>Hide Totals on printed invoice</span>
            </div>
          </div>

          {/* Select Bank Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Select Bank</label>
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-0.5"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Add New Bank</span>
              </button>
            </div>

            <Select
              containerClassName="!mb-0 mb-0"
              value={selectedBankId}
              onChange={(e: any) => {
                const val = typeof e === 'object' && e?.target ? e.target.value : e;
                setSelectedBankId(val);
              }}
              options={
                activeAccounts.length > 0
                  ? activeAccounts.map((acc: any) => ({
                      value: acc.id,
                      label: `${acc.bankName || 'Bank'} — ${acc.accountNumber} (${acc.ifsc})`,
                    }))
                  : [
                      {
                        value: '',
                        label: profile?.bankName
                          ? `${profile.bankName} - ${profile.accountNumber || ''}`
                          : 'Primary Business Bank Account',
                      },
                    ]
              }
            />
          </div>

          {/* Select Signature Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Select Signature</label>
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-0.5"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Add New Signature</span>
              </button>
            </div>

            <Select
              containerClassName="!mb-0 mb-0"
              value={selectedSigId}
              onChange={(e: any) => {
                const val = typeof e === 'object' && e?.target ? e.target.value : e;
                setSelectedSigId(val);
              }}
              options={[
                { value: 'default', label: 'Default Authorised Signature' },
                { value: 'manager', label: 'Accounts Manager' },
                { value: 'proprietor', label: 'Authorised Signatory' },
              ]}
            />

            {/* Signature Preview Pink Box */}
            <div className="border border-pink-200 bg-pink-50/40 rounded p-2.5 text-center">
              <div className="text-[10px] text-pink-500 font-medium mb-1">
                Signature on the document
              </div>
              {profile?.signatureImage ? (
                <img
                  src={profile.signatureImage}
                  alt="Authorised Signatory"
                  className="max-h-12 mx-auto object-contain"
                />
              ) : (
                <div className="font-serif italic text-slate-700 text-sm py-1">
                  For {profile?.businessName || 'Vishal Enterprise'}
                  <div className="text-[9px] text-slate-400 not-italic font-sans mt-0.5">
                    Authorised Signatory
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Sticky Bottom Action Bar matching image.png */}
      <div className="sticky bottom-4 z-40 bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 px-6 flex flex-wrap items-center justify-between gap-4 shadow-2xl mt-6 max-w-[1720px] mx-auto w-full" id="sticky-bottom-action-bar">
        {/* Left Side: Total & Tax Summary */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <div className="flex flex-col">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-slate-400">
              TOTAL
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Includes Total Tax
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight leading-none">
              {formatCurrency(roundedAmount, currency)}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono mt-1">
              {formatCurrency(totalTax, currency)}
            </span>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3">
          {/* Save and Print Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPrintSplit((v) => !v)}
              className="bg-[#f0f2f5] dark:bg-slate-800 hover:bg-[#e2e5ea] dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-4 py-2 rounded-[8px] flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700 select-none shadow-2xs"
            >
              <span onClick={(e) => { e.stopPropagation(); onSavePrint?.(); }}>Save and Print</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1" />
            </button>

            {showPrintSplit && (
              <div
                className="absolute right-0 bottom-full mb-2 w-44 bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-700 rounded-[8px] shadow-2xl py-1 z-50 text-xs overflow-hidden"
                onMouseLeave={() => setShowPrintSplit(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintSplit(false);
                    onSavePrint?.();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                >
                  Direct Print (A4)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintSplit(false);
                    onSavePrint?.();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors border-t border-slate-100 dark:border-slate-800"
                >
                  Thermal Receipt
                </button>
              </div>
            )}
          </div>

          {/* Save Primary Button */}
          <button
            type="button"
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2 rounded-[8px] flex items-center space-x-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Save</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 pb-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
            N
          </div>
          <span>&copy; 2026 NextSpeed Technologies Private Limited. All rights reserved.</span>
        </div>
        <div className="flex items-center space-x-1 text-slate-400">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Data is secured via &apos;bank-grade&apos; security</span>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <button
        type="button"
        onClick={shareWhatsApp}
        className="fixed bottom-5 right-5 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3 rounded-full shadow-lg transition flex items-center justify-center z-40"
        title="Quick Share on WhatsApp"
        id="fgsb-floating-whatsapp-btn"
      >
        <MessageCircle className="w-6 h-6 fill-white text-white" />
      </button>
    </>
  );
}

export default TwoColumnDetailsSection;
