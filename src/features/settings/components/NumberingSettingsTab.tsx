import React from 'react';
import { Hash, Save } from 'lucide-react';
import { Select } from '@/shared/components/ui';
import { InvoiceNumberSettings } from '../types';

interface NumberingSettingsTabProps {
  invNumSettings: InvoiceNumberSettings;
  setInvNumSettings: React.Dispatch<React.SetStateAction<InvoiceNumberSettings>>;
  handleInvNumChange: (field: keyof InvoiceNumberSettings, value: any) => void;
  handleSaveInvNumSettings: () => Promise<void>;
  invNumSaving: boolean;
  getInvNumPreview: () => string;
}

export const NumberingSettingsTab: React.FC<NumberingSettingsTabProps> = ({
  invNumSettings,
  setInvNumSettings,
  handleInvNumChange,
  handleSaveInvNumSettings,
  invNumSaving,
  getInvNumPreview,
}) => {
  return (
    <div id="section-numbering">
      <h3 className="section-title mt-8">
        <Hash size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
        Invoice Number Format
      </h3>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>Preview:</p>
        <p style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--accent)', margin: 0 }}>
          {getInvNumPreview()}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group full-width">
          <label className="form-label">Format Style</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'branded', label: 'Branded Sequential', desc: 'PREFIX/2026-27/0001' },
              { id: 'sequential', label: 'Simple Sequential', desc: 'PREFIX/0001' },
              { id: 'random', label: 'Random', desc: 'PREFIX/A3X9K2' },
            ].map(f => (
              <button
                key={f.id}
                type="button"
                className={`type-chip ${invNumSettings.format === f.id ? 'type-chip-active' : ''}`}
                onClick={() => {
                  const updates: Partial<InvoiceNumberSettings> = { format: f.id as any };
                  if (f.id === 'sequential') updates.showFinYear = false;
                  if (f.id === 'branded') updates.showFinYear = true;
                  setInvNumSettings(prev => ({ ...prev, ...updates }));
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <details style={{ marginTop: '0.5rem', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-secondary)' }}>
        <summary style={{ padding: '0.65rem 0.85rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          ⚙ Customize prefix, separator & padding
          <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.3rem' }}>
            (defaults are fine for most businesses)
          </span>
        </summary>
        <div className="grid grid-cols-2 gap-4" style={{ padding: '0.75rem 0.85rem 0.85rem' }}>
          <div className="form-group">
            <label className="form-label">Brand Prefix</label>
            <input
              type="text"
              className="form-input"
              value={invNumSettings.brandPrefix}
              onChange={e => handleInvNumChange('brandPrefix', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="e.g. ACME, BK (leave empty for INV/EST/CN)"
              maxLength={10}
            />
            <p className="field-hint">Your brand name or abbreviation. Leave empty to use default type prefix (INV, EST, CN, BOS).</p>
          </div>
          <div className="form-group">
            <label className="form-label">Separator</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['/', '-', '#'].map(sep => (
                <button
                  key={sep}
                  type="button"
                  className={`type-chip ${invNumSettings.separator === sep ? 'type-chip-active' : ''}`}
                  style={{ minWidth: 44, fontFamily: 'monospace', fontWeight: 700 }}
                  onClick={() => handleInvNumChange('separator', sep)}
                >
                  {sep}
                </button>
              ))}
            </div>
          </div>
          {invNumSettings.format !== 'random' && (
            <>
              <div className="form-group">
                <label className="form-label">Include Financial Year</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 4 }}>
                  <button
                    type="button"
                    className={`type-chip ${invNumSettings.showFinYear ? 'type-chip-active' : ''}`}
                    onClick={() => handleInvNumChange('showFinYear', true)}
                  >
                    Yes (2026-27)
                  </button>
                  <button
                    type="button"
                    className={`type-chip ${!invNumSettings.showFinYear ? 'type-chip-active' : ''}`}
                    onClick={() => handleInvNumChange('showFinYear', false)}
                  >
                    No
                  </button>
                </div>
              </div>
              <div className="form-group">
                <Select
                  label="Number Padding"
                  value={invNumSettings.padDigits}
                  onChange={e => handleInvNumChange('padDigits', Number(e.target.value))}
                  options={[
                    { value: 3, label: '3 digits (001)' },
                    { value: 4, label: '4 digits (0001)' },
                    { value: 5, label: '5 digits (00001)' },
                    { value: 6, label: '6 digits (000001)' },
                  ]}
                  selectSize="sm"
                />
              </div>
            </>
          )}
        </div>
      </details>
      <div className="mt-4 flex justify-end">
        <button type="button" className="btn btn-primary" onClick={handleSaveInvNumSettings} disabled={invNumSaving}>
          <Save size={16} /> {invNumSaving ? 'Saving...' : 'Save Number Format'}
        </button>
      </div>
    </div>
  );
};
