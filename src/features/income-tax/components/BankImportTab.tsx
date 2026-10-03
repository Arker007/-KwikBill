import React, { useState, useMemo } from 'react';
import { Upload, X, ChevronRight } from 'lucide-react';
import { Select } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import { parseBankStatement, CURRENT_FY } from '../utils';
import { toast } from '@/shared/components/feedback/Toast';
import type { BankImportData } from '../types';

export const CATEGORY_LABELS: Record<string, string> = {
  salary: 'Salary income',
  business_in: 'Business receipts',
  business_out: 'Business expense',
  interest: 'Interest earned',
  rent_received: 'Rent received',
  investment: 'Investment / MF / PPF',
  deduction_80C: '80C claim',
  deduction_80D: '80D claim',
  gst_paid: 'GST paid',
  transfer: 'Transfer / unclassified',
  personal: 'Personal spending',
};

export const CATEGORY_COLORS: Record<string, string> = {
  salary: '#dbeafe',
  business_in: '#dcfce7',
  business_out: '#fee2e2',
  interest: '#e0f2fe',
  rent_received: '#f3e8ff',
  investment: '#fef3c7',
  deduction_80C: '#ccfbf1',
  deduction_80D: '#ccfbf1',
  gst_paid: '#fed7aa',
  transfer: '#e2e8f0',
  personal: '#fce7f3',
};

interface BankImportTabProps {
  bankImport: BankImportData;
  setBankImport: React.Dispatch<React.SetStateAction<BankImportData>>;
  onCommit: (totals: Record<string, number>) => void;
}

export function BankImportTab({ bankImport, setBankImport, onCommit }: BankImportTabProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseBankStatement(text);
      if (!parsed.transactions.length) {
        toast("No transactions found. Try uploading a raw CSV from your bank's statement download.", 'warning');
        return;
      }
      setBankImport(parsed);
      toast(`Parsed ${parsed.transactions.length} transactions from ${parsed.bankName}`, 'success');
    } catch {
      toast('Could not parse this CSV. Supported banks: SBI, HDFC, ICICI, Axis, Kotak, PNB, Yes Bank.', 'error');
    }
  };

  const changeCategory = (idx: number, category: string) => {
    setBankImport(prev => ({
      ...prev,
      transactions: prev.transactions.map((t, i) => i === idx ? { ...t, category } : t),
    }));
  };

  const totals = useMemo(() => {
    const t: Record<string, number> = {};
    (bankImport.transactions || []).forEach(row => {
      const amt = (row.credit || 0) > 0 ? (row.credit || 0) : (row.debit || 0);
      t[row.category] = (t[row.category] || 0) + amt;
    });
    return t;
  }, [bankImport]);

  if (!bankImport.transactions.length) {
    return (
      <div className="glass-panel p-6">
        <div
          onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault(); setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          style={{
            border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: 12,
            padding: '3rem 1rem',
            textAlign: 'center',
            background: dragActive ? 'rgba(30, 64, 175, 0.05)' : undefined,
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('bank-csv-input')?.click()}>
          <Upload size={40} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Drop a bank-statement CSV here or click to select</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Auto-detects: SBI · HDFC · ICICI · Axis · Kotak · PNB · Yes Bank
          </p>
          <input id="bank-csv-input" type="file" accept=".csv,text/csv" style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files?.[0])} />
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>How to get the CSV</h4>
          <ul style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0, paddingLeft: '1.2rem' }}>
            <li><strong>Net-banking</strong> → Accounts → Statements → Download as CSV / Excel (save as CSV)</li>
            <li><strong>Mobile app</strong> → Account statement → Share → Export CSV</li>
            <li>Choose a date range covering the current FY (1 Apr {parseInt(CURRENT_FY.split('-')[0], 10)} onwards)</li>
            <li>Your data is parsed in-browser — nothing is uploaded to a server</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel p-4" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="section-title" style={{ margin: 0 }}>{bankImport.bankName} — {bankImport.transactions.length} transactions</h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Review each row's category. Auto-categorised — override any you disagree with.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setBankImport({ bankName: '', transactions: [] })}>
            <X size={16} /> Clear
          </button>
          <button className="btn btn-primary" onClick={() => onCommit(totals)}>
            <ChevronRight size={16} /> Push to Calculator
          </button>
        </div>
      </div>

      {/* Category totals strip */}
      <div className="glass-panel p-3" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
        {Object.entries(totals).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([cat, amt]) => (
          <span key={cat} style={{ background: CATEGORY_COLORS[cat] || '#e2e8f0', padding: '0.25rem 0.6rem', borderRadius: 4 }}>
            <strong>{CATEGORY_LABELS[cat] || cat}:</strong> {formatCurrency(amt as number)}
          </span>
        ))}
      </div>

      {/* Transactions grid */}
      <div className="glass-panel" style={{ overflow: 'auto', maxHeight: '60vh' }}>
        <table className="data-table" style={{ minWidth: '900px' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Debit</th>
              <th style={{ textAlign: 'right' }}>Credit</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {bankImport.transactions.map((row, idx) => (
              <tr key={idx}>
                <td className="text-muted" style={{ fontSize: '0.78rem' }}>{row.date}</td>
                <td style={{ maxWidth: '350px', fontSize: '0.78rem' }} title={row.description}>{row.description}</td>
                <td style={{ textAlign: 'right', color: '#dc2626', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  {row.debit ? formatCurrency(row.debit) : '-'}
                </td>
                <td style={{ textAlign: 'right', color: '#059669', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  {row.credit ? formatCurrency(row.credit) : '-'}
                </td>
                <td>
                  <Select
                    value={row.category}
                    onChange={e => changeCategory(idx, e.target.value)}
                    options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
                      value: k,
                      label: v,
                    }))}
                    selectSize="sm"
                    fullWidth={false}
                    containerClassName="mb-0"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
