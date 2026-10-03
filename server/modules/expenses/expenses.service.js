import { expensesRepository } from './expenses.repository.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class ExpensesService {
  constructor(repo = expensesRepository) {
    this.repo = repo;
  }

  /**
   * Retrieves all expenses sorted descending by date.
   * @returns {object[]}
   */
  listExpenses() {
    const expenses = this.repo.getAllExpenses();
    return expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Retrieves a single expense by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getExpense(id) {
    return this.repo.getExpenseById(id);
  }

  /**
   * Saves a new or updated expense. Generates an ID if missing.
   * @param {object} expense
   * @returns {{ success: boolean, id: string }}
   */
  saveExpense(expense) {
    if (!expense || typeof expense !== 'object') {
      throw new BadRequestError('Invalid expense payload');
    }

    const expenseToSave = { ...expense };
    if (!expenseToSave.id) {
      expenseToSave.id = 'exp_' + Date.now();
    }

    this.repo.saveExpense(expenseToSave);
    return { success: true, id: expenseToSave.id };
  }

  /**
   * Deletes an expense by ID.
   * @param {string} id
   * @returns {{ success: boolean }}
   */
  deleteExpense(id) {
    this.repo.deleteExpense(id);
    return { success: true };
  }
}

export const expensesService = new ExpensesService();
