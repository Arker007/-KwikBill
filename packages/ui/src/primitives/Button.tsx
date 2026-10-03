import React, { forwardRef } from 'react';
import { Button as AntButton, Tooltip, ConfigProvider } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export type ButtonVariant =
  | 'primary'
  | 'default'
  | 'outline'
  | 'secondary'
  | 'dashed'
  | 'text'
  | 'ghost'
  | 'link'
  | 'danger'
  | 'success'
  | 'warning'
  | 'cta';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'size' | 'prefix'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  danger?: boolean;
  ghost?: boolean;
  dashed?: boolean;
  shape?: 'default' | 'circle' | 'round';
  tooltip?: React.ReactNode;
  htmlType?: 'button' | 'submit' | 'reset';
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Ant Design Standardized Button Primitive
 *
 * Implements Ant Design Button Design Patterns:
 * 1. Default Button: Safe non-primary actions.
 * 2. Primary Button: Emphasizes complete/recommend action (max 1 primary per group).
 * 3. Text Button: Low emphasis, lightweight table row actions.
 * 4. Icon / Icon-with-Text: Visual clues with automatic tooltip support.
 * 5. Dashed Button: Guide users to add content to an area (+ Add Line / + Add Item).
 * 6. Danger Button: High-risk operational warning (e.g., delete/revoke).
 * 7. Ghost Button: Transparent on dark/colored backgrounds.
 * 8. CTA (Call To Action): High prominence action on banners / landing views.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      isLoading = false,
      loading = false,
      leftIcon,
      rightIcon,
      icon,
      fullWidth = false,
      danger = false,
      ghost = false,
      dashed = false,
      shape = 'default',
      tooltip,
      className = '',
      disabled,
      htmlType,
      type,
      ...props
    },
    ref
  ) => {
    const isDark = useIsDarkMode();
    const effectiveLoading = Boolean(loading || isLoading);
    const resolvedHtmlType = (htmlType || type || 'button') as 'button' | 'submit' | 'reset';

    // Map size
    const antSize: AntButtonProps['size'] = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'middle';

    // Map variant to Ant Design button type & danger/ghost flags
    let antType: AntButtonProps['type'] = 'default';
    let isDanger = Boolean(danger);
    let isGhost = Boolean(ghost);
    let customColorClass = '';

    if (variant === 'primary' || variant === 'cta') {
      antType = 'primary';
    } else if (variant === 'danger') {
      antType = 'primary';
      isDanger = true;
    } else if (variant === 'dashed') {
      antType = 'dashed';
    } else if (variant === 'text') {
      antType = 'text';
    } else if (variant === 'ghost') {
      antType = 'default';
      isGhost = true;
    } else if (variant === 'link') {
      antType = 'link';
    } else if (variant === 'success') {
      antType = 'primary';
      customColorClass = 'bg-[#52c41a] hover:!bg-[#73d13d] border-[#52c41a] hover:!border-[#73d13d] text-white';
    } else if (variant === 'warning') {
      antType = 'primary';
      customColorClass = 'bg-[#faad14] hover:!bg-[#ffc53d] border-[#faad14] hover:!border-[#ffc53d] text-slate-900';
    } else if (variant === 'secondary' || variant === 'default' || variant === 'outline') {
      antType = dashed ? 'dashed' : 'default';
    }

    if (dashed && antType !== 'primary' && antType !== 'dashed') {
      antType = 'dashed';
    }

    const resolvedLeftIcon = leftIcon || icon;
    const isIconOnly = Boolean(resolvedLeftIcon && !children);

    const buttonElement = (
      <AntButton
        ref={ref as any}
        type={antType}
        danger={isDanger}
        ghost={isGhost}
        size={antSize}
        shape={shape}
        loading={effectiveLoading}
        disabled={disabled}
        block={fullWidth || variant === 'cta'}
        htmlType={resolvedHtmlType}
        icon={resolvedLeftIcon}
        className={`inline-flex items-center justify-center font-medium ant-motion-btn ${
          fullWidth || variant === 'cta' ? 'w-full' : ''
        } ${isIconOnly ? 'p-0 flex items-center justify-center' : ''} ${
          variant === 'cta' ? 'h-11 text-base shadow-sm font-semibold' : ''
        } ${customColorClass} ${className}`.trim()}
        {...(props as any)}
      >
        {children}
        {rightIcon && <span className="ml-1.5 inline-flex items-center">{rightIcon}</span>}
      </AntButton>
    );

    const wrappedElement = (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        {tooltip ? (
          <Tooltip title={tooltip}>
            {buttonElement}
          </Tooltip>
        ) : (
          buttonElement
        )}
      </ConfigProvider>
    );

    return wrappedElement;
  }
);

Button.displayName = 'Button';

export default Button;
