import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { AutoComplete, ConfigProvider, Input as AntInput } from 'antd';
import { useIsDarkMode, getAntdTheme } from '@/shared/components/ui/AntdThemeConfig';
import {
  Search,
  Sliders,
  FolderOpen,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ArrowRight,
  X,
  Package,
  Tag,
  GripVertical,
  Eye,
} from 'lucide-react';
import { suggestGstRate } from '@/features/inventory/data/hsnRates';
import { promptAction } from '@/shared/components/feedback/ConfirmModal';
import { toast } from '@/shared/components/feedback/Toast';
import { Select, Input, Switch, Button, Checkbox } from '@/shared/components/ui';

interface InvoiceItemsTableProps {
  items: any[];
  invoiceOptions: any;
  setInvoiceOptions: React.Dispatch<React.SetStateAction<any>>;
  taxInclusive: boolean;
  setTaxInclusive: (val: boolean) => void;
  units: any[];
  countryTaxRates: number[];
  filterUnitsByMode: (units: any[], mode: string) => any[];
  profile: any;
  getProductSuggestions: (id: string) => any[];
  handleItemChange: (id: string, field: string, val: any) => void;
  selectProduct: (id: string, product: any) => void;
  setProductSearch: (data: { itemId: string | null; query: string }) => void;
  handleAddCustomUnit: (id: string) => void;
  handleRemoveCustomUnit: (label: string) => void;
  removeItem: (id: string) => void;
  clampNonNeg: (val: any) => number;
  addItem: () => void;
  addProductItem?: (product: any, qty?: number) => void;
  formatCurrency: (amount: number, currency: string) => string;
  onOpenAddProductModal?: (initialName?: string) => void;
  onOpenAiOcr?: () => void;
  onOpenSettings?: () => void;
  onSaveDraft?: () => void;
  onSavePrint?: () => void;
  onSave?: () => void;
  products?: any[];
  invoiceType?: string;
}

export function InvoiceItemsTable({
  items,
  invoiceOptions,
  setInvoiceOptions,
  taxInclusive,
  setTaxInclusive,
  units,
  countryTaxRates,
  filterUnitsByMode,
  profile,
  getProductSuggestions,
  handleItemChange,
  selectProduct,
  setProductSearch,
  handleAddCustomUnit,
  handleRemoveCustomUnit,
  removeItem,
  clampNonNeg,
  addItem,
  addProductItem,
  formatCurrency,
  onOpenAddProductModal,
  onOpenAiOcr,
  onOpenSettings,
  onSaveDraft,
  onSavePrint,
  onSave,
  products = [],
  invoiceType = 'tax-invoice',
}: InvoiceItemsTableProps) {
  const [topSearchQuery, setTopSearchQuery] = useState('');
  const [selectedTopProduct, setSelectedTopProduct] = useState<any | null>(null);
  const [topQty, setTopQty] = useState('1');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [allDiscountPercent, setAllDiscountPercent] = useState('');
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [productPickerIdx, setProductPickerIdx] = useState(-1);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsListRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowProductSuggestions(false);
        setProductPickerIdx(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for top search bar
  const filteredProducts = useMemo(() => {
    const q = topSearchQuery.trim().toLowerCase();
    return (products || []).filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      const name = (p.name || '').toLowerCase();
      const hsn = (p.hsn || '').toLowerCase();
      const barcode = (p.barcode || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(q) || hsn.includes(q) || barcode.includes(q) || cat.includes(q) || desc.includes(q);
    });
  }, [products, selectedCategory, topSearchQuery]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set((products || []).map((p) => p.category).filter(Boolean)))],
    [products]
  );

  const handleSelectProduct = (prod: any, directAdd = false) => {
    setSelectedTopProduct(prod);
    setTopSearchQuery(prod.name || '');
    setShowProductSuggestions(false);
    setProductPickerIdx(-1);

    if (directAdd) {
      const rawQty = parseFloat(topQty);
      const qty = !isNaN(rawQty) && rawQty > 0 ? rawQty : 1;
      if (addProductItem) {
        addProductItem(prod, qty);
      } else {
        const emptyItem = items.find((it) => !it.name?.trim() && !it.rate && !it.productId);
        if (emptyItem) {
          selectProduct(emptyItem.id, prod);
          handleItemChange(emptyItem.id, 'quantity', qty);
        } else {
          addItem();
        }
      }
      setTopSearchQuery('');
      setSelectedTopProduct(null);
      setTopQty('1');
    }
  };

  const handleAddTopProduct = () => {
    const rawQty = parseFloat(topQty);
    const qty = !isNaN(rawQty) && rawQty > 0 ? rawQty : 1;
    const prod = selectedTopProduct;
    const customName = topSearchQuery.trim();

    if (!prod && !customName) {
      return;
    }

    if (addProductItem) {
      addProductItem(prod || customName, qty);
    } else {
      const emptyItem = items.find((it) => !it.name?.trim() && !it.rate && !it.productId);
      if (prod) {
        if (emptyItem) {
          selectProduct(emptyItem.id, prod);
          handleItemChange(emptyItem.id, 'quantity', qty);
        } else {
          addItem();
        }
      } else if (customName && emptyItem) {
        handleItemChange(emptyItem.id, 'name', customName);
        handleItemChange(emptyItem.id, 'quantity', qty);
      }
    }

    setTopSearchQuery('');
    setSelectedTopProduct(null);
    setTopQty('1');
    setShowProductSuggestions(false);
    setProductPickerIdx(-1);
  };

  const isDark = useIsDarkMode();

  const autoCompleteOptions = useMemo(() => {
    return filteredProducts.map((p, idx) => {
      const price = p.sellingPrice ?? p.rate ?? 0;
      const tax =
        p.taxPercent !== undefined && p.taxPercent !== null
          ? p.taxPercent
          : p.gstRate ?? p.taxRate ?? 18;
      const rawStock = p.stock ?? p.quantity ?? 0;
      const stockStr =
        typeof rawStock === 'number' ? rawStock.toFixed(2) : parseFloat(rawStock || 0).toFixed(2);
      const unitStr = p.unit || 'NOS';
      const catStr = p.category;
      const hsnCode = p.hsn || p.barcode;

      return {
        value: p.name,
        key: p.id || `${p.name}-${idx}`,
        product: p,
        label: (
          <div
            key={p.id || `${p.name}-${idx}`}
            className="flex items-center justify-between py-2 px-1 border-b border-slate-100/80 dark:border-slate-800/60 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelectProduct(p, true);
            }}
          >
            {/* Left Column: Product Name & Metadata */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-[13px] leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {p.name}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] mt-1 flex-wrap">
                <span className="text-red-500 font-semibold">
                  Avl. qty: {stockStr}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{unitStr}</span>
                {catStr && (
                  <span className="text-indigo-700 dark:text-indigo-300 font-medium">{catStr}</span>
                )}
                {hsnCode && (
                  <span className="text-slate-400 font-normal">{hsnCode}</span>
                )}
              </div>
            </div>

            {/* Right Column: Price & Tax */}
            <div className="text-right shrink-0">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono">
                {formatCurrency(price, profile?.currency || 'INR')}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                + tax {tax}%
              </div>
            </div>
          </div>
        ),
      };
    });
  }, [filteredProducts, formatCurrency, profile, handleSelectProduct]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showProductSuggestions) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setShowProductSuggestions(true);
        return;
      }
    }

    const maxItems = Math.min(filteredProducts.length, 30);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showProductSuggestions) {
        setShowProductSuggestions(true);
        setProductPickerIdx(0);
      } else {
        setProductPickerIdx((prev) => (prev < maxItems - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setProductPickerIdx((prev) => (prev > 0 ? prev - 1 : maxItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (showProductSuggestions && productPickerIdx >= 0 && productPickerIdx < filteredProducts.length) {
        handleSelectProduct(filteredProducts[productPickerIdx]);
      } else {
        handleAddTopProduct();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowProductSuggestions(false);
      setProductPickerIdx(-1);
    }
  };

  const handleApplyDiscountToAll = (percentStr: string) => {
    setAllDiscountPercent(percentStr);
    const num = parseFloat(percentStr);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      items.forEach((it) => {
        handleItemChange(it.id, 'discount', num);
        handleItemChange(it.id, 'discountType', 'percent');
      });
    }
  };

  // Summary counts
  const totalItemsCount = items.length;
  const totalQuantity = items.reduce((acc, it) => acc + (parseFloat(it.quantity) || 0), 0);

  const isQuotation = invoiceType === 'quotation' || invoiceType === 'estimate';

  return (
    <section className="bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden" id="products-services-section">
      {/* Section Top Title Bar */}
      <div className="p-3 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#1f1f1f]">
        <div className="flex items-center space-x-2">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200">Products &amp; Services</h2>
          <HelpCircle
            className="text-slate-400 w-3.5 h-3.5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition"
            aria-label="List of line items, products or services billed"
          />
          <button
            type="button"
            onClick={() => (onOpenAddProductModal ? onOpenAddProductModal() : addItem())}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs font-semibold pl-2 flex items-center space-x-1 transition cursor-pointer"
          >
            <Plus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Add new Product?</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Column preferences &amp; document settings"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (items.length > 0 && confirm('Are you sure you want to clear all items?')) {
                items.forEach((it) => removeItem(it.id));
              }
            }}
            className="text-slate-500 hover:text-red-600 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Clear all items"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Add Product Controls & Search in Soft Light Blue Container */}
      <div className="p-3.5 m-3 bg-[#eef5fe] dark:bg-slate-800/60 rounded-xl border border-blue-100/80 dark:border-slate-700 flex flex-wrap items-center gap-2.5 relative">
        {/* Category Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCategoryMenu((v) => !v)}
            className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-slate-700 rounded-[6px] px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center space-x-2 shadow-2xs hover:border-slate-300 cursor-pointer h-9"
          >
            <span>{selectedCategory === 'All' ? 'Filter Category' : selectedCategory}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showCategoryMenu && (
            <div
              className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-700 rounded-[6px] shadow-lg py-1 z-40 text-xs"
              onMouseLeave={() => setShowCategoryMenu(false)}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowCategoryMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                    selectedCategory === cat ? 'text-blue-600 font-semibold bg-blue-50 dark:bg-blue-950/40' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ant Design Product Search Input */}
        <div ref={searchContainerRef} className="flex-1 min-w-[280px] relative" id="product-search-container">
          <ConfigProvider theme={getAntdTheme(isDark)}>
            <AutoComplete
              className="w-full"
              options={autoCompleteOptions}
              value={topSearchQuery}
              onSearch={(text) => {
                setTopSearchQuery(text);
                setShowProductSuggestions(true);
              }}
              onSelect={(_val, option) => {
                if (option?.product) {
                  handleSelectProduct(option.product, true);
                }
              }}
              open={showProductSuggestions}
              onFocus={() => setShowProductSuggestions(true)}
              popupMatchSelectWidth={false}
              popupRender={(menu) => (
                <div className="bg-white dark:bg-[#1f1f1f] rounded-[6px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 min-w-[540px] max-w-[650px] z-50">
                  <div className="max-h-[380px] overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      menu
                    ) : (
                      <div className="py-6 px-4 text-center text-slate-500 text-xs font-medium">
                        {topSearchQuery ? `No products matching "${topSearchQuery}"` : 'Type to search products'}
                      </div>
                    )}
                  </div>
                  {/* Bottom Footer: Add New Product */}
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowProductSuggestions(false);
                      if (onOpenAddProductModal) {
                        onOpenAddProductModal(topSearchQuery.trim());
                      }
                    }}
                    className="bg-[#f0f2f5] dark:bg-slate-800/90 py-3.5 px-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer hover:bg-[#e2e5ea] dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
                      +
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Add New Product &rarr;
                    </span>
                  </div>
                </div>
              )}
            >
              <AntInput
                ref={searchInputRef as any}
                id="product-search-input"
                prefix={<Search className="w-4 h-4 text-slate-400 mr-1.5 shrink-0" />}
                placeholder="Search or scan barcode for existing products"
                size="middle"
                className="w-full h-9 !rounded-[6px] !border !border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-[#141414] font-medium text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs focus:!border-blue-500"
                allowClear
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTopProduct();
                  } else if (e.key === 'Escape') {
                    setShowProductSuggestions(false);
                  }
                }}
              />
            </AutoComplete>
          </ConfigProvider>
        </div>

        {/* Quantity Input */}
        <div className="w-24">
          <ConfigProvider theme={getAntdTheme(isDark)}>
            <AntInput
              size="middle"
              placeholder="Qty"
              type="number"
              min="0"
              step="any"
              value={topQty}
              onChange={(e) => setTopQty(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTopProduct();
                }
              }}
              className="w-full h-9 !rounded-[6px] !border !border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-[#141414] !text-left px-3 font-medium text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </ConfigProvider>
        </div>

        {/* Add to Bill Button */}
        <button
          type="button"
          onClick={() => handleAddTopProduct()}
          disabled={!topSearchQuery.trim() && !selectedTopProduct}
          className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-[6px] shadow-2xs transition-colors flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>+ Add to Bill</span>
        </button>
      </div>

      {/* Product Table Header & Body */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] table-fixed border-collapse text-xs">
          <colgroup>
            <col className="w-[28px]" />
            <col className="w-[30%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[15%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead>
            <tr className="bg-[#fcfcfb] dark:bg-slate-900/60 border-y border-slate-200/80 text-[11px] font-semibold text-slate-500 select-none">
              <th className="py-2.5 px-1 text-center"></th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">Product Name</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">Quantity</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">Unit Price</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">Price with Tax</th>
              <th className="px-3 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex items-center space-x-1 cursor-pointer">
                  <span>Discount on Total Amount</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="px-3 py-2.5 text-right font-semibold text-slate-600 dark:text-slate-300">
                <div className="font-bold">Total</div>
                <div className="text-[10px] font-normal text-slate-400">Net Amount + Tax</div>
              </th>
            </tr>
          </thead>

          {items.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center bg-white dark:bg-[#141414] border-b border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative mb-3">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <FolderOpen className="text-slate-300 dark:text-slate-600 w-8 h-8" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-slate-200/80 dark:bg-slate-700 rounded-full w-6 h-6 flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                        ...
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                      Search existing products to add to this list or add new product to get started! 🚀
                    </p>
                    <button
                      type="button"
                      onClick={() => (onOpenAddProductModal ? onOpenAddProductModal() : addItem())}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded text-xs transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>+ Add New Product</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#1f1f1f]">
              {items.map((item, idx) => {
                const qty = parseFloat(item.quantity) || 0;
                const rate = parseFloat(item.rate) || 0;
                const taxRate = parseFloat(item.taxPercent) ?? 18;
                const discVal = parseFloat(item.discount) || 0;
                const isPerc = item.discountType === 'percent';

                const baseAmount = qty * rate;
                const discAmount = isPerc ? (baseAmount * discVal) / 100 : discVal;
                const taxableLine = Math.max(0, baseAmount - discAmount);
                const lineTax = (taxableLine * taxRate) / 100;
                const lineTotal = taxableLine + lineTax;
                const unitPriceWithTax = rate * (1 + taxRate / 100);

                return (
                  <tr
                    key={item.id || idx}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition group"
                  >
                    {/* Grip handle */}
                    <td className="py-3.5 px-1 text-center align-top pt-4">
                      <div className="text-slate-300 hover:text-slate-500 cursor-grab flex justify-center">
                        <GripVertical className="w-4 h-4" />
                      </div>
                    </td>

                    {/* Product Name & Details */}
                    <td className="px-3 py-3.5 align-top">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug">
                        {item.name || 'Plastic Sheet 2 ft × 2 ft × 18 mm Thickness'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center space-x-2">
                        <span>#{idx + 1}</span>
                      </div>

                      <div className="mt-2">
                        {item.description || item._descOpen ? (
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Enter description..."
                            className="w-full text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 focus:outline-none"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleItemChange(item.id, '_descOpen', true)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-medium cursor-pointer transition-colors"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>Show Description</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Quantity & Unit Group Input */}
                    <td className="px-3 py-3.5 align-top">
                      <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-[6px] bg-white dark:bg-[#141414] overflow-hidden shadow-2xs">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', clampNonNeg(e.target.value))}
                          className="w-16 h-9 px-2.5 text-slate-900 dark:text-slate-100 font-semibold text-xs text-left outline-none focus:bg-blue-50/30 dark:focus:bg-blue-950/30"
                        />
                        <div className="border-l border-slate-200 dark:border-slate-700 px-2.5 py-2 text-xs text-slate-500 font-semibold bg-slate-50/60 dark:bg-slate-800/60 shrink-0 select-none">
                          {item.unit || 'NOS'}
                        </div>
                      </div>
                    </td>

                    {/* Unit Price Input */}
                    <td className="px-3 py-3.5 align-top">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', clampNonNeg(e.target.value))}
                        className="w-24 h-9 px-3 text-slate-900 dark:text-slate-100 font-semibold text-xs text-left border border-slate-200 dark:border-slate-700 rounded-[6px] bg-white dark:bg-[#141414] outline-none focus:border-blue-500 shadow-2xs"
                      />
                    </td>

                    {/* Price with Tax Input */}
                    <td className="px-3 py-3.5 align-top">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={unitPriceWithTax.toFixed(2)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const newRate = val / (1 + taxRate / 100);
                          handleItemChange(item.id, 'rate', newRate);
                        }}
                        className="w-24 h-9 px-3 text-slate-900 dark:text-slate-100 font-semibold text-xs text-left border border-slate-200 dark:border-slate-700 rounded-[6px] bg-white dark:bg-[#141414] outline-none focus:border-blue-500 shadow-2xs"
                      />
                    </td>

                    {/* Discount Input Group */}
                    <td className="px-3 py-3.5 align-top">
                      <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-[6px] bg-white dark:bg-[#141414] overflow-hidden shadow-2xs">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.discount || '0'}
                          onChange={(e) => handleItemChange(item.id, 'discount', clampNonNeg(e.target.value))}
                          className="w-14 h-9 px-2 text-slate-900 dark:text-slate-100 font-semibold text-xs text-left outline-none focus:bg-blue-50/30"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newType = item.discountType === 'percent' ? 'fixed' : 'percent';
                            handleItemChange(item.id, 'discountType', newType);
                          }}
                          className="border-l border-slate-200 dark:border-slate-700 px-2.5 h-9 text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-50/60 dark:bg-slate-800/60 flex items-center space-x-1 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <span>{item.discountType === 'percent' ? '%' : '₹'}</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </td>

                    {/* Total Cell with Top-Right Trash Icon */}
                    <td className="px-3 py-3.5 align-top text-right">
                      <div className="flex flex-col items-end">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-0.5 cursor-pointer mb-1.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5 fill-red-50 text-red-500" />
                        </button>
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm tracking-tight font-mono">
                          {lineTotal.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {taxableLine.toFixed(2)} + {lineTax.toFixed(2)} ({taxRate}%)
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      {/* Bottom Discount & Additional Charges Summary Row */}
      <div className="p-3.5 bg-[#fcfcfb] dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80">
        <div className="flex flex-col space-y-1.5">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Apply discount(%) to all items?</span>
            <HelpCircle className="text-slate-400 w-3 h-3 cursor-pointer" />
          </div>
          <input
            className="w-20 h-8 border-2 border-emerald-600 dark:border-emerald-500 rounded-[6px] px-2.5 font-bold text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-[#141414] focus:outline-none shadow-2xs"
            type="number"
            min="0"
            max="100"
            value={allDiscountPercent}
            onChange={(e) => handleApplyDiscountToAll(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-500 font-medium">
            Items: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{totalItemsCount}</strong>, Qty:{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{totalQuantity.toFixed(3)}</strong>
          </span>
          <button
            type="button"
            onClick={onOpenSettings}
            className="px-3.5 py-1.5 rounded-[6px] border border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 bg-white dark:bg-[#141414] hover:bg-blue-50 dark:hover:bg-blue-950/40 font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Additional Charges</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default InvoiceItemsTable;
