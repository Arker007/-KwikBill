import { invoicingRepository, InvoicingRepository, type InvoiceRecord } from './invoicing.repository.ts';
import { sequenceGenerator } from './counters/sequenceGenerator.ts';
import { BadRequestError, ConflictError, NotFoundError } from '../../platform/errors/AppError.ts';
import { computeInvoiceTotals } from '@free-gst/financial-core';

export class InvoicingService {
  private repo: InvoicingRepository;
  private billCache: InvoiceRecord[] | null = null;

  constructor(repo?: InvoicingRepository) {
    this.repo = repo || invoicingRepository;
  }

  /**
   * Invalidates the in-memory bill index cache.
   */
  invalidateCache(): void {
    this.billCache = null;
  }

  /**
   * Retrieves all bills sorted chronologically descending by invoice date.
   */
  listBills(): InvoiceRecord[] {
    if (!this.billCache) {
      const bills = this.repo.getAllBills();
      this.billCache = bills.sort((a, b) => {
        const dateA = new Date(a.invoiceDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.invoiceDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }
    return this.billCache;
  }

  /**
   * Retrieves a single bill by ID.
   */
  getBill(id: string): InvoiceRecord | null {
    if (this.billCache) {
      const found = this.billCache.find((b) => b.id === id);
      if (found) return found;
    }
    return this.repo.getBillById(id);
  }

  /**
   * Saves a new or edited bill.
   */
  saveBill(bill: InvoiceRecord, { overwrite = false }: { overwrite?: boolean } = {}): { success: boolean; id: string } {
    if (!bill || !bill.id) {
      throw new BadRequestError('Bill must have an id');
    }

    if (!overwrite && this.repo.billExists(bill.id)) {
      const error: any = new ConflictError('A bill with this invoice number already exists');
      error.invoiceNumber = bill.id;
      throw error;
    }

    if (bill && bill.data) {
      const calculated = computeInvoiceTotals({
        items: bill.data.items || [],
        profile: bill.data.profile || {},
        client: bill.data.client || {},
        details: bill.data.details || {},
        showGST: bill.data.invoiceOptions?.showGST !== false,
        taxInclusive: !!bill.data.taxInclusive,
        invoiceOptions: bill.data.invoiceOptions || {},
      });

      const expectedTotal = calculated.total;
      const actualTotal = bill.totalAmount ?? bill.data.totals?.total;

      if (actualTotal !== undefined && Math.abs(actualTotal - expectedTotal) > 0.05) {
        throw new BadRequestError(`Mathematically inconsistent totals: expected ${expectedTotal}, got ${actualTotal}`);
      }
    }

    this.repo.saveBill(bill);
    this.invalidateCache();
    return { success: true, id: bill.id };
  }

  /**
   * Duplicates an existing bill with a new invoice number sequence.
   */
  duplicateBill(id: string): { success: boolean; newBill: InvoiceRecord } {
    const existing = this.getBill(id);
    if (!existing) {
      throw new NotFoundError('Source invoice not found');
    }

    const nextSeq = sequenceGenerator.incrementCounter('invoiceSequence');
    const newInvoiceNumber = sequenceGenerator.formatInvoiceNumber('INV', nextSeq);

    const duplicated: InvoiceRecord = {
      ...existing,
      id: newInvoiceNumber,
      invoiceNumber: newInvoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.repo.saveBill(duplicated);
    this.invalidateCache();
    return { success: true, newBill: duplicated };
  }

  /**
   * Deletes or trashes a bill.
   */
  deleteBill(
    id: string,
    { force = false, permanent = false }: { force?: boolean; permanent?: boolean } = {}
  ): { success: boolean; permanent?: boolean; trashed?: boolean } {
    if (!this.repo.billExists(id)) {
      return { success: true };
    }

    if (!force) {
      const dependents = this.repo.findCreditDependents(id);
      if (dependents.length > 0) {
        const error: any = new ConflictError(
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

export const invoicingService = new InvoicingService();
export const billsService = invoicingService;
