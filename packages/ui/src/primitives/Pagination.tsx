import React from 'react';
import { Pagination as AntPagination, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  mode?: 'basic' | 'mini' | 'simple';
  showQuickJumper?: boolean;
  showSizeChanger?: boolean;
  showTotal?: boolean;
  className?: string;
  id?: string;
}

/**
 * Ant Design Navigation System - Pagination Component
 * 
 * Spec Rules:
 * - Divides extensive content into navigable pages.
 * - BASIC: Standard pagination for large datasets. Offers quick page jumper when >5 pages.
 *   Allows user-controlled page size.
 * - MINI: Compact pagination for cards or floating layers.
 * - SIMPLE: Minimal pagination for cards or data tables containing <= 10 pages.
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  mode = 'basic',
  showQuickJumper,
  showSizeChanger,
  showTotal = true,
  className = '',
  id,
}) => {
  const isDark = useIsDarkMode();
  const calculatedTotal = totalItems !== undefined ? totalItems : (totalPages ? totalPages * pageSize : 0);
  const effectivePages = totalPages || Math.ceil(calculatedTotal / pageSize) || 1;

  if (effectivePages <= 1 && calculatedTotal <= pageSize) return null;

  const handleChange = (page: number, size: number) => {
    if (size !== pageSize && onPageSizeChange) {
      onPageSizeChange(size);
    }
    onPageChange(page);
  };

  // Determine if quick jumper should be active (defaults to true when > 5 pages per spec)
  const isQuickJumperActive = showQuickJumper !== undefined ? showQuickJumper : effectivePages > 5 && mode === 'basic';
  const isSizeChangerActive = showSizeChanger !== undefined ? showSizeChanger : Boolean(onPageSizeChange) && mode === 'basic';

  if (mode === 'simple') {
    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div id={id} className={`ant-pagination-simple-container px-3 py-2 flex items-center justify-end text-xs ${className}`.trim()}>
          <AntPagination
            simple
            current={currentPage}
            total={calculatedTotal}
            pageSize={pageSize}
            onChange={handleChange}
            size="small"
          />
        </div>
      </ConfigProvider>
    );
  }

  if (mode === 'mini') {
    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div id={id} className={`ant-pagination-mini-container px-2 py-1.5 flex items-center justify-between text-xs ${className}`.trim()}>
          <AntPagination
            size="small"
            current={currentPage}
            total={calculatedTotal}
            pageSize={pageSize}
            onChange={handleChange}
            showLessItems
          />
        </div>
      </ConfigProvider>
    );
  }

  // Mode: BASIC (standard with total counter, size changer, and quick jumper when >5 pages)
  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <div id={id} className={`ant-pagination-basic-container flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#141414] border-t border-[#e5e7eb] dark:border-[#303030] text-xs text-slate-600 dark:text-slate-400 flex-wrap ${className}`.trim()}>
        <AntPagination
          current={currentPage}
          total={calculatedTotal}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onChange={handleChange}
          showSizeChanger={isSizeChangerActive}
          showQuickJumper={isQuickJumperActive}
          showTotal={showTotal ? (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries` : undefined}
          size="small"
          className="w-full flex items-center justify-between flex-wrap gap-2"
        />
      </div>
    </ConfigProvider>
  );
};

export default Pagination;
