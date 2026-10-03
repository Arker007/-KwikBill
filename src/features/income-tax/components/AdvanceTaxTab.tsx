import React from 'react';
import { Check, X } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { compute234BInterest, compute234CInterest } from '../utils';
import { Row, NumberInput } from './RegimeCalculatorTab';
import type { AdvanceTaxInputs, AdvanceTaxScheduleResult, AdvancePayment } from '../types';
import { DatePicker, Checkbox } from '@/shared/components/ui';

interface AdvanceTaxTabProps {
  advanceInputs: AdvanceTaxInputs;
  setAdvanceInputs: React.Dispatch<React.SetStateAction<AdvanceTaxInputs>>;
  schedule: AdvanceTaxScheduleResult;
  totalTax: number;
  recommended: string;
}

export function AdvanceTaxTab({ advanceInputs, setAdvanceInputs, schedule, totalTax, recommended }: AdvanceTaxTabProps) {
  const set = (patch: Partial<AdvanceTaxInputs>) => setAdvanceInputs(prev => ({ ...prev, ...patch }));

  const addPayment = () => {
    const today = new Date().toISOString().split('T')[0];
    set({ payments: [...(advanceInputs.payments || []), { date: today, amount: 0 }] });
  };
  const updatePayment = (idx: number, patch: Partial<AdvancePayment>) => {
    set({ payments: advanceInputs.payments.map((p, i) => i === idx ? { ...p, ...patch } : p) });
  };
  const removePayment = (idx: number) => {
    set({ payments: advanceInputs.payments.filter((_, i) => i !== idx) });
  };

  const interest234C = compute234CInterest(schedule);
  const interest234B = compute234BInterest(schedule);

  return (
    <>
      <div className="glass-panel p-4" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 className="section-title" style={{ margin: 0 }}>Advance Tax Schedule</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Checkbox
              checked={advanceInputs.mode === 'presumptive'}
              onChange={e => set({ mode: e.target.checked ? 'presumptive' : 'regular' })}
              label="Presumptive (pay 100% by 15 March)"
            />
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
          Based on your recommended <strong style={{ textTransform: 'uppercase' }}>{recommended}</strong> Regime total tax of <strong>{formatCurrency(totalTax)}</strong>.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <NumberInput label="TDS already deducted" hint="From salary, contract payments, interest — as per Form 26AS" value={advanceInputs.tdsCredit} onChange={v => set({ tdsCredit: v })} />
          <div>
            <Row label="Total tax liability" value={totalTax} />
            <Row label="Less: TDS credit" value={-(Number(advanceInputs.tdsCredit) || 0)} muted={!advanceInputs.tdsCredit} />
            <Row label="Net advance-tax liability" value={schedule.netLiability} bold />
          </div>
        </div>

        {!schedule.applies && (
          <div style={{ padding: '0.75rem', background: 'var(--success-bg, #ecfdf5)', borderRadius: 6, fontSize: '0.85rem' }}>
            <Check size={14} style={{ display: 'inline', marginRight: 4 }} />
            {schedule.note}
          </div>
        )}
      </div>

      {schedule.applies && (
        <>
          <div className="glass-panel p-0" style={{ marginBottom: '1rem', overflow: 'hidden' }}>
            <table className="data-table" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>Installment</th>
                  <th>Due Date</th>
                  <th style={{ textAlign: 'right' }}>% cumulative</th>
                  <th style={{ textAlign: 'right' }}>This installment</th>
                  <th style={{ textAlign: 'right' }}>Paid by due date</th>
                  <th style={{ textAlign: 'right' }}>Shortfall</th>
                </tr>
              </thead>
              <tbody>
                {schedule.schedule.map(row => (
                  <tr key={row.installment}>
                    <td>#{row.installment}</td>
                    <td>{row.label}</td>
                    <td style={{ textAlign: 'right' }}>{(row.cumulativePct * 100).toFixed(0)}%</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.installmentDue)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(row.totalPaidByDue)}</td>
                    <td style={{ textAlign: 'right', color: row.shortfall > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>
                      {formatCurrency(row.shortfall)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="glass-panel p-4">
              <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Payments made</h4>
              {(advanceInputs.payments || []).length === 0 && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No advance-tax payments recorded yet.</p>}
              {(advanceInputs.payments || []).map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <div className="w-[140px]">
                    <DatePicker
                      value={p.date}
                      onChange={e => updatePayment(i, { date: e.target.value })}
                      pickerSize="sm"
                    />
                  </div>
                  <input type="number" className="form-input" style={{ fontSize: '0.82rem', padding: '0.35rem' }}
                    value={p.amount || ''} placeholder="Amount"
                    onChange={e => updatePayment(i, { amount: parseFloat(e.target.value) || 0 })} />
                  <button className="icon-btn icon-btn-red" onClick={() => removePayment(i)} title="Remove"><X size={14} /></button>
                </div>
              ))}
              <button className="btn btn-secondary" style={{ fontSize: '0.78rem', marginTop: '0.5rem' }} onClick={addPayment}>
                + Add payment
              </button>
            </div>

            <div className="glass-panel p-4">
              <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Interest under §234B / §234C</h4>
              <Row label="§234C — installment shortfall" value={interest234C} muted={!interest234C} />
              <Row label="§234B — post year-end delay (1% per month)" value={interest234B} muted={!interest234B} />
              <Row label="Total interest" value={interest234B + interest234C} bold />
              <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>§234C</strong>: 1% per month for shortfalls in Q1-Q3 (3 months each) and Q4 (1 month). Waived if you paid ≥ 12% by 15 Jun / 36% by 15 Sep.<br /><br />
                <strong>§234B</strong>: 1% per month from 1 April of AY if you paid less than 90% of tax by 31 March.
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

