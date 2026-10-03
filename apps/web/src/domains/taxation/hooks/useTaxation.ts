import { useState, useEffect } from 'react';
import { getAllBills, getAllExpenses, getAllPurchases, getProfile } from '@/store';
import { belongsToProfile } from '@/shared/utils';

export function useTaxation() {
  const [bills, setBills] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [b, e, p] = await Promise.all([
        getAllBills(),
        getAllExpenses(),
        getProfile().catch(() => ({})),
      ]);
      setBills((b || []).filter((bill: any) => belongsToProfile(bill, p)));
      setExpenses(e || []);
      setProfile(p || {});
      try {
        const pur = await getAllPurchases();
        setPurchases(pur || []);
      } catch {
        /* ignore older servers without purchases endpoint */
      }
    } catch (err) {
      console.error('Failed to load taxation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    bills,
    expenses,
    purchases,
    profile,
    loading,
    refetch: loadData,
  };
}
