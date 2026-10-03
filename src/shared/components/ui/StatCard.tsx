import React, { ReactNode } from 'react';
import { Card } from './Card';

export interface StatCardProps {
  title: ReactNode;
  value: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple';
  badge?: ReactNode;
  footer?: ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
}

const iconVariantStyles: Record<NonNullable<StatCardProps['variant']>, { bg: string; text: string }> = {
  default: {
    bg: 'bg-[#f5f5f5] dark:bg-[#1f1f1f]',
    text: 'text-[rgba(0,0,0,0.65)] dark:text-[rgba(255,255,255,0.65)]',
  },
  primary: {
    bg: 'bg-[#e6f4ff] dark:bg-[rgba(22,119,255,0.15)]',
    text: 'text-[#1677ff] dark:text-[#4096ff]',
  },
  success: {
    bg: 'bg-[#f6ffed] dark:bg-[rgba(82,196,26,0.15)]',
    text: 'text-[#52c41a] dark:text-[#73d13d]',
  },
  warning: {
    bg: 'bg-[#fffbe6] dark:bg-[rgba(250,173,20,0.15)]',
    text: 'text-[#faad14] dark:text-[#ffc53d]',
  },
  danger: {
    bg: 'bg-[#fff2f0] dark:bg-[rgba(255,77,79,0.15)]',
    text: 'text-[#ff4d4f] dark:text-[#ff7875]',
  },
  purple: {
    bg: 'bg-[#f9f0ff] dark:bg-[rgba(114,46,209,0.15)]',
    text: 'text-[#722ed1] dark:text-[#9254de]',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  badge,
  footer,
  className = '',
  id,
  onClick,
}) => {
  const iconTheme = iconVariantStyles[variant] || iconVariantStyles.default;

  return (
    <Card
      id={id}
      className={`relative rounded-xl bg-white dark:bg-[#141414] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[#1677ff]/40 hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`.trim()}
      onClick={onClick}
      styles={{
        body: { padding: '0.875rem 1rem' },
      }}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {icon && (
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-transform ${iconTheme.bg} ${iconTheme.text} [&_svg]:w-3.5 [&_svg]:h-3.5`}
          >
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <p
              className="text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight"
              title={typeof title === 'string' ? title : undefined}
            >
              {title}
            </p>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>

          <div
            className="text-lg sm:text-xl xl:text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-tight mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
            title={typeof value === 'string' || typeof value === 'number' ? String(value) : undefined}
          >
            {value}
          </div>

          {subtitle && (
            <p
              className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
              title={typeof subtitle === 'string' ? subtitle : undefined}
            >
              {subtitle}
            </p>
          )}

          {trend && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs flex-wrap">
              <span
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold text-[11px] ${
                  trend.isPositive
                    ? 'bg-[#f6ffed] text-[#389e0d] dark:bg-[rgba(82,196,26,0.15)] dark:text-[#73d13d]'
                    : 'bg-[#fff2f0] text-[#cf1322] dark:bg-[rgba(255,77,79,0.15)] dark:text-[#ff7875]'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              {trend.label && (
                <span className="text-[rgba(0,0,0,0.45)] dark:text-[rgba(255,255,255,0.45)] text-[11px]">
                  {trend.label}
                </span>
              )}
            </div>
          )}

          {footer && <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">{footer}</div>}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
