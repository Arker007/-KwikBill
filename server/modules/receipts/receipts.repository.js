import { RECEIPTS_DIR } from '../../config/paths.js';
import { CollectionRepository } from '../../infrastructure/storage/CollectionRepository.js';

export class ReceiptsRepository {
  constructor() {
    this.repo = new CollectionRepository(RECEIPTS_DIR, { idField: 'id' });
  }

  /**
   * Reads all saved receipts.
   * @returns {object[]}
   */
  getAllReceipts() {
    return this.repo.findAll();
  }

  /**
   * Reads a single receipt by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getReceiptById(id) {
    return this.repo.findById(id);
  }

  /**
   * Checks if a receipt with given ID exists.
   * @param {string} id
   * @returns {boolean}
   */
  receiptExists(id) {
    return this.repo.exists(id);
  }

  /**
   * Saves or overwrites a receipt voucher.
   * @param {object} receipt
   * @returns {object}
   */
  saveReceipt(receipt) {
    return this.repo.save(receipt);
  }

  /**
   * Deletes a receipt voucher from disk.
   * @param {string} id
   * @returns {boolean}
   */
  deleteReceipt(id) {
    return this.repo.delete(id);
  }
}

export const receiptsRepository = new ReceiptsRepository();
