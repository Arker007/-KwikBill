import { EXPENSES_DIR } from '../../config/paths.js';
import { CollectionRepository } from '../../infrastructure/storage/CollectionRepository.js';

export class ExpensesRepository {
  constructor() {
    this.repo = new CollectionRepository(EXPENSES_DIR, { idField: 'id' });
  }

  /**
   * Reads all saved expenses.
   * @returns {object[]}
   */
  getAllExpenses() {
    return this.repo.findAll();
  }

  /**
   * Reads a single expense by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getExpenseById(id) {
    return this.repo.findById(id);
  }

  /**
   * Checks if an expense with given ID exists.
   * @param {string} id
   * @returns {boolean}
   */
  expenseExists(id) {
    return this.repo.exists(id);
  }

  /**
   * Saves or overwrites an expense record.
   * @param {object} expense
   * @returns {object}
   */
  saveExpense(expense) {
    return this.repo.save(expense);
  }

  /**
   * Deletes an expense record from disk.
   * @param {string} id
   * @returns {boolean}
   */
  deleteExpense(id) {
    return this.repo.delete(id);
  }
}

export const expensesRepository = new ExpensesRepository();
