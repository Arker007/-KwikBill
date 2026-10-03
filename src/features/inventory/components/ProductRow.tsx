import React from 'react';
import { Edit2 } from 'lucide-react';
import { Product } from '../types';
import { ProductAvatar } from './ProductAvatar';
import { ProductActionMenu } from './ProductActionMenu';
import { formatCurrency } from '../../../shared/utils';

export interface ProductRowProps {
  product: Product;
  currency?: string;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onDuplicate?: (product: Product) => void;
  onAdjustStock?: (product: Product) => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  currency = 'INR',
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onAdjustStock,
}) => {
  const sellingPrice = product.sellingPrice ?? product.rate ?? 0;
  const purchasePrice = product.purchasePrice ?? 0;
  const taxRate = product.taxPercent ?? 0;
  const isTaxInclusive = product.taxType === 'inclusive';
  const taxLabel = `${taxRate}% ${isTaxInclusive ? 'incl. tax' : 'excl. tax'}`;

  const isLowStock = typeof product.stock === 'number' && product.stock <= 5;
  const unitLabel = (product.unit || 'NOS').toUpperCase();
  const productId = product.id || product.name;

  return (
    <tr
      className={`group hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a] transition-colors border-b border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] ${
        isSelected ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
      }`}
    >
      {/* 0. Checkbox */}
      {onToggleSelect && (
        <td className="py-3 px-3 align-middle w-[36px]">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(productId)}
            className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
          />
        </td>
      )}

      {/* 1. Item Detail (Avatar + Title + Clean unboxed metadata) */}
      <td className="py-3 px-4 align-middle">
        <div className="flex items-center gap-3.5">
          <ProductAvatar name={product.name} category={product.category} size="md" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#141414] dark:text-[#f0f0f0] truncate max-w-md">
              {product.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span>{product.type === 'service' ? 'Service' : 'Product'}</span>
              {product.category && (
                <>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{product.category}</span>
                </>
              )}
              {product.hsn && (
                <>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px] tabular-nums">
                    HSN: {product.hsn}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* 2. Stock Qty */}
      <td className="py-3 px-4 align-middle tabular-nums">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-sm font-bold ${
              isLowStock
                ? 'text-[#ff4d4f] dark:text-[#ff7875]'
                : 'text-[#141414] dark:text-[#f0f0f0]'
            }`}
          >
            {product.stock ?? 0}
          </span>
          <span className="text-xs font-semibold text-[#595959] dark:text-[#8c8c8c] tracking-wider">
            {unitLabel}
          </span>
        </div>
      </td>

      {/* 3. Selling Price */}
      <td className="py-3 px-4 align-middle tabular-nums">
        <div>
          <div className="text-sm font-semibold text-[#141414] dark:text-[#f0f0f0]">
            {formatCurrency(sellingPrice, currency)}
          </div>
          <div className="text-[11px] text-[#8c8c8c] font-medium mt-0.5">{taxLabel}</div>
        </div>
      </td>

      {/* 4. Purchase Price */}
      <td className="py-3 px-4 align-middle tabular-nums">
        <div>
          <div className="text-sm font-semibold text-[#595959] dark:text-[rgba(255,255,255,0.75)]">
            {formatCurrency(purchasePrice, currency)}
          </div>
          <div className="text-[11px] text-[#8c8c8c] font-medium mt-0.5">{taxLabel}</div>
        </div>
      </td>

      {/* 5. Row Actions (Inline Edit + Context Menu) */}
      <td className="py-3 px-4 align-middle text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-1.5 justify-end">
          {/* Quick Edit button */}
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#595959] hover:text-[#1677ff] dark:text-[#8c8c8c] dark:hover:text-[#69b1ff] bg-white dark:bg-[#1f1f1f] border border-[#d9d9d9] dark:border-[rgba(255,255,255,0.15)] rounded-[4px] opacity-80 group-hover:opacity-100 hover:border-[#1677ff] dark:hover:border-[#1677ff] transition-all shadow-2xs"
          >
            <Edit2 size={12} />
            <span>Edit</span>
          </button>

          {/* Context 3-dot menu */}
          <ProductActionMenu
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onAdjustStock={onAdjustStock}
          />
        </div>
      </td>
    </tr>
  );
};
