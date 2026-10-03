import {
  fetchCustomersList,
  saveCustomerRecord,
  deleteCustomerRecord,
  fetchBillsList,
  deleteBillRecord,
  fetchProfileRecord,
  importCustomersFromCSV,
  parseCSVLine,
} from '../../../../apps/web/src/domains/customers/hooks/useCustomers';
import { saveBill as storeSaveBill } from '@/store';

export const fetchClients = fetchCustomersList;
export const saveClient = saveCustomerRecord;
export const deleteClient = deleteCustomerRecord;
export const fetchBills = fetchBillsList;
export const deleteBill = deleteBillRecord;
export const fetchProfile = fetchProfileRecord;
export const importClientsFromCSV = importCustomersFromCSV;
export { parseCSVLine };

export async function saveBill(bill: any, options?: { overwrite?: boolean }): Promise<void> {
  await storeSaveBill(bill, options);
}
