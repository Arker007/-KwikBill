import React from 'react';
import { formatCurrency } from '@/shared/utils';
import type { ClientAnalyticsRow } from '../types';

interface ClientAnalyticsTabProps {
  filteredBills: any[];
  currencyFilter: string;
}

export function ClientAnalyticsTab({ filteredBills, currencyFilter }: ClientAnalyticsTabProps) {
  // Aggregate revenue + outstanding + count per client
  const byClient: Record<string, ClientAnalyticsRow> = {};
  filteredBills.forEach(b => {
    const name = b.clientName || '—';
    if (!byClient[name]) {
      byClient[name] = { name, revenue: 0, paid: 0, outstanding: 0, count: 0, lastInvoiceDate: '' };
    }
    byClient[name].revenue += (b.totalAmount || 0);
    byClient[name].paid += (b.paidAmount || 0);
    byClient[name].outstanding += Math.max(0, (b.totalAmount || 0) - (b.paidAmount || 0));
    byClient[name].count += 1;
    if (!byClient[name].lastInvoiceDate || b.invoiceDate > byClient[name].lastInvoiceDate) {
      byClient[name].lastInvoiceDate = b.invoiceDate;
    }
  });

  const clientArr = Object.values(byClient);
  const topByRevenue = [...clientArr].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const worstPayers = clientArr.filter(c => c.outstanding > 0).sort((a, b) => b.outstanding - a.outstanding).slice(0, 10);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem' }}>🏆 Top clients by revenue</h3>
        {topByRevenue.length === 0 ? <p className="text-muted">No client data for this period.</p> : (
          <table className="data-table" style={{ marginBottom: 0 }}>
            <thead><tr><th>Client</th><th style={{ textAlign: 'right' }}>Revenue</th><th style={{ textAlign: 'right' }}>Invoices</th></tr></thead>
            <tbody>
              {topByRevenue.map((c, i) => (
                <tr key={i}>
                  <td className="font-medium">{c.name}</td>
                  <td style={{ textAlign: 'right', color: '#059669', fontWeight: 600 }}>{formatCurrency(c.revenue, currencyFilter)}</td>
                  <td style={{ textAlign: 'right' }}>{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem' }}>⚠️ Highest outstanding (worst payers)</h3>
        {worstPayers.length === 0 ? <p className="text-muted">Everyone is up to date. 🎉</p> : (
          <table className="data-table" style={{ marginBottom: 0 }}>
            <thead><tr><th>Client</th><th style={{ textAlign: 'right' }}>Outstanding</th><th style={{ textAlign: 'right' }}>% Unpaid</th></tr></thead>
            <tbody>
              {worstPayers.map((c, i) => (
                <tr key={i}>
                  <td className="font-medium">{c.name}</td>
                  <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{formatCurrency(c.outstanding, currencyFilter)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{Math.round((c.outstanding / c.revenue) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', gridColumn: '1 / -1' }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem' }}>📊 All clients breakdown ({clientArr.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ marginBottom: 0 }}>
            <thead><tr>
              <th>Client</th>
              <th style={{ textAlign: 'right' }}>Invoices</th>
              <th style={{ textAlign: 'right' }}>Revenue</th>
              <th style={{ textAlign: 'right' }}>Paid</th>
              <th style={{ textAlign: 'right' }}>Outstanding</th>
              <th>Last Invoice</th>
            </tr></thead>
            <tbody>
              {clientArr.sort((a, b) => b.revenue - a.revenue).map((c, i) => (
                <tr key={i}>
                  <td className="font-medium">{c.name}</td>
                  <td style={{ textAlign: 'right' }}>{c.count}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(c.revenue, currencyFilter)}</td>
                  <td style={{ textAlign: 'right', color: '#059669' }}>{formatCurrency(c.paid, currencyFilter)}</td>
                  <td style={{ textAlign: 'right', color: c.outstanding > 0 ? '#dc2626' : 'var(--text-muted)', fontWeight: c.outstanding > 0 ? 600 : 400 }}>
                    {c.outstanding > 0 ? formatCurrency(c.outstanding, currencyFilter) : '—'}
                  </td>
                  <td className="text-muted">{c.lastInvoiceDate ? new Date(c.lastInvoiceDate).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
