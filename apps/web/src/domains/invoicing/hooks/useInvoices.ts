import { useState, useEffect, useCallback } from 'react';
import { getAllBills, saveBill, deleteBill } from '@/store';

export function useInvoices() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllBills();
      setBills(data || []);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const removeInvoice = useCallback(async (id: string) => {
    await deleteBill(id);
    await fetchBills();
  }, [fetchBills]);

  const saveInvoiceRecord = useCallback(async (bill: any, options?: any) => {
    const res = await saveBill(bill, options);
    await fetchBills();
    return res;
  }, [fetchBills]);

  return {
    bills,
    invoices: bills,
    loading,
    error,
    refresh: fetchBills,
    deleteInvoice: removeInvoice,
    saveInvoice: saveInvoiceRecord,
  };
}
