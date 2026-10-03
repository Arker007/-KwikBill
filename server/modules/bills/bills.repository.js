import { BILLS_DIR, TRASH_DIR } from '../../config/paths.js';
import { CollectionRepository } from '../../infrastructure/storage/CollectionRepository.js';

export class BillsRepository {
  constructor() {
    this.billsRepo = new CollectionRepository(BILLS_DIR, { idField: 'id' });
    this.trashRepo = new CollectionRepository(TRASH_DIR, { idField: 'id' });
  }

  /**
   * Reads all saved bills.
   * @returns {object[]}
   */
  getAllBills() {
    return this.billsRepo.findAll();
  }

  /**
   * Reads a single bill by ID.
   * @param {string} id
   * @returns {object|null}
   */
  getBillById(id) {
    return this.billsRepo.findById(id);
  }

  /**
   * Checks if a bill with given ID exists in live bills.
   * @param {string} id
   * @returns {boolean}
   */
  billExists(id) {
    return this.billsRepo.exists(id);
  }

  /**
   * Saves or overwrites a bill.
   * @param {object} bill
   * @returns {object}
   */
  saveBill(bill) {
    return this.billsRepo.save(bill);
  }

  /**
   * Permanently deletes a bill from bills directory.
   * @param {string} id
   * @returns {boolean}
   */
  deleteBillPermanent(id) {
    return this.billsRepo.delete(id);
  }

  /**
   * Moves a bill from bills directory to trash directory (soft-delete).
   * @param {string} id
   * @returns {object|null}
   */
  trashBill(id) {
    return this.billsRepo.moveTo(id, this.trashRepo);
  }

  /**
   * Finds all live bills that depend on this bill as a credit source.
   * Prevents deleting a credit source that would leave a paid-via-credit target bill dangling.
   * @param {string} billId
   * @returns {Array<{ id: string, invoiceNumber: string, amount: number }>}
   */
  findCreditDependents(billId) {
    try {
      const allBills = this.billsRepo.findAll();
      const dependents = [];
      for (const other of allBills) {
        if (!other || other.id === billId) continue;
        const payments = other.payments || other.data?.payments || [];
        for (const p of payments) {
          if (p?.mode !== 'credit-applied') continue;
          const sources = p?.creditSourceBillIds || [];
          if (sources.includes(billId)) {
            dependents.push({
              id: other.id,
              invoiceNumber: other.invoiceNumber || other.id,
              amount: p.amount,
            });
            break;
          }
        }
      }
      return dependents;
    } catch {
      return [];
    }
  }
}

export const billsRepository = new BillsRepository();
