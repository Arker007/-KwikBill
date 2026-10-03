import React from 'react';
import { IndianRupee, TrendingUp, Clock, FileText } from 'lucide-react';
import { formatCurrency } from '@/shared/utils';
import { StatCard } from '@/shared/components/ui';
import { DashboardStats } from './types';

interface MetricCardsProps {
  stats: DashboardStats;
  totalInvoicesCount?: number;
  unpaidCount?: number;
  paidCount?: number;
  overdueCount?: number;
  onFilterStatus?: (status: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  stats,
  totalInvoicesCount,
  unpaidCount = 0,
  paidCount = 0,
  overdueCount = 0,
  onFilterStatus,
}) => {
  const currencyKeys = Object.keys(stats.byCurrency || {});
  const totalCount = typeof totalInvoicesCount === 'number' ? totalInvoicesCount : stats.count;

  const renderCurrencies = (field: 'total' | 'tax' | 'unpaid') => {
    if (currencyKeys.length === 0) return '₹0';
    return Object.entries(stats.byCurrency || {}).map(([cur, v]: [string, any]) => (
      <div key={cur} className={`${currencyKeys.length > 1 ? 'text-lg sm:text-xl font-bold' : 'text-lg sm:text-xl xl:text-2xl font-bold'} whitespace-nowrap`}>
        {formatCurrency(v[field] || 0, cur)}
      </div>
    ));
  };

  const invoiceCountText = `Across ${totalCount} invoice${totalCount === 1 ? '' : 's'}`;
  const unpaidText = `${unpaidCount + overdueCount} unpaid invoice${unpaidCount + overdueCount === 1 ? '' : 's'}`;

  return (
    <div id="dashboard-metric-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      <StatCard
        id="stat-card-total"
        title="TOTAL INVOICED"
        value={renderCurrencies('total')}
        subtitle={invoiceCountText}
        icon={<IndianRupee size={15} />}
        variant="primary"
        className="cursor-default"
      />
      <StatCard
        id="stat-card-tax"
        title="TAX COLLECTED"
        value={renderCurrencies('tax')}
        subtitle={invoiceCountText}
        icon={<TrendingUp size={15} />}
        variant="success"
        className="cursor-default"
      />
      <StatCard
        id="stat-card-outstanding"
        title="OUTSTANDING"
        value={renderCurrencies('unpaid')}
        subtitle={unpaidText}
        icon={<Clock size={15} />}
        variant="warning"
        onClick={onFilterStatus ? () => onFilterStatus('unpaid') : undefined}
        className={onFilterStatus ? 'cursor-pointer hover:border-amber-400/50' : 'cursor-default'}
      />
      <StatCard
        id="stat-card-count"
        title="INVOICES"
        value={totalCount}
        subtitle="Total invoices created"
        icon={<FileText size={15} />}
        variant="purple"
        badge={
          paidCount > 0 ? (
            <span className="text-[11px] font-medium text-[#389e0d] dark:text-[#73d13d] bg-[#f6ffed] dark:bg-[rgba(82,196,26,0.15)] border border-[#b7eb8f] dark:border-[rgba(82,196,26,0.35)] px-2 py-0.5 rounded-full">
              {Math.round((paidCount / (totalCount || 1)) * 100)}% paid
            </span>
          ) : undefined
        }
        className="cursor-default"
      />
    </div>
  );
};

export default MetricCards;
