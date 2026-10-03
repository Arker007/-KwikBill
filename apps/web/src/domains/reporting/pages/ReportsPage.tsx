import { useState, useEffect } from 'react';
import { BarChart3, Clock, Users, Package, FileBarChart } from 'lucide-react';
import { getFYOptions } from '@/shared/utils';
import { PageHeader } from '@/shared/components/layout';
import { SegmentedTabs } from '@/shared/components/ui';
import { useReports } from '../hooks/useReports';
import {
  ProfitAndLossTab,
  AgingReportTab,
  ClientAnalyticsTab,
  ProductPerformanceTab,
} from '@/features/reports';
import type {
  ReportTabKey,
  ReportFilterMode,
  MonthlyPLItem,
  AgingRow,
  AgingBucket,
  AgingCurrencySummary,
} from '@/features/reports';

const getBillCurrency = (b: any): string => b.currency || b.data?.invoiceOptions?.currency || 'INR';

export function ReportsPage() {
  const { bills, expenses, loading } = useReports();
  const [activeTab, setActiveTab] = useState<ReportTabKey>('pl');
  const [filterMode, setFilterMode] = useState<ReportFilterMode>('fy');
  const [fyFilter, setFyFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [agingSearch, setAgingSearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('INR');

  const fyOptions = getFYOptions();
  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = currentYear; y >= currentYear - 5; y--) yearOptions.push(y);

  useEffect(() => {
    const now = new Date();
    const fy = fyOptions[0];
    if (fy) setFyFilter(fy.value);
    setYearFilter(String(now.getFullYear()));
    setMonthFilter(String(now.getMonth()));
  }, []);

  const filterByPeriod = (date?: string) => {
    if (!date) return false;
    if (filterMode === 'fy') {
      const fy = fyOptions.find(f => f.value === fyFilter);
      return fy ? date >= fy.from && date <= fy.to : true;
    } else {
      const d = new Date(date);
      return d.getFullYear() === parseInt(yearFilter, 10) && d.getMonth() === parseInt(monthFilter, 10);
    }
  };

  const allFilteredBills = bills.filter(bill => bill.data && filterByPeriod(bill.invoiceDate));
  const filteredExpenses = expenses.filter(exp =>
    filterByPeriod(exp.date) && ((exp.currency || 'INR') === currencyFilter));

  // All distinct currencies in the filtered period
  const allCurrencies = [...new Set(allFilteredBills.map(getBillCurrency) as string[])].sort();

  // Set currency filter to first available if current selection not in list
  useEffect(() => {
    if (allCurrencies.length > 0 && !allCurrencies.includes(currencyFilter)) {
      setCurrencyFilter(allCurrencies[0]);
    }
  }, [allCurrencies.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bills for P&L — only selected currency
  const plBills = allFilteredBills.filter(b => getBillCurrency(b) === currencyFilter);

  // P&L
  const totalRevenue = plBills.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const totalTaxCollected = plBills.reduce((s, b) => s + (b.totalTaxAmount || 0), 0);
  const revenueExTax = totalRevenue - totalTaxCollected;
  const totalExpenseAmount = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalExpenseGST = filteredExpenses.reduce((s, e) => s + (e.gstAmount || 0), 0);
  const expenseExGST = totalExpenseAmount - totalExpenseGST;
  const netProfit = revenueExTax - expenseExGST;

  // Monthly breakdown — per selected currency
  const monthlyPL: Record<string, MonthlyPLItem> = {};
  plBills.forEach(b => {
    if (!b.invoiceDate) return;
    const key = b.invoiceDate.substring(0, 7);
    if (!monthlyPL[key]) monthlyPL[key] = { revenue: 0, tax: 0, expense: 0, expGst: 0 };
    monthlyPL[key].revenue += b.totalAmount || 0;
    monthlyPL[key].tax += b.totalTaxAmount || 0;
  });
  filteredExpenses.forEach(e => {
    if (!e.date) return;
    const key = e.date.substring(0, 7);
    if (!monthlyPL[key]) monthlyPL[key] = { revenue: 0, tax: 0, expense: 0, expGst: 0 };
    monthlyPL[key].expense += e.amount || 0;
    monthlyPL[key].expGst += e.gstAmount || 0;
  });
  const monthlyKeys = Object.keys(monthlyPL).sort();

  // ========== Outstanding & Aging ==========
  const today = new Date();
  const unpaidBills = bills.filter(b => b.status !== 'paid');
  const agingData: AgingRow[] = unpaidBills.map(b => {
    const dueDate = b.data?.details?.dueDate || b.invoiceDate;
    const due = dueDate ? new Date(dueDate) : null;
    const daysOverdue = (due && !isNaN(due.getTime()))
      ? Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86400000))
      : 0;
    const outstanding = (b.totalAmount || 0) - (b.paidAmount || 0);
    let bucket: AgingBucket = 'current';
    if (daysOverdue > 90) bucket = '90plus';
    else if (daysOverdue > 60) bucket = '61to90';
    else if (daysOverdue > 30) bucket = '31to60';
    return {
      clientName: b.clientName || 'Unknown',
      invoiceNumber: b.invoiceNumber,
      invoiceDate: b.invoiceDate,
      dueDate,
      totalAmount: b.totalAmount || 0,
      paidAmount: b.paidAmount || 0,
      outstanding,
      daysOverdue,
      bucket,
      currency: getBillCurrency(b),
    };
  }).filter(r => r.outstanding > 0);

  const agingFiltered = agingSearch.trim()
    ? agingData.filter(r => r.clientName.toLowerCase().includes(agingSearch.toLowerCase()))
    : agingData;

  // Aging summary — group by currency
  const agingByCurrency: Record<string, AgingCurrencySummary> = {};
  agingFiltered.forEach(r => {
    if (!agingByCurrency[r.currency]) {
      agingByCurrency[r.currency] = { total: 0, current: 0, '31to60': 0, '61to90': 0, '90plus': 0 };
    }
    agingByCurrency[r.currency].total += r.outstanding;
    agingByCurrency[r.currency][r.bucket] += r.outstanding;
  });
  const agingCurrencies = Object.keys(agingByCurrency).sort((a, b) => a === 'INR' ? -1 : b === 'INR' ? 1 : a.localeCompare(b));
  const agingSorted = [...agingFiltered].sort((a, b) => b.daysOverdue - a.daysOverdue);

  const reportTabs = [
    { key: 'pl', label: 'Profit & Loss' },
    { key: 'aging', label: 'Outstanding & Aging' },
    { key: 'clients', label: 'Client Analytics' },
    { key: 'products', label: 'Product Performance' },
  ];

  if (loading) {
    return (
      <div className="dashboard-container max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-5">
        <PageHeader
          icon={<FileBarChart size={20} />}
          title="Financial Reports"
          subtitle="Profit & loss statements, accounts aging analysis, client metrics, and product performance"
        />
        <div className="glass-panel p-8 text-center text-muted">
          Loading financial data...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: 'Reports & Tools' },
          { label: 'Financial Reports' },
        ]}
        icon={<FileBarChart size={20} />}
        title="Financial Reports"
        subtitle="Profit & loss statements, accounts aging analysis, client metrics, and product performance"
      />

      {/* Modern Segmented Tab Bar */}
      <div>
        <SegmentedTabs
          options={reportTabs}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ReportTabKey)}
        />
      </div>

      {activeTab === 'pl' && (
        <ProfitAndLossTab
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          fyFilter={fyFilter}
          setFyFilter={setFyFilter}
          fyOptions={fyOptions}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          yearOptions={yearOptions}
          currencyFilter={currencyFilter}
          setCurrencyFilter={setCurrencyFilter}
          allCurrencies={allCurrencies}
          totalRevenue={totalRevenue}
          totalTaxCollected={totalTaxCollected}
          revenueExTax={revenueExTax}
          totalExpenseAmount={totalExpenseAmount}
          totalExpenseGST={totalExpenseGST}
          expenseExGST={expenseExGST}
          netProfit={netProfit}
          monthlyKeys={monthlyKeys}
          monthlyPL={monthlyPL}
        />
      )}

      {activeTab === 'aging' && (
        <AgingReportTab
          agingCurrencies={agingCurrencies}
          agingByCurrency={agingByCurrency}
          agingSearch={agingSearch}
          setAgingSearch={setAgingSearch}
          agingSorted={agingSorted}
        />
      )}

      {activeTab === 'clients' && (
        <ClientAnalyticsTab
          filteredBills={plBills}
          currencyFilter={currencyFilter}
        />
      )}

      {activeTab === 'products' && (
        <ProductPerformanceTab
          filteredBills={plBills}
          currencyFilter={currencyFilter}
        />
      )}
    </div>
  );
}

export default ReportsPage;
