import React from 'react';
import { X, Info } from 'lucide-react';
import { DEDUCTION_CAPS } from '../utils';
import { formatCurrency } from '@/shared/utils';
import type { IncomeTaxInputs, RegimeComparison, RegimeTaxResult } from '../types';

export function defaultInputs(): IncomeTaxInputs {
  return {
    salary: 0,
    businessIncome: 0,
    housePropertyIncome: 0,
    otherSources: 0,
    stcgAtSpecialRate: 0,
    ltcgAtSpecialRate: 0,
    deductions: {
      '80C': 0, '80CCD1B': 0, '80D': 0, '80TTA': 0, '80TTB': 0,
      '80E': 0, '80G': 0, '80GG': 0, '80DDB': 0, '80U': 0,
      '24b': 0, '80CCD2': 0,
    },
    regime: 'new',
  };
}

export const SECTION_DESCRIPTIONS: Record<string, string> = {
  '80C':     'PPF · ELSS · LIC · EPF · tuition · home-loan principal · NSC',
  '80CCD1B': 'Additional NPS (self)',
  '80D':     'Health insurance (self + family + parents)',
  '80TTA':   'Savings-account interest (< 60 yrs)',
  '80TTB':   'Bank / PO deposit interest (senior citizens)',
  '80E':     'Education-loan interest — no cap, 8 years',
  '80G':     'Donations to approved funds',
  '80GG':    'Rent paid when HRA is not received',
  '80DDB':   'Specified serious illness',
  '80U':     'Self-disability',
  '24b':     'Home-loan interest (self-occupied)',
};

export function Row({ label, value, bold, big, muted }: {
  label: string;
  value: number;
  bold?: boolean;
  big?: boolean;
  muted?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      fontSize: big ? '1rem' : '0.8rem',
      fontWeight: bold ? 700 : 400,
      marginBottom: 2,
      opacity: muted ? 0.5 : 1,
    }}>
      <span>{label}</span>
      <span style={{ fontFamily: 'monospace' }}>{formatCurrency(value)}</span>
    </div>
  );
}

export function NumberInput({ label, hint, value, onChange }: {
  label: string;
  hint?: string; key?: string | number;
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 2 }}>{label}</label>
      <input type="number" className="form-input"
        style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
        value={value || ''} min="0" step="any"
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        placeholder="0" />
      {hint && <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  );
}

export function RegimeCard({ title, result, highlighted, color }: {
  title: string;
  result: RegimeTaxResult;
  highlighted: boolean;
  color: string;
}) {
  return (
    <div className="glass-panel p-4" style={{
      border: highlighted ? `2px solid ${color}` : '1px solid var(--border)',
      background: highlighted ? `${color}15` : undefined,
    }}>
      <h4 style={{ margin: 0, marginBottom: '0.5rem', color }}>{title}</h4>
      <Row label="Gross Total Income" value={result.grossTotalIncome} />
      <Row label="Standard Deduction" value={-result.standardDeduction} muted={!result.standardDeduction} />
      <Row label="Chapter VI-A" value={-result.allowedDeductions} muted={!result.allowedDeductions} />
      <Row label="Taxable Income" value={result.taxableIncome} bold />
      <hr style={{ opacity: 0.2, margin: '0.5rem 0' }} />
      <Row label="Slab Tax" value={result.slabTax} />
      {(result.stcgTax > 0 || result.ltcgTax > 0) && (
        <>
          <Row label="STCG (15%)" value={result.stcgTax} muted={!result.stcgTax} />
          <Row label="LTCG (10%)" value={result.ltcgTax} muted={!result.ltcgTax} />
        </>
      )}
      {result.rebate87A > 0 && <Row label="§87A Rebate" value={-result.rebate87A} />}
      {result.surcharge > 0 && <Row label="Surcharge" value={result.surcharge} />}
      <Row label="Health & Ed Cess (4%)" value={result.cess} />
      <hr style={{ opacity: 0.2, margin: '0.5rem 0' }} />
      <Row label="Total Tax" value={result.totalTax} bold big />
    </div>
  );
}

interface RegimeCalculatorTabProps {
  inputs: IncomeTaxInputs;
  setInputs: React.Dispatch<React.SetStateAction<IncomeTaxInputs>>;
  comparison: RegimeComparison;
  onReset: () => void;
}

export function RegimeCalculatorTab({ inputs, setInputs, comparison, onReset }: RegimeCalculatorTabProps) {
  const set = (patch: Partial<IncomeTaxInputs>) => setInputs(prev => ({ ...prev, ...patch }));
  const setDed = (section: string, val: number) => setInputs(prev => ({
    ...prev,
    deductions: { ...prev.deductions, [section]: val },
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      {/* Left column: inputs */}
      <div className="glass-panel p-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Your income</h3>
          <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={onReset}>
            <X size={14} /> Reset
          </button>
        </div>

        <NumberInput label="Gross Salary (Form 16 box 1)" hint="Enter zero if you don't have salary income. Standard Deduction is applied automatically." value={inputs.salary} onChange={v => set({ salary: v })} />
        <NumberInput label="Business / Professional Income" hint={inputs._autofillHint ? '✨ Auto-filled from your invoices minus purchases + expenses this FY. Override if needed.' : 'Net profit from your books.'} value={inputs.businessIncome} onChange={v => set({ businessIncome: v, _autofillHint: false })} />
        <NumberInput label="House Property (rent received)" hint="Enter net income AFTER 30% standard deduction and home-loan interest §24(b)." value={inputs.housePropertyIncome} onChange={v => set({ housePropertyIncome: v })} />
        <NumberInput label="Other Sources (bank interest, dividends, etc.)" hint="Includes savings-account interest; 80TTA claims that separately." value={inputs.otherSources} onChange={v => set({ otherSources: v })} />

        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Capital gains (special rates)</h4>
        <NumberInput label="STCG on listed equity (§111A)" hint="Taxed flat at 15%. Excludes debt / property STCG (those go into slab)." value={inputs.stcgAtSpecialRate} onChange={v => set({ stcgAtSpecialRate: v })} />
        <NumberInput label="LTCG on listed equity (§112A)" hint="₹1L exempt; balance taxed flat at 10%." value={inputs.ltcgAtSpecialRate} onChange={v => set({ ltcgAtSpecialRate: v })} />

        <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Deductions (Old Regime only)</h4>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
          Under New Regime (default from FY 2023-24), only Section 80CCD(2) — employer NPS contribution — is allowed.
          These deductions ONLY reduce your Old-Regime tax.
        </p>
        {Object.entries(DEDUCTION_CAPS).map(([section, cap]) => (
          <NumberInput key={section}
            label={`§${section}`}
            hint={`Cap: ${cap === Infinity ? 'No cap' : formatCurrency(Number(cap))} · ${SECTION_DESCRIPTIONS[section] || ''}`}
            value={inputs.deductions?.[section] || 0}
            onChange={v => setDed(section, v)} />
        ))}
        <NumberInput label="§80CCD(2) — employer NPS" hint="Allowed under BOTH regimes. Typically 10% of salary (14% for govt)." value={inputs.deductions?.['80CCD2'] || 0} onChange={v => setDed('80CCD2', v)} />
      </div>

      {/* Right column: side-by-side comparison */}
      <div>
        <div className="glass-panel p-4" style={{ marginBottom: '1rem' }}>
          <h3 className="section-title" style={{ marginTop: 0 }}>
            Recommended: <span style={{ color: comparison.recommended === 'new' ? '#059669' : '#8b5cf6', textTransform: 'uppercase' }}>{comparison.recommended} Regime</span>
          </h3>
          <p style={{ fontSize: '0.85rem', margin: '0 0 0.75rem 0' }}>
            Saves you <strong>{formatCurrency(comparison.savings)}</strong> compared to the other regime.
            {comparison.recommended === 'new' && " (New Regime is the default — you don't need to elect anything.)"}
            {comparison.recommended === 'old' && ' (You must file Form 10-IEA before the due date to elect Old Regime.)'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <RegimeCard title="Old Regime" result={comparison.old} highlighted={comparison.recommended === 'old'} color="#8b5cf6" />
          <RegimeCard title="New Regime" result={comparison.new} highlighted={comparison.recommended === 'new'} color="#059669" />
        </div>

        <div className="glass-panel p-4" style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--primary)' }} />
            <div>
              <strong>How this is computed:</strong> slabs → §87A rebate → surcharge (income &gt; ₹50L) → 4% Health &amp; Ed Cess.
              STCG (§111A) at 15%, LTCG (§112A) at 10% over ₹1L exempt.
              Numbers auto-save; refresh the page and they persist.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
