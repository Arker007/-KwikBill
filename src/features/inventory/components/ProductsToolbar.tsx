import React, { useState, useRef } from 'react';
import { Search, ChevronDown, SlidersHorizontal, Plus, Download, Upload, Trash2, Layers } from 'lucide-react';
import { Input, Select, Button } from '@/shared/components/ui';

export interface ProductsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  onNewItem: () => void;
  onExportCSV: () => void;
  onImportCSV: () => void;
  onBulkStockAdjustment?: () => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
}

export const ProductsToolbar: React.FC<ProductsToolbarProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  onNewItem,
  onExportCSV,
  onImportCSV,
  onBulkStockAdjustment,
  selectedCount = 0,
  onBulkDelete,
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Close actions menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
      {/* Left Search & Category Dropdown */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {/* Search input */}
        <div className="flex-1">
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products, category, description, barcode..."
            prefix={<Search size={16} className="text-[#8c8c8c]" />}
            inputSize="md"
            containerClassName="mb-0"
            allowClear
          />
        </div>

        {/* Category select filter */}
        <div className="min-w-[180px]">
          <Select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={[
              { value: '', label: 'Select Category' },
              ...categories.map((cat) => ({ value: cat, label: cat })),
            ]}
            selectSize="md"
            containerClassName="mb-0"
          />
        </div>
      </div>

      {/* Right Controls: Filter, Actions, + Create Product */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {/* Filter Toggle */}
        <Button
          variant="default"
          size="md"
          icon={<SlidersHorizontal size={15} />}
          tooltip="Filter products"
          aria-label="Filter products"
        />

        {/* Actions Dropdown */}
        <div className="relative" ref={actionsMenuRef}>
          <Button
            variant="default"
            size="md"
            onClick={() => setShowActionsMenu((prev) => !prev)}
            rightIcon={<ChevronDown size={14} className="text-[#8c8c8c]" />}
          >
            <span>Actions</span>
          </Button>

          {showActionsMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-[#1f1f1f] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.12)] rounded-[8px] shadow-[0_6px_16px_0_rgba(0,0,0,0.08)] py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setShowActionsMenu(false);
                  onExportCSV();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#262626] dark:text-[rgba(255,255,255,0.85)] hover:bg-[#fafafa] dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                <Download size={14} className="text-[#1677ff]" />
                Export to CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowActionsMenu(false);
                  onImportCSV();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#262626] dark:text-[rgba(255,255,255,0.85)] hover:bg-[#fafafa] dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                <Upload size={14} className="text-[#52c41a]" />
                Import from CSV
              </button>
              {onBulkStockAdjustment && (
                <button
                  type="button"
                  onClick={() => {
                    setShowActionsMenu(false);
                    onBulkStockAdjustment();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#262626] dark:text-[rgba(255,255,255,0.85)] hover:bg-[#fafafa] dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                >
                  <Layers size={14} className="text-[#722ed1]" />
                  Bulk Stock Update
                </button>
              )}
              {selectedCount > 0 && onBulkDelete && (
                <>
                  <div className="h-px bg-[#f0f0f0] dark:bg-[rgba(255,255,255,0.1)] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowActionsMenu(false);
                      onBulkDelete();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#ff4d4f] hover:bg-[#fff2f0] dark:hover:bg-[rgba(255,77,79,0.15)] transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Delete Selected ({selectedCount})
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* + Create Product Primary CTA (Single Primary Button) */}
        <Button
          variant="primary"
          size="md"
          onClick={onNewItem}
          leftIcon={<Plus size={16} strokeWidth={2.5} />}
        >
          <span>Create Product</span>
        </Button>
      </div>
    </div>
  );
};
