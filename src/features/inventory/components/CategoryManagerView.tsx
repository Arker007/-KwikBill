import React, { useState } from 'react';
import { Tag, Plus, ArrowRight, Package } from 'lucide-react';
import { Product } from '../types';

export interface CategoryManagerViewProps {
  products: Product[];
  categories: string[];
  onSelectCategory: (cat: string) => void;
  onAddProductInCategory: (cat: string) => void;
}

export const CategoryManagerView: React.FC<CategoryManagerViewProps> = ({
  products,
  categories,
  onSelectCategory,
  onAddProductInCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  // Group products by category
  const categoryStats = categories.map((cat) => {
    const matched = products.filter(
      (p) => (p.category || '').toLowerCase() === cat.toLowerCase()
    );
    const totalVal = matched.reduce(
      (sum, p) => sum + (p.stock || 0) * (p.sellingPrice || p.rate || 0),
      0
    );
    return {
      name: cat,
      count: matched.length,
      totalVal,
    };
  });

  const uncategorized = products.filter((p) => !p.category || p.category.trim() === '');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#141414] p-4 rounded-[12px] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] shadow-xs">
        <div className="flex items-center gap-2">
          <Tag size={18} className="text-[#1677ff]" />
          <div>
            <h3 className="text-sm font-semibold text-[#141414] dark:text-[#f0f0f0] m-0">
              Product Categories ({categories.length})
            </h3>
            <p className="text-xs text-[#8c8c8c] mt-0.5">
              Organize your items into logical billing and inventory categories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            className="px-3 py-1.5 text-xs bg-white dark:bg-[#1f1f1f] border border-[#d9d9d9] dark:border-[rgba(255,255,255,0.18)] rounded-[6px] focus:outline-none focus:border-[#1677ff]"
            placeholder="New Category Name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newCategoryName.trim()) {
                onAddProductInCategory(newCategoryName.trim());
                setNewCategoryName('');
              }
            }}
          />
          <button
            type="button"
            disabled={!newCategoryName.trim()}
            onClick={() => {
              if (newCategoryName.trim()) {
                onAddProductInCategory(newCategoryName.trim());
                setNewCategoryName('');
              }
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#1677ff] hover:bg-[#4096ff] disabled:opacity-50 rounded-[6px] transition-all shadow-xs"
          >
            <Plus size={13} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {categoryStats.map((cat) => (
          <div
            key={cat.name}
            className="bg-white dark:bg-[#141414] p-4 rounded-[10px] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] hover:border-[#1677ff] dark:hover:border-[#1677ff] transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#141414] dark:text-[#f0f0f0] capitalize">
                  {cat.name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#e6f4ff] text-[#1677ff] dark:bg-[rgba(22,119,255,0.2)] dark:text-[#69b1ff]">
                  {cat.count} items
                </span>
              </div>
              <p className="text-xs text-[#8c8c8c]">
                Stock Valuation:{' '}
                <span className="font-semibold text-[#595959] dark:text-[rgba(255,255,255,0.75)]">
                  ₹ {cat.totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#f0f0f0] dark:border-[rgba(255,255,255,0.06)]">
              <button
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#1677ff] hover:underline"
              >
                <span>View items</span>
                <ArrowRight size={12} />
              </button>
              <button
                type="button"
                onClick={() => onAddProductInCategory(cat.name)}
                className="text-xs text-[#8c8c8c] hover:text-[#141414] dark:hover:text-white"
              >
                + Add item
              </button>
            </div>
          </div>
        ))}

        {uncategorized.length > 0 && (
          <div className="bg-white dark:bg-[#141414] p-4 rounded-[10px] border border-dashed border-[#d9d9d9] dark:border-[rgba(255,255,255,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#8c8c8c]">Uncategorized</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#f5f5f5] text-[#8c8c8c] dark:bg-[#262626]">
                  {uncategorized.length} items
                </span>
              </div>
              <p className="text-xs text-[#8c8c8c]">Items without any designated category.</p>
            </div>
            <div className="pt-3 mt-3 border-t border-[#f0f0f0] dark:border-[rgba(255,255,255,0.06)]">
              <button
                type="button"
                onClick={() => onSelectCategory('')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#1677ff] hover:underline"
              >
                <span>View uncategorized</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
