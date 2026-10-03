import { useExpenses } from '@/features/expenses/hooks/useExpenses';

export function useExpenseTracking() {
  return useExpenses();
}

export { useExpenses };
