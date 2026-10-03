import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, ENDPOINTS } from '@free-gst/api-client';
import { Product, StockAlertSettings } from '@/features/inventory/types';
import { getAllUnits, getCountryConfig } from '@/shared/utils';
import { toast } from '@/shared/components/feedback/Toast';

export function useCatalog() {
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

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    units,
    profileCountry,
    profileCurrency,
    stockAlerts,
    setStockAlerts,
    loading,
    loadProducts,
  };
}

export async function saveProductRecord(product: Partial<Product>): Promise<Product> {
  if (product.id) {
    return apiClient.put<Product>(ENDPOINTS.PRODUCT_BY_ID(product.id), product);
  }
  return apiClient.post<Product>(ENDPOINTS.PRODUCTS, product);
}

export async function deleteProductRecord(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.PRODUCT_BY_ID(id));
}

export async function importProductsFromCSV(csvText: string): Promise<number> {
  const lines = csvText.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return 0;

  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
    if (!cols[0]) continue;
    const prod: Partial<Product> = {
      name: cols[0],
      type: (cols[1] || 'product').toLowerCase() as any,
      category: cols[2] || '',
      hsn: cols[3] || '',
      unit: cols[4] || 'NOS',
      stock: parseFloat(cols[5]) || 0,
      sellingPrice: parseFloat(cols[6]) || 0,
      rate: parseFloat(cols[6]) || 0,
      purchasePrice: parseFloat(cols[7]) || 0,
      taxPercent: parseFloat(cols[8]) || 0,
      taxType: (cols[9] || 'exclusive') as any,
      description: cols[10] || '',
    };
    try {
      await saveProductRecord(prod);
      imported++;
    } catch {
      // Continue importing remaining rows
    }
  }
  return imported;
}
