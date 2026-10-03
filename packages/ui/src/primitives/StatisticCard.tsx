import React, { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ProCard, ProCardProps } from './ProCard';

export type StatisticStatus = 'default' | 'success' | 'warning' | 'danger' | 'error' | 'processing';

export interface StatisticData {
  title?: ReactNode;
  value?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  precision?: number;
  status?: StatisticStatus;
  trend?: 'up' | 'down';
  description?: ReactNode;
}

export interface StatisticCardProps extends ProCardProps {
  statistic?: StatisticData;
  chart?: ReactNode;
  chartPlacement?: 'bottom' | 'right' | 'left';
  footer?: ReactNode;
  badge?: ReactNode;
}

const statusColors: Record<StatisticStatus, { text: string; bg: string }> = {
  default: {
    text: 'text-slate-900 dark:text-slate-100',
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  },
  success: {
    text: 'text-[#389e0d] dark:text-[#73d13d]',
    bg: 'bg-[#f6ffed] dark:bg-[rgba(82,196,26,0.15)] text-[#389e0d] dark:text-[#73d13d]',
  },
  warning: {
    text: 'text-[#d48806] dark:text-[#ffc53d]',
    bg: 'bg-[#fffbe6] dark:bg-[rgba(250,173,20,0.15)] text-[#d48806] dark:text-[#ffc53d]',
  },
  danger: {
    text: 'text-[#cf1322] dark:text-[#ff7875]',
    bg: 'bg-[#fff2f0] dark:bg-[rgba(255,77,79,0.15)] text-[#cf1322] dark:text-[#ff7875]',
  },
  error: {
    text: 'text-[#cf1322] dark:text-[#ff7875]',
    bg: 'bg-[#fff2f0] dark:bg-[rgba(255,77,79,0.15)] text-[#cf1322] dark:text-[#ff7875]',
  },
  processing: {
    text: 'text-[#0958d9] dark:text-[#4096ff]',
    bg: 'bg-[#e6f4ff] dark:bg-[rgba(22,119,255,0.15)] text-[#0958d9] dark:text-[#4096ff]',
  },
};

export const StatisticCardComponent: React.FC<StatisticCardProps> = ({
  statistic,
  chart,
  chartPlacement = 'bottom',
  footer,
  badge,
  children,
  className = '',
  ...props
}) => {
  const statusTheme = statistic?.status ? statusColors[statistic.status] : statusColors.default;

  const renderStatistic = () => {
    if (!statistic) return null;

    return (
      <div className="statistic-content flex flex-col gap-1 min-w-0">
        {statistic.title && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {statistic.title}
            </span>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
        )}

        <div className="flex items-baseline gap-1.5 flex-wrap">
          {statistic.prefix && (
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {statistic.prefix}
            </span>
          )}

          <span
            className={`text-xl sm:text-2xl font-bold tracking-tight ${statusTheme.text} tabular-nums`}
          >
            {statistic.value}
          </span>

          {statistic.suffix && (
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              {statistic.suffix}
            </span>
          )}

          {statistic.trend && (
            <span
              className={`inline-flex items-center text-xs font-semibold px-1 py-0.5 rounded ml-1 ${
                statistic.trend === 'up'
                  ? 'text-[#389e0d] bg-[#f6ffed] dark:bg-[rgba(82,196,26,0.15)] dark:text-[#73d13d]'
                  : 'text-[#cf1322] bg-[#fff2f0] dark:bg-[rgba(255,77,79,0.15)] dark:text-[#ff7875]'
              }`}
            >
              {statistic.trend === 'up' ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
            </span>
          )}
        </div>

        {statistic.description && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {statistic.description}
          </div>
        )}
      </div>
    );
  };

  const renderBody = () => {
    if (chartPlacement === 'right') {
      return (
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {renderStatistic()}
            {children}
          </div>
          {chart && <div className="shrink-0">{chart}</div>}
        </div>
      );
    }

    if (chartPlacement === 'left') {
      return (
        <div className="flex items-center justify-between gap-4">
          {chart && <div className="shrink-0">{chart}</div>}
          <div className="flex-1 min-w-0">
            {renderStatistic()}
            {children}
          </div>
        </div>
      );
    }

    // Default 'bottom'
    return (
      <div className="flex flex-col gap-3">
        {renderStatistic()}
        {children}
        {chart && <div className="w-full pt-1">{chart}</div>}
      </div>
    );
  };

  return (
    <ProCard className={`statistic-card ${className}`} {...props}>
      {renderBody()}
      {footer && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </ProCard>
  );
};

StatisticCardComponent.displayName = 'StatisticCard';
(StatisticCardComponent as any).isProCard = true;

/**
 * StatisticCard.Group
 */
const StatisticCardGroup: React.FC<ProCardProps> = ({ children, split = 'vertical', ...props }) => {
  return (
    <ProCard.Group split={split} {...props}>
      {children}
    </ProCard.Group>
  );
};
StatisticCardGroup.displayName = 'StatisticCard.Group';
(StatisticCardGroup as any).isProCard = true;

export type StatisticCardType = typeof StatisticCardComponent & {
  Group: typeof StatisticCardGroup;
  Divider: typeof ProCard.Divider;
  isProCard: boolean;
};

export const StatisticCard = StatisticCardComponent as StatisticCardType;
StatisticCard.Group = StatisticCardGroup;
StatisticCard.Divider = ProCard.Divider;
StatisticCard.isProCard = true;

export default StatisticCard;
