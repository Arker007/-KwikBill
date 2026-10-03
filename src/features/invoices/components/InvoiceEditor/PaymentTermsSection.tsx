import React from 'react';
import { Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Select, Textarea, Button } from '@/shared/components/ui';
import { TERMS_PRESETS } from '@/shared/constants';
import { htmlHasText } from '@/shared/utils';
import { confirmAction } from '@/shared/components/feedback/ConfirmModal';
import { toast } from '@/shared/components/feedback/Toast';
import { RichEditor } from './RichEditor';

interface PaymentTermsSectionProps {
  invoiceOptions: any;
  setInvoiceOptions: React.Dispatch<React.SetStateAction<any>>;
  termsTemplates: any[];
  selectedTermsId: string;
  setSelectedTermsId: (id: string) => void;
  customTerms: string;
  setCustomTerms: (terms: string) => void;
  customNotes: string;
  setCustomNotes: (notes: string) => void;
  internalNote: string;
  setInternalNote: (note: string) => void;
  extraSections: any[];
  setExtraSections: React.Dispatch<React.SetStateAction<any[]>>;
  handleTermsSelect: (id: string) => void;
}

export function PaymentTermsSection({
  invoiceOptions,
  setInvoiceOptions,
  termsTemplates,
  selectedTermsId,
  setSelectedTermsId,
  customTerms,
  setCustomTerms,
  customNotes,
  setCustomNotes,
  internalNote,
  setInternalNote,
  extraSections,
  setExtraSections,
  handleTermsSelect,
}: PaymentTermsSectionProps) {
  return (
    <div id="fgsb-payment-terms-section">
      {/* Terms */}
      <div className="glass-panel p-6 mb-6" id="fgsb-terms-container-card">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h3 className="section-title font-bold text-slate-800 dark:text-slate-100" style={{ margin: 0 }}>
            Terms &amp; Conditions
          </h3>
          <div className="flex gap-2 items-center">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
              PDF Layout:
            </span>
            {[
              { id: 'compact', label: 'Compact', hint: 'Tiny footer text — saves paper' },
              { id: 'formatted', label: 'Formatted', hint: 'Larger readable paragraphs' },
            ].map((mode) => {
              const active = (invoiceOptions.termsFormatMode || 'compact') === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setInvoiceOptions((prev: any) => ({ ...prev, termsFormatMode: mode.id }))}
                  title={mode.hint}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={`grid gap-3 mb-4 ${termsTemplates.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div className="form-group mb-0">
            <Select
              label="Insert preset (by business type)"
              value=""
              onChange={async (e) => {
                if (!e.target.value) return;
                const preset = TERMS_PRESETS.find((p) => p.id === e.target.value);
                if (!preset) return;

                if (htmlHasText(customTerms)) {
                  const skipConfirm = sessionStorage.getItem('gst_termsPresetConfirmed') === '1';
                  if (!skipConfirm) {
                    const proceed = await confirmAction({
                      title: 'Replace current Terms?',
                      message:
                        'Your existing Terms text will be lost. Subsequent preset swaps this session will happen silently — this confirmation is shown once.',
                      confirmLabel: 'Replace',
                      tone: 'warning',
                    });
                    if (!proceed) {
                      e.target.value = '';
                      return;
                    }
                    try {
                      sessionStorage.setItem('gst_termsPresetConfirmed', '1');
                    } catch {
                      /* ignore */
                    }
                  }
                }
                setCustomTerms(preset.body);
                setSelectedTermsId('');
                e.target.value = '';
                if (preset.body) toast(`Inserted "${preset.label}" preset`, 'success');
              }}
              options={[
                { value: '', label: '— Pick a business type —' },
                ...TERMS_PRESETS.map((p) => ({ value: p.id, label: p.label })),
              ]}
              helperText={<span className="text-[10px] text-slate-400 dark:text-slate-500">India-specific starter wording. Edit freely.</span>}
              selectSize="sm"
            />
          </div>
          {termsTemplates.length > 0 && (
            <div className="form-group mb-0">
              <Select
                label="Load saved template"
                value={selectedTermsId}
                onChange={(e) => handleTermsSelect(e.target.value)}
                options={[
                  { value: '', label: '— Custom —' },
                  ...termsTemplates.map((t) => ({ value: t.id, label: t.name })),
                ]}
                selectSize="sm"
              />
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Terms (appears on invoice — supports rich formatting)</label>
          <RichEditor
            toolbar
            value={customTerms}
            onChange={(v) => {
              setCustomTerms(v);
              setSelectedTermsId('');
            }}
            placeholder="Enter or paste your terms & conditions..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes / Remarks (optional)</label>
          <RichEditor
            toolbar
            value={customNotes}
            onChange={(v) => setCustomNotes(v)}
            placeholder="Project details, special instructions, additional notes..."
          />
        </div>

        <div
          className="form-group p-4 rounded-lg border border-dashed bg-amber-50/50 border-amber-300 dark:bg-amber-950/10 dark:border-amber-900/50"
        >
          <label
            className="form-label flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
            Private Note (not shown on invoice)
          </label>
          <Textarea
            rows={2}
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="e.g. Client asked for 15-day credit, follow up on 20th, referred by Ravi..."
            containerClassName="mb-0"
          />
        </div>
      </div>

      {/* Extra Sections */}
      <div className="glass-panel p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="section-title font-bold text-slate-800 dark:text-slate-100" style={{ margin: 0 }}>
            Additional Pages / Sections
          </h3>
          <Button
            type="button"
            variant="dashed"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setExtraSections((prev) => [...prev, { id: Date.now().toString(), title: '', content: '' }])}
          >
            Add Section
          </Button>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
          Add extra sections that appear after the invoice footer. You can paste formatted HTML content (bold, lists, tables,
          etc.).
        </p>
        {extraSections.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            No extra sections. Click "Add Section" to create one.
          </p>
        ) : (
          extraSections.map((section, idx) => (
            <div key={section.id || `extra-section-${idx}`} className="extra-section-editor">
              <div className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  className="form-input"
                  value={section.title}
                  onChange={(e) =>
                    setExtraSections((prev) =>
                      prev.map((s) => (s.id === section.id ? { ...s, title: e.target.value } : s))
                    )
                  }
                  placeholder="Section title (e.g. Scope of Work, Delivery Timeline)"
                  style={{ flex: 1 }}
                />
                <button
                  className="icon-btn"
                  onClick={() => {
                    if (idx > 0)
                      setExtraSections((prev) => {
                        const arr = [...prev];
                        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                        return arr;
                      });
                  }}
                  title="Move up"
                  disabled={idx === 0}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  className="icon-btn"
                  onClick={() => {
                    if (idx < extraSections.length - 1)
                      setExtraSections((prev) => {
                        const arr = [...prev];
                        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
                        return arr;
                      });
                  }}
                  title="Move down"
                  disabled={idx === extraSections.length - 1}
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  className="icon-btn icon-btn-red"
                  onClick={() => setExtraSections((prev) => prev.filter((s) => s.id !== section.id))}
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                <RichEditor
                  value={section.content}
                  onChange={(html) =>
                    setExtraSections((prev) =>
                      prev.map((s) => (s.id === section.id ? { ...s, content: html } : s))
                    )
                  }
                  placeholder="Type or paste formatted content here (supports bold, lists, tables from Word/Docs)..."
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
