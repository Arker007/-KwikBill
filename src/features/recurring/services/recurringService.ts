import {
  getAllRecurring,
  saveRecurring,
  deleteRecurring,
  getAllClients,
  saveBill,
  getNextInvoiceNumber,
  getProfile,
} from '../../../store';
import { INVOICE_TYPES } from '@/features/invoices/constants';
import { toast } from '@/shared/components/feedback/Toast';
import { RecurringTemplate } from '../types';

export async function fetchRecurringTemplates(): Promise<RecurringTemplate[]> {
  return await getAllRecurring();
}

export async function fetchClientsForRecurring(): Promise<any[]> {
  return await getAllClients();
}

export async function saveRecurringTemplate(template: RecurringTemplate): Promise<void> {
  await saveRecurring(template);
}

export async function deleteRecurringTemplate(id: string): Promise<void> {
  await deleteRecurring(id);
}

export async function toggleTemplateActiveState(tpl: RecurringTemplate): Promise<void> {
  await saveRecurring({ ...tpl, active: !tpl.active });
}

export async function generateBillFromTemplate(tpl: RecurringTemplate): Promise<string> {
  const typeConfig = (INVOICE_TYPES as any)[tpl.invoiceType || 'tax-invoice'] || { prefix: 'INV' };
  const invoiceNumber = await getNextInvoiceNumber(typeConfig.prefix);
  const today = new Date().toISOString().split('T')[0];

  const items = (tpl.items || []).map(i => ({
    name: i.name,
    hsn: i.hsn || '',
    quantity: parseFloat(String(i.quantity)) || 1,
    rate: parseFloat(String(i.rate)) || 0,
    taxPercent: parseFloat(String(i.taxPercent)) || 0,
    discount: parseFloat(String(i.discount)) || 0,
  }));

  const totalAmount = items.reduce((sum, i) => {
    const base = i.quantity * i.rate - i.discount;
    return sum + base + (base * i.taxPercent) / 100;
  }, 0);
  const totalTaxAmount = items.reduce((sum, i) => {
    const base = i.quantity * i.rate - i.discount;
    return sum + (base * i.taxPercent) / 100;
  }, 0);

  const bill = {
    id: invoiceNumber,
    invoiceNumber,
    invoiceDate: today,
    invoiceType: tpl.invoiceType || 'tax-invoice',
    clientName: tpl.clientName,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalTaxAmount: Math.round(totalTaxAmount * 100) / 100,
    status: 'unpaid',
    paidAmount: 0,
    payments: [],
    data: {
      details: { invoiceNumber, invoiceDate: today },
      client: {
        name: tpl.clientName,
        state: tpl.clientState,
        gstin: tpl.clientGstin,
        address: tpl.clientAddress,
      },
      items,
    },
    generatedFrom: tpl.id,
  };

  await saveBill(bill);

  // Advance next date
  const next = new Date(tpl.nextDate || today);
  if (tpl.frequency === 'weekly') next.setDate(next.getDate() + 7);
  else if (tpl.frequency === 'monthly') next.setMonth(next.getMonth() + 1);
  else if (tpl.frequency === 'quarterly') next.setMonth(next.getMonth() + 3);
  else if (tpl.frequency === 'yearly') next.setFullYear(next.getFullYear() + 1);

  await saveRecurring({
    ...tpl,
    nextDate: next.toISOString().split('T')[0],
    lastGenerated: today,
  });

  return invoiceNumber;
}
