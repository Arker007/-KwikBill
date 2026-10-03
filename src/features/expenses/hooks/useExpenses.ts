import { useState, useEffect, useCallback } from 'react';
import { fetchExpenses, fetchProfile, assignUnassignedExpenses as assignService } from '../services/expenseService';
import { Expense } from '../types';
import { toast } from '../../../shared/components/feedback/Toast';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [unassignedExpenses, setUnassignedExpenses] = useState<Expense[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const prof = await fetchProfile().catch(() => null);
      setOwnerProfile(prof);
      const { expenses: rows, unassigned } = await fetchExpenses(prof);
      setExpenses(rows);
      setUnassignedExpenses(unassigned);
    } catch {
      toast('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const assignUnassigned = async () => {
    try {
      await assignService(unassignedExpenses, ownerProfile);
      await loadExpenses();
    } catch {
      toast('Failed to assign expenses', 'error');
    }
  };

  return {
    expenses,
    unassignedExpenses,
    ownerProfile,
    loading,
    loadExpenses,
    assignUnassigned,
  };
}
