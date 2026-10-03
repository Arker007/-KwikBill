import React from 'react';
import { Tag as AntTag, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export type InvoiceStatusType = 'paid' | 'unpaid' | 'partially-paid' | 'partial' | 'overdue' | 'draft' | 'cancelled';

export interface StatusBadgeProps {
  status: InvoiceStatusType | string;
  label?: string;
  className?: string;
  showDot?: boolean;
}

const statusConfig: Record<string, { label: string; dot: string; color: string }> = {
  paid: {
    label: 'Paid',
    dot: '#52c41a',
    color: 'success',
  },
  unpaid: {
    label: 'Unpaid',
    dot: '#faad14',
    color: 'warning',
  },
  'partially-paid': {
    label: 'Partial',
    dot: '#fa8c16',
    color: 'warning',
  },
  partial: {
    label: 'Partial',
    dot: '#fa8c16',
    color: 'warning',
  },
  overdue: {
    label: 'Overdue',
    dot: '#ff4d4f',
    color: 'error',
  },
  draft: {
    label: 'Draft',
    dot: '#8c8c8c',
    color: 'default',
  },
  cancelled: {
    label: 'Cancelled',
    dot: '#8c8c8c',
    color: 'default',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className = '',
  showDot = true,
}) => {
  const isDark = useIsDarkMode();
  const normStatus = (status || 'unpaid').toLowerCase();
  const cfg = statusConfig[normStatus] || statusConfig.unpaid;
  const displayLabel = label || cfg.label;

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntTag
        color={cfg.color}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`.trim()}
      >
        {showDot && (
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: cfg.dot }}
          />
        )}
        <span>{displayLabel}</span>
      </AntTag>
    </ConfigProvider>
  );
};

export default StatusBadge;
