import { useRecurring } from '@/features/recurring/hooks/useRecurring';

export function useRecurringBilling() {
  return useRecurring();
}

export { useRecurring };
