import { getAllExpenses, saveExpense as storeSaveExpense, deleteExpense as storeDeleteExpense, getProfile } from '../../../store';
import { belongsToProfile, isUnassignedToBusiness, toCsvLine } from '@/shared/utils';
import { Expense } from '../types';

export const EXPENSE_CATEGORIES = [
  { name: 'Office Rent', itrHead: 'business' as const },
  { name: 'Utilities', itrHead: 'business' as const },
  { name: 'Internet & Phone', itrHead: 'business' as const },
  { name: 'Software & Tools', itrHead: 'business' as const },
  { name: 'Travel', itrHead: 'business' as const },
  { name: 'Meals & Entertainment', itrHead: 'business' as const },
  { name: 'Office Supplies', itrHead: 'business' as const },
  { name: 'Salary & Wages', itrHead: 'salary' as const },
  { name: 'Professional Fees', itrHead: 'business' as const },
  { name: 'Insurance', itrHead: 'business' as const },
  { name: 'Marketing & Ads', itrHead: 'business' as const },
  { name: 'Raw Materials', itrHead: 'business' as const },
  { name: 'Shipping & Courier', itrHead: 'business' as const },
  { name: 'Repairs & Maintenance', itrHead: 'business' as const },
  { name: 'Bank Charges', itrHead: 'business' as const },
  { name: 'GST Paid', itrHead: 'business' as const },
  { name: 'Asset Purchase', itrHead: 'depreciation' as const },
  { name: 'Personal / Drawings', itrHead: 'notDeductible' as const },
  { name: 'Other', itrHead: 'business' as const },
];

export const CATEGORY_NAMES = EXPENSE_CATEGORIES.map((c) => c.name);

export const PAYMENT_MODES = ['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Card', 'Other'];

export async function fetchExpenses(profile: any): Promise<{ expenses: Expense[]; unassigned: Expense[] }> {
  const rows = await getAllExpenses();
  const ownerExpenses = (rows || []).filter((r: any) => belongsToProfile(r, profile));
  const unassignedExpenses = (rows || []).filter(isUnassignedToBusiness);
  return { expenses: ownerExpenses, unassigned: unassignedExpenses };
}

export async function saveExpense(expense: Partial<Expense>): Promise<void> {
  await storeSaveExpense(expense);
}

export async function deleteExpense(id: string): Promise<void> {
  await storeDeleteExpense(id);
}

export async function fetchProfile(): Promise<any> {
  return await getProfile();
}

export async function assignUnassignedExpenses(unassignedExpenses: Expense[], ownerProfile: any): Promise<void> {
  await Promise.all(
    unassignedExpenses.map((r) =>
      saveExpense({
        ...r,
        ownerGstin: ownerProfile?.gstin || '',
        ownerName: ownerProfile?.businessName || '',
      })
    )
  );
}

export function exportExpensesToCSV(filteredExpenses: Expense[]): string {
  const headers = [
    'Date',
    'Description',
    'Category',
    'Amount',
    'GST Amount',
    'GST %',
    'Vendor',
    'Vendor GSTIN',
    'Invoice No',
    'Payment Mode',
    'Note',
  ];
  const lines = [toCsvLine(headers)];
  filteredExpenses.forEach((e) => {
    lines.push(
      toCsvLine([
        e.date,
        e.description,
        e.category,
        e.amount,
        e.gstAmount || 0,
        e.gstPercent || 0,
        e.vendorName,
        e.vendorGstin,
        e.invoiceNo,
        e.paymentMode,
        e.note,
      ])
    );
  });
  return lines.join('\n');
}
