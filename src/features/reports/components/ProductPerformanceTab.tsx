import React from 'react';
import { formatCurrency } from '@/shared/utils';
import type { ProductPerformanceRow } from '../types';

interface ProductPerformanceTabProps {
  filteredBills: any[];
  currencyFilter: string;
}

export function ProductPerformanceTab({ filteredBills, currencyFilter }: ProductPerformanceTabProps) {
  // Aggregate quantity + revenue + last-sold per unique item name
  const byProduct: Record<string, ProductPerformanceRow> = {};
  filteredBills.forEach(b => {
    (b.data?.items || []).forEach((item: any) => {
      const name = (item.name || item.description || 'Unnamed').trim();
      if (!name || name === 'Unnamed') return;
      if (!byProduct[name]) {
        byProduct[name] = { name, hsn: item.hsn || '', qty: 0, revenue: 0, txns: 0, lastSold: '' };
      }
      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      byProduct[name].qty += qty;
      byProduct[name].revenue += (qty * rate);
      byProduct[name].txns += 1;
      if (!byProduct[name].lastSold || b.invoiceDate > byProduct[name].lastSold) {
        byProduct[name].lastSold = b.invoiceDate;
      }
      if (item.hsn && !byProduct[name].hsn) {
        byProduct[name].hsn = item.hsn;
      }
    });
  });

  const productArr = Object.values(byProduct);
  const bestSellers = [...productArr].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const mostSoldByUnits = [...productArr].sort((a, b) => b.qty - a.qty).slice(0, 10);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem' }}>💰 Top revenue producers</h3>
        {bestSellers.length === 0 ? <p className="text-muted">No product data for this period.</p> : (
          <table className="data-table" style={{ marginBottom: 0 }}>
            <thead><tr><th>Product</th><th style={{ textAlign: 'right' }}>Revenue</th><th style={{ textAlign: 'right' }}>Qty sold</th></tr></thead>
            <tbody>
              {bestSellers.map((p, i) => (
                <tr key={i}>
                  <td className="font-medium" title={p.hsn ? `HSN ${p.hsn}` : ''}>{p.name}</td>
                  <td style={{ textAlign: 'right', color: '#059669', fontWeight: 600 }}>{formatCurrency(p.revenue, currencyFilter)}</td>
                  <td style={{ textAlign: 'right' }}>{p.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem' }}>📦 Most units sold</h3>
        {mostSoldByUnits.length === 0 ? <p className="text-muted">No product data.</p> : (
          <table className="data-table" style={{ marginBottom: 0 }}>
            <thead><tr><th>Product</th><th style={{ textAlign: 'right' }}>Qty sold</th><th style={{ textAlign: 'right' }}>Txns</th></tr></thead>
            <tbody>
              {mostSoldByUnits.map((p, i) => (
                <tr key={i}>
                  <td className="font-medium">{p.name}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{p.qty}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{p.txns}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', gridColumn: '1 / -1' }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem' }}>📋 All products ({productArr.length})</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ marginBottom: 0 }}>
            <thead><tr>
              <th>Product</th><th>HSN</th>
              <th style={{ textAlign: 'right' }}>Qty sold</th>
              <th style={{ textAlign: 'right' }}>Revenue</th>
              <th style={{ textAlign: 'right' }}>Avg rate</th>
              <th style={{ textAlign: 'right' }}>Txns</th>
              <th>Last sold</th>
            </tr></thead>
            <tbody>
              {productArr.sort((a, b) => b.revenue - a.revenue).map((p, i) => (
                <tr key={i}>
                  <td className="font-medium">{p.name}</td>
                  <td className="text-muted" style={{ fontSize: '0.78rem' }}>{p.hsn || '—'}</td>
                  <td style={{ textAlign: 'right' }}>{p.qty}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(p.revenue, currencyFilter)}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{p.qty > 0 ? formatCurrency(p.revenue / p.qty, currencyFilter) : '—'}</td>
                  <td style={{ textAlign: 'right' }}>{p.txns}</td>
                  <td className="text-muted">{p.lastSold ? new Date(p.lastSold).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
