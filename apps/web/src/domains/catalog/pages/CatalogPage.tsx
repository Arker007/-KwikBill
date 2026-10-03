import React, { useState, useRef, useMemo } from 'react';
import { Package, FolderTree, AlertCircle, Coins, Plus, Trash2, Download, CheckSquare } from 'lucide-react';
import { toast } from '@/shared/components/feedback/Toast';
import { confirmAction } from '@/shared/components/feedback/ConfirmModal';
import { useCatalog, saveProductRecord, deleteProductRecord, importProductsFromCSV } from '../hooks/useCatalog';
import { PageHeader } from '@/shared/components/layout';
import { StatCard } from '@/shared/components/ui';
import { formatCurrency } from '@/shared/utils';
import {
  ProductsHeader,
  ProductsToolbar,
  ProductsPagination,
} from '@/features/inventory/components';
import { Product, ProductFormData } from '@/features/inventory/types';
import ProductModal from '../components/ProductModal';
import ProductsTable, { SortField, SortOrder } from '../components/ProductsTable';
import CategoryManagerView from '../components/CategoryManagerModal';

export const CatalogPage: React.FC = () => {
  const { products, units, profileCurrency, loadProducts } = useCatalog();

  const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'groups' | 'price-lists' | 'deleted'>('items');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const csvInputRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [products]);

  const tabCounts = useMemo(() => {
    const activeItems = products.filter((p) => !p.isDeleted);
    const deletedItems = products.filter((p) => p.isDeleted);
    return {
      items: activeItems.length,
      categories: categories.length,
      groups: categories.length,
      priceLists: 1,
      deleted: deletedItems.length,
    };
  }, [products, categories]);

  const inventoryMetrics = useMemo(() => {
    const active = products.filter((p) => !p.isDeleted);
    const lowStock = active.filter((p) => p.trackStock && (Number(p.stock) || 0) <= (Number(p.minStock) || 5));
    const totalValuation = active.reduce((sum, p) => {
      const qty = Number(p.stock) || 0;
      const price = Number(p.purchasePrice) || Number(p.sellingPrice) || 0;
      return sum + (qty * price);
    }, 0);
    return {
      activeCount: active.length,
      lowStockCount: lowStock.length,
      totalValuation,
    };
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (activeTab === 'deleted') {
        return !!p.isDeleted;
      }
      return !p.isDeleted;
    });

    if (selectedCategory) {
      result = result.filter(
        (p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.hsn || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.barcode || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
      } else if (sortField === 'stock') {
        valA = Number(a.stock ?? 0);
        valB = Number(b.stock ?? 0);
      } else if (sortField === 'sellingPrice') {
        valA = Number(a.sellingPrice ?? a.rate ?? 0);
        valB = Number(b.sellingPrice ?? b.rate ?? 0);
      } else if (sortField === 'purchasePrice') {
        valA = Number(a.purchasePrice ?? 0);
        valB = Number(b.purchasePrice ?? 0);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, activeTab, selectedCategory, search, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedProducts.slice(start, start + pageSize);
  }, [filteredAndSortedProducts, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const openAdd = (defaultCategory?: string) => {
    setSelectedProduct(defaultCategory ? { name: '', category: defaultCategory } as Product : null);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditingId(product.id || null);
    setShowForm(true);
  };

  const handleDuplicate = (product: Product) => {
    setSelectedProduct({
      ...product,
      id: undefined,
      name: `${product.name} (Copy)`,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedProduct(null);
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    if (paginatedProducts.every((p) => selectedIds.has(p.id || p.name))) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedProducts.forEach((p) => next.delete(p.id || p.name));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedProducts.forEach((p) => next.add(p.id || p.name));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      await confirmAction({
        title: `Delete ${selectedIds.size} selected item${selectedIds.size !== 1 ? 's' : ''}?`,
        message: 'This will remove the selected items from your active catalog. Existing invoices will stay unchanged.',
        confirmLabel: 'Delete Selected',
        tone: 'danger',
      })
    ) {
      let count = 0;
      for (const id of Array.from(selectedIds)) {
        await deleteProductRecord(id);
        count++;
      }
      toast(`Deleted ${count} item${count !== 1 ? 's' : ''}`, 'success');
      clearSelection();
      loadProducts();
    }
  };

  const handleBulkExportCSV = () => {
    const selectedItems = products.filter((p) => selectedIds.has(p.id || p.name));
    if (selectedItems.length === 0) {
      toast('No items selected to export', 'warning');
      return;
    }
    const headers = ['Name', 'Type', 'Category', 'HSN/SAC', 'Unit', 'Stock', 'Selling Price', 'Purchase Price', 'GST Rate (%)', 'Tax Type', 'Description'];
    const rows = selectedItems.map((p) => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.type || 'product'}"`,
      `"${(p.category || '').replace(/"/g, '""')}"`,
      `"${p.hsn || ''}"`,
      `"${p.unit || 'NOS'}"`,
      p.stock ?? 0,
      p.sellingPrice ?? p.rate ?? 0,
      p.purchasePrice ?? 0,
      p.taxPercent ?? 0,
      `"${p.taxType || 'exclusive'}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `selected_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Exported ${selectedItems.length} items to CSV`, 'success');
  };

  const handleSave = async (form: ProductFormData) => {
    if (!form.name.trim()) {
      toast('Product name is required', 'warning');
      return;
    }
    try {
      const sellingPrice = form.sellingPrice ? parseFloat(form.sellingPrice) : 0;
      const purchasePrice = form.purchasePrice ? parseFloat(form.purchasePrice) : 0;
      const product: Partial<Product> = {
        ...(editingId ? { id: editingId } : {}),
        name: form.name.trim(),
        type: form.type || 'product',
        category: form.category ? form.category.trim() : '',
        hsn: form.hsn.trim(),
        purchasePrice,
        sellingPrice,
        rate: sellingPrice,
        taxPercent: form.taxPercent ? parseFloat(form.taxPercent) : 0,
        taxType: form.taxType || 'exclusive',
        unit: form.unit,
        stock: form.stock ? parseFloat(form.stock) : 0,
        barcode: form.barcode ? form.barcode.trim() : '',
        description: form.description.trim(),
      };
      await saveProductRecord(product);
      toast(editingId ? 'Item updated' : 'Item added', 'success');
      closeForm();
      loadProducts();
    } catch {
      toast('Failed to save item', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (
      await confirmAction({
        title: 'Delete this item?',
        message:
          'Existing invoices using this item will keep their line items unchanged. This item will be removed from your active catalog.',
        confirmLabel: 'Delete',
        tone: 'danger',
      })
    ) {
      try {
        await deleteProductRecord(id);
        toast('Item deleted', 'success');
        loadProducts();
      } catch {
        toast('Failed to delete item', 'error');
      }
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) {
      toast('No products to export', 'warning');
      return;
    }
    const headers = ['Name', 'Type', 'Category', 'HSN/SAC', 'Unit', 'Stock', 'Selling Price', 'Purchase Price', 'GST Rate (%)', 'Tax Type', 'Description'];
    const rows = products.map((p) => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${p.type || 'product'}"`,
      `"${(p.category || '').replace(/"/g, '""')}"`,
      `"${p.hsn || ''}"`,
      `"${p.unit || 'NOS'}"`,
      p.stock ?? 0,
      p.sellingPrice ?? p.rate ?? 0,
      p.purchasePrice ?? 0,
      p.taxPercent ?? 0,
      `"${p.taxType || 'exclusive'}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `products_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Products exported to CSV', 'success');
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = await importProductsFromCSV(text);
      if (imported === 0) {
        toast('CSV file is empty or has no data rows', 'warning');
      } else {
        toast(`Imported ${imported} item${imported !== 1 ? 's' : ''}`, 'success');
        loadProducts();
      }
    } catch {
      toast('Failed to parse CSV file', 'error');
    }
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  return (
    <div className="dashboard-container max-w-7xl mx-auto px-2 sm:px-4 py-3 space-y-5">
      <input
        type="file"
        accept=".csv"
        ref={csvInputRef}
        style={{ display: 'none' }}
        onChange={handleCSVImport}
      />

      <PageHeader
        icon={<Package size={20} />}
        title="Products & Inventory"
        subtitle="Item catalog, stock valuation, HSN/SAC classification, and pricing tiers"
        actions={
          <button
            type="button"
            className="btn btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
            onClick={() => openAdd()}
          >
            <Plus size={14} /> New Product
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Catalog Items"
          value={inventoryMetrics.activeCount}
          subtitle="Active products and services"
          icon={<Package size={20} />}
          variant="primary"
        />
        <StatCard
          title="Active Categories"
          value={tabCounts.categories}
          subtitle="Item classifications"
          icon={<FolderTree size={20} />}
          variant="default"
        />
        <StatCard
          title="Low Stock Warnings"
          value={inventoryMetrics.lowStockCount}
          subtitle="Items at or below reorder level"
          icon={<AlertCircle size={20} />}
          variant={inventoryMetrics.lowStockCount > 0 ? "warning" : "success"}
        />
        <StatCard
          title="Stock Valuation"
          value={formatCurrency(inventoryMetrics.totalValuation)}
          subtitle="Estimated on-hand inventory"
          icon={<Coins size={20} />}
          variant="purple"
        />
      </div>

      <ProductsHeader
        activeTab={activeTab}
        onTabChange={(tab: any) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        counts={tabCounts}
      />

      {activeTab === 'categories' || activeTab === 'groups' ? (
        <CategoryManagerView
          products={products}
          categories={categories}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setActiveTab('items');
          }}
          onAddProductInCategory={(cat) => {
            openAdd(cat);
          }}
        />
      ) : activeTab === 'price-lists' ? (
        <div className="bg-white dark:bg-[#141414] rounded-[12px] border border-[#f0f0f0] dark:border-[rgba(255,255,255,0.08)] p-8 text-center">
          <h3 className="text-base font-semibold text-[#141414] dark:text-[#f0f0f0] mb-1">
            Standard Tier Price List
          </h3>
          <p className="text-xs text-[#8c8c8c] max-w-md mx-auto mb-4">
            Default wholesale and retail pricing tiers linked to your product catalog.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className="text-xs font-semibold text-[#1677ff] hover:underline cursor-pointer"
          >
            Manage item selling prices →
          </button>
        </div>
      ) : (
        <>
          {/* Batch Action Toolbar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs animate-in fade-in duration-150 mb-3">
              <span className="font-semibold flex items-center gap-1.5">
                <CheckSquare size={14} className="text-blue-600 dark:text-blue-400" />
                <span>{selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} selected</span>
              </span>
              <button
                type="button"
                onClick={handleBulkExportCSV}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Download size={13} />
                <span>Export Selected CSV</span>
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Selected</span>
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="ml-auto text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs cursor-pointer"
              >
                Clear selection
              </button>
            </div>
          )}

          <ProductsToolbar
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            category={selectedCategory}
            onCategoryChange={(val) => {
              setSelectedCategory(val);
              setCurrentPage(1);
            }}
            categories={categories}
            onNewItem={() => openAdd()}
            onExportCSV={handleExportCSV}
            onImportCSV={() => csvInputRef.current?.click()}
          />

          <ProductsTable
            products={paginatedProducts}
            currency={profileCurrency}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelectProduct}
            onToggleSelectAll={toggleSelectAllVisible}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={openEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onNewItem={() => openAdd()}
          />

          <ProductsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAndSortedProducts.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}

      <ProductModal
        show={showForm}
        onClose={closeForm}
        onSave={handleSave}
        editingId={editingId}
        product={selectedProduct}
        units={units}
        categories={categories}
      />
    </div>
  );
};

export default CatalogPage;
