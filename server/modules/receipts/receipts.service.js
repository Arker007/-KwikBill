import { receiptsRepository } from './receipts.repository.js';
import { BadRequestError } from '../../shared/errors/AppError.js';

export class ReceiptsService {
  constructor(repo = receiptsRepository) {
    this.repo = repo;
  }

  /**
   * Retrieves all receipts sorted descending by date.
   * @returns {object[]}
   */
  listReceipts() {
    const receipts = this.repo.getAllReceipts();
    return receipts.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Retrieves a single receipt by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getReceipt(id) {
    return this.repo.getReceiptById(id);
  }

  /**
   * Saves a new or updated receipt. Generates an ID if missing.
   * @param {object} receipt
   * @returns {{ success: boolean, id: string }}
   */
  saveReceipt(receipt) {
    if (!receipt || typeof receipt !== 'object') {
      throw new BadRequestError('Invalid receipt payload');
    }

    const receiptToSave = { ...receipt };
    if (!receiptToSave.id) {
      receiptToSave.id = 'rcp_' + Date.now();
    }

    this.repo.saveReceipt(receiptToSave);
    return { success: true, id: receiptToSave.id };
  }

  /**
   * Deletes a receipt by ID.
   * @param {string} id
   * @returns {{ success: boolean }}
   */
  deleteReceipt(id) {
    this.repo.deleteReceipt(id);
    return { success: true };
  }
}

export const receiptsService = new ReceiptsService();
