import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiClient, ENDPOINTS } from '@free-gst/api-client';
import {
  getAllClients,
  saveClient as storeSaveClient,
  deleteClient as storeDeleteClient,
  getAllBills,
  saveBill as storeSaveBill,
  deleteBill as storeDeleteBill,
  getProfile,
} from '@/store';
import { Client, ClientStats, ClientAgingResult } from '@/features/clients/types';
import { toast } from '@/shared/components/feedback/Toast';

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export async function fetchCustomersList(): Promise<Client[]> {
  try {
    return await apiClient.get<Client[]>(ENDPOINTS.CLIENTS);
  } catch {
    return await getAllClients();
  }
}

export async function saveCustomerRecord(clientData: Partial<Client>): Promise<any> {
  try {
    if (clientData.id) {
      return await apiClient.put(ENDPOINTS.CLIENT_BY_ID(clientData.id), clientData);
    } else {
      return await apiClient.post(ENDPOINTS.CLIENTS, clientData);
    }
  } catch {
    return await storeSaveClient(clientData);
  }
}

export async function deleteCustomerRecord(id: string): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.CLIENT_BY_ID(id));
  } catch {
    await storeDeleteClient(id);
  }
}

export async function fetchBillsList(): Promise<any[]> {
  try {
    return await apiClient.get<any[]>(ENDPOINTS.BILLS);
  } catch {
    return await getAllBills();
  }
}

export async function deleteBillRecord(id: string): Promise<void> {
  try {
    await apiClient.delete(ENDPOINTS.BILL_BY_ID(id));
  } catch {
    await storeDeleteBill(id);
  }
}

export async function fetchProfileRecord(): Promise<any> {
  try {
    return await apiClient.get<any>(ENDPOINTS.PROFILE);
  } catch {
    return await getProfile().catch(() => ({}));
  }
}

export async function importCustomersFromCSV(fileText: string): Promise<number> {
  const lines = fileText.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return 0;

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
  let imported = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim();
    });
    const name = row.name || row.client || row['client name'] || '';
    if (!name) continue;

    await saveCustomerRecord({
      name,
      address: row.address || '',
      state: row.state || '',
      gstin: row.gstin || '',
      email: row.email || '',
      phone: row.phone || '',
    });
    imported++;
  }

  return imported;
}

export function useCustomers() {
  const [clients, setClients] = useState<Client[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [profileCountry, setProfileCountry] = useState<string>('');
  const [profileForStatement, setProfileForStatement] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [c, b, p] = await Promise.all([
        fetchCustomersList(),
        fetchBillsList(),
        fetchProfileRecord(),
      ]);
      setClients(c || []);
      setBills(b || []);
      setProfileForStatement(p || null);
      if (p?.country) setProfileCountry(p.country);
    } catch {
      toast('Failed to load customers data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const billsByClient = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const b of bills) {
      const key = (b.clientName || '').toLowerCase();
      let arr = map.get(key);
      if (!arr) {
        arr = [];
        map.set(key, arr);
      }
      arr.push(b);
    }
    for (const arr of map.values()) {
      arr.sort((a: any, b: any) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
    }
    return map;
  }, [bills]);

  const statsByClient = useMemo(() => {
    const map = new Map<string, ClientStats>();
    for (const [key, cBills] of billsByClient) {
      const total = cBills.reduce((s: number, b: any) => s + (b.totalAmount || 0), 0);
      const paid = cBills.reduce((s: number, b: any) => {
        const fromPayments = (b.payments || []).reduce((ps: number, p: any) => ps + (Number(p.amount) || 0), 0);
        if (fromPayments > 0) return s + fromPayments;
        if (typeof b.paidAmount === 'number' && b.paidAmount > 0) return s + b.paidAmount;
        if (b.status === 'paid') return s + (b.totalAmount || 0);
        return s;
      }, 0);
      map.set(key, { total, paid, unpaid: total - paid, count: cBills.length });
    }
    return map;
  }, [billsByClient]);

  const EMPTY_BILLS: any[] = useMemo(() => [], []);

  const getClientBills = useCallback(
    (clientName: string): any[] => {
      return billsByClient.get((clientName || '').toLowerCase()) || EMPTY_BILLS;
    },
    [billsByClient, EMPTY_BILLS]
  );

  const getClientStats = useCallback(
    (clientName: string): ClientStats => {
      return (
        statsByClient.get((clientName || '').toLowerCase()) || {
          total: 0,
          paid: 0,
          unpaid: 0,
          count: 0,
        }
      );
    },
    [statsByClient]
  );

  const bucketAge = (days: number): 'current' | 'd31_60' | 'd61_90' | 'd90plus' => {
    if (days <= 30) return 'current';
    if (days <= 60) return 'd31_60';
    if (days <= 90) return 'd61_90';
    return 'd90plus';
  };

  const getClientAging = useCallback(
    (clientName: string): ClientAgingResult => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const buckets = { current: 0, d31_60: 0, d61_90: 0, d90plus: 0, total: 0 };
      const unpaidBills: any[] = [];
      for (const b of getClientBills(clientName)) {
        const outstanding = (b.totalAmount || 0) - (b.paidAmount || 0);
        if (outstanding <= 0.01) continue;
        const ref = b.data?.details?.dueDate || b.invoiceDate;
        const dueDate = ref ? new Date(ref) : today;
        const ageDays = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / 86400000));
        const bucket = bucketAge(ageDays);
        buckets[bucket] += outstanding;
        buckets.total += outstanding;
        unpaidBills.push({ bill: b, ageDays, outstanding });
      }
      return { buckets, unpaidBills };
    },
    [getClientBills]
  );

  return {
    clients,
    bills,
    loading,
    profileCountry,
    profileForStatement,
    loadData,
    getClientBills,
    getClientStats,
    getClientAging,
  };
}

export default useCustomers;
