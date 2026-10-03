import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, PackageOpen, Plus } from 'lucide-react';
import { Product } from '@/features/inventory/types';
import { ProductRow } from '@/features/inventory/components/ProductRow';

export type SortField = 'name' | 'stock' | 'sellingPrice' | 'purchasePrice';
export type SortOrder = 'asc' | 'desc';

export interface ProductsTableProps {
  products: Product[];
  currency?: string;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
  onNewItem?: () => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  currency = 'INR',
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  onDuplicate,
  onAdjustStock,
  onNewItem,
}) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-[#bfbfbf] opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={12} className="text-[#1677ff]" />
    ) : (
      <ArrowDown size={12} className="text-[#1677ff]" />
    );
  };

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-[#141414] rounded-[12px] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f5f5f5] dark:bg-[#1f1f1f] flex items-center justify-center mx-auto mb-3 text-[#8c8c8c]">
          <PackageOpen size={30} strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-semibold text-[#141414] dark:text-[#f0f0f0] mb-1">
          No products or services found
        </h3>
        <p className="text-xs text-[#8c8c8c] max-w-sm mx-auto mb-5">
          Get started by creating your first product item or service with GST rates, HSN codes, and pricing.
        </p>
        {onNewItem && (
          <button
            type="button"
            onClick={onNewItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#1677ff] hover:bg-[#4096ff] rounded-[6px] transition-all shadow-sm mx-auto cursor-pointer"
          >
            <Plus size={15} />
            <span>Add First Item</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#141414] rounded-[12px] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[#fafafa] dark:bg-[#1d1d1d] border-b border-[#f0f0f0] dark:border-[rgba(255,255,255,0.12)]">
              {onToggleSelectAll && (
                <th className="py-3 px-3 text-xs font-semibold text-[#595959] dark:text-[rgba(255,255,255,0.65)] whitespace-nowrap w-[36px]">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && products.every((p) => selectedIds?.has(p.id || p.name))}
                    onChange={onToggleSelectAll}
                    title="Select all visible products"
                    className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
                  />
                </th>
              )}
              <th className="py-3 px-4 text-xs font-semibold text-[#595959] dark:text-[rgba(255,255,255,0.65)] whitespace-nowrap min-w-[260px]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSort('name')}
                    className="group inline-flex items-center gap-1 hover:text-[#1677ff] transition-colors text-left cursor-pointer"
                  >
                    <span>Item</span>
                    {renderSortIcon('name')}
                  </button>
                  <Filter size={11} className="text-[#bfbfbf] ml-0.5" />
                </div>
              </th>

              <th className="py-3 px-4 text-xs font-semibold text-[#595959] dark:text-[rgba(255,255,255,0.65)] whitespace-nowrap min-w-[100px]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSort('stock')}
                    className="group inline-flex items-center gap-1 hover:text-[#1677ff] transition-colors cursor-pointer"
                  >
                    <span>Qty</span>
                    {renderSortIcon('stock')}
                  </button>
                  <Filter size={11} className="text-[#bfbfbf] ml-0.5" />
                </div>
              </th>

              <th className="py-3 px-4 text-xs font-semibold text-[#595959] dark:text-[rgba(255,255,255,0.65)] whitespace-nowrap min-w-[140px]">
                <button
                  type="button"
                  onClick={() => onSort('sellingPrice')}
                  className="group inline-flex items-center gap-1 hover:text-[#1677ff] transition-colors cursor-pointer"
                >
                  <span>Selling Price (Disc %)</span>
                  {renderSortIcon('sellingPrice')}
                </button>
              </th>

              <th className="py-3 px-4 text-xs font-semibold text-[#595959] dark:text-[rgba(255,255,255,0.65)] whitespace-nowrap min-w-[130px]">
                <button
                  type="button"
                  onClick={() => onSort('purchasePrice')}
                  className="group inline-flex items-center gap-1 hover:text-[#1677ff] transition-colors cursor-pointer"
                >
                  <span>Purchase Price</span>
                  {renderSortIcon('purchasePrice')}
                </button>
              </th>

              <th className="py-3 px-4 text-xs font-semibold text-[#595959] dark:text-[rgba(255,255,255,0.65)] text-right whitespace-nowrap min-w-[90px]">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#f0f0f0] dark:divide-[rgba(255,255,255,0.06)]">
            {products.map((product) => {
              const productId = product.id || product.name;
              return (
                <ProductRow
                  key={productId}
                  product={product}
                  currency={currency}
                  isSelected={selectedIds?.has(productId)}
                  onToggleSelect={onToggleSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onAdjustStock={onAdjustStock}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;
