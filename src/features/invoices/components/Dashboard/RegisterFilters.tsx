import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Columns3,
  Download,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import { INVOICE_TYPES } from '../../constants';
import { DashboardVisibleColumns } from './types';
import { DatePicker, Input, Select, Checkbox, SegmentedTabs } from '@/shared/components/ui';

interface RegisterFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  fyFilter: string;
  onFyFilterChange: (value: string) => void;
  fyOptions: Array<{ value: string; label: string }>;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  hasFilters: boolean;
  onClearFilters: () => void;
  showColumnPicker: boolean;
  onToggleColumnPicker: () => void;
  visibleColumns: DashboardVisibleColumns;
  onToggleColumn: (key: string, checked: boolean) => void;
  bulkBusy: boolean;
  filteredCount: number;
  totalCount?: number;
  unpaidCount: number;
  overdueCount: number;
  paidCount: number;
  onBulkPrintByFilter: (filterKind: string) => void;
  onBulkExportJSON?: () => void;
}

export const RegisterFilters: React.FC<RegisterFiltersProps> = ({
  search,
  onSearchChange,
  fyFilter,
  onFyFilterChange,
  fyOptions,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  hasFilters,
  onClearFilters,
  showColumnPicker,
  onToggleColumnPicker,
  visibleColumns,
  onToggleColumn,
  bulkBusy,
  filteredCount,
  totalCount = 0,
  unpaidCount,
  overdueCount,
  paidCount,
  onBulkPrintByFilter,
  onBulkExportJSON,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu]);

  // Segmented tab active key calculation
  const currentTab = ['all', 'unpaid', 'overdue', 'paid'].includes(statusFilter)
    ? statusFilter
    : 'all';

  const statusTabOptions = [
    { key: 'all', label: 'All', count: totalCount || filteredCount },
    { key: 'unpaid', label: 'Unpaid', count: unpaidCount, dotColor: '#faad14' },
    { key: 'overdue', label: 'Overdue', count: overdueCount, dotColor: '#ff4d4f' },
    { key: 'paid', label: 'Paid', count: paidCount, dotColor: '#52c41a' },
  ];

  return (
    <div className="space-y-3.5 mb-4">
      {/* 1. Header & Column Visibility row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
            Invoices
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Search, filter and manage all your invoices in one place.
          </p>
        </div>

        <div className="relative shrink-0">
          <button
            id="btn-toggle-column-picker"
            type="button"
            onClick={onToggleColumnPicker}
            title="Choose which columns to show"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#141414] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#1f1f1f] shadow-xs transition-colors"
          >
            <Columns3 size={15} className="text-slate-500" />
            <span>Columns</span>
          </button>

          {/* Column Picker Popover */}
          {showColumnPicker && (
            <div
              id="column-picker-popover"
              className="absolute right-0 mt-2 w-64 p-3 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                Visible Columns
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ['invoice', 'Invoice No.'],
                  ['client', 'Client'],
                  ['date', 'Date'],
                  ['type', 'Type'],
                  ['amount', 'Amount'],
                  ['currency', 'Currency'],
                  ['status', 'Status'],
                  ['dueDate', 'Due Date'],
                  ['printed', 'Print Count'],
                  ['actions', 'Actions'],
                ].map(([key, label]) => (
                  <Checkbox
                    key={key}
                    label={label}
                    checked={!!visibleColumns[key]}
                    onChange={(e) => onToggleColumn(key, e.target.checked)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Filter Inputs Row */}
      <div
        id="register-filters-bar"
        className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-slate-50/70 dark:bg-[#141414] border border-slate-200/80 dark:border-slate-800/80"
      >
        {/* Search input */}
        <div className="flex-1 min-w-[220px]">
          <Input
            id="input-filter-search"
            type="text"
            placeholder="Search client or invoice..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Search size={15} className="text-slate-400" />}
            inputSize="md"
            containerClassName="mb-0"
            allowClear
          />
        </div>

        {/* Financial Year Selector */}
        <div className="w-[125px] shrink-0">
          <Select
            id="select-filter-fy"
            value={fyFilter}
            onChange={(e) => onFyFilterChange(e.target.value)}
            fullWidth
            selectSize="md"
            containerClassName="mb-0"
            options={[
              { value: 'all', label: 'All Years' },
              ...fyOptions.map((fy) => ({ value: fy.value, label: fy.label })),
            ]}
          />
        </div>

        {/* Invoice Type Selector */}
        <div className="w-[135px] shrink-0">
          <Select
            id="select-filter-type"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            fullWidth
            selectSize="md"
            containerClassName="mb-0"
            options={[
              { value: 'all', label: 'All Types' },
              ...Object.entries(INVOICE_TYPES).map(([key, val]) => ({
                value: key,
                label: (val as any).label,
              })),
            ]}
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-[125px] shrink-0">
          <Select
            id="select-filter-status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            fullWidth
            selectSize="md"
            containerClassName="mb-0"
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'partial', label: 'Partial' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' },
            ]}
          />
        </div>

        {/* Date From */}
        <div className="w-[130px] shrink-0">
          <DatePicker
            id="input-filter-date-from"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            onClear={() => onDateFromChange('')}
            pickerSize="md"
            fullWidth
            containerClassName="mb-0"
            placeholder="From"
            title="From"
          />
        </div>

        {/* Date To */}
        <div className="w-[130px] shrink-0">
          <DatePicker
            id="input-filter-date-to"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            onClear={() => onDateToChange('')}
            pickerSize="md"
            fullWidth
            containerClassName="mb-0"
            placeholder="To"
            title="To"
          />
        </div>

        {/* Clear Filters Button */}
        {hasFilters && (
          <button
            id="btn-clear-filters"
            type="button"
            onClick={onClearFilters}
            title="Clear all filters"
            aria-label="Clear filters"
            className="p-2 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {/* Export Dropdown Menu */}
        <div className="relative shrink-0" ref={exportRef}>
          <button
            id="btn-export-dropdown"
            type="button"
            disabled={bulkBusy}
            onClick={() => setShowExportMenu((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-[#262626] shadow-xs transition-colors"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-52 p-1.5 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onBulkPrintByFilter('all');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-left transition-colors"
              >
                <Download size={14} className="text-blue-500" />
                <span>Export All Shown ({filteredCount} PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onBulkPrintByFilter('unpaid');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-left transition-colors"
              >
                <Clock size={14} className="text-amber-500" />
                <span>Export Unpaid ({unpaidCount} PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onBulkPrintByFilter('overdue');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-left transition-colors"
              >
                <AlertTriangle size={14} className="text-rose-500" />
                <span>Export Overdue ({overdueCount} PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onBulkPrintByFilter('paid');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-left transition-colors"
              >
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Export Paid ({paidCount} PDF)</span>
              </button>

              {onBulkExportJSON && (
                <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      onBulkExportJSON();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f1f1f] text-left transition-colors"
                  >
                    <FileText size={14} className="text-purple-500" />
                    <span>Export JSON Backup</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Segmented Tabs for Quick Status Filtering */}
      <div className="flex items-center justify-between gap-4">
        <SegmentedTabs
          id="dashboard-status-tabs"
          options={statusTabOptions}
          activeKey={currentTab}
          onChange={(key) => onStatusFilterChange(key)}
          size="md"
        />

        {/* Filter status indicator text */}
        <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredCount}</strong> of{' '}
          {totalCount || filteredCount} invoices
        </div>
      </div>
    </div>
  );
};

export default RegisterFilters;
