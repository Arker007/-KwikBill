import { useState, useEffect } from 'react';
import { getAllBills, getAllExpenses, getProfile } from '@/store';
import { belongsToProfile } from '@/shared/utils';

export function useReports() {
  const [bills, setBills] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
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
    } catch (err) {
      console.error('Failed to load reporting data:', err);
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
    profile,
    loading,
    refetch: loadData,
  };
}

export default useReports;
