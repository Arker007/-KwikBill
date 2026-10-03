import { BILLS_DIR, TRASH_DIR } from '../../config/paths.ts';
import { CollectionRepository } from '../../../../../server/infrastructure/storage/CollectionRepository.js';

export interface InvoiceRecord {
  id: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  clientId?: string;
  clientName?: string;
  clientGstin?: string;
  items?: any[];
  subtotal?: number;
  totalTax?: number;
  grandTotal?: number;
  payments?: any[];
  notes?: string;
  terms?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export class InvoicingRepository {
  private billsRepo: any;
  private trashRepo: any;

  constructor(billsRepo?: any, trashRepo?: any) {
    this.billsRepo = billsRepo || new CollectionRepository(BILLS_DIR, { idField: 'id' });
    this.trashRepo = trashRepo || new CollectionRepository(TRASH_DIR, { idField: 'id' });
  }

  /**
   * Reads all saved bills.
   */
  getAllBills(): InvoiceRecord[] {
    return this.billsRepo.findAll();
  }

  async getAllBillsAsync(): Promise<InvoiceRecord[]> {
    return await this.billsRepo.findAllAsync();
  }

  /**
   * Reads a single bill by ID.
   */
  getBillById(id: string): InvoiceRecord | null {
    return this.billsRepo.findById(id);
  }

  async getBillByIdAsync(id: string): Promise<InvoiceRecord | null> {
    return await this.billsRepo.findByIdAsync(id);
  }

  /**
   * Checks if a bill with given ID exists in live bills.
   */
  billExists(id: string): boolean {
    return this.billsRepo.exists(id);
  }

  /**
   * Saves or overwrites a bill.
   */
  saveBill(bill: InvoiceRecord): InvoiceRecord {
    return this.billsRepo.save(bill);
  }

  async saveBillAsync(bill: InvoiceRecord): Promise<InvoiceRecord> {
    return await this.billsRepo.saveAsync(bill);
  }

  /**
   * Permanently deletes a bill from bills directory.
   */
  deleteBillPermanent(id: string): boolean {
    return this.billsRepo.delete(id);
  }

  async deleteBillPermanentAsync(id: string): Promise<boolean> {
    return await this.billsRepo.deleteAsync(id);
  }

  /**
   * Moves a bill from bills directory to trash directory (soft-delete).
   */
  trashBill(id: string): any {
    return this.billsRepo.moveTo(id, this.trashRepo);
  }

  async trashBillAsync(id: string): Promise<any> {
    return await this.billsRepo.moveToAsync(id, this.trashRepo);
  }

  /**
   * Finds all live bills that depend on this bill as a credit source.
   */
  findCreditDependents(billId: string): Array<{ id: string; invoiceNumber: string; amount: number }> {
    try {
      const allBills = this.billsRepo.findAll();
      const dependents: Array<{ id: string; invoiceNumber: string; amount: number }> = [];
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

export const invoicingRepository = new InvoicingRepository();
export const billsRepository = invoicingRepository;
