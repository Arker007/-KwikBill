import React, { useState } from 'react';
import { Hash, Sparkles, Check, RefreshCw } from 'lucide-react';
import { InvoiceNumberSettings } from '../types';
import { toast } from '../../../shared/components/feedback/Toast';
import { Select } from '@/shared/components/ui/Select';

export interface InvoiceNumberingViewProps {
  settings: InvoiceNumberSettings;
  onSave: (settings: InvoiceNumberSettings) => Promise<void>;
}

export const InvoiceNumberingView: React.FC<InvoiceNumberingViewProps> = ({
  settings: initialSettings,
  onSave,
}) => {
  const [settings, setSettings] = useState<InvoiceNumberSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof InvoiceNumberSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const getPreview = () => {
    const pfx = settings.brandPrefix || 'INV';
    const sep = settings.separator || '/';
    const padded = String(settings.startNumber || 1).padStart(settings.padDigits || 4, '0');
    if (settings.format === 'random') {
      return `${pfx}${sep}A3X9K2`;
    }
    if (settings.showFinYear) {
      const yr = new Date().getFullYear();
      const ny = (yr + 1).toString().slice(-2);
      return `${pfx}${sep}${yr}-${ny}${sep}${padded}`;
    }
    return `${pfx}${sep}${padded}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(settings);
      toast('Invoice numbering preferences saved!', 'success');
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="invoice-numbering-tab-content" className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Invoice Numbering & Sequence</h2>
          <p className="text-xs text-gray-500 mt-1">
            Customize invoice numbering format, prefixes, financial year codes, and starting counters.
          </p>
        </div>
      </div>

      {/* Live Preview Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-lg border border-blue-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-[#1E61EB] uppercase tracking-wider block">
            Next Generated Invoice Number
          </span>
          <span className="text-xl font-mono font-bold text-gray-900 mt-0.5 block">{getPreview()}</span>
        </div>
        <div className="text-right text-[11px] text-gray-500 flex items-center space-x-1">
          <Sparkles className="w-4 h-4 text-[#1E61EB]" />
          <span>Auto-increments sequentially</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Prefix / Brand Code :</label>
            <input
              type="text"
              value={settings.brandPrefix || ''}
              onChange={e => handleChange('brandPrefix', e.target.value.toUpperCase())}
              placeholder="e.g. INV, VE, SW"
              className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs font-mono uppercase focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Separator :</label>
            <input
              type="text"
              value={settings.separator || '/'}
              onChange={e => handleChange('separator', e.target.value)}
              placeholder="e.g. / or -"
              maxLength={2}
              className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Starting Number :</label>
            <input
              type="number"
              min={1}
              value={settings.startNumber || 1}
              onChange={e => handleChange('startNumber', parseInt(e.target.value, 10) || 1)}
              className="w-full h-8 px-2.5 rounded border border-gray-200 text-xs font-mono focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <Select
              label="Padding Digits :"
              value={settings.padDigits || 4}
              onChange={(e: any) => {
                const val = typeof e === 'object' && e?.target ? e.target.value : e;
                handleChange('padDigits', parseInt(val, 10));
              }}
              options={[
                { value: 3, label: '3 digits (001)' },
                { value: 4, label: '4 digits (0001)' },
                { value: 5, label: '5 digits (00001)' },
                { value: 6, label: '6 digits (000001)' },
              ]}
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center space-x-2 text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={!!settings.showFinYear}
              onChange={e => handleChange('showFinYear', e.target.checked)}
              className="rounded border-gray-300 text-[#1E61EB] focus:ring-0"
            />
            <span className="font-medium">Include Indian Financial Year (e.g. 2026-27) in sequence</span>
          </label>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1E61EB] hover:bg-[#174ec4] text-white font-medium text-xs py-2.5 px-6 rounded-md shadow-xs transition-colors flex items-center space-x-1.5"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Save Numbering Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceNumberingView;
