import React from 'react';
import { Plus, Trash2, Sliders, Info, Shield } from 'lucide-react';

interface CustomFieldsTabProps {
  extraSections?: any[];
  setExtraSections?: React.Dispatch<React.SetStateAction<any[]>>;
}

const COMMON_SUGGESTIONS = [
  { title: 'Vehicle Number', content: 'e.g. MH-12-AB-1234' },
  { title: 'Purchase Order (PO) Details', content: 'PO No: 45000123\nPO Date: 2026-09-15' },
  { title: 'E-Way Bill Number', content: 'e.g. 231456789012' },
  { title: 'Transporter Details', content: 'Transporter ID / Name / LR No.' },
  { title: 'Delivery Challan', content: 'DC No: DC-2026-001\nDate: 2026-09-18' },
];

export const CustomFieldsTab: React.FC<CustomFieldsTabProps> = ({
  extraSections = [],
  setExtraSections,
}) => {
  const addSection = (title = '', content = '') => {
    if (!setExtraSections) return;
    setExtraSections((prev: any[]) => [
      ...prev,
      { id: Date.now().toString(), title: title || 'Custom Section', content },
    ]);
  };

  const updateSection = (id: string, field: 'title' | 'content', value: string) => {
    if (!setExtraSections) return;
    setExtraSections((prev: any[]) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeSection = (id: string) => {
    if (!setExtraSections) return;
    setExtraSections((prev: any[]) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Custom Invoice Fields &amp; Sections
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Add business-specific metadata blocks (PO #, Vehicle #, E-Way Bill #, Logistics)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => addSection()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus size={14} /> Add Custom Field
          </button>
        </div>

        {/* Quick Add Suggestions */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Quick Add Common Fields:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SUGGESTIONS.map((sug) => (
              <button
                key={sug.title}
                type="button"
                onClick={() => addSection(sug.title, sug.content)}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> {sug.title}
              </button>
            ))}
          </div>
        </div>

        {/* List of custom sections */}
        {extraSections.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No custom fields added to this invoice. Click above to add purchase order, transport, or custom notes blocks.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {extraSections.map((sec, idx) => (
              <div
                key={sec.id || idx}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/40 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={sec.title || ''}
                    onChange={(e) => updateSection(sec.id, 'title', e.target.value)}
                    placeholder="Field Heading / Section Title"
                    className="form-input text-xs font-bold text-slate-800 dark:text-slate-100 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(sec.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Remove custom field"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={sec.content || ''}
                  onChange={(e) => updateSection(sec.id, 'content', e.target.value)}
                  placeholder="Field value or multi-line content..."
                  className="form-input text-xs w-full resize-y font-mono"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
