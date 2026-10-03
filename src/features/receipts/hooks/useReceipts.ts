import { useState, useEffect, useCallback } from 'react';
import { getAllReceipts, getAllBills, getProfile } from '../../../store';
import { toast } from '@/shared/components/feedback/Toast';
import { Receipt } from '../types';

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [recs, bls, prof] = await Promise.all([
        getAllReceipts(),
        getAllBills(),
        getProfile().catch(() => ({})),
      ]);
      setReceipts(recs || []);
      setBills(bls || []);
      setProfile(prof || {});
    } catch {
      toast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unpaidBills = bills.filter(b => b.status !== 'paid');

  return {
    receipts,
    bills,
    profile,
    unpaidBills,
    loading,
    reload: loadData,
  };
}
