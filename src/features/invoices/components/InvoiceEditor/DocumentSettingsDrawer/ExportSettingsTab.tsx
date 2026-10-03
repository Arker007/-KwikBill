import React from 'react';
import { Select, Switch, DatePicker } from '@/shared/components/ui';
import { getCountriesForRegion } from '@/shared/utils';
import { getRegionMode } from '@/store';
import { Repeat, DollarSign, Download, FileText, CheckCircle2 } from 'lucide-react';
import { INVOICE_TYPES } from '@/features/invoices/constants';

interface ExportSettingsTabProps {
  invoiceOptions: any;
  setInvoiceOptions: React.Dispatch<React.SetStateAction<any>>;
  details: any;
  setDetails?: React.Dispatch<React.SetStateAction<any>>;
  invoiceType: string;
}

export const ExportSettingsTab: React.FC<ExportSettingsTabProps> = ({
  invoiceOptions,
  setInvoiceOptions,
  details,
  setDetails,
  invoiceType,
}) => {
  const currentTypeConfig = INVOICE_TYPES[invoiceType as keyof typeof INVOICE_TYPES];
  const countries = getCountriesForRegion(getRegionMode() as any);
  const currencyOptions = Array.from(
    new Map(countries.map((c) => [c.currency, c])).values()
  ).map((c: any) => ({
    value: c.currency,
    label: `${c.currency} (${c.currencySymbol === c.currency ? c.name : c.currencySymbol})`,
  }));

  const rec = invoiceOptions.recurring || { enabled: false };

  const toggleRecurring = () => {
    if (rec.enabled) {
      setInvoiceOptions((prev: any) => ({
        ...prev,
        recurring: { ...prev.recurring, enabled: false },
      }));
    } else {
      const next = new Date(details?.invoiceDate || new Date().toISOString());
      next.setMonth(next.getMonth() + 1);
      setInvoiceOptions((prev: any) => ({
        ...prev,
        recurring: {
          enabled: true,
          frequency: 'monthly',
          interval: 1,
          nextDate: next.toISOString().split('T')[0],
          endMode: 'never',
          endDate: '',
          maxOccurrences: '',
        },
      }));
    }
  };

  const setRecKey = (key: string, val: any) => {
    setInvoiceOptions((prev: any) => ({
      ...prev,
      recurring: { ...prev.recurring, [key]: val },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Document Title & Currency */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Document Title &amp; Currency</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize the printed title heading and international transaction currencies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Custom Invoice Title Heading
            </label>
            <input
              type="text"
              className="form-input text-xs w-full"
              value={invoiceOptions.customTitle || ''}
              onChange={(e) =>
                setInvoiceOptions((prev: any) => ({ ...prev, customTitle: e.target.value }))
              }
              placeholder={currentTypeConfig?.title || 'TAX INVOICE'}
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Leave blank to default to standard '{currentTypeConfig?.title || 'TAX INVOICE'}'
            </span>
          </div>

          <div>
            <Select
              label="Transaction Currency"
              value={invoiceOptions.currency || 'INR'}
              onChange={(e) =>
                setInvoiceOptions((prev: any) => ({ ...prev, currency: e.target.value }))
              }
              options={currencyOptions}
              selectSize="sm"
            />
          </div>

          {invoiceOptions.currency && invoiceOptions.currency !== 'INR' && (
            <div className="sm:col-span-2 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
              <label className="text-xs font-semibold text-indigo-950 dark:text-indigo-200 block mb-1">
                Historical Exchange Rate (optional snapshot)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-input text-xs w-full"
                value={invoiceOptions.exchangeRate || ''}
                onChange={(e) =>
                  setInvoiceOptions((prev: any) => ({ ...prev, exchangeRate: e.target.value }))
                }
                placeholder={`1 ${invoiceOptions.currency} = ? INR`}
              />
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 block">
                Saved permanently on this bill so future currency fluctuations don't alter accounting.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recurring Invoice Automation */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Repeat size={16} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Recurring Invoice Schedule
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically generate recurring invoices on fixed intervals for retainers and subscriptions
              </p>
            </div>
          </div>
          <Switch
            checked={!!rec.enabled}
            onChange={toggleRecurring}
            size="sm"
          />
        </div>

        {rec.enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
            <Select
              label="Frequency"
              value={rec.frequency || 'monthly'}
              onChange={(e) => setRecKey('frequency', e.target.value)}
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              selectSize="sm"
            />
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Interval (every N periods)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                className="form-input text-xs w-full"
                value={rec.interval || 1}
                onChange={(e) => setRecKey('interval', parseInt(e.target.value, 10) || 1)}
              />
            </div>
            <DatePicker
              label="Next Invoice Date"
              value={rec.nextDate || ''}
              onChange={(e) => setRecKey('nextDate', e.target.value)}
            />
            <Select
              label="End Condition"
              value={rec.endMode || 'never'}
              onChange={(e) => setRecKey('endMode', e.target.value)}
              options={[
                { value: 'never', label: 'Never (Run until cancelled)' },
                { value: 'onDate', label: 'On a specific end date' },
                { value: 'afterN', label: 'After N generated invoices' },
              ]}
              selectSize="sm"
            />
            {rec.endMode === 'onDate' && (
              <div className="sm:col-span-2">
                <DatePicker
                  label="Stop Generating After Date"
                  value={rec.endDate || ''}
                  onChange={(e) => setRecKey('endDate', e.target.value)}
                />
              </div>
            )}
            {rec.endMode === 'afterN' && (
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Stop after this many invoices
                </label>
                <input
                  type="number"
                  min="1"
                  className="form-input text-xs w-full"
                  value={rec.maxOccurrences || ''}
                  onChange={(e) => setRecKey('maxOccurrences', parseInt(e.target.value, 10) || '')}
                  placeholder="e.g. 12"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* PDF Generation & Auto-Print */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <Download size={16} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Download &amp; Print Preferences
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure PDF document naming conventions and instant print triggers
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Auto-Print on Save
              </div>
              <div className="text-[11px] text-slate-500">
                Trigger system printer dialog automatically whenever Save &amp; Download is clicked
              </div>
            </div>
            <Switch
              checked={!!invoiceOptions.autoPrintOnSave}
              onChange={(val) =>
                setInvoiceOptions((prev: any) => ({ ...prev, autoPrintOnSave: val }))
              }
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
