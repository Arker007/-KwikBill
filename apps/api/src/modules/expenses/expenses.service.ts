import { expensesRepository, ExpensesRepository, ExpenseRecord } from './expenses.repository.ts';
import { BadRequestError } from '../../platform/errors/AppError.ts';

export interface ItcSummary {
  totalTax: number;
  eligibleItc: number;
  ineligibleItc: number;
  capitalGoodsItc: number;
}

export class ExpensesService {
  private repo: ExpensesRepository;

  constructor(repo?: ExpensesRepository) {
    this.repo = repo || expensesRepository;
  }

  listExpenses(): ExpenseRecord[] {
    const expenses = this.repo.getAllExpenses();
    return expenses.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  getExpense(id: string): ExpenseRecord | null {
    return this.repo.getExpenseById(id);
  }

  saveExpense(expense: any): { success: boolean; id: string } {
    if (!expense || typeof expense !== 'object') {
      throw new BadRequestError('Invalid expense payload');
    }

    const expenseToSave: ExpenseRecord = { ...expense };
    if (!expenseToSave.id) {
      expenseToSave.id = 'exp_' + Date.now();
    }

    this.repo.saveExpense(expenseToSave);
    return { success: true, id: expenseToSave.id };
  }

  deleteExpense(id: string): { success: boolean } {
    this.repo.deleteExpense(id);
    return { success: true };
  }

  /**
   * Computes statutory ITC breakdown across expenses.
   */
  getItcSummary(): ItcSummary {
    const expenses = this.repo.getAllExpenses();
    let totalTax = 0;
    let eligibleItc = 0;
    let ineligibleItc = 0;
    let capitalGoodsItc = 0;

    for (const exp of expenses) {
      const tax = Number(exp.taxAmount || 0);
      totalTax += tax;

      if (exp.itcEligible === false || exp.itcCategory === 'ineligible_17_5') {
        ineligibleItc += tax;
      } else if (exp.itcCategory === 'capital_goods') {
        capitalGoodsItc += tax;
        eligibleItc += tax;
      } else {
        eligibleItc += tax;
      }
    }

    return {
      totalTax,
      eligibleItc,
      ineligibleItc,
      capitalGoodsItc,
    };
  }
}

export const expensesService = new ExpensesService();
