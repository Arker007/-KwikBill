import { billsRepository } from './bills.repository.js';
import { BadRequestError, ConflictError } from '../../shared/errors/AppError.js';

export class BillsService {
  constructor(repo = billsRepository) {
    this.repo = repo;
    this.billCache = null;
  }

  /**
   * Invalidates the in-memory bill index cache.
   */
  invalidateCache() {
    this.billCache = null;
  }

  /**
   * Retrieves all bills sorted chronologically descending by invoice date.
   * Utilizes in-memory index cache for instant response times.
   * @returns {object[]}
   */
  listBills() {
    if (!this.billCache) {
      const bills = this.repo.getAllBills();
      this.billCache = bills.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));
    }
    return this.billCache;
  }

  /**
   * Retrieves a single bill by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getBill(id) {
    if (this.billCache) {
      const found = this.billCache.find(b => b.id === id);
      if (found) return found;
    }
    return this.repo.getBillById(id);
  }

  /**
   * Saves a new or edited bill.
   * @param {object} bill
   * @param {object} [options]
   * @param {boolean} [options.overwrite=false]
   * @returns {{ success: boolean }}
   */
  saveBill(bill, { overwrite = false } = {}) {
    if (!bill || !bill.id) {
      throw new BadRequestError('Bill must have an id');
    }

    if (!overwrite && this.repo.billExists(bill.id)) {
      const error = new ConflictError('A bill with this invoice number already exists');
      error.invoiceNumber = bill.id;
      throw error;
    }

    this.repo.saveBill(bill);
    this.invalidateCache();
    return { success: true };
  }

  /**
   * Deletes or trashes a bill.
   * @param {string} id
   * @param {object} [options]
   * @param {boolean} [options.force=false]
   * @param {boolean} [options.permanent=false]
   * @returns {{ success: boolean, permanent?: boolean, trashed?: boolean }}
   */
  deleteBill(id, { force = false, permanent = false } = {}) {
    if (!this.repo.billExists(id)) {
      return { success: true };
    }

    if (!force) {
      const dependents = this.repo.findCreditDependents(id);
      if (dependents.length > 0) {
        const error = new ConflictError(
          'This bill was used as a client-credit source on another invoice. Deleting it would leave that invoice paid via credit that no longer has a real source.'
        );
        error.error = 'client-credit-dependency';
        error.dependents = dependents;
        throw error;
      }
    }

    if (permanent) {
      this.repo.deleteBillPermanent(id);
      this.invalidateCache();
      return { success: true, permanent: true };
    }

    this.repo.trashBill(id);
    this.invalidateCache();
    return { success: true, trashed: true };
  }
}

export const billsService = new BillsService();
