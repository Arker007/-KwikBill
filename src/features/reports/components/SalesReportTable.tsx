import React from 'react';
import { formatCurrency } from '@/shared/utils';
import { MONTHS } from './ProfitAndLossTab';
import type { MonthlyPLItem } from '../types';

interface SalesReportTableProps {
  monthlyKeys: string[];
  monthlyPL: Record<string, MonthlyPLItem>;
  currencyFilter: string;
}

export function SalesReportTable({ monthlyKeys, monthlyPL, currencyFilter }: SalesReportTableProps) {
  if (!monthlyKeys || monthlyKeys.length === 0) return null;

  return (
    <div className="glass-panel">
      <div className="table-header"><h3>Monthly Breakdown</h3></div>
      <div className="table-scroll">
        <table className="data-table" style={{ minWidth: '600px' }}>
          <thead>
            <tr>
              <th>Month</th>
              <th style={{ textAlign: 'right' }}>Revenue</th>
              <th style={{ textAlign: 'right' }}>Expenses</th>
              <th style={{ textAlign: 'right' }}>Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {monthlyKeys.map(key => {
              const m = monthlyPL[key];
              const rev = m.revenue - m.tax;
              const exp = m.expense - m.expGst;
              const pl = rev - exp;
              const [y, mo] = key.split('-');
              return (
                <tr key={key}>
                  <td className="font-medium">{MONTHS[parseInt(mo, 10) - 1]} {y}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(rev, currencyFilter)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(exp, currencyFilter)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: pl >= 0 ? '#059669' : '#dc2626' }}>
                    {formatCurrency(Math.abs(pl), currencyFilter)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
