import React, { forwardRef } from 'react';
import { Table as AntTable, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from './AntdThemeConfig';

export { AntTable };

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = '', containerClassName = '', wrapperProps, ...props }, ref) => {
    const isDark = useIsDarkMode();
    return (
      <ConfigProvider theme={getAntdTheme(isDark)}>
        <div
          className={`table-scroll ant-table ant-table-bordered overflow-x-auto rounded-[8px] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.12)] ${containerClassName}`.trim()}
          {...wrapperProps}
        >
          <table
            ref={ref}
            className={`data-table ant-table-content w-full border-collapse text-left ${className}`.trim()}
            {...props}
          >
            {children}
          </table>
        </div>
      </ConfigProvider>
    );
  }
);
Table.displayName = 'Table';

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, className = '', ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={`bg-[#fafafa] dark:bg-[#1d1d1d] border-b border-[#f0f0f0] dark:border-[rgba(255,255,255,0.12)] ${className}`.trim()}
      {...props}
    >
      {children}
    </thead>
  );
});
TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, className = '', ...props }, ref) => {
  return (
    <tbody
      ref={ref}
      className={`divide-y divide-[#f0f0f0] dark:divide-[rgba(255,255,255,0.08)] bg-white dark:bg-[#141414] ${className}`.trim()}
      {...props}
    >
      {children}
    </tbody>
  );
});
TableBody.displayName = 'TableBody';

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ children, className = '', ...props }, ref) => {
  return (
    <tfoot
      ref={ref}
      className={`bg-[#fafafa] dark:bg-[#1d1d1d] font-medium border-t border-[#f0f0f0] dark:border-[rgba(255,255,255,0.12)] ${className}`.trim()}
      {...props}
    >
      {children}
    </tfoot>
  );
});
TableFooter.displayName = 'TableFooter';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  clickable?: boolean;
  status?: 'default' | 'overdue' | 'warning' | 'success';
}

const rowStatusClasses: Record<'default' | 'overdue' | 'warning' | 'success', string> = {
  default: 'hover:bg-[#fafafa] dark:hover:bg-[#1f1f1f]',
  overdue: 'row-overdue bg-[#fff2f0]/60 dark:bg-[rgba(255,77,79,0.12)] hover:bg-[#fff2f0] dark:hover:bg-[rgba(255,77,79,0.2)]',
  warning: 'row-warning bg-[#fffbe6]/60 dark:bg-[rgba(250,173,20,0.12)] hover:bg-[#fffbe6] dark:hover:bg-[rgba(250,173,20,0.2)]',
  success: 'bg-[#f6ffed]/60 dark:bg-[rgba(82,196,26,0.12)] hover:bg-[#f6ffed] dark:hover:bg-[rgba(82,196,26,0.2)]',
};

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className = '', selected = false, clickable = false, status = 'default', ...props }, ref) => {
    const statusClass = rowStatusClasses[status] || rowStatusClasses.default;
    const selectedClass = selected
      ? 'bg-[#e6f4ff] dark:bg-[rgba(22,119,255,0.18)] border-l-2 border-l-[#1677ff]'
      : '';
    const cursorClass = clickable ? 'cursor-pointer select-none' : '';

    return (
      <tr
        ref={ref}
        className={`transition-colors duration-150 ${statusClass} ${selectedClass} ${cursorClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </tr>
    );
  }
);
TableRow.displayName = 'TableRow';

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className = '', align = 'left', ...props }, ref) => {
    const alignClass =
      align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

    return (
      <th
        ref={ref}
        className={`py-3 px-3.5 text-xs font-semibold uppercase tracking-wider text-[#595959] dark:text-[rgba(255,255,255,0.65)] whitespace-nowrap ${alignClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className = '', align = 'left', ...props }, ref) => {
    const alignClass =
      align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

    return (
      <td
        ref={ref}
        className={`py-3 px-3.5 text-sm text-[#262626] dark:text-[rgba(255,255,255,0.85)] align-middle ${alignClass} ${className}`.trim()}
        {...props}
      >
        {children}
      </td>
    );
  }
);
TableCell.displayName = 'TableCell';

export default Table;
