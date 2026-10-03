import React, { forwardRef, ReactNode } from 'react';
import { Tag as AntTag, Badge as AntBadge, ConfigProvider } from 'antd';
import type { PresetStatusColorType } from 'antd/es/_util/colors';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'paid'
  | 'danger'
  | 'unpaid'
  | 'overdue'
  | 'warning'
  | 'partial'
  | 'purple'
  | 'neutral'
  | 'secondary'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  dotColor?: string;
  icon?: ReactNode;
  count?: ReactNode;
  overflowCount?: number;
  showZero?: boolean;
  status?: PresetStatusColorType;
  color?: string;
  text?: ReactNode;
  offset?: [number | string, number | string];
}

const variantColorMap: Record<BadgeVariant, { color?: string; className: string }> = {
  default: { color: 'processing', className: '' },
  primary: { color: 'blue', className: '' },
  success: { color: 'success', className: '' },
  paid: { color: 'success', className: '' },
  danger: { color: 'error', className: '' },
  unpaid: { color: 'warning', className: '' },
  overdue: { color: 'error', className: '' },
  warning: { color: 'warning', className: '' },
  partial: { color: 'warning', className: '' },
  purple: { color: 'purple', className: '' },
  neutral: { color: 'default', className: '' },
  secondary: { color: 'default', className: '' },
  outline: { className: 'border border-[#d9d9d9] dark:border-[#424242] bg-transparent text-inherit' },
};

const dotColors: Record<BadgeVariant, string> = {
  default: '#1677ff',
  primary: '#1677ff',
  success: '#52c41a',
  paid: '#52c41a',
  danger: '#ff4d4f',
  unpaid: '#faad14',
  overdue: '#ff4d4f',
  warning: '#faad14',
  partial: '#fa8c16',
  purple: '#722ed1',
  neutral: '#8c8c8c',
  secondary: '#8c8c8c',
  outline: '#8c8c8c',
};

/**
 * Badge: Dual-purpose component.
 * 1. Aggregated message indicators: Position at upper-right of icons/avatars or after titles
 *    when count, overflowCount, or status is provided.
 * 2. Tag/Pill indicator: Displays colored status badge when variant is provided.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant,
      size = 'md',
      dot = false,
      dotColor,
      icon,
      count,
      overflowCount = 99,
      showZero = false,
      status,
      color,
      text,
      offset,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDark = useIsDarkMode();

    // If count, status, or standalone dot/color is passed, render Ant Design aggregated message badge
    const isIndicatorBadge = count !== undefined || status !== undefined || (dot && !variant);

    if (isIndicatorBadge) {
      return (
        <ConfigProvider theme={getAntdTheme(isDark)}>
          <AntBadge
            count={count}
            dot={dot}
            overflowCount={overflowCount}
            showZero={showZero}
            status={status}
            color={color || dotColor}
            text={text}
            offset={offset}
            size={size === 'sm' ? 'small' : undefined}
            className={className}
          >
            {children}
          </AntBadge>
        </ConfigProvider>
      );
    }

    const resolvedVariant = variant || 'default';
    const config = variantColorMap[resolvedVariant] || variantColorMap.default;
    const resolvedDotColor = dotColor || dotColors[resolvedVariant] || '#1677ff';
    const sizeClass =
      size === 'sm'
        ? 'text-[11px] px-1.5 py-0 leading-tight'
        : size === 'lg'
        ? 'text-sm px-2.5 py-0.5'
        : 'text-xs px-2 py-0.5';

    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <AntTag
          ref={ref as any}
          color={config.color}
          icon={icon}
          className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClass} ${config.className} ${className}`.trim()}
          {...(props as any)}
        >
          {dot && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: resolvedDotColor }}
              aria-hidden="true"
            />
          )}
          {children && <span>{children}</span>}
        </AntTag>
      </ConfigProvider>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge as IndicatorBadge, Badge as NumericBadge };
export default Badge;
