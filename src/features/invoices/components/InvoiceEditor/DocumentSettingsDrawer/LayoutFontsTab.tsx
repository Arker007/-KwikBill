import React from 'react';
import { Select, Switch } from '@/shared/components/ui';
import { Radio } from 'antd';
import { PAPER_SIZES, getPaperSize, DEFAULT_PRINT_SETTINGS } from '@/features/invoices/utils/printSettings';
import { Sparkles, Printer, FileSpreadsheet } from 'lucide-react';

interface LayoutFontsTabProps {
  invoiceOptions: any;
  setInvoiceOptions: React.Dispatch<React.SetStateAction<any>>;
}

const PDF_STYLES = [
  { id: 'classic', label: 'Classic', desc: 'Standard business layout with clean dividers and top bar' },
  { id: 'modern', label: 'Modern', desc: 'Contemporary header block with accent typography' },
  { id: 'minimal', label: 'Minimal', desc: 'Ultra-clean, crisp borderless editorial layout' },
  { id: 'corporate', label: 'Corporate', desc: 'Formal executive structure with high-contrast sections' },
  { id: 'evergreen', label: 'Evergreen', desc: 'Detailed business and quotation layout with structured grid' },
  { id: 'exact', label: 'Exact GST Standard', desc: 'Official statutory GST tax invoice layout with structured tax and totals columns' },
];

const DESIGN_PRESETS = [
  {
    id: 'exact-gst',
    name: 'Exact Standard',
    accentColor: '#1e40af',
    pdfStyle: 'exact',
    desc: 'Official statutory tax invoice structure with explicit GST breakdown',
  },
  {
    id: 'modern-blue',
    name: 'Aurora',
    accentColor: '#2563eb',
    pdfStyle: 'modern',
    desc: 'Electric blue header block, modern sans typography',
  },
  {
    id: 'classic-slate',
    name: 'Editorial',
    accentColor: '#1e293b',
    pdfStyle: 'classic',
    desc: 'Charcoal slate accents, timeless authority look',
  },
  {
    id: 'executive-navy',
    name: 'Executive',
    accentColor: '#0c1e3d',
    pdfStyle: 'corporate',
    desc: 'Deep navy accents, formal enterprise feel',
  },
  {
    id: 'minimal-emerald',
    name: 'Verdant',
    accentColor: '#059669',
    pdfStyle: 'minimal',
    desc: 'Subtle emerald green styling, airy minimalist layout',
  },
];

export const LayoutFontsTab: React.FC<LayoutFontsTabProps> = ({
  invoiceOptions,
  setInvoiceOptions,
}) => {
  const currentPaper = getPaperSize(invoiceOptions.paperSize, invoiceOptions);

  return (
    <div className="space-y-6">
      {/* Design Presets */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <Sparkles size={16} className="text-amber-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Design Presets</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant one-click professional styles &amp; color harmonies
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DESIGN_PRESETS.map((preset) => {
            const isSelected =
              invoiceOptions.pdfStyle === preset.pdfStyle &&
              invoiceOptions.accentColor === preset.accentColor;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setInvoiceOptions((prev: any) => ({
                    ...prev,
                    pdfStyle: preset.pdfStyle,
                    accentColor: preset.accentColor,
                  }));
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {preset.name}
                    </span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: preset.accentColor }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {preset.desc}
                  </p>
                </div>
                <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-2">
                  Style: {preset.pdfStyle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PDF Style */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">PDF Template Structure</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Choose the architectural layout structure for your generated invoice documents using Ant Design selection controls
        </p>

        <Radio.Group
          value={invoiceOptions.pdfStyle || 'classic'}
          onChange={(e) => setInvoiceOptions((prev: any) => ({ ...prev, pdfStyle: e.target.value }))}
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {PDF_STYLES.map((s) => {
            const isSelected = (invoiceOptions.pdfStyle || 'classic') === s.id;
            return (
              <Radio
                key={s.id}
                value={s.id}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer m-0 !h-auto flex items-start gap-3 w-full ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-100 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold mb-1 flex items-center justify-between text-slate-900 dark:text-slate-100">
                    <span>{s.label}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {s.desc}
                  </div>
                </div>
              </Radio>
            );
          })}
        </Radio.Group>
      </div>

      {/* Paper / Print Size */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <Printer size={16} className="text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Paper &amp; Print Size</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select standard sheet sizes or configure thermal roll receipt dimensions
            </p>
          </div>
        </div>

        <div className="max-w-md mb-4">
          <Select
            label="Page Format / Paper Size"
            value={invoiceOptions.paperSize || 'a4'}
            onChange={(e) => setInvoiceOptions((prev: any) => ({ ...prev, paperSize: e.target.value }))}
            options={Object.entries(PAPER_SIZES).map(([k, ps]: any) => ({
              value: k,
              label: ps.label,
            }))}
            selectSize="sm"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            {currentPaper.hint}
          </p>
        </div>

        {/* Custom Paper Size Inputs */}
        {invoiceOptions.paperSize === 'custom' && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl mb-4">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
              Custom Dimensions (mm)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Width (mm)
                </label>
                <input
                  type="number"
                  min="30"
                  max="500"
                  value={invoiceOptions.customPaperWidth || 80}
                  onChange={(e) =>
                    setInvoiceOptions((prev: any) => ({
                      ...prev,
                      customPaperWidth: parseInt(e.target.value, 10) || 80,
                    }))
                  }
                  className="form-input text-xs w-full"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Height (mm)
                </label>
                <input
                  type="number"
                  min="50"
                  max="1200"
                  value={invoiceOptions.customPaperHeight || 297}
                  onChange={(e) =>
                    setInvoiceOptions((prev: any) => ({
                      ...prev,
                      customPaperHeight: parseInt(e.target.value, 10) || 297,
                    }))
                  }
                  className="form-input text-xs w-full"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/50">
              <span className="text-[11px] text-slate-500">Presets:</span>
              {[
                { label: '40mm Roll', w: 32 },
                { label: '58mm Roll', w: 48 },
                { label: '80mm Roll', w: 72 },
                { label: '110mm Roll', w: 102 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() =>
                    setInvoiceOptions((prev: any) => ({
                      ...prev,
                      customPaperWidth: p.w,
                      customPaperHeight: 297,
                    }))
                  }
                  className="text-[11px] font-medium px-2.5 py-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Thermal Settings */}
        {currentPaper.kind === 'thermal' && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-4">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Thermal POS Receipt Options
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Thermal Font Scale"
                value={invoiceOptions.thermalFontSize || 'medium'}
                onChange={(e) =>
                  setInvoiceOptions((prev: any) => ({ ...prev, thermalFontSize: e.target.value }))
                }
                options={[
                  { value: 'small', label: 'Small (Maximum items per roll)' },
                  { value: 'medium', label: 'Medium (Standard recommended)' },
                  { value: 'large', label: 'Large (High legibility)' },
                ]}
                selectSize="sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Compact 2-Line Mode
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Condense line items to save roll paper
                  </div>
                </div>
                <Switch
                  checked={!!invoiceOptions.thermalCompact}
                  onChange={(val) =>
                    setInvoiceOptions((prev: any) => ({ ...prev, thermalCompact: val }))
                  }
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Paper Cut Mark
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Print dashed cut-line at bottom
                  </div>
                </div>
                <Switch
                  checked={invoiceOptions.thermalCutMark !== false}
                  onChange={(val) =>
                    setInvoiceOptions((prev: any) => ({ ...prev, thermalCutMark: val }))
                  }
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Margins & Page Numbers */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
          Margins &amp; Pagination
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Control print margins for pre-printed letterheads and multi-page document pagination
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {['marginTop', 'marginBottom', 'marginLeft', 'marginRight'].map((m) => {
            const labels: Record<string, string> = {
              marginTop: 'Top Margin',
              marginBottom: 'Bottom Margin',
              marginLeft: 'Left Margin',
              marginRight: 'Right Margin',
            };
            return (
              <div key={m}>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {labels[m]} (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={invoiceOptions[m] ?? 0}
                  onChange={(e) =>
                    setInvoiceOptions((prev: any) => ({
                      ...prev,
                      [m]: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="form-input text-xs w-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
