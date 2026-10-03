import React, { ReactNode } from 'react';
import { Breadcrumb as AntBreadcrumb, ConfigProvider } from 'antd';
import type { BreadcrumbProps as AntBreadcrumbProps } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface BreadcrumbItem {
  key?: string;
  title: ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => void;
  icon?: ReactNode;
  menu?: {
    items: Array<{
      key: string;
      label: ReactNode;
      onClick?: () => void;
    }>;
  };
  className?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxCount?: number; // Defaults to 5 per Ant Design navigation spec (prefer <3, max 5)
  className?: string;
  id?: string;
}

/**
 * Ant Design Navigation System - Breadcrumb Component
 * 
 * Spec Rules:
 * - Shows current location and parent-child page hierarchy.
 * - Prefer displaying fewer than 3 levels; never exceed 5.
 * - Intermediate levels collapse in deep structures when exceeding maxCount.
 * - Avoid breadcrumbs when existing navigation already provides sufficient location context.
 */
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  maxCount = 5,
  className = '',
  id,
}) => {
  const isDark = useIsDarkMode();

  // Enforce Navigation spec: Collapse intermediate levels if count exceeds maxCount (max 5)
  let processedItems = items;
  if (items.length > maxCount && maxCount >= 3) {
    const start = items.slice(0, 1);
    const end = items.slice(-(maxCount - 2));
    const collapsedItems = items.slice(1, -(maxCount - 2));

    const ellipsisItem: BreadcrumbItem = {
      key: 'collapsed-ellipsis',
      title: '...',
      menu: {
        items: collapsedItems.map((item, idx) => ({
          key: item.key || `collapsed-${idx}`,
          label: (
            <span
              onClick={item.onClick}
              className="cursor-pointer flex items-center gap-1.5"
            >
              {item.icon}
              <span>{item.title}</span>
            </span>
          ),
        })),
      },
    };

    processedItems = [...start, ellipsisItem, ...end];
  }

  const antdItems: NonNullable<AntBreadcrumbProps['items']> = processedItems.map((item, idx) => ({
    key: item.key || `crumb-${idx}`,
    title: (
      <span
        onClick={item.onClick}
        className={`inline-flex items-center gap-1.5 ${item.onClick ? 'cursor-pointer hover:text-[#1677ff] dark:hover:text-[#4096ff] transition-colors' : ''} ${item.className || ''}`}
      >
        {item.icon && <span className="shrink-0">{item.icon}</span>}
        <span>{item.title}</span>
      </span>
    ),
    href: item.href,
    menu: item.menu,
  }));

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <nav aria-label="Breadcrumb" id={id} className={`ant-breadcrumb-wrapper ${className}`.trim()}>
        <AntBreadcrumb
          items={antdItems}
          separator={separator}
          className="text-xs text-slate-500 dark:text-slate-400"
        />
      </nav>
    </ConfigProvider>
  );
};

export default Breadcrumb;
