import { PURCHASES_DIR } from '../../config/paths.js';
import { CollectionRepository } from '../../infrastructure/storage/CollectionRepository.js';

export class PurchasesRepository {
  constructor() {
    this.repo = new CollectionRepository(PURCHASES_DIR, { idField: 'id' });
  }

  /**
   * Reads all saved purchases.
   * @returns {object[]}
   */
  getAllPurchases() {
    return this.repo.findAll();
  }

  /**
   * Reads a single purchase bill by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getPurchaseById(id) {
    return this.repo.findById(id);
  }

  /**
   * Checks if a purchase with given ID exists.
   * @param {string} id
   * @returns {boolean}
   */
  purchaseExists(id) {
    return this.repo.exists(id);
  }

  /**
   * Saves or overwrites a purchase record.
   * @param {object} purchase
   * @returns {object}
   */
  savePurchase(purchase) {
    return this.repo.save(purchase);
  }

  /**
   * Deletes a purchase record from disk.
   * @param {string} id
   * @returns {boolean}
   */
  deletePurchase(id) {
    return this.repo.delete(id);
  }
}

export const purchasesRepository = new PurchasesRepository();
