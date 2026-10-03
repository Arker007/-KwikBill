import { useState, useEffect, useCallback } from 'react';
import { getAllPurchases, savePurchase, deletePurchase, getAllProducts, getProfile } from '../../../store';
import { belongsToProfile, isUnassignedToBusiness } from '@/shared/utils';
import { toast } from '@/shared/components/feedback/Toast';
import { Purchase } from '../types';

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const [rows, prof, prods] = await Promise.all([
        getAllPurchases(),
        getProfile().catch(() => null),
        getAllProducts().catch(() => []),
      ]);
      setOwnerProfile(prof);
      setProducts(prods || []);
      setPurchases((rows || []).filter((r: any) => belongsToProfile(r, prof)));
    } catch {
      toast('Failed to load purchases', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const unassignedPurchases = purchases.filter(isUnassignedToBusiness);

  const assignUnassignedPurchases = async () => {
    await Promise.all(
      unassignedPurchases.map(r =>
        savePurchase({
          ...r,
          ownerGstin: ownerProfile?.gstin || '',
          ownerName: ownerProfile?.businessName || '',
        })
      )
    );
    await loadPurchases();
  };

  const saveBill = async (purchaseData: Purchase) => {
    await savePurchase(purchaseData);
    await loadPurchases();
  };

  const removeBill = async (id: string) => {
    await deletePurchase(id);
    await loadPurchases();
  };

  return {
    purchases,
    products,
    ownerProfile,
    loading,
    unassignedPurchases,
    assignUnassignedPurchases,
    reloadPurchases: loadPurchases,
    saveBill,
    removeBill,
  };
}
