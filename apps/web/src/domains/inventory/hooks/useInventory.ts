import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, ENDPOINTS } from '@free-gst/api-client';
import { Product, StockAlertSettings } from '@/features/inventory/types';
import { getAllUnits, getCountryConfig } from '@/shared/utils';
import { toast } from '@/shared/components/feedback/Toast';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<any[]>(getAllUnits());
  const [profileCountry, setProfileCountry] = useState<string>('India');
  const [stockAlerts, setStockAlerts] = useState<StockAlertSettings>({ enabled: true, threshold: 5 });
  const [loading, setLoading] = useState<boolean>(true);

  const profileCurrency = useMemo(() => {
    return getCountryConfig(profileCountry).currency;
  }, [profileCountry]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const [pData, prof] = await Promise.all([
        apiClient.get<Product[]>(ENDPOINTS.PRODUCTS).catch(() => []),
        apiClient.get<any>(ENDPOINTS.PROFILE).catch(() => null),
      ]);
      setProducts(Array.isArray(pData) ? pData : []);
      if (prof?.country) setProfileCountry(prof.country);
      setUnits(getAllUnits());
    } catch {
      toast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const adjustStock = useCallback(async (productId: string, newStock: number, _reason?: string) => {
    try {
      const existing = products.find((p) => p.id === productId);
      if (!existing) return;
      const updated = { ...existing, stock: newStock };
      await apiClient.put<Product>(ENDPOINTS.PRODUCT_BY_ID(productId), updated);
      toast('Stock updated', 'success');
      await loadProducts();
    } catch {
      toast('Failed to update stock', 'error');
    }
  }, [products, loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    units,
    profileCountry,
    profileCurrency,
    stockAlerts,
    loading,
    loadProducts,
    adjustStock,
  };
}

export default useInventory;
