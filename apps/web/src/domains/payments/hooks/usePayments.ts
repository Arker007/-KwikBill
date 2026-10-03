import { useReceipts } from '@/features/receipts/hooks/useReceipts';

export function usePayments() {
  return useReceipts();
}

export { useReceipts };
