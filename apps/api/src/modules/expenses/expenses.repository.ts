import { EXPENSES_DIR } from '../../config/paths.ts';
import { CollectionRepository } from '../../../../../server/infrastructure/storage/CollectionRepository.js';

export interface ExpenseRecord {
  id?: string;
  category?: string;
  description?: string;
  amount?: number;
  taxAmount?: number;
  date?: string;
  paymentMode?: string;
  vendorName?: string;
  vendorGstin?: string;
  itcEligible?: boolean;
  itcCategory?: 'eligible' | 'ineligible_17_5' | 'capital_goods' | 'exempt';
  receiptUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class ExpensesRepository {
  private repo: any;

  constructor(repo?: any) {
    this.repo = repo || new CollectionRepository(EXPENSES_DIR, { idField: 'id' });
  }

  getAllExpenses(): ExpenseRecord[] {
    return this.repo.findAll();
  }

  async getAllExpensesAsync(): Promise<ExpenseRecord[]> {
    return await this.repo.findAllAsync();
  }

  getExpenseById(id: string): ExpenseRecord | null {
    return this.repo.findById(id);
  }

  async getExpenseByIdAsync(id: string): Promise<ExpenseRecord | null> {
    return await this.repo.findByIdAsync(id);
  }

  expenseExists(id: string): boolean {
    return this.repo.exists(id);
  }

  saveExpense(expense: ExpenseRecord): ExpenseRecord {
    return this.repo.save(expense);
  }

  async saveExpenseAsync(expense: ExpenseRecord): Promise<ExpenseRecord> {
    return await this.repo.saveAsync(expense);
  }

  deleteExpense(id: string): boolean {
    return this.repo.delete(id);
  }

  async deleteExpenseAsync(id: string): Promise<boolean> {
    return await this.repo.deleteAsync(id);
  }
}

export const expensesRepository = new ExpensesRepository();
