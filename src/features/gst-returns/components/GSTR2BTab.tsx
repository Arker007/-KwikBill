import React, { useState, useRef } from 'react';
import { Upload, Download, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { buildReconciliation } from '../utils/gstCalculations';
import type { ReconRow } from '../types';

interface GSTR2BTabProps {
  gstr2bData: any;
  purchases: any[];
  onImport2B: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear2B: () => void;
  onExportCSV: (rows: ReconRow[]) => void;
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  matched: { label: '✓ Matched', color: 'var(--success)' },
  amount_mismatch: { label: '⚠ Amount mismatch', color: '#d97706' },
  book_only: { label: '⚠ Books only', color: 'var(--danger)' },
  twob_only: { label: '⚠ 2B only', color: 'var(--purple)' },
};

export const GSTR2BTab: React.FC<GSTR2BTabProps> = ({
  gstr2bData,
  purchases,
  onImport2B,
  onClear2B,
  onExportCSV,
}) => {
  const [gstr2bFilter, setGstr2bFilter] = useState<string>('all');
  const gstr2bInputRef = useRef<HTMLInputElement>(null);

  const reconRows = buildReconciliation(gstr2bData, purchases);
  const stats = reconRows.reduce(
    (acc, r) => {
      acc.total += 1;
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    { total: 0, matched: 0, amount_mismatch: 0, book_only: 0, twob_only: 0 }
  );
  const visibleRows = gstr2bFilter === 'all' ? reconRows : reconRows.filter(r => r.status === gstr2bFilter);

  return (
    <>
      {/* Help banner */}
      <div className="glass-panel" style={{ padding: '0.85rem 1rem', marginBottom: '0.75rem', borderLeft: '3px solid var(--primary)' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          <strong>How to use:</strong> Download your GSTR-2B JSON from the GST portal (
          <a href="https://services.gst.gov.in/services/auth/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
            services.gst.gov.in
          </a>{' '}
          → Returns → GSTR-2B → Download JSON), then click <strong>Import 2B JSON</strong> below. We match each 2B entry against your{' '}
          <em>Purchase Bills</em> by supplier GSTIN + invoice number, and flag mismatches so you can claim ITC accurately.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          ref={gstr2bInputRef}
          type="file"
          accept=".json,application/json"
          onChange={onImport2B}
          style={{ display: 'none' }}
        />
        <button
          className="btn btn-primary"
          onClick={() => gstr2bInputRef.current?.click()}
          style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
        >
          <Upload size={13} /> Import 2B JSON
        </button>
        {gstr2bData && (
          <>
            <button
              className="btn btn-secondary"
              onClick={() => onExportCSV(reconRows)}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
            >
              <Download size={13} /> Export reconciliation CSV
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                onClear2B();
                setGstr2bFilter('all');
              }}
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
            >
              Clear
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              Imported for {gstr2bData.gstin || '?'} · period {gstr2bData.rtnprd || gstr2bData.fp || '?'}
            </span>
          </>
        )}
      </div>

      {!gstr2bData && (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Import your GSTR-2B JSON to reconcile against your purchase records.</p>
          {purchases.length === 0 && (
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: '#d97706' }}>
              ⚠ You have no purchase bills recorded yet. Add some in the Purchases view first, otherwise everything will show as "2B only".
            </p>
          )}
        </div>
      )}

      {gstr2bData && (
        <>
          {/* Summary stats */}
          <div className="glass-panel" style={{ padding: '0.85rem 1rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {[
                { k: 'all', label: 'Total entries', count: stats.total, color: 'var(--text-primary)' },
                { k: 'matched', label: '✓ Matched', count: stats.matched, color: '#059669' },
                { k: 'amount_mismatch', label: '⚠ Mismatched', count: stats.amount_mismatch, color: '#d97706' },
                { k: 'book_only', label: '⚠ Books only', count: stats.book_only, color: '#dc2626' },
                { k: 'twob_only', label: '⚠ 2B only', count: stats.twob_only, color: '#7c3aed' },
              ].map(s => (
                <button
                  key={s.k}
                  onClick={() => setGstr2bFilter(s.k)}
                  className={gstr2bFilter === s.k ? 'type-chip type-chip-active' : 'type-chip'}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.1rem', padding: '0.5rem 0.7rem', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.label}</span>
                  <strong style={{ fontSize: '1.05rem', color: s.color }}>{s.count}</strong>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', minWidth: '900px' }}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Supplier</th>
                  <th>Invoice No.</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>2B Value</th>
                  <th style={{ textAlign: 'right' }}>Books Value</th>
                  <th style={{ textAlign: 'right' }}>Diff</th>
                  <th>ITC</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No entries match this filter.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((r, i) => {
                    const badge = STATUS_BADGES[r.status] || { label: r.status, color: 'var(--text-muted)' };
                    const diff = r.twoBVal - r.bookVal;
                    return (
                      <tr key={`${r.ctin || 'x'}-${r.invoiceNumber || i}`}>
                        <td>
                          <span className="status-pill" style={{ '--pill-color': badge.color } as React.CSSProperties}>
                            {badge.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{r.supplier || '—'}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{r.ctin}</div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{r.invoiceNumber}</td>
                        <td style={{ fontSize: '0.78rem' }}>{r.date || '—'}</td>
                        <td style={{ textAlign: 'right' }}>{r.twoBVal > 0 ? formatCurrency(r.twoBVal) : '—'}</td>
                        <td style={{ textAlign: 'right' }}>{r.bookVal > 0 ? formatCurrency(r.bookVal) : '—'}</td>
                        <td
                          style={{
                            textAlign: 'right',
                            color: Math.abs(diff) > 1 ? '#dc2626' : 'var(--text-muted)',
                            fontWeight: Math.abs(diff) > 1 ? 600 : 400,
                          }}
                        >
                          {diff !== 0 ? (diff > 0 ? '+' : '') + formatCurrency(diff) : '—'}
                        </td>
                        <td style={{ fontSize: '0.78rem', color: r.itcAvailable ? '#059669' : '#94a3b8' }}>
                          {r.itcAvailable ? '✓' : '✗'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
};
