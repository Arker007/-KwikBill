import React from 'react';
import { ChevronRight, Info } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { Row, NumberInput } from './RegimeCalculatorTab';
import type { PresumptiveInputs, PresumptiveResult } from '../types';

interface PresumptiveTabProps {
  presumptiveInputs: PresumptiveInputs;
  setPresumptiveInputs: React.Dispatch<React.SetStateAction<PresumptiveInputs>>;
  presumptive: PresumptiveResult | null;
  onPushToCalculator: () => void;
}

export function PresumptiveTab({ presumptiveInputs, setPresumptiveInputs, presumptive, onPushToCalculator }: PresumptiveTabProps) {
  const set = (patch: Partial<PresumptiveInputs>) => setPresumptiveInputs(prev => ({ ...prev, ...patch }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
      <div className="glass-panel p-4">
        <h3 className="section-title" style={{ marginTop: 0 }}>Section</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { key: '44AD' as const,  label: '§44AD',  hint: 'Trading / Retail / Manufacturing' },
            { key: '44ADA' as const, label: '§44ADA', hint: 'Professionals (CA, doctor, lawyer, consultant)' },
            { key: '44AE' as const,  label: '§44AE',  hint: 'Transporters (goods carriage owners)' },
          ].map(opt => (
            <button key={opt.key}
              className={`btn ${presumptiveInputs.section === opt.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.5rem', flexDirection: 'column', alignItems: 'stretch' }}
              onClick={() => set({ section: opt.key })}>
              <strong>{opt.label}</strong>
              <span style={{ fontSize: '0.68rem', opacity: 0.75, marginTop: 4 }}>{opt.hint}</span>
            </button>
          ))}
        </div>

        {presumptiveInputs.section === '44AD' && (
          <>
            <NumberInput label="Turnover received DIGITALLY (UPI/NEFT/RTGS/cheque)" hint="Taxed at 6%. From FY 2023-24, ≤ ₹3Cr allowed if cash ≤ 5% of turnover." value={presumptiveInputs.digitalReceipts} onChange={v => set({ digitalReceipts: v })} />
            <NumberInput label="Turnover received in CASH" hint="Taxed at 8%. Keep cash ≤ 5% of turnover to qualify for the ₹3Cr limit." value={presumptiveInputs.cashReceipts} onChange={v => set({ cashReceipts: v })} />
            <NumberInput label="Actual profit (optional override)" hint="If your books show higher profit than 6/8%, declare that instead. You cannot declare less." value={presumptiveInputs.declaredIncome} onChange={v => set({ declaredIncome: v })} />
          </>
        )}

        {presumptiveInputs.section === '44ADA' && (
          <>
            <NumberInput label="Gross receipts (digital)" hint="Taxed flat at 50% of gross receipts. ≤ ₹75L (was ₹50L) if cash ≤ 5%." value={presumptiveInputs.digitalReceipts} onChange={v => set({ digitalReceipts: v })} />
            <NumberInput label="Gross receipts (cash)" value={presumptiveInputs.cashReceipts} onChange={v => set({ cashReceipts: v })} />
            <NumberInput label="Actual profit (optional override)" hint="If actual profit > 50%, declare that instead. Cannot go below 50%." value={presumptiveInputs.declaredIncome} onChange={v => set({ declaredIncome: v })} />
          </>
        )}

        {presumptiveInputs.section === '44AE' && (
          <>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>Applicable when you own ≤ 10 goods vehicles at any time in the year.</p>
            <NumberInput label="Heavy vehicles (> 12,000 kg): sum of vehicle-months" hint="Example: 2 vehicles × 12 months = 24. Rate ₹1,000 / tonne / month." value={presumptiveInputs.heavyVehicleMonths} onChange={v => set({ heavyVehicleMonths: v })} />
            <NumberInput label="Heavy vehicle gross tonnage (avg)" value={presumptiveInputs.heavyVehicleTonnage} onChange={v => set({ heavyVehicleTonnage: v })} />
            <NumberInput label="Light vehicles: sum of vehicle-months" hint="Rate ₹7,500 / month." value={presumptiveInputs.lightVehicleMonths} onChange={v => set({ lightVehicleMonths: v })} />
          </>
        )}
      </div>

      <div>
        {presumptive && (
          <div className="glass-panel p-4" style={{ marginBottom: '1rem' }}>
            <h3 className="section-title" style={{ marginTop: 0 }}>Presumptive computation</h3>
            {presumptiveInputs.section !== '44AE' && (
              <>
                <Row label="Turnover / gross receipts" value={presumptive.turnover || 0} />
                <Row label={`Deemed income @ ${presumptiveInputs.section === '44ADA' ? '50%' : '6% / 8%'}`} value={presumptive.deemedIncome || 0} muted />
              </>
            )}
            {presumptiveInputs.section === '44AE' && (
              <>
                <Row label="Heavy vehicles (₹1,000 × tonnes × months)" value={presumptive.heavyIncome || 0} muted />
                <Row label="Light vehicles (₹7,500 × months)" value={presumptive.lightIncome || 0} muted />
              </>
            )}
            <Row label="Declared income" value={presumptive.presumptiveIncome} bold big />

            {presumptive.notes.length > 0 && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--warn-bg, #fffbeb)', borderRadius: 6, fontSize: '0.78rem' }}>
                {presumptive.notes.map((n, i) => (<p key={i} style={{ margin: i > 0 ? '0.5rem 0 0' : 0 }}>{n}</p>))}
              </div>
            )}

            {presumptive.isEligible !== false && (
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={onPushToCalculator}>
                <ChevronRight size={15} /> Use {formatCurrency(presumptive.presumptiveIncome)} as Business Income
              </button>
            )}
          </div>
        )}

        <div className="glass-panel p-4" style={{ fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--primary)' }} />
            <div>
              <strong>Why presumptive taxation?</strong>
              <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                <li>Skip full books of account + audit (§44AB)</li>
                <li>Skip advance-tax installments — pay 100% by 15 March</li>
                <li>Simpler ITR-4 (Sugam) form instead of ITR-3</li>
                <li>Once opted in, must continue for 5 assessment years — opting out early disqualifies you from §44AD for the next 5 years</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
