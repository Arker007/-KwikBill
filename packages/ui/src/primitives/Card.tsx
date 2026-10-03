import React, { forwardRef } from 'react';
import { Card as AntCard, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export type CardVariant = 'default' | 'glass' | 'surface' | 'bordered';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: CardVariant;
  hoverable?: boolean;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  bordered?: boolean;
  size?: 'default' | 'small';
  styles?: {
    header?: React.CSSProperties;
    body?: React.CSSProperties;
  };
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', variant = 'default', hoverable = false, title, extra, bordered, size, styles, ...props }, ref) => {
    const isDark = useIsDarkMode();
    const isBordered = bordered !== undefined ? bordered : variant !== 'surface';

    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <AntCard
          ref={ref as any}
          hoverable={hoverable}
          title={title}
          extra={extra}
          variant={isBordered ? 'outlined' : 'borderless'}
          size={size}
          className={`custom-antd-card rounded-xl overflow-hidden ${variant === 'glass' ? 'glass-panel backdrop-blur-md' : ''} ${className}`.trim()}
          styles={{
            body: {
              padding: '1.25rem',
              ...styles?.body,
            },
            header: styles?.header,
          }}
          {...(props as any)}
        >
          {children}
        </AntCard>
      </ConfigProvider>
    );
  }
);
Card.displayName = 'Card';

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, action, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 ${className}`.trim()}
        {...props}
      >
        <div className="flex-1 min-w-0">{children}</div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, as: Component = 'h3', className = '', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-snug ${className}`.trim()}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={`text-xs text-slate-500 dark:text-slate-400 mt-0.5 ${className}`.trim()}
        {...props}
      >
        {children}
      </p>
    );
  }
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`p-5 ${className}`.trim()} {...props}>
        {children}
      </div>
    );
  }
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-5 py-3.5 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = 'CardFooter';

export default Card;
