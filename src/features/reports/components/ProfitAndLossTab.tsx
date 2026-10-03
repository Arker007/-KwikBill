import React from 'react';
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import { Select } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import type { ReportFilterMode, MonthlyPLItem } from '../types';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface FYOption {
  label: string;
  value: string;
  from: string;
  to: string;
}

interface ProfitAndLossTabProps {
  filterMode: ReportFilterMode;
  setFilterMode: (mode: ReportFilterMode) => void;
  fyFilter: string;
  setFyFilter: (fy: string) => void;
  fyOptions: FYOption[];
  monthFilter: string;
  setMonthFilter: (m: string) => void;
  yearFilter: string;
  setYearFilter: (y: string) => void;
  yearOptions: number[];
  currencyFilter: string;
  setCurrencyFilter: (c: string) => void;
  allCurrencies: string[];
  totalRevenue: number;
  totalTaxCollected: number;
  revenueExTax: number;
  totalExpenseAmount: number;
  totalExpenseGST: number;
  expenseExGST: number;
  netProfit: number;
  monthlyKeys: string[];
  monthlyPL: Record<string, MonthlyPLItem>;
}

export function ProfitAndLossTab({
  filterMode,
  setFilterMode,
  fyFilter,
  setFyFilter,
  fyOptions,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  yearOptions,
  currencyFilter,
  setCurrencyFilter,
  allCurrencies,
  totalRevenue,
  totalTaxCollected,
  revenueExTax,
  totalExpenseAmount,
  totalExpenseGST,
  expenseExGST,
  netProfit,
  monthlyKeys,
  monthlyPL,
}: ProfitAndLossTabProps) {
  return (
    <>
      {/* Period + Currency Selector */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <Select
              label="Filter By"
              value={filterMode}
              onChange={e => setFilterMode(e.target.value as ReportFilterMode)}
              options={[
                { value: 'fy', label: 'Fiscal Year' },
                { value: 'month', label: 'Month / Year' },
              ]}
              selectSize="sm"
            />
          </div>
          {filterMode === 'fy' ? (
            <div className="form-group" style={{ margin: 0 }}>
              <Select
                label="Fiscal Year"
                value={fyFilter}
                onChange={e => setFyFilter(e.target.value)}
                options={fyOptions.map(fy => ({ value: fy.value, label: fy.label }))}
                selectSize="sm"
              />
            </div>
          ) : (
            <>
              <div className="form-group" style={{ margin: 0 }}>
                <Select
                  label="Month"
                  value={monthFilter}
                  onChange={e => setMonthFilter(e.target.value)}
                  options={MONTHS.map((m, i) => ({ value: String(i), label: m }))}
                  selectSize="sm"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <Select
                  label="Year"
                  value={yearFilter}
                  onChange={e => setYearFilter(e.target.value)}
                  options={yearOptions.map(y => ({ value: String(y), label: String(y) }))}
                  selectSize="sm"
                />
              </div>
            </>
          )}
          {allCurrencies.length > 1 && (
            <div className="form-group" style={{ margin: 0 }}>
              <Select
                label="Currency"
                value={currencyFilter}
                onChange={e => setCurrencyFilter(e.target.value)}
                options={allCurrencies.map(c => ({ value: c, label: c }))}
                selectSize="sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* P&L Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green"><TrendingUp size={22} /></div>
          <div><p className="stat-label">Revenue (ex. tax)</p><h2 className="stat-value stat-value-green">{formatCurrency(revenueExTax, currencyFilter)}</h2></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple"><TrendingDown size={22} /></div>
          <div><p className="stat-label">Expenses (ex. GST)</p><h2 className="stat-value stat-value-purple">{formatCurrency(expenseExGST, currencyFilter)}</h2></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: netProfit >= 0 ? 'var(--success-light)' : 'var(--danger-light)', color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            <Wallet size={22} />
          </div>
          <div>
            <p className="stat-label">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
            <h2 className="stat-value" style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatCurrency(Math.abs(netProfit), currencyFilter)}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue"><BarChart3 size={22} /></div>
          <div><p className="stat-label">Margin</p><h2 className="stat-value">{revenueExTax > 0 ? Math.round((netProfit / revenueExTax) * 100) : 0}%</h2></div>
        </div>
      </div>

      {/* P&L Statement */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
        <div className="table-header">
          <h3>Profit & Loss Statement</h3>
          {allCurrencies.length > 1 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              Showing {currencyFilter} invoices only
            </span>
          )}
        </div>
        <div style={{ padding: '1.5rem' }}>
          <table style={{ width: '100%', maxWidth: '500px', margin: '0 auto', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.6rem 0', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Revenue</td>
                <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(totalRevenue, currencyFilter)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.6rem 0', fontWeight: 500, color: 'var(--text-secondary)' }}>Less: GST Collected</td>
                <td style={{ padding: '0.6rem 0', textAlign: 'right', color: '#dc2626' }}>-{formatCurrency(totalTaxCollected, currencyFilter)}</td>
              </tr>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <td style={{ padding: '0.6rem 0', fontWeight: 700 }}>Net Revenue</td>
                <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(revenueExTax, currencyFilter)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.6rem 0', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Expenses</td>
                <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(totalExpenseAmount, currencyFilter)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.6rem 0', fontWeight: 500, color: 'var(--text-secondary)' }}>Less: GST on Expenses (ITC)</td>
                <td style={{ padding: '0.6rem 0', textAlign: 'right', color: '#059669' }}>-{formatCurrency(totalExpenseGST, currencyFilter)}</td>
              </tr>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <td style={{ padding: '0.6rem 0', fontWeight: 700 }}>Net Expenses</td>
                <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(expenseExGST, currencyFilter)}</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem 0', fontWeight: 800, fontSize: '1.1rem' }}>
                  Net {netProfit >= 0 ? 'Profit' : 'Loss'}
                </td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 800, fontSize: '1.25rem', color: netProfit >= 0 ? '#059669' : '#dc2626' }}>
                  {formatCurrency(Math.abs(netProfit), currencyFilter)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Breakdown */}
      {monthlyKeys.length > 0 && (
        <div className="glass-panel">
          <div className="table-header"><h3>Monthly Breakdown</h3></div>
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: '600px' }}>
              <thead><tr>
                <th>Month</th>
                <th style={{ textAlign: 'right' }}>Revenue</th>
                <th style={{ textAlign: 'right' }}>Expenses</th>
                <th style={{ textAlign: 'right' }}>Profit/Loss</th>
              </tr></thead>
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
      )}
    </>
  );
}
