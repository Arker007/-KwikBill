import React from 'react';
import { Tag, MessageCircle, ExternalLink, RotateCcw } from 'lucide-react';

interface LabelsTemplatesTabProps {
  invoiceOptions: any;
  setInvoiceOptions: React.Dispatch<React.SetStateAction<any>>;
  activeSubTab?: 'labels' | 'whatsapp';
}

export const LabelsTemplatesTab: React.FC<LabelsTemplatesTabProps> = ({
  invoiceOptions,
  setInvoiceOptions,
  activeSubTab = 'labels',
}) => {
  const customLabels = invoiceOptions.customLabels || {};

  const setLabel = (key: string, val: string) => {
    setInvoiceOptions((prev: any) => ({
      ...prev,
      customLabels: {
        ...(prev.customLabels || {}),
        [key]: val,
      },
    }));
  };

  const resetLabels = () => {
    setInvoiceOptions((prev: any) => ({
      ...prev,
      customLabels: {},
    }));
  };

  const defaultFields = [
    { key: 'invoiceNumber', defaultLabel: 'Invoice #', desc: 'Heading for invoice serial number' },
    { key: 'invoiceDate', defaultLabel: 'Date', desc: 'Heading for invoice issue date' },
    { key: 'dueDate', defaultLabel: 'Due Date', desc: 'Heading for payment due date' },
    { key: 'hsn', defaultLabel: 'HSN/SAC', desc: 'Commodity code column header' },
    { key: 'qty', defaultLabel: 'Qty', desc: 'Item quantity column header' },
    { key: 'rate', defaultLabel: 'Rate', desc: 'Unit price column header' },
    { key: 'discount', defaultLabel: 'Discount', desc: 'Discount column header' },
    { key: 'tax', defaultLabel: 'GST/Tax', desc: 'Tax percentage / amount column header' },
    { key: 'amount', defaultLabel: 'Amount', desc: 'Line item total column header' },
  ];

  if (activeSubTab === 'whatsapp') {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <MessageCircle size={16} className="text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                WhatsApp &amp; Email Sharing Message
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize the default greeting and message text sent to clients via WhatsApp
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                WhatsApp Message Template
              </label>
              <textarea
                rows={4}
                value={
                  invoiceOptions.whatsappTemplate ||
                  'Hello {client_name},\n\nPlease find invoice {invoice_number} for ₹{grand_total} from {business_name}.\nDue date: {due_date}.\n\nThank you for your business!'
                }
                onChange={(e) =>
                  setInvoiceOptions((prev: any) => ({
                    ...prev,
                    whatsappTemplate: e.target.value,
                  }))
                }
                className="form-input text-xs w-full resize-y font-mono"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Available Dynamic Variables:
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {['{client_name}', '{invoice_number}', '{grand_total}', '{due_date}', '{business_name}'].map(
                  (v) => (
                    <span
                      key={v}
                      className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-indigo-600 dark:text-indigo-300"
                    >
                      {v}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Customize Column &amp; Section Labels
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Override default PDF table headers to match your business terminology (e.g. 'Hours' instead of 'Qty')
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetLabels}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            <RotateCcw size={13} /> Reset labels
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {defaultFields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {f.desc}
              </label>
              <input
                type="text"
                value={customLabels[f.key] ?? ''}
                onChange={(e) => setLabel(f.key, e.target.value)}
                placeholder={f.defaultLabel}
                className="form-input text-xs w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
