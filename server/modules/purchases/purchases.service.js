import { purchasesRepository } from './purchases.repository.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class PurchasesService {
  constructor(repo = purchasesRepository) {
    this.repo = repo;
  }

  /**
   * Retrieves all purchases sorted descending by date.
   * @returns {object[]}
   */
  listPurchases() {
    const purchases = this.repo.getAllPurchases();
    return purchases.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Retrieves a single purchase bill by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getPurchase(id) {
    return this.repo.getPurchaseById(id);
  }

  /**
   * Saves a new or updated purchase bill. Generates an ID if missing.
   * @param {object} purchase
   * @returns {{ success: boolean, id: string }}
   */
  savePurchase(purchase) {
    if (!purchase || typeof purchase !== 'object') {
      throw new BadRequestError('Invalid purchase payload');
    }

    const purchaseToSave = { ...purchase };
    if (!purchaseToSave.id) {
      purchaseToSave.id = 'pur_' + Date.now();
    }

    this.repo.savePurchase(purchaseToSave);
    return { success: true, id: purchaseToSave.id };
  }

  /**
   * Deletes a purchase by ID.
   * @param {string} id
   * @returns {{ success: boolean }}
   */
  deletePurchase(id) {
    this.repo.deletePurchase(id);
    return { success: true };
  }
}

export const purchasesService = new PurchasesService();
